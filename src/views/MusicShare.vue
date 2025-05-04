<template>
    <div class="share-container" data-aos="zoom-out-up">
        <div v-if="loading" class="loading">
            <mdui-circular-progress></mdui-circular-progress>
        </div>
        <div v-else-if="error" class="error">
            <mdui-icon name="error_outline"></mdui-icon>
            <p v-html="error"></p>
        </div>
        <mdui-card v-else class="share-content">
            <div class="music-info">
                <img :src="getCoverUrl()" class="album-cover" />
                <div class="text-info">
                    <h2>
                        <span>
                            {{ shareData.title }}
                            <mdui-badge id="quality-badge">
                                {{ musicDetail.qualityGrade }}</mdui-badge>
                        </span>
                    </h2>
                    <p>{{ shareData.artist }}</p>
                </div>
            </div>
            <div class="player-controls">
                <div class="slider ubuntu-light">
                    {{ player.playingMusic.value.nowTimeString }}
                    <mdui-slider id="sharedMusic-slider" @change="player.changeNowTime($event.target.value)"
                        :value="player.playingMusic.value.nowTime" :max="player.playingMusic.value.maxTime"
                        :="{ disabled: !isSharedMusic }"></mdui-slider>
                    {{ player.playingMusic.value.maxTimeString }}
                </div>
                <div class="action-buttons">
                    <mdui-button-icon variant="standard" @click="openInNavidrome" icon="open_in_new"></mdui-button-icon>
                    <mdui-button-icon variant="tonal" @click="togglePlayPause"
                        :icon="player.playingMusic.value.pause ? 'play_arrow' : 'pause'"></mdui-button-icon>
                    <mdui-button-icon variant="standard" @click="downloadMusic" icon="download"></mdui-button-icon>
                </div>
            </div>
            <div class="share-info">
                <mdui-text-field id="urlTextField" variant="outlined" label="分享链接" readonly v-model="currentUrl">
                    <mdui-button-icon slot="end-icon" icon="content_copy" @click="copyURL"></mdui-button-icon>
                </mdui-text-field>
                <div class="share-info-text">
                    <div class="left" id="music-comment">
                        {{ musicDetail.musicComment }}
                    </div>
                    <div class="right">
                        <p>文件大小：{{ musicDetail.fileSize }}</p>
                        <p>文件类型：{{ musicDetail.fileType }}</p>
                        <p>采样率：{{ musicDetail.sampleRate }} Hz</p>
                        <p v-if="musicDetail.bitDepth != '0'">位深：{{ musicDetail.bitDepth }} bit</p>
                        <p>比特率：{{ musicDetail.bitRate }} kbps</p>
                        <p>分享创建时间：{{ musicDetail.shareTimeFormatted }}</p>
                    </div>
                </div>
            </div>
            <transition name="fade">
                <div class="overlay" v-if="!isSharedMusic">
                    <div class="overlay-content">
                        <p style="font-size: 1.6rem; font-weight: bold;">当前播放音乐不是分享音乐</p>
                        <mdui-button variant="filled" @click="playSharedMusic">
                            播放分享的 {{ shareData.title }}
                        </mdui-button>
                    </div>
                </div>
            </transition>
        </mdui-card>

    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { globalVars } from '@/utils/globalVars';
import { useRoute } from 'vue-router';
import { player, available, headers, music_list } from '@/components/SideMusic.vue';
import { hasV6 } from '@/components/IPv6Checker.vue';

const shareData = ref(null);
const currentUrl = ref(window.location.href);
const route = useRoute();
const loading = ref(true);
const error = ref(null);
const isSharedMusic = ref(false);
var detail = null;
const musicDetail = ref({
    shareTimeFormatted: '',
    musicComment: '',
    fileSize: '',
    sampleRate: '',
    bitRate: '',
    bitDepth: '',
    fileType: '',
    qualityGrade: ''
});

