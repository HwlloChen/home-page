<template>
    <h1>信息概览
        <mdui-tooltip :content="versionTip">
            <mdui-chip id="versionChip" style="float: right;" elevated variant="suggestion"
                href="https://github.com/HwlloChen/home-page" target="_blank">
                ChenServer {{ config.version }}
            </mdui-chip>
        </mdui-tooltip>
    </h1>

    <mdui-divider></mdui-divider>
    
    <!-- 作者信息卡片 -->
    <div class="info-cards">
        <mdui-card class="about-author-card" variant="outlined">
            <img :src="globalVars.author.avatar" alt="avatar" class="author-avatar" />
            <div class="author-details">
                <h3>{{ globalVars.author.name }}</h3>

                <mdui-chip icon="email" :href="'mailto:' + globalVars.author.email" target="_blank">{{
                    globalVars.author.email }}</mdui-chip>
                <mdui-chip icon="code" :href="'https://github.com/' + globalVars.author.github"
                    target="_blank">GitHub</mdui-chip>
                <mdui-chip icon="chat" v-if="globalVars.author.qq">QQ: {{ globalVars.author.qq }}</mdui-chip>

            </div>
        </mdui-card>
        <br>
        <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            <!-- 站点信息卡片 -->
            <mdui-card class="siteinfo-card" variant="outlined">
                <h3>站点信息</h3>
                <ul>
                    <li>站点名称：{{ globalVars.site.name }}</li>
                    <li>创建日期：{{ new Date(globalVars.site.created_date).toLocaleDateString() }}</li>
                    <li>API地址：{{ globalVars.site.backpoint }}</li>
                    <li>API地址(IPv6)：{{ globalVars.site.backpoint_v6 }}</li>
                </ul>
            </mdui-card><!-- Artalk 信息卡片 -->
            <mdui-card class="artalk-card" variant="outlined">
                <h3>Artalk 评论系统</h3>
                <ul>
                    <li class="align-center">启用：<mdui-chip
                            :icon="globalVars.artalk.enable ? 'done' : 'disabled_by_default'">{{
                                globalVars.artalk.enable ?
                                    '已启用' : '未启用' }}</mdui-chip></li>
                    <li>服务器地址：{{ globalVars.artalk.server }}</li>
                    <li>站点名称：{{ globalVars.artalk.site }}</li>
                    <li>页面标题：{{ globalVars.artalk.pageTitle }}</li>
                </ul>
            </mdui-card>
            <!-- Navidrome 信息卡片 -->
            <mdui-card class="navidrome-card" variant="outlined">
                <h3>Navidrome 音乐服务</h3>
                <ul>
                    <li class="align-center">启用：<mdui-chip
                            :icon="globalVars.navidrome.enable ? 'done' : 'disabled_by_default'">{{
                                globalVars.navidrome.enable
                                    ? '已启用' : '未启用' }}</mdui-chip></li>
                    <li>服务器地址：{{ globalVars.navidrome.server }}</li>
                    <li>用户名：{{ globalVars.navidrome.user }}</li>
                    <li>播放列表URL：{{ globalVars.navidrome.playListURL }}</li>
                    <li>客户端名称：{{ globalVars.navidrome.clientName }}</li>
                    <li class="align-center">仅支持IPv6：<mdui-chip :icon="globalVars.navidrome.ipv6 ? 'done' : 'close'">{{
                        globalVars.navidrome.ipv6
                            ? '是' : '否' }}</mdui-chip></li>
                </ul>
            </mdui-card>
        </div>
    </div>
</template>

<script setup>
import { globalVars } from '@/utils/globalVars';
import { onMounted, ref } from 'vue';
import config from '../../../package.json';

var gh_package_data
var versionChip
const versionTip = ref("正在检查更新...");

// 比较版本号，支持字母
function compareVersions(a, b) {
    const pa = a.split('.');
    const pb = b.split('.');
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const va = pa[i] || '0';
        const vb = pb[i] || '0';
        // 先尝试数字比较
        const na = parseInt(va, 10);
        const nb = parseInt(vb, 10);
        if (!isNaN(na) && !isNaN(nb)) {
            if (na > nb) return 1;
            if (na < nb) return -1;
        } else {
            // 字符串比较
            if (va > vb) return 1;
            if (va < vb) return -1;
        }
    }
    return 0;
}

async function checkUpdate() {
    versionChip.setAttribute("loading", "true");
    await fetch('https://raw.githubusercontent.com/HwlloChen/home-page/refs/heads/master/package.json')
        .then(response => response.json())
        .then(data => {
            gh_package_data = data;
            const localVersion = config.version;
            const remoteVersion = gh_package_data.version;

            const needsUpdate = compareVersions(remoteVersion, localVersion) > 0;
            if (needsUpdate) {
                versionChip.setAttribute('end-icon', 'new_releases');
                versionTip.value = `(Update available: ${gh_package_data.version})`;
            } else {
                versionChip.setAttribute('end-icon', 'done');
                versionTip.value = "已是最新版本";
            }
            versionChip.removeAttribute("loading");
        })
        .catch(error => {
            console.error('Error fetching package.json:', error);
            versionTip.value = "检查更新失败，请稍后再试";
            versionChip.setAttribute('end-icon', 'warning');
            versionChip.removeAttribute("loading");
        });
}

onMounted(() => {
    versionChip = document.getElementById('versionChip');
    if (import.meta.env.DEV) versionChip.setAttribute('icon', 'logo_dev')

    checkUpdate();

});
</script>

<style scoped>
mdui-card {
    max-width: 430px;
    margin: 1rem;
    padding: 1.5rem;
    width: 100%;
}

@media (max-width: 600px) {
    mdui-card {
        margin: 0.25rem;
        padding: 1rem;
    }
}

mdui-chip {
    margin-right: 8px;
}

.about-author-card {
    display: flex;
    align-items: center;
}

.author-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 1.5rem;
    border: 2px solid #eee;
}

.author-details {
    flex: 1;
}

.siteinfo-card ul,
.navidrome-card ul,
.artalk-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.siteinfo-card li,
.navidrome-card li,
.artalk-card li {
    margin-bottom: 0.5rem;
}

.align-center {
    display: flex;
    align-items: center;
}

.info-cards {
    width: 100%;
}

.info-cards>* {
    align-self: flex-start;
}
</style>
