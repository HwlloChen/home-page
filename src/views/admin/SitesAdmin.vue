<template>
  <div class="admin-container mdui-prose">
    <h2 style="margin-bottom: 1rem;">站点管理</h2>
    <mdui-divider></mdui-divider>
    <mdui-card class="form-card">
      <form class="mdui-card-content" @submit.prevent="addSite">
        <mdui-text-field v-model="newSite.title" label="站点名称" required full-width />
        <mdui-text-field v-model="newSite.url" label="站点URL" required full-width />
        <mdui-text-field v-model="newSite.description" label="描述" full-width />
        <mdui-text-field v-model="newSite.cover" label="封面图片URL或false" full-width />
        <div style="display: flex; gap: 16px; margin: 8px 0;">
          <mdui-checkbox :checked="newSite.blank" @change="newSite.blank = $event.target.checked">新窗口打开</mdui-checkbox>
          <mdui-checkbox :checked="newSite.v6" @change="newSite.v6 = $event.target.checked">仅支持IPv6</mdui-checkbox>
        </div>
        <div>
          <mdui-button type="submit" style="float: right;">添加站点</mdui-button>
        </div>
      </form>
    </mdui-card>
    <div style="overflow-x: auto;">
      <table class="mdui-table mdui-mt-2">
        <thead>
          <tr>
            <th>名称</th>
            <th>URL</th>
            <th>描述</th>
            <th>封面</th>
            <th>新窗口</th>
            <th>需要IPv6</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="site in sites" :key="site.id || site.title">
            <td>
              <mdui-text-field v-if="editSite && editSite.id === site.id" v-model="editSite.title" dense />
              <span v-else>{{ site.title }}</span>
            </td>
            <td>
              <mdui-text-field v-if="editSite && editSite.id === site.id" v-model="editSite.url" dense />
              <span v-else>{{ site.url }}</span>
            </td>
            <td>
              <mdui-text-field v-if="editSite && editSite.id === site.id" v-model="editSite.description" dense />
              <span v-else>{{ site.description }}</span>
            </td>
            <td>
              <mdui-text-field v-if="editSite && editSite.id === site.id" v-model="editSite.cover" dense />
              <span v-else>{{ site.cover }}</span>
            </td>
            <td>
              <mdui-checkbox v-if="editSite && editSite.id === site.id" :checked="editSite.blank" @change="editSite.blank = $event.target.checked" />
              <span v-else>{{ site.blank ? '是' : '否' }}</span>
            </td>
            <td>
              <mdui-checkbox v-if="editSite && editSite.id === site.id" :checked="editSite.v6" @change="editSite.v6 = $event.target.checked" />
              <span v-else>{{ site.v6 ? '是' : '否' }}</span>
            </td>
            <td style="white-space:nowrap">
              <mdui-button v-if="editSite && editSite.id === site.id" color="primary" variant="contained"
                @click="saveEditSite(site.title)" size="small">保存</mdui-button>
              <mdui-button v-else color="primary" variant="outlined" @click="startEditSite(site)"
                size="small">编辑</mdui-button>
              <mdui-button color="error" variant="text" @click="deleteSite(site.id)" size="small">删除</mdui-button>
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

const sites = ref([])
const newSite = ref({ title: '', url: '', description: '', cover: '', blank: false, v6: false })
const editSite = ref(null)

async function fetchSites() {
  const res = await authedFetch(`${globalVars.site.backpoint}/sites`)
  if (res.ok) sites.value = await res.json()
}
onMounted(fetchSites)

async function addSite() {
  // cover 字段处理 false
  const payload = { ...newSite.value, cover: newSite.value.cover === 'false' ? false : newSite.value.cover }
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.ok) {
    newSite.value = { title: '', url: '', description: '', cover: '', blank: false, v6: false }
    fetchSites()
  }
}
function startEditSite(site) {
  editSite.value = { ...site } // 保证包含id字段
}
async function saveEditSite(oldTitle) {
  // cover 字段处理 false
  const payload = { ...editSite.value, cover: editSite.value.cover === 'false' ? false : editSite.value.cover }
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/sites`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.ok) {
    editSite.value = null
    fetchSites()
  }
}
async function deleteSite(id) {
  if (!id) return
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/sites?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
  if (res.ok) fetchSites()
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

.mdui-table td:nth-child(5),
.mdui-table th:nth-child(5) {
  max-width: 80px;
}

.mdui-table td:nth-child(6),
.mdui-table th:nth-child(6) {
  max-width: 80px;
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
