const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");

function ensureDir(){
  if(!fs.existsSync(DATA_DIR)){
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function readJson(fileName, defaultValue){
  ensureDir();
  const filePath = path.join(DATA_DIR, fileName);
  try{
    const raw = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(raw);
  }catch(err){
    if(err.code === 'ENOENT') return defaultValue;
    throw err;
  }
}

async function writeJson(fileName, data){
  ensureDir();
  const filePath = path.join(DATA_DIR, fileName);
  const tmpPath = filePath + ".tmp";
  await fs.promises.writeFile(tmpPath, JSON.stringify(data, null, 2));
  await fs.promises.rename(tmpPath, filePath);
}

module.exports = { readJson, writeJson }


