import { currentUser } from '@/config'
import { RepositoryFactory } from '../../repositories/repository-factory'
const AuthRepository = RepositoryFactory.get('auth')

export default {
  state: {
    currentUser: localStorage.getItem('user') != null ? JSON.parse(localStorage.getItem('user')) : null,
    loginError: null,
    processing: false,
    bearerToken: localStorage.getItem('bearerToken') != null ? JSON.parse(localStorage.getItem('bearerToken')) : null
  },
  getters: {
    currentUser: state => state.currentUser,
    processing: state => state.processing,
    loginError: state => state.loginError,
    bearerToken: state => state.bearerToken
  },
  mutations: {
    setUser(state, payload) {
      state.currentUser = payload
      state.processing = false
      state.loginError = null
    },
    setLogout(state) {
      state.currentUser = null
      state.processing = false
      state.loginError = null
    },
    setProcessing(state, payload) {
      state.processing = payload
      state.loginError = null
    },
    setError(state, payload) {
      state.loginError = payload
      state.currentUser = null
      state.processing = false
    },
    clearError(state) {
      state.loginError = null
    }
  },
  actions: {
    login({ commit }, payload) {
      commit('clearError')
      commit('setProcessing', true)

      var config = {
        auth: {
          username: payload.email,
          password: payload.password
        }
      }

      AuthRepository.login(config).then((response) => {
        console.log(response)
        var user = { uid: 'uuid-test', ...currentUser }
        localStorage.setItem('user', JSON.stringify({ uid: 'uuid-test', ...currentUser }))
        localStorage.setItem('bearerToken', response.data.token)
        commit('setUser', user)
      }, (error) => {
        console.log(error)
        commit('setError', error)
      })
    },
    logout({ commit }) {
      return function () {
        localStorage.removeItem('user')
        commit('setLogout')
      }
      // firebase
      // .auth()
      // .signOut()
      // .then(() => {
      //   localStorage.removeItem('user')
      //   commit('setLogout')
      // }, _error => { })
    }
  }
}
