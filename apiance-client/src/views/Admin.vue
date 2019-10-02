<template>
  <main>
    <md-app class="app-wrapper">
      <TopBar slot="md-app-toolbar" />
      <md-app-content>
        <div>
          <md-tabs>
            <md-tab id="tab-swagger" md-label="Swagger">
              <SwaggerTab />
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
import SwaggerTab from '../components/admin/SwaggerTab'

export default {
  data() {
    return { show: false }
  },
  components: {
    TopBar,
    SwaggerTab
  },
  computed: {}
}
</script>
<style scoped>
.app-wrapper {
  min-height: 100vh;
}
</style>
