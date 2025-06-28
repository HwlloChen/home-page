<script setup>
import { globalVars } from "@/utils/globalVars";
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 存储动画状态的响应式数组
const animationStates = ref([]);
// 存储当前显示文本的状态
const displayStates = ref([]);

const descriptionParts = computed(() => {
  const text = globalVars.author.description;
  const parts = [];
  let lastIndex = 0;
  let animIndex = 0;

  // 匹配所有 %...% 内容
  const pattern = /%([^%]+)%/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'static',
        content: text.slice(lastIndex, match.index)
      });
    }

    // 确保状态数组有足够的元素
    if (animationStates.value.length <= animIndex) {
      animationStates.value.push({
        currentIndex: 0,
        isAnimating: false,
        phase: 'idle' // 添加动画阶段标识
      });
      displayStates.value.push({
        currentText: '',
        nextText: ''
      });
    }

    parts.push({
      type: 'animated',
      animations: match[1].split('|').map(s => s.trim()),
      stateIndex: animIndex
    });

    // 初始化显示文本
    if (!displayStates.value[animIndex].currentText) {
      displayStates.value[animIndex].currentText = parts[parts.length - 1].animations[0];
    }

    animIndex++;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'static',
      content: text.slice(lastIndex)
    });
  }

  return parts;
});

// 获取一个随机的下一个索引，避免与当前索引相同
const getRandomNextIndex = (currentIndex, maxLength) => {
  if (maxLength <= 1) return 0;
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * maxLength);
  } while (nextIndex === currentIndex);
  return nextIndex;
};

const handleClick = (part) => {
  const state = animationStates.value[part.stateIndex];
  const display = displayStates.value[part.stateIndex];
  if (state.isAnimating) return;

  state.isAnimating = true;
  state.phase = 'exit';

  // 使用随机选择下一个文本
  const nextIndex = getRandomNextIndex(state.currentIndex, part.animations.length);
  display.nextText = part.animations[nextIndex];

  setTimeout(() => {
    state.phase = 'enter';
    display.currentText = display.nextText;
    state.currentIndex = nextIndex;
  }, 400);

  setTimeout(() => {
    state.isAnimating = false;
    state.phase = 'idle';
  }, 800);
};

// 刷新所有动画区域
const refreshAllAnimations = () => {
  descriptionParts.value.forEach(part => {
    if (part.type === 'animated') {
      const state = animationStates.value[part.stateIndex];
      const display = displayStates.value[part.stateIndex];
      if (!state.isAnimating) {
        state.isAnimating = true;
        state.phase = 'exit';

        const nextIndex = getRandomNextIndex(state.currentIndex, part.animations.length);
        display.nextText = part.animations[nextIndex];

        setTimeout(() => {
          state.phase = 'enter';
          display.currentText = display.nextText;
          state.currentIndex = nextIndex;
        }, 400);

        setTimeout(() => {
          state.isAnimating = false;
          state.phase = 'idle';
        }, 800);
      }
    }
  });
};

// 定时器引用
let autoRefreshTimer = null;

// 组件挂载时启动定时器
onMounted(() => {
  autoRefreshTimer = setInterval(refreshAllAnimations, 10000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
});
</script>

<template>
  <!--About Me关于页面-->
  <address>
    <mdui-card id="about-me" data-aos="zoom-in">
      <div class="avatar-container">
        <img :src="globalVars.author.avatar" :alt="globalVars.author.name" class="avatar" />
      </div>
      <div class="info-container">
        <div class="name">{{ globalVars.author.name }}</div>
        <div class="description">
          <template v-for="(part, idx) in descriptionParts" :key="idx">
            <template v-if="part.type === 'static'">{{ part.content }}</template>
            <span v-else class="animated-text" :class="{
              'animating': animationStates[part.stateIndex].isAnimating,
              'exit': animationStates[part.stateIndex].phase === 'exit',
              'enter': animationStates[part.stateIndex].phase === 'enter'
            }" @click="handleClick(part)">
              <span class="char" v-for="(char, index) in displayStates[part.stateIndex].currentText" :key="index"
                :style="{ '--char-index': index }">
                {{ char }}
              </span>
            </span>
          </template>
        </div>
        <div class="contact">
          <mdui-tooltip :content="`邮箱`" placement="top-start">
            <mdui-button-icon v-if="globalVars.author.email" :href="'mailto:' + globalVars.author.email" icon="mail"
              variant="tonal"></mdui-button-icon>
          </mdui-tooltip>
          <mdui-tooltip :content="`Github`" placement="top-start">
            <mdui-button-icon v-if="globalVars.author.github" :href="'https://github.com/' + globalVars.author.github"
              target="_blank" icon="code" variant="tonal"></mdui-button-icon>
          </mdui-tooltip>
          <mdui-tooltip :content="`QQ`" placement="top-start">
            <mdui-button-icon v-if="globalVars.author.qq"
              :href="`tencent://message/?uin=${String(globalVars.author.qq)}&Menu=yes`"
              target="_blank" icon="chat" variant="tonal"></mdui-button-icon>
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
      cursor: default; // 移除整体的点击光标

      .animated-text {
        display: inline-block;
        margin: 0 1.5px;
        color: hsla(from rgb(var(--mdui-color-primary)) h s l / 0.85);
        cursor: pointer; // 只在动画文字上显示点击光标

        .char {
          display: inline-block;
          animation: none;
        }

        &.animating .char {
          animation: none;
        }

        &.exit .char {
          animation: exitText 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
          animation-delay: calc(var(--char-index) * 0.04s);
        }

        &.enter .char {
          animation: enterText 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) both;
          animation-delay: calc(var(--char-index) * 0.04s);
        }
      }
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

@keyframes jumpText {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  20% {
    transform: translateY(-20px);
    opacity: 0;
  }

  40% {
    transform: translateY(20px);
    opacity: 0;
  }

  60% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes exitText {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateY(-20px) scale(0.9);
    opacity: 0;
  }
}

@keyframes enterText {
  0% {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }

  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
