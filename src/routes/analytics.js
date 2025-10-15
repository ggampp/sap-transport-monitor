const express = require("express")
const { readJson } = require("../storage/jsonStore")
const router = express.Router()

function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
function fmtDay(d){ return new Date(d).toISOString().slice(0,10) }

router.get("/transports", async (req, res) => {
  const { from, to } = req.query
  const data = await readJson("transports.json", [])

  const fromDate = from ? new Date(from) : null
  const toDate   = to ? new Date(to) : null

  const filtered = data.filter(t => {
    const dt = new Date(t.createdAt)
    if(fromDate && dt < startOfDay(fromDate)) return false
    if(toDate && dt > new Date(startOfDay(toDate).getTime()+86400000-1)) return false
    return true
  })

  // Pie: by status total
  const byStatus = filtered.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  // Bar: per day per status
  const perDayStatus = {}
  for(const t of filtered){
    const day = fmtDay(t.createdAt)
    if(!perDayStatus[day]) perDayStatus[day] = {}
    perDayStatus[day][t.status] = (perDayStatus[day][t.status] || 0) + 1
  }

  const days = Object.keys(perDayStatus).sort()
  const statuses = Array.from(new Set(filtered.map(t => t.status))).sort()
  const series = statuses.map(st => ({ status: st, data: days.map(d => perDayStatus[d][st] || 0) }))

  res.json({
    from: fromDate ? fmtDay(fromDate) : null,
    to: toDate ? fmtDay(toDate) : null,
    totalsByStatus: byStatus,
    days,
    series
  })
})

module.exports = router


