// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'links.json');

// Middleware para interpretar JSON
app.use(bodyParser.json());

// --- Rotas da API ---

// Função para ler os links do arquivo JSON
function readLinks() {
  // Se o arquivo não existir, cria-o com um array vazio
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    return [];
  }

  // Lê o conteúdo do arquivo
  const data = fs.readFileSync(DATA_FILE, { encoding: 'utf-8' });
  
  // Se o arquivo estiver vazio, retorna array vazio
  if (!data) {
    return [];
  }
  
  // Tenta converter o conteúdo para JSON
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao fazer parse do JSON:", error);
    return [];
  }
}

// Função para salvar os links no arquivo JSON
function saveLinks(links) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
}

// Endpoint para obter todos os links
app.get('/api/links', (req, res) => {
  const links = readLinks();
  res.json(links);
});

// Endpoint para cadastrar um novo link
app.post('/api/links', (req, res) => {
  const { nome, url } = req.body;
  if (!nome || !url) {
    return res.status(400).json({ error: 'Nome e URL são obrigatórios' });
  }
  const links = readLinks();
  links.push({ nome, url });
  saveLinks(links);
  res.json({ message: 'Link cadastrado com sucesso!' });
});

// --- Middleware para arquivos estáticos ---
// Assegura que as rotas da API sejam tratadas antes de servir os arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
