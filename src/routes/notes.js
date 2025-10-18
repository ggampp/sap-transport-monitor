const express = require("express")
const noteService = require("../database/noteService")
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const notes = await noteService.getAllNotes()
    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/", async (req, res) => {
  try {
    const { noteId, system, owner } = req.body || {}
    if(!noteId || !system || !owner) return res.status(400).json({ error: "Campos obrigatórios: noteId, system, owner" })
    
    const note = await noteService.createNote({ noteId, system, owner })
    res.status(201).json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    
    const note = await noteService.updateNote(id, { status })
    if (!note) return res.status(404).json({ error: "Não encontrado" })
    
    res.json(note)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    await noteService.deleteNote(id)
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router


