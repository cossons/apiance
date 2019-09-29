export default {
  state: {
    menuVisible: false
  },
  getters: {
    getMenuVisible: state => state.menuVisible
  },
  mutations: {
    changeVisible(state) {
      state.menuVisible = !state.menuVisible
      state.currentUser = null
      state.processing = false
    },
    clearError(state) {
      state.loginError = null
    }
  },
  actions: {
    toggleMenu({ commit }, payload) {
      commit('changeVisible')
    }
  }
}
