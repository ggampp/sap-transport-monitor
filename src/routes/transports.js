const express = require("express")
const transportService = require("../database/transportService")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query || {}
    const transports = await transportService.getAllTransports({ from, to })
    res.json(transports)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const { requestId, system, owner } = req.body || {}
    if(!requestId || !system || !owner) return res.status(400).json({ error: "Campos obrigatórios: requestId, system, owner" })
    
    const transport = await transportService.createTransport({ requestId, system, owner })
    res.status(201).json(transport)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    
    const transport = await transportService.updateTransport(id, { status })
    if (!transport) return res.status(404).json({ error: "Não encontrado" })
    
    res.json(transport)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await transportService.deleteTransport(id)
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router


