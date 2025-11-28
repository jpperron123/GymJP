export async function ensureAdminUser(repository, email, password) {
  const existingAdmin = await repository.findByEmail(email)
  if (existingAdmin) return existingAdmin

  return repository.addUser({
    email,
    name: 'Administrateur',
    password,
    role: 'admin',
  })
}
