const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { readJson, writeJson } = require("../storage/jsonStore")
const router = express.Router()

const FILE = "transports.json"

router.get("/", async (req, res) => {
  const items = await readJson(FILE, [])
  res.json(items)
})

router.post("/", async (req, res) => {
  const { requestId, system, owner } = req.body || {}
  if(!requestId || !system || !owner) return res.status(400).json({ error: "Campos obrigatórios: requestId, system, owner" })
  const items = await readJson(FILE, [])
  const item = { id: uuidv4(), requestId, system, owner, status: "pending", createdAt: new Date().toISOString() }
  items.push(item)
  await writeJson(FILE, items)
  res.status(201).json(item)
})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { status } = req.body || {}
  const items = await readJson(FILE, [])
  const idx = items.findIndex(i => i.id === id)
  if(idx === -1) return res.status(404).json({ error: "Não encontrado" })
  if(status) items[idx].status = status
  await writeJson(FILE, items)
  res.json(items[idx])
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  const items = await readJson(FILE, [])
  const next = items.filter(i => i.id !== id)
  if(next.length === items.length) return res.status(404).json({ error: "Não encontrado" })
  await writeJson(FILE, next)
  res.status(204).end()
})

module.exports = router


