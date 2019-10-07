<template>
  <div>
    <TopBar />
    <v-content>
      <v-tabs vertical>
        <v-tab>
          <v-icon left>fa-lock</v-icon>Swagger
        </v-tab>
        <v-tab>
          <v-icon left>fa-users</v-icon>Users
        </v-tab>

        <v-tab-item>
          <v-card flat>
            <v-card-text>
              <SwaggerTab />
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <v-card-text></v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-content>
  </div>
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
