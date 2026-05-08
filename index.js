require("dotenv").config();
const express       = require("express");
const recordsRouter = require("./routes/records");
const scoresRouter  = require("./routes/scores");
const queryRouter   = require("./routes/query");
const branchRouter   = require("./routes/crudSucursales");
const cadenasRouter   = require("./routes/crudCadenas");

const app = express();
app.use(express.json());

app.use("/api/records", recordsRouter);
app.use("/api/scores",  scoresRouter);
app.use("/api/visitas",   queryRouter);
app.use("/api/branch",   branchRouter);
app.use("/api/cadenas",   cadenasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});