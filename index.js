require("dotenv").config();
const express = require("express");
const recordsRouter = require("./routes/records");
const scoresRouter = require("./routes/scores");

const app = express();
app.use(express.json());

// Ruta principal de la API
app.use("/api/records", recordsRouter);
app.use("/api/scores", scoresRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});