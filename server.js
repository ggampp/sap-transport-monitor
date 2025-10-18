const express   = require("express")
const path      = require("path")
const { initializeDatabase } = require("./src/database/init")
const app       = express();

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS for React frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Static dashboard (HTML)
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
app.use("/api/users", require("./src/routes/users"))

// Root route
app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

const port = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  try {
    console.log("Attempting to connect to PostgreSQL database...");
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.warn("Database connection failed, falling back to JSON storage:", error.message);
    console.log("Server will start with JSON file storage");
  }
  
  app.listen(port, function(){
      console.log("SAP Basis Cockpit listening on port: " + port);
  });
}

startServer();