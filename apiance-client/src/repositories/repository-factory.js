import ContractsRepository from './contracts-repository'
import AuthRepository from './auth-repository'

const repositories = {
  contracts: ContractsRepository,
  auth: AuthRepository
  // other repositories ...
}

export const RepositoryFactory = {
  get: name => repositories[name]
}
