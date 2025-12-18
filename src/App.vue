<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  position: fixed;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

#app {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
}

/* 防止水平滚动 */
* {
  max-width: 100%;
}

/* 隐藏滚动条但保持滚动功能 */
#app::-webkit-scrollbar {
  display: none;
}

#app {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
