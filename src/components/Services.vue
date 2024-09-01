<script setup>
import { globalVars } from '@/utils/globalVars';
import { ref } from 'vue';

bg = "https://chenserver.top/dl/pic.png"

</script>

<template>
	<template v-for="site in sites">
		<section>
			<mdui-card :href="site.url" :target="site.blank ? '_blank' : '_self'" variant="elevated" class="bg"
				clickable :style="`--bg-url: url(${site.cover ? site.cover : ''})`">
				<div class="info">
					<div class="primary">
						<div class="title">
							{{ site.title }}
						</div>
						<div class="description">
							{{ site.description }}
						</div>
					</div>
					<div class="actions">
						<mdui-button :href="site.url" class="go-button">前往</mdui-button>
						<mdui-divider></mdui-divider>
						<span class="ubuntu-light">{{ site.url }}</span>
					</div>
				</div>
			</mdui-card>
		</section>
	</template>
</template>

<script>

var bg
const sites = ref([])

fetch(`${globalVars.backpoint}/sites`).then(response => response.json())
	.then(data => {
		sites.value = data
		console.log(sites)
	}).catch(e => {
		//使用硬编码值
		sites.value = [
			{
				"blank": false,
				"cover": false,
				"description": "My blog!!",
				"title": "Chen's Blog",
				"url": "https://blog.chenserver.top:81"
			},
			{
				"blank": true,
				"cover": false,
				"description": "My blog!!",
				"title": "Chen's Blog",
				"url": "https://blog.chenserver.top:81"
			}
		]
	})

</script>

<style lang="less" scoped>
.mdui-theme-dark mdui-card.bg::before {
	background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container), 0.1) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
		linear-gradient(to left, rgba(var(--mdui-color-surface-container), 0.1) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
		var(--bg-url);
	background-size: cover;
	background-position: top right;
	background-repeat: no-repeat;
}

.mdui-theme-auto mdui-card.bg::before {
	@media (prefers-color-scheme: dark) {
		background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container), 0.1) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
			linear-gradient(to left, rgba(var(--mdui-color-surface-container), 0.1) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
			var(--bg-url);
		background-size: cover;
		background-position: top right;
		background-repeat: no-repeat;
	}
}

mdui-card {
	width: 100%;
	height: 300px;
	position: relative;

	&.bg::before {
		content: '';
		display: block;
		width: 94%;
		height: 80%;
		position: absolute;
		top: 0;
		right: 0;
		opacity: 0.35;
		transition: all .3s var(--mdui-motion-easing-standard);
		background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container-low), 0.1) 0%, rgba(var(--mdui-color-surface-container-low), 1) 100%),
			linear-gradient(to left, rgba(var(--mdui-color-surface-container-low), 0.1) 0%, rgba(var(--mdui-color-surface-container-low), 1) 100%),
			var(--bg-url);
		background-size: cover;
		background-position: top right;
		background-repeat: no-repeat;
	}

	&.bg[hover]::before {
		width: 98%;
		height: 85%;
		opacity: 0.55;
	}
}


.info {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;

	.actions {
		position: relative;
		display: flex;
		align-items: center;
		height: 35px;
		padding: 1rem;
		background-color: rgba(var(--mdui-color-surface-container-highest), 0.7);

		mdui-divider {
			width: 100%;
			height: 0.075rem;
			margin: 0 0.5rem 0 1rem;
			background-color: rgb(var(--mdui-color-outline-variant));
		}

		span {
			white-space: nowrap;
			color: rgb(var(--mdui-color-outline));

			@media(max-width: 600px) {
				font-size: var(--mdui-typescale-body-small-size);
			}

			@media(min-width: 601px) {
				font-size: var(--mdui-typescale-body-medium-size);
			}
		}
	}

	.primary {
		padding-left: 1rem;
		margin-bottom: 1rem;

		.title {
			font-size: var(--mdui-typescale-display-small-size);
		}

		.description {
			margin-top: 0.2rem;
			padding-inline-start: 0.15rem;
			font-size: var(--mdui-typescale-body-medium-size);
		}
	}
}

.glass {
	.actions {
		background-color: rgba(var(--mdui-color-surface-container-highest), 0.55);
	}

	mdui-card {
		&.bg::before {
			width: 100%;
			height: 100%;
		}

		&.bg[hover]::before {
			width: 105%;
			height: 105%;
		}
	}
}

section {
	margin-bottom: 1rem;
}
</style>