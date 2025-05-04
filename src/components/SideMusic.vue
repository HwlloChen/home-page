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
                    <mdui-tooltip
                        :content="player.playbackMode.value === 0 ? '列表循环' : (player.playbackMode.value === -1 ? '单曲循环' : '随机播放')">
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
                    <mdui-button-icon variant="standard" id="shareButton" icon="share--outlined"
                        style="width: 2.5rem; height: 2.5rem;" @click="shareMusic"></mdui-button-icon>
                </div>
            </div>
        </div>
        <mdui-list class="music-list">
            <template v-for="[index, music] in music_list.entries()">
                <mdui-list-item :description="`${music.artist}`" :data-index="index"
                    :="{ active: player.playingMusic.value.index === index }" rounded>
                    {{ music.title }}
                    <mdui-badge v-if="music.isShared">推荐音乐</mdui-badge>
                    <mdui-avatar slot="icon">
                        <img class="lazy"
                            :src="`${globalVars.navidrome.server}/rest/getCoverArt?u=${globalVars.navidrome.user}&t=${globalVars.navidrome.login.subsonicToken}&s=${globalVars.navidrome.login.subsonicSalt}&f=json&v=1.8.0&c=${globalVars.navidrome.clientName}&id=al-${music.albumId}&size=96`"
                            loading="lazy" />
                    </mdui-avatar>
                    <mdui-button-icon slot="end-icon" @click="setMusic(index)"
                        :class="{ 'imgRotate disabled': (player.playingMusic.value.index === index), 'imgRotate-pause': player.playingMusic.value.pause, }"
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
import { prompt, snackbar } from 'mdui';
import { onBeforeMount, onMounted, ref, nextTick, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

onBeforeMount(async () => {
    // 初始化音乐组件
    try {
        // 确保 localStorage 存在且有效
        const navidrome = localStorage.getItem("navidrome");
        const token = navidrome ? JSON.parse(navidrome)?.token : null;

        if (!token) {
            // 没有token,执行登录流程
            await updateToken();
        }

        // 设置请求头
        headers['x-nd-authorization'] = `Bearer ${JSON.parse(localStorage.getItem("navidrome")).token}`;
        headers['x-nd-client-unique-id'] = JSON.parse(localStorage.getItem("navidrome")).id;

        // 验证token是否有效
        await keepAlive();

        // 获取音乐列表
        await getMusicList();

        // 加载播放列表
        player.loadPlaylist(music_list.value);

        available.value = true;

    } catch (e) {
        console.warn("Music initialization error:", e);

        // 尝试重新获取token
        try {
            await updateToken();
            headers['x-nd-authorization'] = `Bearer ${JSON.parse(localStorage.getItem("navidrome")).token}`;
            headers['x-nd-client-unique-id'] = JSON.parse(localStorage.getItem("navidrome")).id;

            await keepAlive();
            await getMusicList();
            player.loadPlaylist(music_list.value);

            available.value = true;
        } catch (retryError) {
            console.error("Music initialization failed after retry:", retryError);
            available.value = false;
            snackbar({
                message: "无法连接到音乐服务器，请稍后重试",
                autoCloseDelay: 3000
            });
        }
    }
});

onMounted(() => {
    drawer = document.getElementById("music-drawer")
    const audio = document.getElementById("audioElement")
    loading.value = false

    // 修改进度条提示函数
    const slider = document.getElementById("music-slider")
    slider.labelFormatter = (value) => player.formatTime(value);

    if (!available.value) {
        return
    }
    player.init(audio)
})

// 监听处理分享音乐事件
window.addEventListener('handle-shared-music', async (event) => {
    const musicData = event.detail;

    // 检查 token 和播放列表是否已加载
    if (!player.playlistLoaded) {
        try {
            await updateToken();
            headers['x-nd-authorization'] = `Bearer ${JSON.parse(localStorage.getItem("navidrome")).token}`;
            headers['x-nd-client-unique-id'] = JSON.parse(localStorage.getItem("navidrome")).id;
            await keepAlive();
            await getMusicList();
            player.loadPlaylist(music_list.value);
        } catch (error) {
            console.error('初始化音乐播放器失败:', error);
            snackbar({
                message: "无法连接到音乐服务器，请稍后重试",
                autoCloseDelay: 3000
            });
            return;
        }
    }

    // 查找音乐是否在当前播放列表中
    const musicIndex = music_list.value.findIndex(music =>
        music.id === musicData.trackId &&
        music.albumId === musicData.albumId
    );

    // 清空已有标记
    music_list.value.forEach(music => {
        music.isShared = false;
    });

    if (musicIndex !== -1) {
        // 如果在列表中，添加标记并播放
        music_list.value[musicIndex].isShared = true;
        player.loadTrack(musicIndex);
    } else {
        // 如果不在列表中，添加到播放列表并播放
        const newMusic = {
            id: musicData.trackId,
            realId: musicData.trackId,
            albumId: musicData.albumId,
            title: musicData.title,
            artist: musicData.artist,
            isShared: true
        };
        music_list.value.push(newMusic);
        player.loadPlaylist(music_list.value);
        player.loadTrack(music_list.value.length - 1);
    }

    player.playbackMode.value = -1; // 设置为单曲循环
});

const setMusic = (index) => {
    player.loadTrack(index)
    player.play()
}

async function shareMusic() {
    const shareButton = document.getElementById("shareButton");
    if (!player.playingMusic.value) {
        snackbar({
            message: "请先播放一首音乐",
            autoCloseDelay: 3000
        });
        return;
    }

    try {
        const currentTrack = player.playlist[player.currentTrackIndex];
        var comment = currentTrack.comment ? currentTrack.comment : ""

        prompt({
            headline: `分享音乐 ${currentTrack.title}`,
            description: "请对分享进行留言",
            confirmText: "分享",
            cancelText: "取消",
            onOpen: function () {
                // 设置默认值
                const inputField = this.querySelector('mdui-text-field')
                inputField.setAttribute("autosize", "true")
                inputField.value = comment;
            },
            onConfirm: async (v) => {
                try {
                    shareButton.loading = true;
                    comment = v
                    const shareData = {
                        title: currentTrack.title,
                        artist: currentTrack.artist,
                        albumId: currentTrack.albumId,
                        trackId: currentTrack.realId,
                        serverUrl: globalVars.navidrome.server,
                        comment: comment,
                    };

                    const response = await fetch(`${globalVars.site.backpoint}/music/share`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(shareData)
                    });

                    if (!response.ok) {
                        throw new Error('分享失败');
                    }

                    const result = await response.json();
                    const shareUrl = `/music/share/${result.id}`;

                    // 复制分享链接到剪贴板
                    const fullUrl = window.location.origin + shareUrl;
                    await navigator.clipboard.writeText(fullUrl);
                    // 使用 router 进行导航并等待导航完成
                    await router.push(shareUrl);
                    await nextTick();

                    // 获取当前路由组件实例
                    const currentInstance = router.currentRoute.value.matched[0].instances.default;
                    if (currentInstance?.initializeSharePage) {
                        await currentInstance.initializeSharePage();
                    }

                    // 显示提示消息
                    setTimeout(() => {
                        snackbar({
                            message: "分享链接已复制到剪贴板",
                            autoCloseDelay: 3000
                        });

                        setTimeout(() => {
                            // 关闭音乐抽屉
                            drawer.open = false
                        }, 300);
                    }, 200);
                } finally {
                    shareButton.loading = false;
                }
            }
        });
    } catch (error) {
        console.error('分享失败:', error);
        shareButton.loading = false;
        snackbar({
            message: "分享失败，请稍后重试",
            autoCloseDelay: 3000
        });
    }
}
</script>

<script>
var drawer
export const available = ref(true)
export const player = new MusicPlayer()
export const headers = {
    "x-nd-authorization": null,
    "x-nd-client-unique-id": null
}
export const music_list = ref([])
export const loading = ref(true)
var firstflag = true

async function updateToken() {
    const response = await fetch(`${globalVars.navidrome.server}/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            username: globalVars.navidrome.user,
            password: globalVars.navidrome.password
        })
    });

    if (!response.ok) {
        throw new Error(response.status === 401 ?
            "Navidrome用户名或密码错误" :
            "连接Navidrome服务器失败"
        );
    }

    const data = await response.json();
    localStorage.setItem("navidrome", JSON.stringify(data));

    if (data.isAdmin) {
        console.warn("请避免使用管理员Navidrome账户");
    }

    return data;
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
    if (firstflag && player.playlistLoaded) {
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

.lazy {
    width: 105%;
    height: 105%;
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
    border-radius: var(--mdui-shape-corner-extra-large);
    border: 1px solid rgba(255, 255, 255, 0.15);
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

mdui-button-icon.disabled {
    /* 不可点击状态 */
    cursor: default;
    pointer-events: none;
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