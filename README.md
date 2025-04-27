#ABRA NO GITHUB COMO RAW:
Fiz uma adaptação desse desafio, em vez de utililizar o python(que também fiz), utilizei o html,css e javascript, como backend utilizei o node.js:
![image](https://github.com/user-attachments/assets/3b8574f0-fac4-4264-a05e-0494b9a10730)
Passos:
1º Configurar suas informações do banco e servidor do azure no arquivo server.js dentro da pasta site
Procure por // Configurações do Azure Storage e // Configurações do Azure SQL Server (formato mssql) colocando suas informações:

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

2º Instalar backend com nodjs no linux:
sudo apt install -y nodejs npm
cd site
npm init -y
npm install express
npm install multer
npm install @azure/storage-blob
npm install cors
npm install mssql
node server.js

3º Para acessar a parte web utilizei a expensão live server do visual studio code, ao clicar com o botão direito no index.html pelo code vai aparecer a opção para abrir com o live server, ai só testar


