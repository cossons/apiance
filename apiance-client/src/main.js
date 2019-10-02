// Default config
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'

// i18n
import VueI18n from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
import { defaultLocale, localeOptions } from '@/config.js'

// Moment
import VueMoment from 'vue-moment'

// Material config
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

// Notification asset :  Snotify
import Snotify, { SnotifyPosition } from 'vue-snotify'

// Css import theme
import './assets/css/sass/theme.default.scss'

const optionsSnotify = {
  toast: {
    position: SnotifyPosition.rightBottom
  }
}

Vue.config.productionTip = false

Vue.use(VueI18n)
Vue.use(VueMoment)
Vue.use(Snotify, optionsSnotify)
Vue.use(VueMaterial)

const messages = { en: en, fr: fr }
const locale = (localStorage.getItem('currentLanguage') && localeOptions.filter(x => x.id === localStorage.getItem('currentLanguage')).length > 0) ? localStorage.getItem('currentLanguage') : defaultLocale

const i18n = new VueI18n({
  locale: locale,
  fallbackLocale: 'en',
  messages
})

export default new Vue({
  router,
  i18n,
  store,
  render: h => h(App)
}).$mount('#app')