async function initializeSharePage() {
    try {
        // 等待 Music.vue 中的认证完成
        let retries = 0;
        while (!globalVars.navidrome.login && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        // 如果超时还没有登录信息，显示错误
        if (!globalVars.navidrome.login) {
            throw new Error('无法连接到音乐服务器，请刷新页面重试');
        }

        const shareId = route.params.id;
        const r1 = await fetch(`${globalVars.site.backpoint}/music/share?id=${shareId}`);

        if (!r1.ok) {
            throw new Error('分享不存在或已失效');
        }

        shareData.value = await r1.json();

        currentUrl.value = window.location.href;

        // 获得歌曲详细信息
        const r2 = await fetch(`${shareData.value.serverUrl}/api/song/${shareData.value.trackId}`, {
            method: 'GET',
            headers: headers
        });
        detail = await r2.json();

        // 格式化分享时间
        musicDetail.value.shareTimeFormatted = new Date(shareData.value.shareTime * 1000)
            .toLocaleString('zh-CN');

        // 获取音乐评论
        musicDetail.value.musicComment = shareData.value.comment || '该分享没有留言哦~';
        // 获取文件大小detail.size(由字节转换为合适单位)
        musicDetail.value.fileSize = detail.size > 1024 * 1024
            ? (detail.size / (1024 * 1024)).toFixed(2) + ' MB'
            : (detail.size / 1024).toFixed(2) + ' KB';
        musicDetail.value.fileType = detail.suffix.toUpperCase();
        musicDetail.value.sampleRate = detail.sampleRate;
        musicDetail.value.bitRate = detail.bitRate;
        musicDetail.value.bitDepth = detail.bitDepth;

        // 等待 player 可用
        while (!available.value) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 触发播放分享的音乐
        if (player.playingMusic.value.pause) {
            window.dispatchEvent(new CustomEvent('handle-shared-music', {
                detail: {
                    trackId: shareData.value.trackId,
                    albumId: shareData.value.albumId,
                    title: shareData.value.title,
                    artist: shareData.value.artist
                }
            }));
        }

        loading.value = false;

        if (player.playingMusic.value.trackId === shareData.value.trackId) {
            isSharedMusic.value = true;
        } else {
            isSharedMusic.value = false;
        }

        setTimeout(() => {
            // 修改进度条提示函数
            const slider = document.getElementById("sharedMusic-slider");
            slider.labelFormatter = (value) => player.formatTime(value);

            const qualityBadge = document.getElementById('quality-badge');
            // Set badge colors based on audio quality
            if (detail.suffix.toLowerCase() === 'flac' || detail.suffix.toLowerCase() === 'wav') {
                if (detail.bitDepth >= 24 && detail.sampleRate >= 48000) {
                    // Hi-Res quality
                    qualityBadge.style.backgroundColor = '#FFD700';
                    qualityBadge.style.color = '#000000';
                    musicDetail.value.qualityGrade = 'HR';
                } else {
                    // Lossless quality
                    qualityBadge.style.backgroundColor = '#1E90FF';
                    qualityBadge.style.color = '#FFFFFF';
                    musicDetail.value.qualityGrade = 'SQ';
                }
            } else if (detail.bitRate >= 320) {
                // High quality lossy
                qualityBadge.style.backgroundColor = '#5976cc';
                qualityBadge.style.color = '#FFFFFF';
                musicDetail.value.qualityGrade = 'HQ';
            } else {
                // Low quality
                qualityBadge.style.backgroundColor = '#808080';
                qualityBadge.style.color = '#FFFFFF';
                musicDetail.value.qualityGrade = 'LQ';
            }
        }, 100);
    } catch (err) {
        console.error('Failed to initializeSharePage player:', err);
        error.value = err.message;
        if (!hasV6.value) {
            error.value += '<br/><span style="color: rgb(var(--mdui-color-error));">您没有IPv6地址，可能无法访问音乐服务器。请检查您的网络设置。</span>';
        }
        loading.value = false;
    }
}

async function downloadMusic() {
    if (!shareData.value) return;
    const { server, user, clientName } = globalVars.navidrome;
    const { subsonicToken, subsonicSalt } = globalVars.navidrome.login;

    const downloadUrl = `${shareData.value.serverUrl}/rest/download?u=${user}&t=${subsonicToken}&s=${subsonicSalt}&f=json&v=1.8.0&c=${clientName}&id=${shareData.value.trackId}&format=raw&bitrate=0`

    window.location.href = downloadUrl;
}

// 使用 defineExpose 导出方法
defineExpose({
    initializeSharePage
});

onMounted(() => {
    initializeSharePage();
    window.addEventListener('playing-music-changed', async (e) => {
        if (!loading.value) {
            if (player.playingMusic.value.trackId === shareData.value.trackId) {
                isSharedMusic.value = true;
            } else {
                isSharedMusic.value = false;
            }
        }
    });
    // 监听路由变化
    watch(
        () => route.path,
        async (newPath) => {
            // 如果是音乐分享页面
            if (newPath.startsWith('/music/share/')) {
                await initializeSharePage();
            } else {
                // 清空已有标记
                music_list.value.forEach(music => {
                    music.isShared = false;
                });
            }
        }
    );
});

function getCoverUrl() {
    if (!shareData.value || !globalVars.navidrome.login) return '';
    const { server, user, clientName } = globalVars.navidrome;
    const { subsonicToken, subsonicSalt } = globalVars.navidrome.login;
    return `${shareData.value.serverUrl}/rest/getCoverArt?u=${user}&t=${subsonicToken}&s=${subsonicSalt}&f=json&v=1.8.0&c=${clientName}&id=al-${shareData.value.albumId}&size=256`;
}

function togglePlayPause() {
    if (player.playingMusic.value.pause) {
        player.play();
    } else {
        player.pause();
    }
}

function playSharedMusic() {
    window.dispatchEvent(new CustomEvent('handle-shared-music', {
        detail: {
            trackId: shareData.value.trackId,
            albumId: shareData.value.albumId,
            title: shareData.value.title,
            artist: shareData.value.artist
        }
    }));
    player.play();
}

function copyURL() {
    const textField = document.getElementById('urlTextField');
    // 清除之前的 helper
    const existingHelper = textField.querySelector('span[slot="helper"]');
    if (existingHelper) {
        textField.removeChild(existingHelper);
    }
    const helper = document.createElement('span');
    helper.setAttribute('slot', 'helper');
    navigator.clipboard.writeText(currentUrl.value).then(() => {
        helper.innerHTML = '链接已复制到剪贴板';
        helper.style.color = 'rgb(var(--mdui-color-on-surface))';
        textField.appendChild(helper);
        textField.focus();
        textField.select();
    }).catch(err => {
        console.error('Failed to copy URL:', err);
        helper.innerHTML = '复制链接失败，请手动复制';
        helper.style.color = 'rgb(var(--mdui-color-error))';
        textField.appendChild(helper);
        textField.focus();
        textField.select();
    });
}

function openInNavidrome() {
    if (!shareData.value && !detail) return;
    const navidromeUrl = `${shareData.value.serverUrl}/app/#/album/${detail.albumId}/show`;
    window.open(navidromeUrl, '_blank');
}
</script>

<style lang="less" scoped>
.share-container {
    position: relative; // 添加相对定位以支持遮罩层
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 2rem;
    margin: 2rem auto;
    max-width: 700px;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(var(--mdui-color-surface-variant), 0.5);
    backdrop-filter: blur(2px);
    z-index: 4;
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;

    .overlay-content {
        text-align: center;

        p {
            color: rgb(var(--mdui-color-on-surface));
            margin-bottom: 1rem;
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.loading,
.error {
    text-align: center;
    color: rgb(var(--mdui-color-on-surface-variant));
}

.error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    mdui-icon {
        font-size: 3rem;
        color: rgb(var(--mdui-color-error));
    }
}

.share-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    padding: 2rem;
    background-color: rgb(var(--mdui-color-surface-container-high));
    border-radius: var(--mdui-shape-corner-extra-large);
    transition: all .3s var(--mdui-motion-easing-standard) !important;

    .music-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;

        .album-cover {
            width: 200px;
            height: 200px;
            border-radius: var(--mdui-shape-corner-large);
            object-fit: cover;
        }

        .text-info {
            h2 {
                margin: 0;
                color: rgb(var(--mdui-color-on-surface));
                display: flex;
                align-items: center;
                justify-content: center;

                span {
                    position: relative;
                    justify-content: center;
                    display: flex;
                    align-items: center;

                    mdui-badge {
                        position: absolute;
                        left: 100%;
                        margin-left: 8px;
                        background-color: gray;
                        color: white;
                        white-space: nowrap;
                        --mdui-typescale-label-small-tracking: 0;
                    }
                }
            }

            p {
                margin: 0.5rem 0 0;
                color: rgb(var(--mdui-color-on-surface-variant));
            }
        }
    }
}

.player-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;

    .slider {
        width: 100%;
        display: flex;
        align-content: center;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        gap: 0.5rem;

        mdui-slider {
            flex: 1;

            &::part(handle) {
                opacity: 0;
                transition: opacity .4s var(--mdui-motion-easing-standard);
            }

            &:hover {
                &::part(handle) {
                    opacity: 1;
                }
            }
        }
    }

    .action-buttons {
        display: flex;
        justify-content: center;
        align-items: center;

        mdui-button-icon {
            margin: 0 0.6rem;
            font-size: x-large;
            width: 3rem;
            height: 3rem;
        }
    }
}

