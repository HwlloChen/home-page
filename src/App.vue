<script setup>
import AppBar from './components/AppBar.vue';
import Theme from './components/Theme.vue';

</script>

<template>
  <mdui-layout>
    <AppBar />
    <mdui-layout-main>
      <div class="main">
        some thing
      </div>
    </mdui-layout-main>
  </mdui-layout>
  <Theme />
</template>

<style scoped>
.main {
  height: 1000px;
  overflow: auto;
}

mdui-layout {
  overflow: visible;
}

mdui-layout-main {
  overflow: visible;
  display: block;
  scroll-behavior: smooth;
}
</style>
