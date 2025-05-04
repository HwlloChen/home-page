<script setup>
import { globalVars } from '@/utils/globalVars';
import Artalk from 'artalk';
import { onMounted } from 'vue';
import { brightness_modes } from './AppBar.vue';

function initArtalk() {
    return new Promise(function (resolve, reject) {
        try {
            artalk = Artalk.init({
                el: '#comments-card',
                pageTitle: globalVars.artalk.pageTitle,
                server: globalVars.artalk.server,
                site: globalVars.artalk.site,
                pageKey: "/",
                darkMode: ['auto', false, true][brightness_modes.indexOf(globalVars.theme.light)]
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}

onMounted(() => {
    setTimeout(() => {
        initArtalk().then(() => {
            console.log("Artalk initialized.");
        }).catch(e => {
            console.error("Artalk initialization failed.");
            globalVars.artalk.enable = false; // Disable Artalk if initialization failed
        });
    }, 100);
});

</script>

<template>
    <mdui-card :variant="globalVars.theme.bgImage ? 'elevated' : 'outlined'" data-aos="zoom-in" id="comments-card">

    </mdui-card>
</template>

<script>
export var artalk;

artalk = undefined;
</script>

<style lang="less" scoped>
#comments-card {
    width: 100%;
    min-height: 250px;
    height: auto;
    position: relative;

    .glass & {
        box-shadow: var(--mdui-elevation-level1);
    }
}
</style>