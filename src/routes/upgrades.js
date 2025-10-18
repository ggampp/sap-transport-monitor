const express = require("express")
const upgradeService = require("../database/upgradeService")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const upgrades = await upgradeService.getAllUpgrades()
    res.json(upgrades)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const { name, window, owner } = req.body || {}
    if(!name || !window || !owner) return res.status(400).json({ error: "Campos obrigatórios: name, window, owner" })
    
    const upgrade = await upgradeService.createUpgrade({ name, window, owner })
    res.status(201).json(upgrade)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    
    const upgrade = await upgradeService.updateUpgrade(id, { status })
    if (!upgrade) return res.status(404).json({ error: "Não encontrado" })
    
    res.json(upgrade)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await upgradeService.deleteUpgrade(id)
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router


