<template>
  <mdui-card class="admin-layout">
    <div v-if="!authed" class="login-wrapper">
      <mdui-card class="login-card">
        <h2>
          <mdui-card-title>后台登录</mdui-card-title>
        </h2>
        <form @submit.prevent="handleLogin">
          <mdui-text-field v-model="username" label="用户名" required />
          <mdui-text-field v-model="password" label="密码" type="password" required />
        </form>
        <mdui-button color="primary" @click="handleLogin">登录</mdui-button>
      </mdui-card>
    </div>
    <template v-else>
      <div class="admin-main">
        <keep-alive>
          <router-view />
        </keep-alive>
      </div>
    </template>
  </mdui-card>
  <mdui-navigation-drawer v-if="authed" class="admin-drawer" :open="drawerOpen" contained close-on-overlay-click>
    <mdui-list>
      <mdui-list-item end-icon="info" :active="tab === 'about'" @click="goTab('about')" rounded>关于</mdui-list-item>
      <mdui-list-item end-icon="announcement" :active="tab === 'announcements'" @click="goTab('announcements')" rounded>公告管理</mdui-list-item>
      <mdui-list-item end-icon="dns--rounded" :active="tab === 'sites'" @click="goTab('sites')" rounded>站点管理</mdui-list-item>
      <mdui-list-item end-icon="link" :active="tab === 'links'" @click="goTab('links')" rounded>友链管理</mdui-list-item>
      <mdui-list-item end-icon="library_music" :active="tab === 'music'" @click="goTab('music')" rounded>音乐分享管理</mdui-list-item>
      <mdui-list-item end-icon="open_in_new" href="/" target="_blank" rounded>打开主页</mdui-list-item>
      <mdui-list-item end-icon="logout" @click="logout" rounded>退出登录</mdui-list-item>
    </mdui-list>
  </mdui-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { setToken, getToken, removeToken, isAuthed } from '@/utils/auth'
import { useRouter } from 'vue-router'
import { globalVars } from '@/utils/globalVars'
import { observeResize, snackbar } from 'mdui'
import { setTitle } from '@/components/AppBar.vue'

const tab = ref('announcements')
const router = useRouter()
const drawerOpen = ref(false)

setTitle(`${globalVars.site.name} - 后台管理`)

function goTab(t) {
  tab.value = t
  if (t === 'about') router.push('/admin')
  else if (t === 'announcements') router.push('/admin/announcements')
  else if (t === 'sites') router.push('/admin/sites')
  else if (t === 'links') router.push('/admin/links')
  else if (t === 'music') router.push('/admin/music-share')

  if (window.innerWidth < 900) drawerOpen.value = false;
}

const username = ref('')
const password = ref('')
const loginError = ref('')
const authed = computed(() => isAuthed())

async function handleLogin() {
  loginError.value = ''
  try {
    const res = await fetch(`${globalVars.site.backpoint}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    if (!res.ok) {
      snackbar({ message: '用户名或密码错误' })
      return
    }
    const data = await res.json()
    setToken(data.token)
    window.location.reload()
  } catch (e) {
    console.error('登录请求失败:', e)
    snackbar({ message: '登录请求失败，请稍后再试' })
  }
}

function logout() {
  removeToken()
  window.location.reload()
}

// 保证tab高亮与路由同步
onMounted(() => {
  syncTabWithRoute()
})
watch(() => router.currentRoute.value.path, syncTabWithRoute)
function syncTabWithRoute() {
  const path = router.currentRoute.value.path
  if (path === '/admin' || path === '/admin/') tab.value = 'about'
  else if (path.includes('/admin/announcements')) tab.value = 'announcements'
  else if (path.includes('/admin/sites')) tab.value = 'sites'
  else if (path.includes('/admin/links')) tab.value = 'links'
  else if (path.includes('/admin/music-share')) tab.value = 'music'
}

if (authed.value) {
  window.addEventListener('toggle-admin-drawer', () => {
    drawerOpen.value = !drawerOpen.value
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth < 900) {
      drawerOpen.value = false
    }
  })
  setTimeout(() => {
    if (window.innerWidth >= 900) drawerOpen.value = true;
  }, 80);
}
</script>

<style scoped>
.admin-layout {
  margin: 1rem 2rem;
  display: flex;
}

.admin-drawer {
  top: 64px;
  max-height: 100vh;
  position: fixed;
}

.admin-main {
  flex: 1;
  padding: 32px;
  min-width: 0;
}

@media (max-width: 900px) {
  .admin-main {
    padding: 16px;
  }

  .admin-layout {
    margin: 0.5rem;
  }
}

.login-wrapper {
  height: 60vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  min-width: 320px;
  max-width: 90vw;
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
}

mdui-text-field {
  margin-bottom: 0.5rem;
}

mdui-list-item {
  /* left: -28px; */

  &::part(container) {
    margin-left: 28px;
  }
}

mdui-navigation-drawer::part(panel) {
  width: 20rem;
  padding-right: 0.5rem;
  left: -28px;
}

.glass {
  mdui-navigation-drawer::part(panel) {
    background-color: rgba(var(--mdui-color-surface), 0.8);
    backdrop-filter: blur(10px);
  }
}
</style>
