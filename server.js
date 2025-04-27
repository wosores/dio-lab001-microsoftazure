const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const sql = require('mssql'); // Importe a biblioteca mssql

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Configurações do Azure Storage
const CONNECTION_STRING = "";
const CONTAINER_NAME = "";
const ACCOUNT_NAME = "";

// Configurações do Azure SQL Server (formato mssql)
const sqlConfig = {
    server: "",
    database: "",
    user: "",
    password: "",
    options: {
        encrypt: true,
        trustServerCertificate: false // ou true dependendo da sua configuração
    }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Função para executar a query SQL com mssql
async function executeQuery(sqlQuery) {
    try {
        const pool = await sql.connect(sqlConfig);
        const result = await pool.request().query(sqlQuery);
        return result.recordset;
    } catch (err) {
        console.error('Erro ao executar query com mssql:', err);
        throw err;
    } finally {
        sql.close(); // Fechar a conexão após a execução
    }
}

app.post('/api/produtos', upload.single('imagem'), async (req, res) => {
    const { nome, descricao, preco } = req.body;
    const imageFile = req.file;
    let imageUrl = null;

    if (!nome || !descricao || !preco) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        if (imageFile) {
            const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
            const blobName = `${uuidv4()}.jpg`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.upload(imageFile.buffer, imageFile.size);
            imageUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;
        }

        const pool = await sql.connect(sqlConfig);
        const request = pool.request();
        request.input('nome', sql.NVarChar, nome);
        request.input('descricao', sql.NVarChar, descricao);
        request.input('preco', sql.Decimal(10, 2), parseFloat(preco)); // Ajuste a precisão conforme necessário
        request.input('imagem_url', sql.NVarChar, imageUrl);

        const insertQuery = `
            INSERT INTO dbo.Produtos (nome, descricao, preco, imagem_url)
            VALUES (@nome, @descricao, @preco, @imagem_url);
        `;

        await request.query(insertQuery);
        res.status(201).json({ message: 'Produto cadastrado com sucesso!' });

    } catch (error) {
        console.error('Erro ao cadastrar produto com mssql:', error);
        res.status(500).json({ error: 'Erro ao cadastrar o produto no banco de dados.' });
    } finally {
        sql.close();
    }
});

app.get('/api/produtos', async (req, res) => {
    console.log("Tentando listar produtos usando mssql...");
    const query = `SELECT id, nome, descricao, preco, imagem_url FROM dbo.Produtos;`;

    try {
        const products = await executeQuery(query);
        res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao listar produtos com mssql:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos do banco de dados.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor Node.js rodando na porta ${port}`);
});