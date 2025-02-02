const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'links.json');

// Middleware para interpretar JSON
app.use(bodyParser.json());

// Função para ler os links do arquivo JSON
function readLinks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
      return [];
    }

    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error);
    return [];
  }
}

// Função para salvar os links no arquivo JSON de forma segura
function saveLinks(links, res = null) {
  fs.writeFile(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8', (err) => {
    if (err) {
      console.error("Erro ao salvar os dados:", err);
      if (res) res.status(500).json({ error: "Erro ao salvar os dados" });
    } else {
      console.log("Dados salvos com sucesso!");
      if (res) res.json({ message: 'Operação realizada com sucesso!' });
    }
  });
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
  
  // Verifica se o link já existe
  const linkExiste = links.some(link => link.url === url);
  if (linkExiste) {
    return res.status(400).json({ error: 'Este link já foi cadastrado' });
  }

  links.push({ nome, url });
  saveLinks(links, res);
});

// Endpoint para deletar um link pelo nome
app.delete('/api/links/:nome', (req, res) => {
  const { nome } = req.params;
  let links = readLinks();

  const filteredLinks = links.filter(link => link.nome !== nome);

  if (filteredLinks.length === links.length) {
    return res.status(404).json({ error: 'Link não encontrado' });
  }

  saveLinks(filteredLinks, res);
});

// Servindo arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
