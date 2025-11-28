import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { UserRepository } from './storage/userRepository.js'
import { ensureAdminUser } from './utils/adminBootstrap.js'

dotenv.config()

const defaultStorePath = fileURLToPath(new URL('./data/users.json', import.meta.url))
const repository = new UserRepository(process.env.USER_STORE_PATH ?? defaultStorePath)
await repository.initialize()
await ensureAdminUser(
  repository,
  process.env.ADMIN_EMAIL ?? 'admin@example.com',
  process.env.ADMIN_PASSWORD ?? 'Admin123!'
)

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/users', async (_req, res) => {
  const users = await repository.listSafe()
  res.json(users)
})

app.post('/api/users', async (req, res) => {
  const { email, name, password } = req.body ?? {}
  if (!email || !name || !password) {
    return res.status(400).json({ message: 'email, name and password are required' })
  }

  try {
    const createdUser = await repository.addUser({ email, name, password })
    res.status(201).json(createdUser)
  } catch (error) {
    if (error.message === 'USER_EXISTS') {
      return res.status(409).json({ message: 'A user with that email already exists' })
    }
    res.status(500).json({ message: 'Unable to create user' })
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' })
  }

  const user = await repository.verifyCredentials(email, password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  res.json({ message: 'Login successful', user })
})

app.use((err, _req, res, next) => {
  console.error(err)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({ message: 'Unexpected server error' })
})

const port = process.env.PORT ?? 4000
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
