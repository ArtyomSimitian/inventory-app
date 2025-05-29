// src/index.js
require("dotenv").config();
const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());

// welcome message
app.get("/", (req, res) => {
  res.send("🏭 Welcome to your Inventory API! Try GET /products");
});

// GET all products
app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new product
app.post("/products", async (req, res) => {
  const { name, sku, quantity, supplier_id, category, price } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, sku, quantity, supplier_id, category, price) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, sku, quantity, supplier_id, category, price]
    );
    res.status(201).json({ product_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update stock for a product
app.put("/products/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { quantity_change, reason } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE products SET quantity = quantity + ? WHERE product_id = ?`,
      [quantity_change, id]
    );
    await conn.query(
      `INSERT INTO stock_movements (product_id, quantity_change, reason) VALUES (?, ?, ?)`,
      [id, quantity_change, reason]
    );
    await conn.commit();
    res.json({ message: "Stock updated" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET low-stock products
app.get("/reports/lowstock", async (req, res) => {
  try {
    const threshold = req.query.threshold || 5;
    const [rows] = await pool.query(
      `SELECT * FROM products WHERE quantity <= ?`,
      [threshold]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST an order
app.post("/orders", async (req, res) => {
  const { product_id, quantity, order_type } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO orders (product_id, quantity, order_type) VALUES (?, ?, ?)`,
      [product_id, quantity, order_type]
    );
    res.status(201).json({ order_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Inventory app listening on http://localhost:${PORT}`);
});
