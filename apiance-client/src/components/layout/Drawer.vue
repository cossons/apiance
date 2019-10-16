<template>
  <v-navigation-drawer app clipped permanent>
    <v-list shaped dense>
      <v-list-item :to="{ name: 'home' }" link>
        <v-list-item-icon>
          <v-icon>fa-home</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{$t('drawer.home')}}</v-list-item-title>
      </v-list-item>

      <v-list-item :to="{ name: 'performances' }">
        <v-list-item-icon>
          <v-icon>fa-tachometer-alt</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{$t('drawer.performances')}}</v-list-item-title>
      </v-list-item>

      <v-list-item :to="{ name: 'codes' }">
        <v-list-item-icon>
          <v-icon>fa-list-alt</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{$t('drawer.codes')}}</v-list-item-title>
      </v-list-item>

      <v-list-group prepend-icon="fa-file-contract" value="true">
        <template v-slot:activator>
          <v-list-item-title>{{$t('drawer.apis')}}</v-list-item-title>
        </template>

        <v-list-group
          no-action
          sub-group
          value="true"
          v-for="(consumer, it)  in this.contracts.entries()"
          :key="it"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>{{consumer[0]}}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-group
            no-action
            sub-group
            value="true"
            v-for="(api, it)  in consumer[1]"
            :key="it"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{api[0]}}</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="(version, it) in api[1]"
              :key="it"
              :to="{ name: 'apis', params: {id: version[1]} }"
            >
              <v-list-item-title v-text="version[0]"></v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions } from 'vuex'
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
  computed: {},
  created() {
    this.fetch()
  },
  methods: {
    ...mapActions(['toggleMenu']),
    async fetch() {
      const { data } = await ContractsRepository.getNames()

      let map = new Map()
      data.forEach(function(iter) {
        let contract = JSON.parse(iter.swagger)

        if (contract.host === undefined) {
          contract.host = 'N/A'
        }

        if (!map.has(contract.host)) {
          map.set(contract.host, new Map())

          let cons = map.get(contract.host)
          if (!cons.get(contract.info.title)) {
            cons.set(contract.info.title, new Map())

            let api = cons.get(contract.info.title)
            api.set(contract.info.version, iter._id)
          } else {
            let api = cons.get(contract.info.title)
            api.set(contract.info.version, iter._id)
          }
        } else {
          let cons = map.get(contract.host)
          if (!cons.get(contract.info.title)) {
            cons.set(contract.info.title, new Map())

            let api = cons.get(contract.info.title)
            api.set(contract.info.version, iter._id)
          } else {
            let api = cons.get(contract.info.title)
            api.set(contract.info.version, iter._id)
          }
        }
      })

      this.contracts = map
    }
  }
}
</script>
