import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

const sanitizeUser = (user) => {
  const safeUser = { ...user }
  delete safeUser.passwordHash
  return safeUser
}

export class UserRepository {
  constructor(filePath) {
    this.filePath = filePath
    this.users = []
  }

  async initialize() {
    await mkdir(dirname(this.filePath), { recursive: true })
    try {
      await access(this.filePath)
    } catch {
      await writeFile(this.filePath, JSON.stringify({ users: [] }, null, 2))
    }
    await this.#loadFromDisk()
  }

  async #loadFromDisk() {
    const raw = await readFile(this.filePath, 'utf-8')
    const data = JSON.parse(raw)
    this.users = data.users ?? []
  }

  async #persist() {
    await writeFile(this.filePath, JSON.stringify({ users: this.users }, null, 2))
  }

  async listSafe() {
    return this.users.map((user) => sanitizeUser(user))
  }

  async findByEmail(email) {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
  }

  async addUser({ email, name, password, role = 'user' }) {
    const existingUser = await this.findByEmail(email)
    if (existingUser) {
      throw new Error('USER_EXISTS')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = { id: uuid(), email, name, passwordHash, role }
    this.users.push(user)
    await this.#persist()
    return sanitizeUser(user)
  }

  async verifyCredentials(email, password) {
    const user = await this.findByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.passwordHash)
    return isValid ? sanitizeUser(user) : null
  }
}
