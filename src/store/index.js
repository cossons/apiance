import Vue from 'vue'
import Vuex from 'vuex'

import app from '../main'
import user from './modules/user'
import menu from './modules/menu'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
  },
  getters: {
  },
  mutations: {
    changeLang(state, payload) {
      app.$i18n.locale = payload
      localStorage.setItem('currentLanguage', payload)
    }
  },
  actions: {
    setLang({ commit }, payload) {
      commit('changeLang', payload)
    }
  },
  modules: {
    user,
    menu
  }
})
