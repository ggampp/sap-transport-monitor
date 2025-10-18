const express = require("express")
const transportService = require("../database/transportService")
const router = express.Router()

router.get("/transports", async (req, res) => {
  try {
    const { from, to } = req.query
    const analytics = await transportService.getAnalytics({ from, to })
    res.json(analytics)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router


