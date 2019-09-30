<template>
  <div>
    <div id="swagger-ui"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import SwaggerUI from 'swagger-ui'
import { RepositoryFactory } from '../../repositories/repository-factory'
const ContractsRepository = RepositoryFactory.get('contracts')

export default {
  name: 'apis',
  components: {},
  data() {
    return {
      contract: {}
    }
  },
  created() {
    this.fetch(this.$route.params.id)
  },
  mounted() {
    this.loadSwagger(this.$route.params.id)
  },
  methods: {
    async fetch(id) {
      const { data } = await ContractsRepository.getOne(id)
      this.contract = data
      console.log()
    },
    loadSwagger(id) {
      SwaggerUI({
        url: 'http://localhost:3000/api/contracts/' + id,
        dom_id: '#swagger-ui',
        deepLinking: false,
        presets: [SwaggerUI.presets.apis, SwaggerUI.SwaggerUIStandalonePreset],
        plugins: [SwaggerUI.plugins.DownloadUrl]
      })
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.fetch(to.params.id)
    this.loadSwagger(to.params.id)

    next()
  }
}
</script>

<style lang="scss">
@import '~swagger-ui/dist/swagger-ui.css';
</style>
