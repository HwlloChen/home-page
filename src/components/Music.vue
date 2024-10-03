<template>
    <mdui-navigation-drawer id="music-drawer" placement="right" modal close-on-esc close-on-overlay-click>
        <div class="playing-music">
            <div class="playing-music-cover-div">
                <img class="playing-music-cover" :src="player.playingMusic.value.cover">
            </div>
            <div class="playing-music-name ubuntu-bold">{{ player.playingMusic.value.title }}</div>
            <div class="playing-music-information ubuntu-light">{{ player.playingMusic.value.information }}</div>
            <div class="actions">
                <audio id="audioElement" src=""
                    :title="`${player.playingMusic.value.title} - ${player.playingMusic.value.information}`"></audio>
                <div class="slider ubuntu-light">
                    {{ player.playingMusic.value.nowTimeString }}
                    <mdui-slider id="music-slider" @change="player.changeNowTime($event.target.value)"
                        :value="player.playingMusic.value.nowTime"
                        :max="player.playingMusic.value.maxTime"></mdui-slider>
                    {{ player.playingMusic.value.maxTimeString }}
                </div>
                <div class="action-buttons">
                    <mdui-tooltip :content="player.playbackMode.value === 0 ? '列表循环' : (player.playbackMode.value === -1 ? '单曲循环' : '随机播放')">
                        <mdui-button-icon variant="standard"
                            :icon="player.playbackMode.value === 0 ? 'repeat--outlined' : (player.playbackMode.value === -1 ? 'repeat_one--outlined' : 'shuffle--outlined')"
                            style="width: 2.5rem; height: 2.5rem;"
                            @click="player.changePlayBackMode()"></mdui-button-icon>
                    </mdui-tooltip>
                    <mdui-button-icon variant="tonal" icon="skip_previous"
                        @click="player.prevTrack()"></mdui-button-icon>
                    <mdui-button-icon variant="tonal" @click="player.negative()"
                        :icon="player.playingMusic.value.pause ? 'play_arrow' : 'pause'"></mdui-button-icon>
                    <mdui-button-icon variant="tonal" icon="skip_next" @click="player.nextTrack()"></mdui-button-icon>
                    <mdui-button-icon variant="standard" icon="share--outlined" style="width: 2.5rem; height: 2.5rem;"
                        @click="snackbar({message: '敬请期待'})"></mdui-button-icon>
                </div>
            </div>
        </div>
        <mdui-list class="music-list">
            <template v-for="[index, music] in music_list.entries()">
                <mdui-list-item :description="`${music.artist}`" :data-index="index"
                    :="{ active: player.playingMusic.value.index === index }" rounded>
                    {{ music.title }}
                    <mdui-avatar slot="icon">
                        <img class="lazy"
                            :src="`${globalVars.navidrome.server}/rest/getCoverArt?u=${globalVars.navidrome.user}&t=${globalVars.navidrome.login.subsonicToken}&s=${globalVars.navidrome.login.subsonicSalt}&f=json&v=1.8.0&c=${globalVars.navidrome.clientName}&id=al-${music.albumId}&size=128`"
                            loading="lazy" />
                    </mdui-avatar>
                    <mdui-button-icon slot="end-icon" @click="setMusic(index)"
                        :icon="(player.playingMusic.value.index === index) ? 'music_note' : 'play_circle'"></mdui-button-icon>
                </mdui-list-item>
            </template>
        </mdui-list>
        <div class="ubuntu-light music-about">
            Powered by <a :href="globalVars.navidrome.server">ChenServer Musics</a></div>
    </mdui-navigation-drawer>
</template>

<script setup>
import { globalVars } from '@/utils/globalVars';
import { MusicPlayer } from '@/utils/musicPlayer';
import { snackbar } from 'mdui';
import { onBeforeMount, onMounted, ref } from 'vue';

onBeforeMount(() => {
    /**
     * 初始化音乐组件
     */

    // 检查token
    try {
        if (localStorage.getItem("navidrome") == null || JSON.parse(localStorage.getItem("navidrome")).token == undefined) {
            updateToken().then(function () {
                return new Promise(function (resolve, reject) {
                    headers['x-nd-authorization'] = `Bearer ${JSON.parse(localStorage.getItem("navidrome")).token}`
                    headers['x-nd-client-unique-id'] = JSON.parse(localStorage.getItem("navidrome")).id
                    keepAlive().then(resolve()).catch(() => { throw new Error("Cannot do keepAlive!") })
                })
            }).then(() => {
                getMusicList().then(() => player.loadPlaylist(music_list.value)).catch(() => { throw new Error("Cannot get MusicList!") })
            })
        } else {
            headers['x-nd-authorization'] = `Bearer ${JSON.parse(localStorage.getItem("navidrome")).token}`
            headers['x-nd-client-unique-id'] = JSON.parse(localStorage.getItem("navidrome")).id
            keepAlive().then(() => {
                getMusicList().then(() => player.loadPlaylist(music_list.value)).catch(() => { throw new Error("Cannot get MusicList!") })
            })
        }

    } catch (e) {
        available.value = false
        console.warn("get error", e)
        return
    }

    available.value = true
})

onMounted(() => {
    drawer = document.getElementById("music-drawer")
    const audio = document.getElementById("audioElement")
    loading.value = false
    console.log(available.value)

    // 修改进度条提示函数
    const slider = document.getElementById("music-slider")
    slider.labelFormatter = (value) => player.formatTime(value);

    if (!available.value) {
        return
    }
    player.init(audio)
})

