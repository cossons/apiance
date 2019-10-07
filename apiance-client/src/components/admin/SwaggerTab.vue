<template>
  <v-container>
    <v-card class="pa-5">
      <v-card-title>Swagger Utils</v-card-title>

      <v-dialog v-model="deleteModal" persistent max-width="290">
        <template v-slot:activator="{ on }">
          <div class="d-flex justify-end ma-5">
            <v-btn class color="primary" dark v-on="on">Delete all</v-btn>
          </div>
        </template>

        <v-card>
          <v-card-title class="headline">Delete Swaggers</v-card-title>
          <v-card-text>You will delete all swagger contracts. Will you proceed ?</v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="green darken-1" text @click="deleteOnCancel">Disagree</v-btn>
            <v-btn color="green darken-1" text @click="deleteOnConfirm">Agree</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-file-input
        v-model="selectedFiles"
        color="deep-purple accent-4"
        counter
        label="Choose your swaggers - json/yaml"
        multiple
        placeholder="Select your files"
        prepend-icon="fa-paperclip"
        outlined
        show-size
        @change="onFileUpload"
      >
        <template v-slot:selection="{ index, text }">
          <v-chip v-if="index < 2" color="indigo darken-1" dark label small>{{ text }}</v-chip>
          <span
            v-else-if="index === 2"
            class="overline grey--text text--darken-3 mx-2"
          >+{{ files.length - 2 }} File(s)</span>
        </template>
      </v-file-input>

      <v-list two-line subheader v-if="files.length !== 0">
        <v-subheader inset>Scanning results</v-subheader>

        <v-list-item v-for="file in this.files" :key="file.name">
          <v-list-item-avatar>
            <v-icon v-if="file.error !== null" style="color: red">fa-exclamation-triangle</v-icon>
            <v-icon v-if="file.error === null" style="color: green">fa-thumbs-up</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <span>{{ file.name }}</span>
            <span v-if="file.error !== null">{{file.error}}</span>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon color="lighten-1" @click="removeOne(file)">fa-trash</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-btn
        color="primary"
        v-if="files.length !== 0 && filesErrors ===0"
        @click="sendSwaggers"
      >Load</v-btn>
    </v-card>

    <!-- <div>
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
    </div>-->
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
        .finally(() => {
          this.deleteModal = false
        })
    },
    deleteOnCancel() {
      this.deleteModal = false
    },
    sendSwaggers() {
      this.swaggerFiles = this.files
      this.selectedFiles = null
      this.files = []

      this.swaggerFiles.forEach(iter => {
        ContractsRepository.createOne(iter.content).then(
          response => {
            this.$snotify.success('Saved swagger ' + iter.name + ': ' + response.data)
          },
          error => {
            console.log(error)
          }
        )
      })
    },
    callbackLoadedFile(name, content, error) {
      if (error != null) {
        this.filesErrors++
      }

      this.files.push({
        name: name,
        content: content,
        error: error
      })
    },
    onFileUpload(fileList) {
      this.files = []
      this.filesErrors = 0

      function readFile(index) {
        var reader = new FileReader()
        if (index >= fileList.length) {
          return
        }

        var file = fileList[index]
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
        reader.readAsText(file)
      }
      let vm = this
      readFile(0, vm)
    },
    removeOne(file) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].name === file.name) {
          if (this.files[i].error != null) {
            this.filesErrors--
          }
          this.files.splice(i, 1)
          break
        }
      }
    }
  }
}
</script>
