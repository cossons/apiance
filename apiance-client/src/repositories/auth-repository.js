import repository from './repository'

const resource = '/auth'

export default {
  login(config) {
    return repository.post(`${resource}/login`, {}, config)
  },

  invalidate() {
    return repository.post(`${resource}/invalidate`)
  },

  me() {
    return repository.get(`${resource}`)
  }
}