const setMusic = (index) => {
    player.loadTrack(index)
    player.play()
}
</script>

<script>
var drawer
export const available = ref(true)
export const player = new MusicPlayer()
const headers = {
    "x-nd-authorization": null,
    "x-nd-client-unique-id": null
}
const music_list = ref([])
export const loading = ref(true)
var firstflag = true

function updateToken() {
    return new Promise(function (resolve, reject) {
        // 获取cookie
        fetch(`${globalVars.navidrome.server}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
                username: globalVars.navidrome.user,
                password: globalVars.navidrome.password
            })
        }).then(response => {
            if (response.ok) {
                // 保存登陆信息
                response.json().then(data => {
                    localStorage.setItem("navidrome", JSON.stringify(data))
                    console.log("Updated Navidrome Token")
                    if (data.isAdmin) { snackbar({ message: "请避免使用管理员Navidrome账户" }); console.warn("请避免使用管理员Navidrome账户") }
                    resolve()
                })
            } else {
                // 配置有误
                if (response.status === 401) {
                    snackbar({ message: "Navidrome音乐服务器用户名或密码错误", autoCloseDelay: 3000 })
                    console.error("Navidrome音乐服务器用户名或密码错误")
                } else {
                    snackbar({ message: "连接到Navidrome服务器时出现未知错误", autoCloseDelay: 3000 })
                    console.error("连接到Navidrome服务器时出现未知错误");
                }
                available.value = false
                reject("Navidrome Music Plugin Error");
            }
        })
    })
}

function keepAlive() {
    return new Promise(function (resolve, reject) {
        // keepalive
        fetch(`${globalVars.navidrome.server}/api/keepalive/keepalive`, {
            method: "GET",
            headers: headers
        }).then(response => response.json())
            .then(data => {
                console.log("Navidrome KeepAlive", data)
                if (data.error !== undefined || !data.response === "ok") {
                    updateToken().then(() => {
                        globalVars.navidrome.login = JSON.parse(localStorage.getItem("navidrome"))
                        resolve()
                    })
                }
                else {
                    // 加载登陆信息到全局变量
                    globalVars.navidrome.login = JSON.parse(localStorage.getItem("navidrome"))
                    resolve()
                }
            }).catch(() => { reject() })
    })
}

function getMusicList() {
    return new Promise(function (resolve, reject) {
        // 获取音乐列表
        fetch(`${globalVars.navidrome.server}${globalVars.navidrome.playListURL}`, {
            method: "GET",
            headers: headers
        }).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    music_list.value = data
                    resolve()
                })
            } else {
                reject()
            }
        })
    })
}

export const opendrawer = () => {
    drawer.open = !drawer.open
    if (firstflag) {
        setTimeout(() => {
            // 平滑滚动到指定元素
            const targets = document.querySelector(".music-list").children;
            targets[player.playingMusic.value.index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
        firstflag = false
    }
} 
</script>

<style lang="less" scoped>
#music-drawer {
    &::part(panel) {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;

        @media(min-width: 601px) {
            padding: 1rem 0.7rem 1rem 1rem;
        }

        @media(max-width: 600px) {
            padding: 0.6rem 0.3rem 0.6rem 0.6rem;
        }

        width: 24rem;
    }

    margin-right: 0 !important;
    position: fixed;
}

.playing-music {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 1rem;

    .playing-music-cover-div {
        width: 85%;
        box-sizing: border-box;
        padding: 1.25rem;

        .playing-music-cover {
            width: 100%;
            aspect-ratio: 1 / 1;
            /* 设置宽高比为1:1，保证宽高相等 */
            object-fit: cover;
            /* 图片覆盖整个img容器，可能会裁剪 */
            display: block;
            border-radius: var(--mdui-shape-corner-extra-large);
        }
    }

    .playing-music-information {
        max-width: 105%;
        font-size: .9rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .playing-music-name {
        font-size: larger;
    }
}

.music-list {
    flex-grow: 1;
    width: auto;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
}

.actions {
    width: 100%;
    margin: 0;
    align-items: center;

    .slider {
        display: flex;
        align-content: center;
        align-items: center;
        justify-content: center;
        font-size: small;

        mdui-slider {
            &::part(handle) {
                opacity: 0;
                transition: opacity .4s var(--mdui-motion-easing-standard);
            }

            &:hover {
                &::part(handle) {
                    opacity: 1;
                }
            }

            display: inline-block;
        }
    }

    .action-buttons {
        display: flex;
        justify-content: center;
        align-items: center;

        mdui-button-icon {
            margin-left: 5px;
            margin-right: 5px;
            font-size: x-large;
            width: 3rem;
            height: 3rem;
        }
    }
}

.music-about {
    text-align: right !important;
    margin-bottom: -0.45rem;

    @media(min-width: 601px) {
        font-size: .9rem;
        padding-top: .5rem;
        line-height: 1.25;
    }

    @media(max-width: 600px) {
        font-size: .85rem;
        padding-top: .3rem;
        line-height: 1;
    }
}

.glass {
    #music-drawer::part(panel) {
        background-color: rgba(var(--mdui-color-surface-container-low), 0.25);
        backdrop-filter: blur(8.5px);
    }

    mdui-list-item[active] {
        background-color: rgba(var(--mdui-color-secondary-container), 0.8);
    }

    mdui-button-icon[variant="tonal"] {
        background-color: rgba(var(--mdui-color-secondary-container), 0.8);
    }
}
</style>