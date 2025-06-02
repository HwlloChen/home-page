<template>
  <mdui-dialog :headline="headline" id="announcement-editor-dialog" icon="edit">
    <div class="announcement-editor-flex-row">
      <div class="announcement-editor-left">
        <mdui-text-field v-model="Announcement.content" autosize max-rows="15" label="公告内容" />
        <mdui-text-field v-model="Announcement.publisher" label="发布者" />
        <mdui-select v-model="Announcement.importance" @change="(v) => Announcement.importance = v.target.value"
          label="重要等级">
          <mdui-menu-item value="1">普通</mdui-menu-item>
          <mdui-menu-item value="2">重要</mdui-menu-item>
          <mdui-menu-item value="3">非常重要</mdui-menu-item>
        </mdui-select>
        <template v-if="Announcement.importance === '3' && !isWideScreen">
          <mdui-button @click="openPreview" class="preview-btn">预览Markdown</mdui-button>
        </template>
      </div>
      <template v-if="Announcement.importance === '3' && isWideScreen">
        <div class="announcement-editor-preview-widescreen">
          <div class="preview-title">Markdown预览</div>
          <div v-html="renderedMarkdown" class="mdui-prose markdown-preview-widescreen"></div>
        </div>
      </template>
    </div>
    <mdui-button slot="action" variant="outlined" @click="openDialog">取消</mdui-button>
    <mdui-button slot="action" @click="submitAnnouncement">{{ submitbuttonText }}</mdui-button>
    <mdui-dialog v-if="Announcement.importance === '3' && showPreview && !isWideScreen" open @close="closePreview"
      fullscreen>
      <div class="preview-title">Markdown预览</div>
      <div v-html="renderedMarkdown" class="mdui-prose markdown-preview-mobile"></div>
      <mdui-button slot="action" @click="closePreview">关闭</mdui-button>
    </mdui-dialog>
  </mdui-dialog>
</template>

<script setup>
import { authedFetch } from '@/utils/auth'
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { globalVars } from '@/utils/globalVars'
import { marked } from 'marked'
import { observeResize } from 'mdui'
const emit = defineEmits(['updated'])

const headline = ref('编辑公告'); // 或新增公告
const submitbuttonText = ref('修改公告'); // 或新增公告

var observer

defineExpose({
  editAnnouncement,
  newAnnouncement,
  openDialog
});

// 公告内容，需要通过参数获取
const Announcement = ref({
  content: '',
  publisher: '',
  importance: '1', // 默认普通
  id: null // 用于编辑时的ID
});

function openDialog() {
  const dialog = document.getElementById('announcement-editor-dialog')
  dialog.open = !dialog.open; // 切换对话框的打开状态
  if (!dialog.open && observer) {
    observer.unobserve();
  } else {
    const editorDialog = document.getElementById('announcement-editor-dialog');
    observer = observeResize(document.body, function (entry) {
      isWideScreen.value = entry.contentRect.width >= 1024
      if (entry.contentRect.width < 1024) {
        editorDialog.setAttribute('fullscreen', ''); // 设置为全屏
      } else {
        editorDialog.removeAttribute('fullscreen'); // 移除全屏
      }
    });
  }
}

function editAnnouncement(announcement) {
  headline.value = '编辑公告';
  submitbuttonText.value = '修改公告';
  Announcement.value = { ...announcement };
  console.log('Editing announcement:', Announcement.value);
  openDialog();
}

function newAnnouncement() {
  headline.value = '新增公告';
  submitbuttonText.value = '新增公告';
  Announcement.value = { content: '', publisher: '', importance: '1', id: null }; // 重置
  openDialog();
}

async function submitAnnouncement() {
  const isEdit = Announcement.value.id
  const url = isEdit
    ? `${globalVars.site.backpoint}/admin/announcements`
    : `${globalVars.site.backpoint}/admin/announcements`
  const method = isEdit ? 'PUT' : 'POST'
  const body = JSON.stringify({
    ...Announcement.value,
    importance: Number(Announcement.value.importance)
  })
  const res = await authedFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body
  })
  if (res.ok) {
    openDialog()
    emit('updated')
  } else {
    alert('操作失败，请重试')
  }
}

const showPreview = ref(false)
const isWideScreen = ref(window.innerWidth >= 900)

const renderedMarkdown = computed(() => marked.parse(Announcement.value.content || ''))

function openPreview() {
  showPreview.value = true
}
function closePreview() {
  showPreview.value = false
}

// 动态为body添加/移除class以控制样式
watch(() => Announcement.value.importance, (val) => {
  nextTick(() => {
    if (val === '3') {
      document.body.classList.add('announcement-important3')
    } else {
      document.body.classList.remove('announcement-important3')
    }
  })
}, { immediate: true })
</script>

<style scoped>
.announcement-editor-flex-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.announcement-editor-left {
  flex: 1;
  min-width: 0;
}

.announcement-editor-preview-widescreen {
  flex: 1;
  min-width: 0;
  border-left: 1px solid #eee;
  padding-left: 1rem;
  overflow: auto;
}

.preview-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.markdown-preview-widescreen {
  overflow: auto;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid grey;
  max-height: calc(100vh - 15rem - 138px);
}

.markdown-preview-mobile {
  overflow: auto;
  border-radius: 6px;
  margin-top: 1rem;
  max-height: calc(100vh - 11rem);
  border: 1px solid grey;
}

.preview-btn {
  margin-top: 0.5rem;
}

mdui-text-field {
  margin-bottom: 0.75rem;
}

.announcement-important3 #announcement-editor-dialog::part(panel) {
  max-width: 1024px;
}
</style>