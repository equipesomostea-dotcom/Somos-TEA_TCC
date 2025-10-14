// server.js
import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();

// Aumenta o limite do body para receber imagens grandes
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Conecta/abre banco SQLite
let db;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  // Cria tabela de usuários
  await db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      perfil TEXT,
      notas TEXT,
      perfilImage TEXT,
      data TEXT NOT NULL
    )
  `);

  // Cria tabela de comentários
  await db.run(`
    CREATE TABLE IF NOT EXISTS comentarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      texto TEXT NOT NULL,
      data TEXT NOT NULL
    )
  `);

  console.log("✅ Banco de dados pronto!");
})();

// =====================
// Rotas de usuários
// =====================

// Cadastrar usuário
app.post("/api/usuarios", async (req, res) => {
  const { nome, email, perfil, notas, perfilImage } = req.body;
  if (!nome || !email) return res.status(400).json({ error: "Nome e email são obrigatórios" });

  const data = new Date().toISOString();
  try {
    await db.run(
      "INSERT INTO usuarios (nome, email, perfil, notas, perfilImage, data) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, email, perfil, notas, perfilImage, data]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar usuário. Email pode já estar cadastrado." });
  }
});

// Buscar usuário pelo email
app.get("/api/usuarios/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const user = await db.get("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// =====================
// Rotas de comentários
// =====================

// Buscar todos os comentários
app.get("/api/comentarios", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM comentarios ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
});

// Inserir comentário
app.post("/api/comentarios", async (req, res) => {
  const { nome, texto } = req.body;
  if (!nome || !texto) return res.status(400).json({ error: "Nome e texto são obrigatórios" });

  const data = new Date().toISOString();
  try {
    await db.run("INSERT INTO comentarios (nome, texto, data) VALUES (?, ?, ?)", [nome, texto, data]);
    res.json({ success: true, nome, texto, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar comentário" });
  }
});

// =====================
// Inicialização do servidor
// =====================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
