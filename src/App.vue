<script setup>
import './utils/init'
import AppBar from './components/AppBar.vue';
import Theme, { useGlass } from './components/Theme.vue';
import { onMounted, watch, ref } from 'vue';
import { globalVars } from './utils/globalVars';
import { hasV6 } from './components/IPv6Checker.vue';
import Music from './components/SideMusic.vue';
import Footer from './components/Footer.vue';
import Live2d from './components/Live2d.vue';

const musicShareRef = ref(null);

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
			<router-view ref="musicShareRef"></router-view>
		</mdui-layout-main>
		<Footer />
	</mdui-layout>
	<Theme />
	<Music v-if="hasV6 && globalVars.navidrome.enable" />
	<Live2d />
</template>

<style lang="less">
// 全局样式
mdui-layout {
	box-sizing: border-box;
	flex-direction: column;
	min-height: 100vh;
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
