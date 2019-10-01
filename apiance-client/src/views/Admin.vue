<template>
  <main>
    <md-app class="app-wrapper">
      <TopBar slot="md-app-toolbar" />
      <md-app-content>
        <div>
          <md-tabs>
            <md-tab id="tab-swagger" md-label="Swagger">
              <Swagger />
            </md-tab>
          </md-tabs>
        </div>
      </md-app-content>
    </md-app>
  </main>
</template>
<script>
// import Sidebar from "@/containers/Sidebar";
import TopBar from '../components/layout/TopBar'
import Swagger from '../components/admin/Swagger'

export default {
  data() {
    return { show: false }
  },
  components: {
    TopBar,
    Swagger
  },
  computed: {}
}
</script>
<style scoped>
.app-wrapper {
  min-height: 100vh;
}
</style>
