const express = require("express")
const userService = require("../database/userService")
const router = express.Router()

// Users CRUD
router.get("/", async (req, res) => {
  try {
    const users = await userService.getAllUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const { username, fullName, email, department, status = "active" } = req.body || {}
    if(!username || !fullName || !email) return res.status(400).json({ error: "Campos obrigatórios: username, fullName, email" })
    
    const user = await userService.createUser({ username, fullName, email, department, status })
    await userService.logAudit("USER_CREATED", user.id, { username, fullName, email })
    res.status(201).json(user)
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: "Usuário já existe" })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { fullName, email, department, status } = req.body || {}
    
    const user = await userService.updateUser(id, { fullName, email, department, status })
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" })
    
    await userService.logAudit("USER_MODIFIED", id, { changes: { fullName, email, department, status } })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const user = await userService.getUserById(id)
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" })
    
    await userService.deleteUser(id)
    await userService.logAudit("USER_DELETED", id, { username: user.username, fullName: user.full_name })
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Profile/Role management
router.post("/:id/profiles", async (req, res) => {
  try {
    const { id } = req.params
    const { profileName } = req.body || {}
    if(!profileName) return res.status(400).json({ error: "profileName é obrigatório" })
    
    await userService.assignProfile(id, profileName)
    const user = await userService.getUserById(id)
    await userService.logAudit("PROFILE_ASSIGNED", id, { profileName, username: user.username })
    res.json(user)
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: "Perfil já atribuído" })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

router.delete("/:id/profiles/:profileName", async (req, res) => {
  try {
    const { id, profileName } = req.params
    const user = await userService.getUserById(id)
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" })
    
    await userService.removeProfile(id, profileName)
    await userService.logAudit("PROFILE_REMOVED", id, { profileName, username: user.username })
    const updatedUser = await userService.getUserById(id)
    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/:id/roles", async (req, res) => {
  try {
    const { id } = req.params
    const { roleName } = req.body || {}
    if(!roleName) return res.status(400).json({ error: "roleName é obrigatório" })
    
    await userService.assignRole(id, roleName)
    const user = await userService.getUserById(id)
    await userService.logAudit("ROLE_ASSIGNED", id, { roleName, username: user.username })
    res.json(user)
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: "Papel já atribuído" })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

router.delete("/:id/roles/:roleName", async (req, res) => {
  try {
    const { id, roleName } = req.params
    const user = await userService.getUserById(id)
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" })
    
    await userService.removeRole(id, roleName)
    await userService.logAudit("ROLE_REMOVED", id, { roleName, username: user.username })
    const updatedUser = await userService.getUserById(id)
    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// SOX Compliance Review
router.get("/sox-review", async (req, res) => {
  try {
    const soxReview = await userService.getSoxReview()
    res.json(soxReview)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Audit logs
router.get("/audit-logs", async (req, res) => {
  try {
    const { action, userId, limit = 100 } = req.query || {}
    const logs = await userService.getAuditLogs({ action, userId, limit })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login tracking
router.post("/:id/login", async (req, res) => {
  try {
    const { id } = req.params
    const user = await userService.updateUserLogin(id)
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" })
    
    await userService.logAudit("USER_LOGIN", id, { username: user.username })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Metrics
router.get("/metrics", async (req, res) => {
  try {
    const metrics = await userService.getMetrics()
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
