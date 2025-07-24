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
import { onBeforeMount, onMounted, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onBeforeMount(() => {
    // 使用 requestIdleCallback 或 setTimeout 在空闲时初始化
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initializeMusicPlayer();
        }, { timeout: 2000 });
    } else {
        // 降级方案：使用 setTimeout 延迟执行
        setTimeout(() => {
            initializeMusicPlayer();
        }, 100);
    }
});

onMounted(() => {
    drawer = document.getElementById("music-drawer")
    const audio = document.getElementById("audioElement")
    loading.value = false
    
    // 确保drawer元素存在
    if (!drawer) {
        console.warn('音乐抽屉元素未找到');
    }

    // 修改进度条提示函数
    const slider = document.getElementById("music-slider")
    if (slider) {
        slider.labelFormatter = (value) => player.formatTime(value);
    }

    // 始终初始化音频元素，即使服务器不可用
    if (audio) {
        player.init(audio);
    }

    // 不要等待音乐播放器初始化，让它在后台完成
    waitForMusicInitialization().catch(console.error);
})

// 监听处理分享音乐事件
window.addEventListener('handle-shared-music', async (event) => {
    const musicData = event.detail;

    // 检查 token 和播放列表是否已加载
    if (!player.playlistLoaded || !available.value) {
        try {
            // 如果音乐服务尚未初始化，等待初始化完成
            await waitForMusicInitialization();
            
            // 如果等待后仍不可用，触发重新初始化
            if (!available.value) {
                initializationPromise = null;
                await initializeMusicPlayer();
            }
            
            if (!available.value) {
                throw new Error('Music service unavailable');
            }
        } catch (error) {
            console.error('初始化音乐播放器失败:', error);
            snackbar({
                message: "音乐服务正在连接中，请稍后重试",
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
        player.setShareMode(true, musicIndex); // 设置分享模式
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
        const newIndex = music_list.value.length - 1;
        player.setShareMode(true, newIndex); // 设置分享模式
        player.loadTrack(newIndex);
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

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
                    
                    try {
                        const response = await fetch(`${globalVars.site.backpoint}/music/share`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(shareData),
                            signal: controller.signal
                        });

                        clearTimeout(timeoutId);

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
                                const musicDrawer = document.getElementById("music-drawer");
                                if (musicDrawer) {
                                    musicDrawer.open = false;
                                }
                            }, 300);
                        }, 200);
                    } catch (fetchError) {
                        clearTimeout(timeoutId);
                        if (fetchError.name === 'AbortError') {
                            throw new Error('分享请求超时');
                        }
                        throw fetchError;
                    }
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
let initializationPromise = null

async function initializeMusicPlayer(retryCount = 0) {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
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
            console.log("Music player initialized successfully");

        } catch (e) {
            console.warn("Music initialization error:", e);
            available.value = false;
            
            // 重试逻辑
            if (retryCount < 3) {
                console.log(`Retrying music initialization (${retryCount + 1}/3)...`);
                initializationPromise = null;
                
                // 使用指数退避策略
                const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                setTimeout(() => {
                    initializeMusicPlayer(retryCount + 1);
                }, delay);
            } else {
                // 最终失败后的处理
                setTimeout(() => {
                    snackbar({
                        message: "音乐服务暂时不可用，将在后台继续尝试连接",
                        autoCloseDelay: 3000
                    });
                }, 1000);
                
                // 后台静默重试
                scheduleBackgroundRetry();
            }
        }
    })();

    return initializationPromise;
}

// 后台重试机制
function scheduleBackgroundRetry() {
    setTimeout(async () => {
        if (!available.value) {
            try {
                initializationPromise = null;
                await initializeMusicPlayer();
                if (available.value) {
                    snackbar({
                        message: "音乐服务已恢复连接",
                        autoCloseDelay: 2000
                    });
                }
            } catch (e) {
                // 继续后台重试
                scheduleBackgroundRetry();
            }
        }
    }, 30000); // 30秒后重试
}

async function waitForMusicInitialization() {
    if (initializationPromise) {
        await initializationPromise;
    }
}

async function updateToken() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
        const response = await fetch(`${globalVars.navidrome.server}/auth/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: globalVars.navidrome.user,
                password: globalVars.navidrome.password
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

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
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('连接超时，请检查网络或服务器状态');
        }
        throw error;
    }
}

async function keepAlive() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

    try {
        const response = await fetch(`${globalVars.navidrome.server}/api/keepalive/keepalive`, {
            method: "GET",
            headers: headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token过期，刷新token
                await updateToken();
                globalVars.navidrome.login = JSON.parse(localStorage.getItem("navidrome"));
                // 更新请求头
                headers['x-nd-authorization'] = `Bearer ${globalVars.navidrome.login.token}`;
                headers['x-nd-client-unique-id'] = globalVars.navidrome.login.id;
                return;
            } else {
                throw new Error(`KeepAlive failed with status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log("Navidrome KeepAlive", data);

        if (data.error !== undefined || data.response !== "ok") {
            await updateToken();
            globalVars.navidrome.login = JSON.parse(localStorage.getItem("navidrome"));
            // 更新请求头
            headers['x-nd-authorization'] = `Bearer ${globalVars.navidrome.login.token}`;
            headers['x-nd-client-unique-id'] = globalVars.navidrome.login.id;
        } else {
            // 加载登陆信息到全局变量
            globalVars.navidrome.login = JSON.parse(localStorage.getItem("navidrome"));
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('KeepAlive请求超时');
        }
        throw error;
    }
}

async function getMusicList() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
        const response = await fetch(`${globalVars.navidrome.server}${globalVars.navidrome.playListURL}`, {
            method: "GET",
            headers: headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 401) {
                // Token过期，刷新token后重试
                await updateToken();
                headers['x-nd-authorization'] = `Bearer ${JSON.parse(localStorage.getItem("navidrome")).token}`;
                headers['x-nd-client-unique-id'] = JSON.parse(localStorage.getItem("navidrome")).id;
                
                // 重新请求
                const retryResponse = await fetch(`${globalVars.navidrome.server}${globalVars.navidrome.playListURL}`, {
                    method: "GET",
                    headers: headers
                });
                
                if (!retryResponse.ok) {
                    throw new Error(`获取音乐列表失败: ${retryResponse.status}`);
                }
                
                const data = await retryResponse.json();
                music_list.value = data;
            } else {
                throw new Error(`获取音乐列表失败: ${response.status}`);
            }
        } else {
            const data = await response.json();
            music_list.value = data;
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('获取音乐列表超时');
        }
        throw error;
    }
}

export const opendrawer = () => {
    // 确保drawer元素存在
    if (!drawer) {
        drawer = document.getElementById("music-drawer");
        if (!drawer) {
            console.warn('音乐抽屉元素未找到，无法打开');
            return;
        }
    }
    
    drawer.open = !drawer.open
    if (firstflag && player.playlistLoaded) {
        setTimeout(() => {
            // 平滑滚动到指定元素
            const targets = document.querySelector(".music-list");
            if (targets && targets.children && targets.children[player.playingMusic.value.index]) {
                targets.children[player.playingMusic.value.index].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
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

        &::before {
            backdrop-filter: blur(8.5px);
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
        }
    }

    mdui-list-item[active] {
        background-color: rgba(var(--mdui-color-secondary-container), 0.8);
    }

    mdui-button-icon[variant="tonal"] {
        background-color: rgba(var(--mdui-color-secondary-container), 0.8);
    }
}
</style>