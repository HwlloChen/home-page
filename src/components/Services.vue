<script setup>

bg = "https://chenserver.top/dl/pic.png"

</script>

<template>
    <section>
        <mdui-card variant="elevated" class="bg" clickable :style="`--bg-url: url(${bg})`">
        </mdui-card>
    </section>
    <section>
        <mdui-card class="bg" clickable :style="`--bg-url: url(https://www.chenserver.top:81/randompic.php)`"></mdui-card>
    </section>
</template>

<script>

var bg

</script>

<style lang="less" scoped>
mdui-card {
    width: 100%;
    height: 350px;
    position: relative;
}

mdui-card.bg::before {
    content: '';
    display: block;
    width: 400px;
    height: 200px;
    position: absolute;
    top: 0;
    right: 0;
    opacity: 0.35;
    transition: all .3s var(--mdui-motion-easing-standard);
    background: linear-gradient(to bottom, rgba(var(--mdui-color-surface-container-low), 0.1) 0%, rgba(var(--mdui-color-surface-container-low), 1) 100%),
        linear-gradient(to left, rgba(var(--mdui-color-surface-container-low), 0.1) 0%, rgba(var(--mdui-color-surface-container-low), 1) 100%), 
        var(--bg-url);
    background-size: cover;
    background-position: top right;
    background-repeat: no-repeat;
}

mdui-card.bg[hover]::before {
    width: 425px;
    height: 212.5px;
    opacity: 0.55;
}


section {
    margin-bottom: 1rem;
}
</style>