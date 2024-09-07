<script setup>
import './utils/init'
import AppBar from './components/AppBar.vue';
import Theme, { useGlass } from './components/Theme.vue';
import Yiyan from './components/Yiyan.vue';
import Services from './components/Services.vue';
import AboutMe from './components/AboutMe.vue';
import { onMounted, watch } from 'vue';

onMounted(() => {
	//绑定glass类到body
	useGlass.value ? document.body.classList.add("glass") : document.body.classList.remove("glass")
	watch(useGlass, (v) => {
		v ? document.body.classList.add("glass") : document.body.classList.remove("glass")
	})
})

</script>

<template>
	<mdui-layout>
		<AppBar />
		<mdui-layout-main>
			<Yiyan />
			<div class="main">
				<main id="content">
					<Services />
				</main>
				<div id="side" v-if="false">
					<AboutMe />
				</div>
			</div>

		</mdui-layout-main>
		<Theme />
	</mdui-layout>
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
	scrollbar-width: thin;
	overflow: visible;
	box-sizing: border-box;
}

mdui-layout-main {
	scrollbar-width: thin;
	overflow: visible;
}
</style>
