<template>
  <md-app-drawer :md-active.sync="menuVisible" md-persistent="mini">
    <md-toolbar class="md-primary" md-elevation="0">
      <span>Navigation</span>

      <div class="md-toolbar-section-end">
        <md-button class="md-icon-button md-dense" @click="toggleMenu">
          <md-icon>keyboard_arrow_left</md-icon>
        </md-button>
      </div>
    </md-toolbar>

    <md-list class="md-dense">
      <router-link to="/app/home">
        <md-list-item>
          <md-icon>home</md-icon>
          <span class="md-list-item-text">{{$t('drawer.home')}}</span>
        </md-list-item>
      </router-link>

      <md-list-item md-expand>
        <md-icon>view_list</md-icon>
        <span class="md-list-item-text">List APIs</span>

        <md-list slot="md-expand">
          <md-list-item
            v-for="(consumer, it)  in this.contracts.entries()"
            :key="it"
            class="md-inset"
          >
            <md-list class="md-dense">
              <md-list-item md-expand>
                <span class="md-list-item-text">{{consumer[0]}}</span>
                <md-list slot="md-expand">
                  <md-list-item v-for="(api, it)  in consumer[1]" :key="it" class="md-inset">
                    <md-list class="md-dense">
                      <md-list-item md-expand>
                        <span class="md-list-item-text">{{api[0]}}</span>
                        <md-list slot="md-expand">
                          <md-list-item v-for="(version, it)  in api[1]" :key="it" class="md-inset">
                            <md-list class="md-dense">
                              <md-list-item>
                                <router-link :to="{ name: 'apis', params: {id: version[1]} }">
                                  <span class="md-list-item-text">{{version[0]}}</span>
                                </router-link>
                                <md-list slot="md-expand"></md-list>
                              </md-list-item>
                            </md-list>
                          </md-list-item>
                        </md-list>
                      </md-list-item>
                    </md-list>
                  </md-list-item>
                </md-list>
              </md-list-item>
            </md-list>
          </md-list-item>
        </md-list>
      </md-list-item>

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
import { RepositoryFactory } from '../../repositories/repository-factory'
const ContractsRepository = RepositoryFactory.get('contracts')

export default {
  name: 'Drawer',
  components: {},
  data() {
    return {
      contracts: []
    }
  },
  computed: {
    ...mapGetters({
      menuVisible: 'getMenuVisible'
    })
  },
  created() {
    this.fetch()
  },
  methods: {
    ...mapActions(['toggleMenu']),
    async fetch() {
      const { data } = await ContractsRepository.getNames()

      let map = new Map()
      data.forEach(function(contract) {
        if (!map.has(contract.host)) {
          map.set(contract.host, new Map())

          let cons = map.get(contract.host)
          if (!cons.get(contract.info.title)) {
            cons.set(contract.info.title, new Map())

            let api = cons.get(contract.info.title)
            api.set(contract.info.version, contract._id)
          } else {
            let api = cons.get(contract.info.title)
            api.set(contract.info.version, contract._id)
          }
        } else {
          let cons = map.get(contract.host)
          if (!cons.get(contract.info.title)) {
            cons.set(contract.info.title, new Map())

            let api = cons.get(contract.info.title)
            api.set(contract.info.version, contract._id)
          } else {
            let api = cons.get(contract.info.title)
            api.set(contract.info.version, contract._id)
          }
        }
      })

      this.contracts = map
    }
  }
}
</script>
