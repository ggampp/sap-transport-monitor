const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { readJson, writeJson } = require("../storage/jsonStore")
const router = express.Router()

const FILE = "transports.json"

router.get("/", async (req, res) => {
  const { from, to } = req.query || {}
  const items = await readJson(FILE, [])
  if(!from && !to){
    return res.json(items)
  }
  const startOfDay = (d)=>{ const x = new Date(d); x.setHours(0,0,0,0); return x }
  const fromDate = from ? startOfDay(new Date(from)) : null
  const toDate   = to ? new Date(startOfDay(new Date(to)).getTime()+86400000-1) : null
  const filtered = items.filter(t => {
    const dt = new Date(t.createdAt)
    if(fromDate && dt < fromDate) return false
    if(toDate && dt > toDate) return false
    return true
  })
  res.json(filtered)
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


