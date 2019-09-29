import ContractsRepository from './contracts-repository'

const repositories = {
  contracts: ContractsRepository
  // other repositories ...
}

export const RepositoryFactory = {
  get: name => repositories[name]
}
