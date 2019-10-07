<template>
  <v-container>
     <v-dialog v-model="deleteModal" persistent max-width="290">
      <template v-slot:activator="{ on }">
        <v-btn color="primary" dark v-on="on">Delete all</v-btn>
      </template>
      <v-card>
        <v-card-title class="headline">Delete Swaggers</v-card-title>
        <v-card-text>You will delete all swagger contracts. Will you proceed ?</v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="green darken-1" text @click="deleteModal = false">Disagree</v-btn>
          <v-btn color="green darken-1" text @click="deleteModal = false">Agree</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div>
      <!-- <v-dialog v-model="deleteModal"
        md-title="Confirm"
        md-content="You will delete all contracts. Will you proceed ?"
        @md-cancel="deleteOnCancel"
        @md-confirm="deleteOnConfirm"
      />
       <template v-slot:activator="{ on }">
        <v-btn color="primary" dark v-on="on">Open Dialog</v-btn>
      </template>
      <v-btn class="green darken-1" text @click="deleteModal = true">Delete all swaggers</v-btn> -->
    </div>

    <div>
      <h3 class="md-title">Import Swagger files (json/yml)</h3>
      <md-field>
        <label>Swaggers</label>
        <md-file
          multiple
          accept=".json, .yaml"
          v-model="selectedFiles"
          @md-change="onFileUpload($event)"
        />
        <md-button
          v-if="files.length === 0 || filesHasError"
          class="md-raised md-primary"
          @click="sendSwaggers"
          disabled
        >Save files</md-button>
        <md-button
          v-if="files.length !== 0 && !filesHasError"
          class="md-raised md-primary"
          @click="sendSwaggers"
        >Save files</md-button>
      </md-field>

      <md-list>
        <md-list-item v-for="(file, it)  in this.files" :key="it">
          <md-avatar>
            <md-icon v-if="file.error !== null" style="color: red">pan_tool</md-icon>
            <md-icon v-if="file.error === null" style="color: green">thumb_up</md-icon>
          </md-avatar>

          <div class="md-list-item-text">
            <span>{{ file.name }}</span>
            <span v-if="file.error !== null">{{file.error.reason}}</span>
            <span v-if="file.error !== null">{{file.error.message}}</span>
          </div>
        </md-list-item>
      </md-list>
    </div>
  </v-container>
</template>

<script>
import yaml from 'js-yaml'
import { RepositoryFactory } from '../../repositories/repository-factory'
const ContractsRepository = RepositoryFactory.get('contracts')

export default {
  name: 'SwaggerTab',
  data: () => ({
    deleteModal: false,
    filesHasError: false,
    selectedFiles: null,
    files: []
  }),
  created() {},
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
      this.swaggerFiles = this.files
      this.selectedFiles = null
      this.files = []

      this.swaggerFiles.forEach(iter => {
        ContractsRepository.createOne(iter.content).then(
          response => {
            this.$snotify.success('Saved: ' + response.data)
          },
          error => {
            console.log(error)
          }
        )
      })
    },
    callbackLoadedFile(name, content, error) {
      if (error != null) {
        this.filesHasError = true
      }

      this.files.push({
        name: name,
        content: content,
        error: error
      })
    },
    onOldFileUpload(fileList) {
      let vm = this
      this.files = []
      this.filesHasError = false

      for (let i = 0; i < fileList.length; i++) {
        var reader = new FileReader()
        reader.onload = function(event) {
          let content = {}
          let error = null
          try {
            content = yaml.safeLoad(event.target.result)
          } catch (err) {
            content = null
            error = err
          } finally {
            vm.callbackLoadedFile(event.target.filename, content, error)
          }
        }
        reader.filename = fileList.item(i).name
        reader.readAsText(fileList.item(i))
      }
    },
    onFileUpload(fileList) {
      this.files = []
      this.filesHasError = false

      function readFile(index) {
        var reader = new FileReader()

        if (index >= fileList.length) {
          return
        }

        var file = fileList.item(index)

        reader.onload = function(event) {
          let content = {}
          let error = null
          try {
            content = yaml.safeLoad(event.target.result)
          } catch (err) {
            content = null
            error = err
          } finally {
            vm.callbackLoadedFile(event.target.filename, content, error)
          }
          readFile(index + 1, vm)
        }
        reader.filename = file.name
        reader.readAsBinaryString(file)
      }
      let vm = this
      readFile(0, vm)
    }
  }
}
</script>
