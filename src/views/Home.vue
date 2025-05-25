<script setup>
import Yiyan from '../components/Yiyan.vue';
import Services from '../components/Services.vue';
import AboutMe from '../components/AboutMe.vue';
import { globalVars } from '../utils/globalVars';
import Comments from '../components/Comments.vue';
import { Announcements } from '@/utils/Announcements';
import { onMounted } from 'vue';
import { setTitle } from '@/components/AppBar.vue';

onMounted(() => {
    setTitle(globalVars.site.name);
    Announcements() // 显示公告
})
</script>

<template>
    <Yiyan />
    <div class="main">
        <main id="content">
            <section>
                <div class="section-title" data-aos="fade-right">
                    <mdui-icon name="dns--rounded"></mdui-icon>
                    <div class="section-title-text">
                        <span class="chinese">服务</span>
                        <span class="english ubuntu-light-italic">Services</span>
                    </div>
                </div>
                <Services />
            </section>
        </main>
        <div id="side">
            <section v-if="globalVars.artalk.enable">
                <div class="section-title" data-aos="fade-right">
                    <mdui-icon name="sentiment_very_satisfied"></mdui-icon>
                    <div class="section-title-text">
                        <span class="chinese">关于我</span>
                        <span class="english ubuntu-light-italic">About Me</span>
                    </div>
                </div>
                <AboutMe />
            </section>

            <section v-if="globalVars.artalk.enable">
                <div class="section-title" data-aos="fade-right">
                    <mdui-icon name="comment"></mdui-icon>
                    <div class="section-title-text">
                        <span class="chinese">留言板</span>
                        <span class="english ubuntu-light-italic">Comments</span>
                    </div>
                </div>
                <Comments />
            </section>
        </div>
    </div>
</template>

<style lang="less" scoped>
@max-width: 1080px;
@content-width-large: 75%;
@side-width-large: 25%;
@margin-side: 1.5rem;
@padding-main: 1.5rem;
@max-main-width: 1500px;

.main {
    display: flex;
    justify-content: center;
    margin: 2rem auto;
    padding: 0 @padding-main;
    max-width: @max-main-width;
    box-sizing: border-box;

    transition: all .3s;

    #content,
    #side {
        box-sizing: border-box;
        transition: all .3s;
    }

    /* 当屏幕宽度大于1080px时 */
    @media (min-width: (@max-width + 1)) {
        #content {
            width: @content-width-large;
        }

        #side {
            width: @side-width-large;
            margin-left: @margin-side;
            min-width: 300px;

            .section-title {
                font-size: 1.5rem;
                margin-bottom: 0.75rem;
            }
        }
    }

    /* 当屏幕宽度小于等于1080px时 */
    @media (max-width: @max-width) {
        flex-direction: column;
        padding: 0 .75rem;

        #content,
        #side {
            width: 100%;
            margin-bottom: 5px;
        }
    }
}
</style>
