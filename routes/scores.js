const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../zohoAuth");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const token = await getAccessToken();
    const moduleName = process.env.ZOHO_SCORES_MODULE_NAME;

    const {
      global_score,
      score_five, count_five,
      score_four, count_four,
      score_three, count_three,
      score_two, count_two,
      score_one, count_one,
    } = req.body;

    // ✅ Validación completa
    if (
      global_score === undefined ||
      count_five === undefined || count_four === undefined ||
      count_three === undefined || count_two === undefined ||
      count_one === undefined
    ) {
      return res.status(400).json({
        message: "El body debe contener: global_score, count_five, count_four, count_three, count_two, count_one",
      });
    }

    const payload = {
      data: [
        {
          global_score: global_score,
          score_five: score_five ?? 5,
          count_five: count_five,
          score_four: score_four ?? 4,
          count_four: count_four,
          score_three: score_three ?? 3,
          count_three: count_three,
          score_two: score_two ?? 2,
          count_two: count_two,
          score_one: score_one ?? 1,
          count_one: count_one,
        },
      ],
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

    if (result.status === "success") {
      return res.status(201).json({
        message: "Score registrado exitosamente",
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