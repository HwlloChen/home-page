<script setup>
import './utils/init'
import AppBar from './components/AppBar.vue';
import Theme, { useGlass } from './components/Theme.vue';
import Yiyan from './components/Yiyan.vue';
import Services from './components/Services.vue';
import AboutMe from './components/AboutMe.vue';
import { onMounted, watch } from 'vue';
import { globalVars } from './utils/globalVars';
import { hasV6 } from './components/IPv6Checker.vue';
import Music from './components/Music.vue';
import Footer from './components/Footer.vue';
import Comments from './components/Comments.vue';

onMounted(() => {
	//绑定glass类到body
	useGlass.value ? document.body.classList.add("glass") : document.body.classList.remove("glass")
	watch(useGlass, (v) => {
		v ? document.body.classList.add("glass") : document.body.classList.remove("glass")
	})
})
</script>

<template>
	<h1 style="display: none;">{{ globalVars.siteName }}</h1>
	<mdui-layout>
		<AppBar />
		<mdui-layout-main>
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
					<section v-if="globalVars.artalk.enable">
						<div class="section-title" data-aos="fade-right">
							<mdui-icon name="comment"></mdui-icon>
							<div class="section-title-text">
								<span class="chinese ">留言板</span>
								<span class="english ubuntu-light-italic">Comments</span>
							</div>
						</div>
						<Comments />
					</section>
				</main>
				<div id="side" v-if="false">
					<AboutMe />
				</div>
			</div>
		</mdui-layout-main>
		<Footer />
	</mdui-layout>
	<Theme />
	<Music v-if="hasV6 && globalVars.navidrome.enable" />
</template>

<style lang="less" scoped>
@max-width: 1080px;
@content-width-large: 75%;
@side-width-large: 25%;
@margin-side: 20px;
@padding-main: 15px;
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
			margin-right: @margin-side;
		}

		#side {
			width: @side-width-large;
		}
	}

	/* 当屏幕宽度小于等于1080px时 */
	@media (max-width: @max-width) {
		flex-direction: column;

		#content,
		#side {
			width: 100%;
			margin-bottom: 5px;
		}
	}
}


mdui-layout {
	box-sizing: border-box;
	flex-direction: column;
	min-height: 100vh;
}

mdui-layout-main {
	flex: 1;
}

.section-title {
	font-size: 1.75rem;
	margin-bottom: 1rem;
	display: flex;
	align-items: center;
	align-content: center;
	text-align: center;

	mdui-icon {
		margin-right: 10px;
		font-size: 1.75rem;
	}

	.section-title-text {
		display: flex;
		align-items: flex-end;
		/* 底部对齐 */

		.english {
			margin-left: 0.5rem;
			color: rgb(var(--mdui-color-secondary));
		}
	}

	@media(max-width: 1080px) {
		font-size: 1.5rem;
		margin-left: 0;
	}
	@media(min-width: 1081px) {
		font-size: 1.75rem;
		margin-left: -1rem;
	}
}
</style>
