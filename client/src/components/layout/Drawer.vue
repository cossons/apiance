<template>
  <md-app-drawer :md-active.sync="menuVisible" md-persistent="mini">
    <md-toolbar class="md-transparent" md-elevation="0">
      <span>Navigation</span>

      <div class="md-toolbar-section-end">
        <md-button class="md-icon-button md-dense" @click="toggleMenu">
          <md-icon>keyboard_arrow_left</md-icon>
        </md-button>
      </div>
    </md-toolbar>

    <md-list>
      <router-link to="/app/home">
        <md-list-item>
          <md-icon>home</md-icon>
          <span class="md-list-item-text">{{$t('drawer.home')}}</span>
        </md-list-item>
      </router-link>

      <router-link to="/app/apis">
        <md-list-item>
          <md-icon>view_list</md-icon>
          <span class="md-list-item-text">{{$t('drawer.apis')}}</span>
        </md-list-item>
      </router-link>

      <router-link to="/app/performances">
        <md-list-item>
          <md-icon>speed</md-icon>
          <span class="md-list-item-text">{{$t('drawer.performances')}}</span>
        </md-list-item>
      </router-link>

      <router-link to="/app/codeList">
        <md-list-item>
          <md-icon>code</md-icon>
          <span class="md-list-item-text">{{$t('drawer.codes')}}</span>
        </md-list-item>
      </router-link>
    </md-list>
  </md-app-drawer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Drawer',
  components: {},
  computed: {
    ...mapGetters({
      menuVisible: 'getMenuVisible'
    })
  },
  methods: {
    ...mapActions(['toggleMenu'])
  }
}
</script>
