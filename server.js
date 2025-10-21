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
      email TEXT,
      perfilImage TEXT,
      texto TEXT NOT NULL,
      data TEXT NOT NULL
    )
  `);

  console.log("✅ Banco de dados pronto!");
})();

// ========================
// Rotas de usuários
// ========================

// Cadastrar usuário
app.post("/api/usuarios", async (req, res) => {
  const data = req.body;

  if (!data.nome || !data.email) {
    return res.status(400).json({ error: "Nome e email são obrigatórios" });
  }

  const now = new Date().toISOString();

  try {
    await db.run(
      `INSERT INTO usuarios (nome, email, perfil, notas, perfilImage, data) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET 
         nome=excluded.nome,
         perfil=excluded.perfil,
         notas=excluded.notas,
         perfilImage=excluded.perfilImage,
         data=excluded.data`,
      [
        data.nome,
        data.email,
        data.perfil || null,
        data.notas || null,
        data.perfilImage || null,
        now,
      ]
    );

    res.json({
      success: true,
      message: "Usuário cadastrado ou atualizado com sucesso!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar usuário" });
  }
});

// Buscar usuário pelo email
app.get("/api/usuarios/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const user = await db.get("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// ========================
// Rotas de comentários
// ========================

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

// Inserir comentário (com email e perfilImage)
app.post("/api/comentarios", async (req, res) => {
  const { nome, texto, email } = req.body;
  if (!nome || !texto)
    return res.status(400).json({ error: "Nome e texto são obrigatórios" });

  let perfilImage = null;
  if (email) {
    try {
      const user = await db.get(
        "SELECT perfilImage FROM usuarios WHERE email = ?",
        [email]
      );
      perfilImage = user?.perfilImage || null;
    } catch (err) {
      console.error("Erro ao buscar imagem do usuário:", err);
    }
  }

  const data = new Date().toISOString();
  try {
    await db.run(
      "INSERT INTO comentarios (nome, texto, email, perfilImage, data) VALUES (?, ?, ?, ?, ?)",
      [nome, texto, email, perfilImage, data]
    );
    res.json({ success: true, nome, texto, email, perfilImage, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar comentário" });
  }
});

// Inicialização do servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
