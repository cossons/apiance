<template>
  <md-content>
    <div>
      <md-dialog-confirm
        :md-active.sync="deleteModal"
        md-title="Confirm"
        md-content="You will delete all contracts. Will you proceed ?"
        @md-cancel="deleteOnCancel"
        @md-confirm="deleteOnConfirm"
      />
      <md-button class="md-accent md-raised" @click="deleteModal = true">Delete all swagger</md-button>
    </div>

    <div>
      <h3 class="md-title">Import Swagger files (json/yml)</h3>
      {{this.files}}
      <md-field>
        <label>Swaggers</label>
        <md-file
          v-model="swaggerFileNames"
          multiple
          accept=".json, .yaml"
          @md-change="onFileUpload($event)"
        />
        <md-button
          v-if="swaggerFileNames === null"
          class="md-raised md-primary"
          @click="sendSwaggers"
          disabled
        >Save files</md-button>
        <md-button
          v-if="swaggerFileNames !== null"
          class="md-raised md-primary"
          @click="sendSwaggers"
        >Save files</md-button>
      </md-field>
    </div>
  </md-content>
</template>

<script>
import yaml from 'js-yaml'
import { RepositoryFactory } from '../../repositories/repository-factory'
const ContractsRepository = RepositoryFactory.get('contracts')

export default {
  name: 'Swagger',
  data: () => ({
    file: { name: '' },
    swaggerFileNames: null,
    swaggerFile: [],
    deleteModal: false,
    files: []
  }),
  methods: {
    deleteOnConfirm() {
      ContractsRepository.clearAll()
        .then(function(response) {})
        .catch(function(error) {
          console.log(error)
        })
    },
    deleteOnCancel() {},
    sendSwaggers() {
      let filesToSend = this.swaggerFileNames
      this.swaggerFileNames = null
      console.log(filesToSend.name)
    },
    callbackLoadedFile(file) {
      this.files.push(file)
    },
    onFileUpload(fileList) {
      let vm = this
      for (let i = 0; i < fileList.length; i++) {
        var reader = new FileReader()
        reader.onload = function(event) {
          let file = { content: yaml.load(reader.result), name: event }
          vm.callbackLoadedFile(file)
        }
        reader.readAsText(fileList.item(i))
      }
    }
  }
}
</script>
