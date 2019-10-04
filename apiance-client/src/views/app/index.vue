<template>
  <div class="app-wrapper">
    <TopBar />
    <Drawer />
    <v-content>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-content>
    <Footer />
  </div>
</template>
<script>
// import Sidebar from "@/containers/Sidebar";
import TopBar from '../../components/layout/TopBar'
import Drawer from '../../components/layout/Drawer'
import Footer from '../../components/layout/Footer'

export default {
  data() {
    return { show: false }
  },
  components: {
    TopBar,
    Drawer,
    Footer
  },
  computed: {}
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}
</style>
