<template>
  <div>
    <div>{{contracts}}</div>
  </div>
</template>

<script>
// @ is an alias to /src
import { RepositoryFactory } from '../../repositories/repository-factory'
const ContractsRepository = RepositoryFactory.get('contracts')

export default {
  name: 'apis',
  components: {},
  data() {
    return {
      contracts: []
    }
  },
  created() {
    this.fetch()
  },
  methods: {
    async fetch() {
      const { data } = await ContractsRepository.getNames()
      this.contracts = data
    }
  }
}
</script>
