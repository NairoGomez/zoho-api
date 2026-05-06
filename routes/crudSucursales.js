const express = require("express");
const axios = require("axios");
const { getAccessToken } = require("../zohoAuth");

const router = express.Router();
const MODULE = () => process.env.ZOHO_SUCURSALES_MODULE_NAME;
const BASE_URL = "https://www.zohoapis.com/crm/v3";


const DEFAULT_FIELDS = [
  "id",
  "SUCURSAL",
  "ESTADO",
  "DEPARTAMENTO",
  "Latitud",
  "Longitud",
  "Direcci_n",
  "Identificaci_n_del_supervisor",
  "NOMBRE_COMPLETO_DEL_GESTOR",
  "HORARIO_DE_APERTURA",
  "PACIENTES_EN_ESPERA",
  "PERSONAL_QUE_ESTA_TOMANDO_MUESTRA",
  "Created_Time",
  "Modified_Time"
];

// Obtiene los campos del módulo dinámicamente
async function getModuleFields(token) {
  try {
    const response = await axios.get(`${BASE_URL}/settings/fields`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      params: { module: MODULE() },
    });
    return response.data.fields.map((f) => f.api_name).join(",");
  } catch (error) {
    // Si falla, retorna los campos base para no bloquear la consulta
    console.warn("No se pudieron obtener los campos, usando campos base.");
    return DEFAULT_FIELDS.join(",");
  }
}

// GET /api/query
// Trae todos los registros con paginación
// Query params: ?page=1&per_page=20
router.get("/", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { page = 1, per_page = 20 } = req.query;

    const fields = await getModuleFields(token);

    const response = await axios.get(`${BASE_URL}/${MODULE()}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      params: { fields, page, per_page },
    });

    const records = response.data.data || [];
    const info = response.data.info || {};

    return res.status(200).json({
      total: info.count ?? records.length,
      page: info.page ?? parseInt(page),
      per_page: info.per_page ?? parseInt(per_page),
      more_records: info.more_records ?? false,
      records,
    });
  } catch (error) {
    if (error.response?.status === 204) {
      return res.status(200).json({ total: 0, records: [] });
    }
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error al obtener registros",
      error: error.response?.data || error.message,
    });
  }
});

// GET /api/query/:id
// Buscar un registro por ID específico
router.get("/:id", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { id } = req.params;

    const fields = await getModuleFields(token);

    const response = await axios.get(`${BASE_URL}/${MODULE()}/${id}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      params: { fields },
    });

    const record = response.data.data?.[0];

    if (!record) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    return res.status(200).json({ record });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error al buscar el registro",
      error: error.response?.data || error.message,
    });
  }
});

// POST /api/query/search
// Filtrar por campo y valor
// Body: { "field": "IDENTIFICADOR_INTERNO_SUCURSAL", "value": "211" }
router.post("/search", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { field, value, page = 1, per_page = 20 } = req.body;

    if (!field || !value) {
      return res.status(400).json({
        message: "El body debe contener: field y value",
      });
    }

    const response = await axios.get(`${BASE_URL}/${MODULE()}/search`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      params: {
        criteria: `(${field}:equals:${value})`,
        page,
        per_page,
      },
    });

    const records = response.data.data || [];
    const info = response.data.info || {};

    return res.status(200).json({
      total: info.count ?? records.length,
      page: info.page ?? parseInt(page),
      per_page: info.per_page ?? parseInt(per_page),
      more_records: info.more_records ?? false,
      records,
    });
  } catch (error) {
    if (error.response?.status === 204) {
      return res.status(200).json({ total: 0, records: [] });
    }
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error al filtrar registros",
      error: error.response?.data || error.message,
    });
  }
});

// POST /api/query
// Crear un nuevo registro
// Body: { "data": { "SUCURSAL": "Nueva Sucursal", ... } }
router.post("/", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ message: "El body debe contener: data" });
    }

    const response = await axios.post(`${BASE_URL}/${MODULE()}`, { data: [data] }, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    const record = response.data.data?.[0];

    return res.status(201).json({ record });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error al crear el registro",
      error: error.response?.data || error.message,
    });
  }
});

// PUT /api/query/:id
// Actualizar un registro existente
// Body: { "data": { "SUCURSAL": "Sucursal Actualizada", ... } }
router.put("/:id", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { id } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ message: "El body debe contener: data" });
    }

    const response = await axios.put(`${BASE_URL}/${MODULE()}/${id}`, { data: [data] }, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    const record = response.data.data?.[0];

    return res.status(200).json({ record });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error al actualizar el registro",
      error: error.response?.data || error.message,
    });
  }
});

// DELETE /api/query/:id
// Eliminar un registro por ID
router.delete("/:id", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { id } = req.params;

    await axios.delete(`${BASE_URL}/${MODULE()}/${id}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    return res.status(200).json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error al eliminar el registro",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;