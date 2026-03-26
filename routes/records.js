const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../zohoAuth");

const router = express.Router();

// POST /api/records — Crear un registro en el módulo de Zoho
router.post("/", async (req, res) => {
  try {
    const token = await getAccessToken();
    const moduleName = process.env.ZOHO_MODULE_NAME;

    // req.body debe contener los campos del módulo
    const payload = {
      data: [req.body],
    };

    const response = await axios.post(
      `https://www.zohoapis.com/crm/v3/${moduleName}`,
      payload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.data[0];

    // Zoho retorna status SUCCESS o ERROR por registro
    if (result.status === "success") {
      return res.status(201).json({
        message: "Registro creado exitosamente",
        id: result.details.id,
      });
    } else {
      return res.status(400).json({
        message: "Error al crear el registro",
        details: result,
      });
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;