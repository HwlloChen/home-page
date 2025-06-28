<script setup>
import { globalVars } from '@/utils/globalVars';
import { ref } from 'vue';
import { hasV6 } from './IPv6Checker.vue';

</script>

<template>
	<template v-for="site in sites">
		<mdui-card variant="elevated" :class="['service-card', site.cover && site.cover != 'false' ? 'bg' : 'text']"
			data-aos="fade-right" data-aos-anchor-placement="top-bottom" data-aos-offset="40"
			:style="`--bg-url: url(${site.cover ? site.cover : ''}); --site-title: '${addEscapeToQuotes(site.title)}'`">
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
					<mdui-button :="{ disabled: (site.v6 && !hasV6) }" :href="site.url"
						:target="site.blank ? '_blank' : '_self'" :end-icon="site.blank ? 'call_made' : ''"
						class="go-button">前往</mdui-button>
					<mdui-divider></mdui-divider>
					<span class="ubuntu-light">{{ site.url }}</span>
				</div>
			</div>
		</mdui-card>
	</template>
</template>

<script>
const sites = ref([])

fetch(`${globalVars.site.backpoint}/sites`).then(response => response.json())
	.then(data => {
		if (window.scrollY > 300) {
			// 滚动超过300px时直接显示
			sites.value = data;
		} else {
			// 逐个显示，动画效果好一点
			sites.value = [];
			data.forEach((site, index) => {
				setTimeout(() => {
					sites.value.push(site);
				}, index * 100);
			});
		}
	}).catch(e => {
		//使用硬编码值
		sites.value = [
			{
				"title": "Chen's Blog",
				"description": "My blog!!",
				"url": "https://blog.etaris.moe",
				"cover": false,
				"blank": false,
				"v6": false
			},
			{
				"title": "弘毅Club",
				"description": "士不可以不弘毅，任重而道远！",
				"url": "https://hyclub.top",
				"cover": false,
				"blank": true,
				"v6": false
			}
		]
	})

function addEscapeToQuotes(s) {
	// 使用正则表达式全局匹配 " 和 '
	return s.replace(/(["'])/g, '\\$1');
}
</script>

<style lang="less" scoped>
/* 针对暗色模式调整 */
.mdui-theme-dark mdui-card.bg::before {
	background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container), 0.05) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
		linear-gradient(to left, rgba(var(--mdui-color-surface-container), 0.05) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
		var(--bg-url);
	background-size: cover;
	background-position: top right;
	background-repeat: no-repeat;
}

.mdui-theme-auto mdui-card.bg::before {
	@media (prefers-color-scheme: dark) {
		background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container), 0.05) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
			linear-gradient(to left, rgba(var(--mdui-color-surface-container), 0.05) 0%, rgba(var(--mdui-color-surface-container), 1) 100%),
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
	transition: all .5s var(--mdui-motion-easing-standard) !important;
	box-shadow: var(--mdui-elevation-level1);
	margin-bottom: 1rem;

	&:hover {
		box-shadow: var(--mdui-elevation-level4);
	}

	&::before {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		right: 0;
		transition: all .3s var(--mdui-motion-easing-standard);
	}

	&.text:hover::before {
		transition: all 15s cubic-bezier(0.03, 0.7, 0.1, 1),
			color 5s var(--mdui-motion-easing-emphasized-accelerate);
	}

	&.text::before {
		top: -4rem;
		right: 0;
		content: var(--site-title);
		width: 70%;
		color: rgba(var(--mdui-color-secondary-container), 0.45);
		font-family: "Ubuntu", sans-serif;
		font-weight: 700;
		font-style: normal;
		font-size: 14rem;
		white-space: nowrap;
	}

	&.text:hover:before {
		color: rgba(var(--mdui-color-secondary-container), 0.75);
		width: 85%;
	}

	&.bg::before {
		width: 94%;
		height: 80%;
		opacity: 0.75;
		background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container-low), 0) 0%, rgba(var(--mdui-color-surface-container-low), 1) 100%),
			linear-gradient(to left, rgba(var(--mdui-color-surface-container-low), 0.05) 0%, rgba(var(--mdui-color-surface-container-low), 1) 100%),
			/* 针对亮色模式调整 */
			var(--bg-url);
		background-size: cover;
		background-position: top right;
		background-repeat: no-repeat;
	}

	&.bg:hover:before {
		width: 98%;
		height: 85%;
		opacity: 0.8;
	}

	.mdui-theme-dark & {
		&.bg:hover:before {
			opacity: 0.6;
		}

		&.bg:before {
			opacity: 0.5;
		}
	}

	.mdui-theme-auto & {
		@media (prefers-color-scheme: dark) {
			&.bg:hover:before {
				opacity: 0.6;
			}

			&.bg:before {
				opacity: 0.5;
			}
		}
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
		background-color: rgba(var(--mdui-color-surface-container-highest), 0.8);


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

		.go-button {
			transition: box-shadow 0.3s var(--mdui-motion-easing-standard);

			&:hover {
				box-shadow: var(--mdui-elevation-level2);
			}

			&:active {
				box-shadow: var(--mdui-elevation-level5);
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
		background-color: rgba(var(--mdui-color-surface-container-highest), 0.5);
		backdrop-filter: blur(5px);

		border: 0 !important;
		border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
	}

	.service-card {
		&.bg::before {
			width: 100%;
			height: 100%;

			.mdui-theme-light & {
				background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container-low), 0) 0%, rgba(var(--mdui-color-surface-container-low), 0.85) 100%),
					linear-gradient(to left, rgba(var(--mdui-color-surface-container-low), 0.05) 0%, rgba(var(--mdui-color-surface-container-low), 0.85) 100%),
					/* 针对亮色模式调整 */
					var(--bg-url);
				background-size: cover;
				background-position: top right;
				background-repeat: no-repeat;
			}
		}

		&.bg:hover:before {
			width: 103%;
			height: 103%;
		}

		backdrop-filter: blur(6.5px);
		-webkit-backdrop-filter: blur(6.5px);
	}
}
</style>