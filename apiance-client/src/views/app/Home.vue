<template>
  <div>
    <div class="home">
      <GatewayTable />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import GatewayTable from '@/components/GatewayTable.vue'

export default {
  name: 'home',
  components: {
    GatewayTable
  }
}
</script>
