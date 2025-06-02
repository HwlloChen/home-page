<template>
  <div class="admin-container mdui-prose">
    <div class="header">
      <h2>公告管理</h2>
      <mdui-button @click="editorComponent.newAnnouncement">新增公告</mdui-button>
    </div>
    <mdui-divider></mdui-divider>
    <table>
      <thead>
        <tr>
          <th>内容</th>
          <th>发布者</th>
          <th>发布时间</th>
          <th>重要等级</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(a, idx) in announcements" :key="idx">
          <td>
            <span>{{ a.content }}</span>
          </td>
          <td>
            <span>{{ a.publisher }}</span>
          </td>
          <td>
            <span>{{ new Date(a.publishTime).toLocaleString() }}</span>
          </td>
          <td>
            <span>{{ importanceText(a.importance) }}</span>
          </td>
          <td style="white-space:nowrap">
            <mdui-button color="primary" variant="outlined" @click="startEdit(a)">编辑</mdui-button>
            <mdui-button color="error" variant="text" @click="deleteAnnouncement(idx)">删除</mdui-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <AnnouncementEditor ref="editorComponent" @updated="fetchAnnouncements" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authedFetch } from '@/utils/auth'
import { globalVars } from '@/utils/globalVars'
import AnnouncementEditor from '@/components/admin/AnnouncementEditor.vue'

const announcements = ref([])
const editorComponent = ref(null)

function importanceText(val) {
  if (val === 3) return '非常重要'
  if (val === 2) return '重要'
  return '普通'
}

async function fetchAnnouncements() {
  const res = await fetch(`${globalVars.site.backpoint}/announcements`)
  if (res.ok) announcements.value = await res.json()
}
onMounted(fetchAnnouncements)

function startEdit(a) {
  if (editorComponent.value) {
    a.importance = String(a.importance) // 确保重要等级是字符串
    editorComponent.value.editAnnouncement(a)
  } else {
    console.error('Editor component may be not initialized.')
  }
}

async function deleteAnnouncement(idx) {
  const a = announcements.value[idx]
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/announcements?id=${encodeURIComponent(a.id)}`, {
    method: 'DELETE'
  })
  if (res.ok) fetchAnnouncements()
}
</script>

<style scoped>
.admin-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 18px;
  letter-spacing: 1px;
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
    min-width: 600px;
  }
}

.form-card {
  padding: 1rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
