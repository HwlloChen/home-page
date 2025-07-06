<template>
  <div class="admin-container mdui-prose">
    <h2 style="margin-bottom: 1rem;">友链管理</h2>
    <mdui-divider></mdui-divider>
    <mdui-card class="form-card">
      <form class="mdui-card-content" @submit.prevent="addLink">
        <mdui-text-field v-model="newLink.name" label="友链名称" required full-width />
        <mdui-text-field v-model="newLink.url" label="友链URL" required full-width />
        <mdui-text-field v-model="newLink.desc" label="介绍" full-width />
        <mdui-text-field v-model="newLink.avatar" label="头像URL" full-width />
        <div>
          <mdui-button type="submit" style="float: right;">添加友链</mdui-button>
        </div>
      </form>
    </mdui-card>
    <div style="overflow-x: auto;">
      <table class="mdui-table mdui-mt-2">
        <thead>
          <tr>
            <th>名称</th>
            <th>URL</th>
            <th>介绍</th>
            <th>头像</th>
            <th>添加时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in links" :key="link.id">
            <td>
              <mdui-text-field v-if="editLink && editLink.id === link.id" v-model="editLink.name" dense />
              <span v-else>{{ link.name }}</span>
            </td>
            <td>
              <mdui-text-field v-if="editLink && editLink.id === link.id" v-model="editLink.url" dense />
              <span v-else>{{ link.url }}</span>
            </td>
            <td>
              <mdui-text-field v-if="editLink && editLink.id === link.id" v-model="editLink.desc" dense />
              <span v-else>{{ link.desc }}</span>
            </td>
            <td>
              <mdui-text-field v-if="editLink && editLink.id === link.id" v-model="editLink.avatar" dense />
              <mdui-avatar v-else :src="link.avatar" alt="头像" v-if="link.avatar" ></mdui-avatar>
            </td>
            <td>{{ link.addTime ? new Date(link.addTime * 1000).toLocaleString() : '' }}</td>
            <td style="white-space:nowrap">
              <mdui-button v-if="editLink && editLink.id === link.id" color="primary" variant="contained" @click="saveEditLink" size="small">保存</mdui-button>
              <mdui-button v-else color="primary" variant="outlined" @click="startEditLink(link)" size="small">编辑</mdui-button>
              <mdui-button color="error" variant="text" @click="deleteLink(link.id)" size="small">删除</mdui-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authedFetch } from '@/utils/auth'
import { globalVars } from '@/utils/globalVars'

const links = ref([])
const newLink = ref({ name: '', url: '', desc: '', avatar: '' })
const editLink = ref(null)

async function fetchLinks() {
  const res = await authedFetch(`${globalVars.site.backpoint}/links`)
  if (res.ok) links.value = await res.json()
}
onMounted(fetchLinks)

async function addLink() {
  const payload = { ...newLink.value }
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.ok) {
    newLink.value = { name: '', url: '', desc: '', avatar: '' }
    fetchLinks()
  }
}
function startEditLink(link) {
  editLink.value = { ...link }
}
async function saveEditLink() {
  const payload = { ...editLink.value }
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/links`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.ok) {
    editLink.value = null
    fetchLinks()
  }
}
async function deleteLink(id) {
  if (!id) return
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/links?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
  if (res.ok) fetchLinks()
}
</script>

<style scoped>
.admin-container {
  margin: 0 auto;
  padding: 16px;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 18px;
  letter-spacing: 1px;
}

.mdui-card-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: flex-end;
}

.mdui-card-content>* {
  flex: 1 1 220px;
  min-width: 180px;
}

.mdui-table {
  border-radius: 12px;
  overflow: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.mdui-table thead th {
  font-weight: 600;
}

.mdui-table td,
.mdui-table th {
  padding: 12px 10px;
  text-align: left;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mdui-table td:nth-child(1),
.mdui-table th:nth-child(1) {
  max-width: 120px;
}

.mdui-table td:nth-child(2),
.mdui-table th:nth-child(2) {
  max-width: 200px;
}

.mdui-table td:nth-child(3),
.mdui-table th:nth-child(3) {
  max-width: 180px;
}

.mdui-table td:nth-child(4),
.mdui-table th:nth-child(4) {
  max-width: 120px;
}

@media (max-width: 700px) {
  .admin-container {
    padding: 12px 2vw 24px 2vw;
  }
  .mdui-table {
    display: block;
    width: 100%;
    overflow-x: auto;
  }
  .mdui-table table {
    min-width: 700px;
  }
}

.form-card {
  padding: 1rem;
  margin-top: 1rem;
}
</style>
