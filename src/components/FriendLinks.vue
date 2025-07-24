<template>
  <mdui-card id="friend-links" data-aos="zoom-in">
    <div class="links-container">
      <div v-if="loading" class="loading">
        <mdui-circular-progress size="24" color="primary" indeterminate />
      </div>
      <div v-else-if="displayLinks.length > 0" class="links-grid">
        <div v-if="links.length > displayCount" class="progress-container">
          <mdui-linear-progress :value="progress" max="100"></mdui-linear-progress>
        </div>
        <mdui-list>
          <!-- 用transition-group包裹外层div，动画只作用于div -->
          <transition-group name="link-fade" tag="div" class="transition-container">
            <div v-for="link in displayLinks" :key="link.id">
              <mdui-list-item class="link-item" :href="link.url"
                target="_blank" rel="noopener">
                <mdui-avatar v-if="link.avatar" :src="link.avatar" slot="icon" :alt="link.name"></mdui-avatar>
                {{ link.name }}
                <span v-if="link.desc" slot="description"
                  style="font-size: .85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal; line-clamp: 2;">
                  {{ link.desc }}
                </span>
              </mdui-list-item>
            </div>
          </transition-group>
        </mdui-list>
      </div>
      <div v-else class="no-links">暂无友链</div>
      <div>
        <mdui-button v-if="links.length > 0" variant="tonal" class="view-all-btn" @click="goToLinksPage">
          查看全部友链
          <mdui-icon slot="end" name="arrow_forward"></mdui-icon>
        </mdui-button>
      </div>
    </div>
  </mdui-card>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { globalVars } from '@/utils/globalVars'
import { useRouter } from 'vue-router'

const displayCount = 3 // 每次显示的友链数量
const ROTATION_INTERVAL = 6 * 1000 // 6秒
const PROGRESS_INTERVAL = 80 // 80ms更新一次进度

const links = ref([])
const loading = ref(true)
const currentIndex = ref(0)
const router = useRouter()
const progress = ref(100) // 初始为100，倒计时到0
const animating = ref(false)

// 计算当前显示的友链
const displayLinks = computed(() => {
  if (links.value.length <= displayCount) {
    return links.value
  }

  const start = currentIndex.value
  const end = start + displayCount

  if (end <= links.value.length) {
    return links.value.slice(start, end)
  } else {
    // 处理循环显示
    return [
      ...links.value.slice(start),
      ...links.value.slice(0, end - links.value.length)
    ]
  }
})

// 获取友链数据
async function fetchLinks() {
  loading.value = true
  try {
    const res = await fetch(`${globalVars.site.backpoint}/links`)
    if (res.ok) {
      links.value = await res.json()
      // 随机化初始索引
      if (links.value.length > displayCount) {
        currentIndex.value = Math.floor(Math.random() * links.value.length)
      }
    }
  } catch (e) {
    console.error('获取友链失败:', e)
  } finally {
    loading.value = false
  }
}

// 轮换显示友链
function rotateLinks() {
  if (links.value.length > displayCount && !animating.value) {
    animating.value = true
    progress.value = 100 // 重置为100

    setTimeout(() => {
      currentIndex.value = (currentIndex.value + displayCount) % links.value.length
      animating.value = false
    }, 300)
  }
}

// 定时器
let rotateTimer = null
let progressTimer = null

onMounted(() => {
  fetchLinks()

  // 进度条更新定时器（倒计时）
  progressTimer = setInterval(() => {
    if (!animating.value && links.value.length > displayCount) {
      progress.value = Math.max(progress.value - (100 / (ROTATION_INTERVAL / PROGRESS_INTERVAL)), 0)
    }
  }, PROGRESS_INTERVAL)

  // 轮换定时器
  rotateTimer = setInterval(() => {
    rotateLinks()
  }, ROTATION_INTERVAL)
})

onUnmounted(() => {
  if (rotateTimer) {
    clearInterval(rotateTimer)
    rotateTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
})

// 跳转到友链页面并滚动到顶部
function goToLinksPage() {
  router.push('/links')
  // 使用 nextTick 确保路由跳转完成后再滚动
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
</script>

<style lang="less" scoped>
#friend-links {
  width: 100%;
  padding: .9rem;
  margin-bottom: 1.5rem;

  @media (max-width: 1080px) {
    margin-top: 1rem;
  }

  @media (min-width: 1081px) {
    max-width: 350px;
  }

  .links-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }

  .links-grid {
    display: flex;
    flex-direction: column;
    transition: height 0.4s ease;

    mdui-list {
      padding: 0;
      background: transparent;

      .transition-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        position: relative;
      }
    }
  }

  .link-item {
    border-radius: 8px;
    background: rgb(var(--mdui-color-surface-variant) / 0.3);
    transition: all 0.2s var(--mdui-motion-easing-standard);

    &:hover {
      background: rgb(var(--mdui-color-surface-variant) / 0.5);
      transform: translateX(4px);
    }
  }

  // 恢复动画相关样式
  .link-fade-enter-active {
    transition: all 0.4s ease;
  }
  .link-fade-leave-active {
    transition: all 0.4s ease;
    position: absolute;
    width: 100%;
  }
  .link-fade-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }
  .link-fade-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }
  .link-fade-move {
    transition: transform 0.4s ease;
  }

  .no-links {
    text-align: center;
    color: rgb(var(--mdui-color-on-surface-variant));
    padding: 2rem 0;
  }

  .progress-container {
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: center;

    mdui-linear-progress {
      width: 10rem;
      height: 0.35rem;
      border-radius: 999px;
    }
  }

  .view-all-btn {
    float: right;
  }
}
</style>