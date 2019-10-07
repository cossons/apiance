<template>
  <v-app class="app-wrapper">
    <vue-snotify></vue-snotify>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}
</style>
