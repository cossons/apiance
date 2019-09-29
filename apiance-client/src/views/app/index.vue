<template>
  <main>
    <md-app class="app-wrapper">
      <TopBar slot="md-app-toolbar" />
      <Drawer slot="md-app-drawer" />
      <md-app-content>
        <router-view />
      </md-app-content>
    </md-app>
  </main>
</template>
<script>
// import Sidebar from "@/containers/Sidebar";
import TopBar from '../../components/layout/TopBar'
import Drawer from '../../components/layout/Drawer'

export default {
  data() {
    return { show: false }
  },
  components: {
    TopBar,
    Drawer
  },
  computed: {}
}
</script>
<style scoped>
.app-wrapper {
  min-height: 100vh;
}
</style>
