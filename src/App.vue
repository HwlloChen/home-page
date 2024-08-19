<script setup>
import './utils/init'
import AppBar from './components/AppBar.vue';
import Theme from './components/Theme.vue';
import Yiyan from './components/Yiyan.vue';

</script>

<template>
  <mdui-layout>
    <AppBar />
    <mdui-layout-main>
      <Yiyan />
      <div class="main">
        
      </div>
    </mdui-layout-main>
  </mdui-layout>
  <Theme />
</template>

<style scoped>
.main {
  /* height: 1000px; */
  overflow: auto;
  display: flex;
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