.share-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;

    mdui-text-field {
        width: 100%;
        max-width: 500px;
    }
}

.glass {
    .share-content {
        background-color: rgba(var(--mdui-color-surface-container-high), 0.6);
        backdrop-filter: blur(10px);
    }

    .overlay {
        background-color: rgba(var(--mdui-color-surface-variant), 0.3);
        backdrop-filter: blur(4px);
    }
}

.share-info-text {
    width: 100%;
    display: flex;
    align-items: flex-end;

    .left {
        justify-content: space-between;
        text-align: left;
        gap: 1rem;
        color: rgb(var(--mdui-color-on-surface-variant));
        white-space: pre-wrap;
        /* 保持原有的换行格式 */
        word-wrap: break-word;
        /* 确保长单词也能换行 */
        max-width: 70%;
        /* 限制最大宽度，以确保布局美观 */
    }

    .right {
        justify-content: space-between;
        text-align: right;
        gap: 1rem;
        flex-grow: 1;

        p {
            margin: 1px 0;
            font-size: 0.8rem;
            color: rgb(var(--mdui-color-on-surface-variant));
        }
    }
}


@media screen and (max-width: 600px) {
    .share-content {
        padding: 1rem;
        gap: 1.5rem;

        .music-info {
            .album-cover {
                width: 160px;
                height: 160px;
            }

            .text-info {
                h2 {
                    font-size: 1.4rem;
                }

                p {
                    font-size: 0.9rem;
                }
            }
        }
    }

    .player-controls {
        .slider {
            font-size: 0.85rem;
        }

        .action-buttons {
            mdui-button-icon {
                font-size: large;
                width: 2.5rem;
                height: 2.5rem;
            }
        }
    }

    .share-info-text {
        .left {
            font-size: 0.9rem;
        }

        .right p {
            font-size: 0.7rem;
        }
    }

    .overlay .overlay-content p {
        font-size: 1.2rem;
    }
}
</style>