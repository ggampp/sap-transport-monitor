const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { readJson, writeJson } = require("../storage/jsonStore")
const router = express.Router()

const FILE = "users.json"
const AUDIT_FILE = "audit_logs.json"

// Helper to log audit events
async function logAudit(action, userId, details, adminUser = "system"){
  const logs = await readJson(AUDIT_FILE, [])
  logs.push({
    id: uuidv4(),
    action,
    userId,
    adminUser,
    details,
    timestamp: new Date().toISOString()
  })
  await writeJson(AUDIT_FILE, logs)
}

// Users CRUD
router.get("/", async (req, res) => {
  const users = await readJson(FILE, [])
  res.json(users)
})

router.post("/", async (req, res) => {
  const { username, fullName, email, department, status = "active" } = req.body || {}
  if(!username || !fullName || !email) return res.status(400).json({ error: "Campos obrigatórios: username, fullName, email" })
  
  const users = await readJson(FILE, [])
  if(users.find(u => u.username === username)) return res.status(400).json({ error: "Usuário já existe" })
  
  const user = { 
    id: uuidv4(), 
    username, 
    fullName, 
    email, 
    department, 
    status, 
    profiles: [],
    roles: [],
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
  users.push(user)
  await writeJson(FILE, users)
  await logAudit("USER_CREATED", user.id, { username, fullName, email })
  res.status(201).json(user)
})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { fullName, email, department, status } = req.body || {}
  const users = await readJson(FILE, [])
  const idx = users.findIndex(u => u.id === id)
  if(idx === -1) return res.status(404).json({ error: "Usuário não encontrado" })
  
  const oldUser = { ...users[idx] }
  if(fullName) users[idx].fullName = fullName
  if(email) users[idx].email = email
  if(department) users[idx].department = department
  if(status) users[idx].status = status
  
  await writeJson(FILE, users)
  await logAudit("USER_MODIFIED", id, { changes: { fullName, email, department, status }, oldData: oldUser })
  res.json(users[idx])
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  const users = await readJson(FILE, [])
  const user = users.find(u => u.id === id)
  if(!user) return res.status(404).json({ error: "Usuário não encontrado" })
  
  const filtered = users.filter(u => u.id !== id)
  await writeJson(FILE, filtered)
  await logAudit("USER_DELETED", id, { username: user.username, fullName: user.fullName })
  res.status(204).end()
})

// Profile/Role management
router.post("/:id/profiles", async (req, res) => {
  const { id } = req.params
  const { profileName } = req.body || {}
  if(!profileName) return res.status(400).json({ error: "profileName é obrigatório" })
  
  const users = await readJson(FILE, [])
  const idx = users.findIndex(u => u.id === id)
  if(idx === -1) return res.status(404).json({ error: "Usuário não encontrado" })
  
  if(users[idx].profiles.includes(profileName)) return res.status(400).json({ error: "Perfil já atribuído" })
  
  users[idx].profiles.push(profileName)
  await writeJson(FILE, users)
  await logAudit("PROFILE_ASSIGNED", id, { profileName, username: users[idx].username })
  res.json(users[idx])
})

router.delete("/:id/profiles/:profileName", async (req, res) => {
  const { id, profileName } = req.params
  const users = await readJson(FILE, [])
  const idx = users.findIndex(u => u.id === id)
  if(idx === -1) return res.status(404).json({ error: "Usuário não encontrado" })
  
  users[idx].profiles = users[idx].profiles.filter(p => p !== profileName)
  await writeJson(FILE, users)
  await logAudit("PROFILE_REMOVED", id, { profileName, username: users[idx].username })
  res.json(users[idx])
})

router.post("/:id/roles", async (req, res) => {
  const { id } = req.params
  const { roleName } = req.body || {}
  if(!roleName) return res.status(400).json({ error: "roleName é obrigatório" })
  
  const users = await readJson(FILE, [])
  const idx = users.findIndex(u => u.id === id)
  if(idx === -1) return res.status(404).json({ error: "Usuário não encontrado" })
  
  if(users[idx].roles.includes(roleName)) return res.status(400).json({ error: "Papel já atribuído" })
  
  users[idx].roles.push(roleName)
  await writeJson(FILE, users)
  await logAudit("ROLE_ASSIGNED", id, { roleName, username: users[idx].username })
  res.json(users[idx])
})

router.delete("/:id/roles/:roleName", async (req, res) => {
  const { id, roleName } = req.params
  const users = await readJson(FILE, [])
  const idx = users.findIndex(u => u.id === id)
  if(idx === -1) return res.status(404).json({ error: "Usuário não encontrado" })
  
  users[idx].roles = users[idx].roles.filter(r => r !== roleName)
  await writeJson(FILE, users)
  await logAudit("ROLE_REMOVED", id, { roleName, username: users[idx].username })
  res.json(users[idx])
})

// SOX Compliance Review
router.get("/sox-review", async (req, res) => {
  const users = await readJson(FILE, [])
  const criticalUsers = users.filter(u => 
    u.profiles.some(p => p.includes("ADMIN") || p.includes("SUPER")) ||
    u.roles.some(r => r.includes("ADMIN") || r.includes("SUPER"))
  )
  
  const soxReview = criticalUsers.map(u => ({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    department: u.department,
    criticalProfiles: u.profiles.filter(p => p.includes("ADMIN") || p.includes("SUPER")),
    criticalRoles: u.roles.filter(r => r.includes("ADMIN") || r.includes("SUPER")),
    lastLogin: u.lastLogin,
    status: u.status,
    needsReview: !u.lastLogin || new Date(u.lastLogin) < new Date(Date.now() - 90*24*60*60*1000)
  }))
  
  res.json(soxReview)
})

// Audit logs
router.get("/audit-logs", async (req, res) => {
  const { action, userId, limit = 100 } = req.query || {}
  let logs = await readJson(AUDIT_FILE, [])
  
  if(action) logs = logs.filter(l => l.action === action)
  if(userId) logs = logs.filter(l => l.userId === userId)
  
  logs = logs.slice(-limit).reverse()
  res.json(logs)
})

// Login tracking
router.post("/:id/login", async (req, res) => {
  const { id } = req.params
  const users = await readJson(FILE, [])
  const idx = users.findIndex(u => u.id === id)
  if(idx === -1) return res.status(404).json({ error: "Usuário não encontrado" })
  
  users[idx].lastLogin = new Date().toISOString()
  await writeJson(FILE, users)
  await logAudit("USER_LOGIN", id, { username: users[idx].username })
  res.json(users[idx])
})

// Metrics
router.get("/metrics", async (req, res) => {
  const users = await readJson(FILE, [])
  const logs = await readJson(AUDIT_FILE, [])
  
  const metrics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    blockedUsers: users.filter(u => u.status === "blocked").length,
    usersCreated: logs.filter(l => l.action === "USER_CREATED").length,
    usersModified: logs.filter(l => l.action === "USER_MODIFIED").length,
    profilesAssigned: logs.filter(l => l.action === "PROFILE_ASSIGNED").length,
    profilesRemoved: logs.filter(l => l.action === "PROFILE_REMOVED").length,
    rolesAssigned: logs.filter(l => l.action === "ROLE_ASSIGNED").length,
    rolesRemoved: logs.filter(l => l.action === "ROLE_REMOVED").length,
    auditsCompleted: logs.filter(l => l.action.includes("AUDIT")).length
  }
  
  res.json(metrics)
})

module.exports = router
