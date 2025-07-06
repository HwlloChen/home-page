<template>
  <div class="links-page">
    <div class="header" data-aos="fade-down">
      <h1 class="links-title">友链</h1>
      <p class="links-subtitle">与我一同探索数字世界</p>
      <mdui-divider></mdui-divider>
    </div>

    <div v-if="loading" class="loading-container" data-aos="fade-up">
      <mdui-circular-progress size="48" color="primary" indeterminate />
      <p class="loading-text">正在加载友链...</p>
    </div>

    <div v-else-if="links.length === 0" class="empty-state" data-aos="fade-up">
      <mdui-icon name="link_off" class="empty-icon"></mdui-icon>
      <p class="empty-text">暂无友链</p>
    </div>

    <div v-else class="links-container">
      <div class="stats" data-aos="fade-up">
        <mdui-chip class="stats-chip" color="primary">
          <mdui-icon slot="icon" name="link"></mdui-icon>
          共 {{ links.length }} 个友链
        </mdui-chip>
      </div>

      <transition-group name="link-list" tag="div" class="links-list">
        <mdui-card v-for="(link, index) in links" :key="link.id" class="link-card" variant="elevated"
          :data-aos="'fade-up'" :data-aos-delay="index * 100">
          <div class="link-card-content">
            <div class="link-avatar-container">
              <mdui-avatar v-if="link.avatar" :src="link.avatar" class="link-avatar" :alt="link.name"></mdui-avatar>
              <div v-else class="link-avatar-placeholder">
                <mdui-icon name="person"></mdui-icon>
              </div>
            </div>
            <div class="link-info">
              <div class="link-title-row">
                <a :href="link.url" class="link-name" target="_blank" rel="noopener">
                  {{ link.name }}
                </a>
                <div style="flex: 1;"></div>
                <mdui-chip v-if="link.addTime" class="link-time" color="primary" variant="outlined" size="small">
                  {{ formatDate(link.addTime) }}
                </mdui-chip>
              </div>
              <div class="link-desc" v-if="link.desc">{{ link.desc }}</div>
              <div class="link-url">{{ getDomain(link.url) }}</div>
            </div>
          </div>
        </mdui-card>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { globalVars } from '@/utils/globalVars'
import { setTitle } from '@/components/AppBar.vue'

const links = ref([])
const loading = ref(true)

// 格式化日期
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 获取域名
function getDomain(url) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

async function fetchLinks() {
  loading.value = true
  try {
    const res = await fetch(`${globalVars.site.backpoint}/links`)
    if (res.ok) {
      links.value = await res.json()
    }
  } catch (e) {
    console.error('获取友链失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setTitle(`友链`, `${globalVars.site.name} - 友链`)
  fetchLinks()
})
</script>

<style lang="less" scoped>
.links-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  min-height: 70vh;
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;

  .links-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, rgb(var(--mdui-color-primary)), rgb(var(--mdui-color-secondary)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .links-subtitle {
    font-size: 1.1rem;
    color: rgb(var(--mdui-color-on-surface-variant));
    margin-bottom: 1.5rem;
    opacity: 0.8;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;

  .loading-text {
    color: rgb(var(--mdui-color-on-surface-variant));
    font-size: 1rem;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: rgb(var(--mdui-color-on-surface-variant));

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 1.2rem;
  }
}

.links-container {
  .stats {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;

    .stats-chip {
      font-size: 0.9rem;
    }
  }

  .links-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;

    @media (max-width: 500px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
}

.link-card {
  border-radius: 16px;
  overflow: hidden;

  .link-card-content {
    display: flex;
    align-items: flex-start;
    padding: 1.5rem;
    gap: 1rem;
  }
}

.link-avatar-container {
  flex-shrink: 0;

  .link-avatar {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgb(var(--mdui-color-shadow) / 0.1);
  }

  .link-avatar-placeholder {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    background: rgb(var(--mdui-color-surface-variant));
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(var(--mdui-color-on-surface-variant));

    mdui-icon {
      font-size: 2rem;
    }
  }
}

.link-info {
  flex: 1;
  min-width: 0;

  .link-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .link-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(var(--mdui-color-primary));
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .link-time {
    font-size: 0.8rem;
  }

  .link-desc {
    color: rgb(var(--mdui-color-on-surface-variant));
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .link-url {
    font-size: 0.85rem;
    color: rgb(var(--mdui-color-outline));
    font-family: 'Courier New', monospace;
  }
}

// 列表动画
.link-list-enter-active {
  transition: all 0.5s var(--mdui-motion-easing-emphasized);
}

.link-list-leave-active {
  transition: all 0.3s var(--mdui-motion-easing-emphasized);
}

.link-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.link-list-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.link-list-move {
  transition: transform 0.5s var(--mdui-motion-easing-emphasized);
}

// 响应式设计
@media (max-width: 768px) {
  .links-page {
    padding: 1rem 0.5rem 2rem;
  }

  .header {
    margin-bottom: 2rem;

    .links-subtitle {
      font-size: 1rem;
    }
  }

  .link-card {
    .link-card-content {
      padding: 1rem;
      gap: 0.75rem;
    }
  }

  .link-avatar-container {

    .link-avatar,
    .link-avatar-placeholder {
      width: 48px;
      height: 48px;
    }
  }

  .link-info {
    .link-name {
      font-size: 1.1rem;
    }

    .link-desc {
      font-size: 0.9rem;
    }
  }
}

.glass {
  mdui-chip {
    background-color: rgba(var(--mdui-color-surface-container), 0.8);
  }
}
</style>
