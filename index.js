require("dotenv").config();
const express       = require("express");
const recordsRouter = require("./routes/records");
const scoresRouter  = require("./routes/scores");
const queryRouter   = require("./routes/query");
const branchRouter   = require("./routes/crudSucursales");

const app = express();
app.use(express.json());

app.use("/api/records", recordsRouter);
app.use("/api/scores",  scoresRouter);
app.use("/api/query",   queryRouter);
app.use("/api/branch",   branchRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});