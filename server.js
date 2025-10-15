const express   = require("express")
const path      = require("path")
const app       = express();

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static dashboard
app.use(express.static(path.join(__dirname, "public")))

// Health
app.get("/health", function(req, res){
    res.json({ status: "ok" })
})

// APIs
app.use("/api/transports", require("./src/routes/transports"))
app.use("/api/notes", require("./src/routes/notes"))
app.use("/api/upgrades", require("./src/routes/upgrades"))
app.use("/api/analytics", require("./src/routes/analytics"))

// Root -> serve dashboard
app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

const port = process.env.PORT || 5000;
app.listen(port, function(){
    console.log("SAP Basis Cockpit listening on port: " + port);
});