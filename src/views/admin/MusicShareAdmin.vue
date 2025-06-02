<template>
  <div class="admin-container mdui-prose">
    <h2 style="margin-bottom: 1rem;">音乐分享管理</h2>
    <mdui-divider></mdui-divider>
    <div style="overflow-x: auto; margin-top: 1rem;">
      <table class="mdui-table mdui-mt-2">
        <thead>
          <tr>
            <th>分享ID</th>
            <th>标题</th>
            <th>艺术家</th>
            <th>评论</th>
            <th>分享时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="share in shares" :key="share.id">
            <td>{{ share.id }}</td>
            <td>{{ share.title }}</td>
            <td>{{ share.artist }}</td>
            <td>{{ share.comment }}</td>
            <td>{{ formatTime(share.shareTime) }}</td>
            <td>
              <mdui-button color="primary" variant="text" @click="goShare(share.id)" size="small">跳转</mdui-button>
              <mdui-button color="error" variant="text" @click="deleteShare(share.id)" size="small">删除</mdui-button>
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

const shares = ref([])

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleString()
}

async function fetchShares() {
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/music/share?admin=1`)
  if (res.ok) shares.value = await res.json()
}

async function deleteShare(id) {
  if (!id) return
  const res = await authedFetch(`${globalVars.site.backpoint}/admin/music/share?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
  if (res.ok) fetchShares()
}

function goShare(id) {
  if (!id) return
  const url = `/music/share/${id}`
  window.open(url, '_blank')
}

onMounted(fetchShares)
</script>

<style scoped>
.admin-container {
  margin: 0 auto;
  padding: 16px;
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
</style>
