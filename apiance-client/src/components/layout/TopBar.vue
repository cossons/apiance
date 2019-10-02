<template>
  <md-toolbar class="md-primary" md-elevation="0">
    <div class="md-toolbar-section-start">
      <md-button class="md-icon-button" @click="toggleMenu" v-if="!menuVisible">
        <md-icon>menu</md-icon>
      </md-button>
    </div>

    <h3 class="md-title" style="flex: 1">APIANCE - An API Doc Platform</h3>

    <div class="md-toolbar-section-end">
      <router-link v-if="this.$route.name !== 'admin'" :to="{ name: 'admin' }">
        <md-button class="md-icon-button">
          <md-icon>supervisor_account</md-icon>
        </md-button>
      </router-link>

      <router-link v-if="this.$route.name === 'admin'" :to="{ name: 'home' }">
        <md-button class="md-icon-button">
          <md-icon>home</md-icon>
        </md-button>
      </router-link>

      <md-button v-on:click="sendLogout">{{ $t('toolbar.logout')}}</md-button>

      <md-menu>
        <md-button md-menu-trigger class="md-icon-button">
          <md-icon>more_vert</md-icon>
          <md-menu-content>
            <md-menu-item
              v-for="(l,index) in localeOptions"
              :key="index"
              @click="changeLocale(l.id)"
            >{{l.name}}</md-menu-item>
          </md-menu-content>
        </md-button>
      </md-menu>
    </div>
  </md-toolbar>
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
