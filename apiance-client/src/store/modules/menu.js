export default {
  state: {
    menuVisible: true
  },
  getters: {
    getMenuVisible: state => state.menuVisible
  },
  mutations: {
    changeVisible(state) {
      state.menuVisible = !state.menuVisible
    }
  },
  actions: {
    toggleMenu({ commit }, payload) {
      commit('changeVisible')
    }
  }
}
