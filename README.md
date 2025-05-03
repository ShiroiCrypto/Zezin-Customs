# Zezin-Customs

Bot para Discord feito em JavaScript, com suporte a comandos prefixados, comandos slash e sistema de eventos. Desenvolvido com foco em modularidade, performance e integração com sistemas de metas diárias.

## 🚀 Tecnologias

- Node.js
- Discord.js v14+
- SQLite (banco de dados leve e embutido)
- Dotenv (variáveis de ambiente)
- Square Cloud (hospedagem)

## 📂 Estrutura de Pastas

```

├── .env                # Variáveis de ambiente
├── api.js              # API externa ou conexões auxiliares
├── Config.json         # Arquivo de configurações (prefixo, etc)
├── Handler/            # Sistema de carregamento automático de comandos/eventos
├── ComandosPrefix/     # Comandos que usam prefixo (!comando)
├── ComandosSlash/      # Comandos slash (/comando)
├── Eventos/            # Eventos do bot (ready, messageCreate, etc)
├── index.js            # Ponto de entrada do bot
├── json.sqlite         # Base de dados local SQLite
├── package.json        # Dependências e metadados do projeto

````

## ⚙️ Requisitos

- Node.js v18 ou superior
- SQLite3
- Conta na [Square Cloud](https://squarecloud.app)

## 🔧 Instalação

```bash
git clone https://github.com/ShiroiCrypto/Zezin-Customs.git
cd Zezin-Customs
npm install
````

## 📄 Variáveis de ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```
TOKEN=seu_token_do_bot
CLIENT_ID=seu_id_do_cliente
GUILD_ID=id_do_servidor_para_testes
```

## 💻 Executar o bot

```bash
node index.js
```

---

## 📝 Licença

Distribuído sob a Licença [GNU GPLv3](LICENSE).

---

Desenvolvido por [ShiroiCrypto](https://github.com/ShiroiCrypto).

```

---

Se quiser, posso gerar esse `README.md` direto em arquivo para você colar ou importar. Deseja isso?
```
