<template>
  <v-app-bar app clipped-left>
    <v-toolbar class="primary" dark>
      <v-toolbar-title>APIANCE - An API Doc Platform</v-toolbar-title>

      <div class="flex-grow-1"></div>

      <v-btn icon v-if="this.$route.name !== 'admin'" :to="{ name: 'admin' }">
        <v-icon>fa-user-shield</v-icon>
      </v-btn>

      <v-btn icon v-if="this.$route.name === 'admin'" :to="{ name: 'home' }">
        <v-icon>fa-home</v-icon>
      </v-btn>

      <v-btn icon v-on:click="sendLogout">
        <v-icon>fa-sign-out-alt</v-icon>
      </v-btn>

      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on">
            <v-icon>fa-globe-europe</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(lang,it) in localeOptions" :key="it" @click="changeLocale(l.id)">
            <v-list-item-title>{{ lang.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </v-app-bar>
</template>

<script>
// @ is an alias to /src
import { mapGetters, mapActions } from 'vuex'
import { localeOptions } from '@/config'
export default {
  name: 'TopBar',
  components: {},
  data() {
    return {
      localeOptions
    }
  },
  computed: {
    ...mapGetters({
      menuVisible: 'getMenuVisible'
    })
  },
  methods: {
    ...mapActions(['setLang', 'logout', 'toggleMenu']),
    sendLogout() {
      this.logout().then(() => {
        this.$router.push('/login')
      })
    },
    changeLocale(locale) {
      this.setLang(locale)
    }
  }
}
</script>
