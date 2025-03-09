<script setup>
import { globalVars } from "@/utils/globalVars";
</script>

<template>
  <!--About Me关于页面-->
  <address>
    <mdui-card id="about-me">
      <div class="avatar-container">
        <img
          :src="globalVars.author.avatar"
          :alt="globalVars.author.name"
          class="avatar"
        />
      </div>
      <div class="info-container">
        <div class="name">{{ globalVars.author.name }}</div>
        <div class="description">{{ globalVars.author.description }}</div>
        <div class="contact">
          <mdui-tooltip :content="`邮箱`" placement="top-start">
            <mdui-button-icon
              v-if="globalVars.author.email"
              :href="'mailto:' + globalVars.author.email"
              icon="mail"
              variant="tonal"
            ></mdui-button-icon>
          </mdui-tooltip>
          <mdui-tooltip :content="`Github`" placement="top-start">
            <mdui-button-icon
              v-if="globalVars.author.github"
              :href="'https://github.com/' + globalVars.author.github"
              target="_blank"
              icon="code"
              variant="tonal"
            ></mdui-button-icon>
          </mdui-tooltip>
          <mdui-tooltip :content="`QQ`" placement="top-start">
            <mdui-button-icon
              v-if="globalVars.author.qq"
              :href="`http://wpa.qq.com/msgrd?v=3&uin=${String(globalVars.author.qq)}&site=qq&menu=yes`"
              target="_blank"
              icon="chat"
              variant="tonal"
            ></mdui-button-icon>
          </mdui-tooltip>
        </div>
      </div>
    </mdui-card>
  </address>
</template>

<style lang="less" scoped>
#about-me {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  width: 100%;
  height: auto;
  min-height: 300px;
  margin-bottom: 1.5rem;

  @media (max-width: 1080px) {
    margin-top: 1rem;
  }

  @media (min-width: 1081px) {
    max-width: 350px;
    position: sticky;
    top: 1rem;
  }

  .avatar-container {
    margin-bottom: 1.25rem;

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: var(--mdui-elevation-level2);
      transition: transform 0.3s var(--mdui-motion-easing-standard);

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .info-container {
    text-align: center;
    width: 100%;

    .name {
      font-size: var(--mdui-typescale-headline-small-size);
      font-weight: var(--mdui-typescale-headline-small-weight);
      margin-bottom: 0.5rem;
      color: rgb(var(--mdui-color-primary));
    }

    .description {
      font-size: var(--mdui-typescale-body-medium-size);
      color: rgb(var(--mdui-color-on-surface-variant));
      margin-bottom: 1.5rem;
    }

    .contact {
      display: flex;
      justify-content: center;
      gap: 1rem;

      mdui-button-icon {
        transition: transform 0.2s var(--mdui-motion-easing-standard);

        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style>
