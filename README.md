# Santa Cruz News Scraper e Notificador por E-mail

Este projeto consiste em um scraper de notícias desenvolvido em Node.js utilizando Puppeteer e Cheerio para extrair as últimas notícias do Santa Cruz de uma fonte específica (Flashscore). Além disso, ele integra uma funcionalidade de envio automático de e-mails com as notícias extraídas, utilizando Nodemailer.

## Funcionalidades

- **Scraping de Notícias**: Extrai títulos, links e fontes das notícias do Santa Cruz.
- **Geração de JSON**: Salva as notícias extraídas em um arquivo `noticias-santa-cruz.json`.
- **Envio de E-mail Automatizado**: Envia um e-mail formatado em HTML com as notícias para um destinatário configurado.

## Pré-requisitos

Certifique-se de ter o Node.js instalado em sua máquina.

## Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/dilucas00/Noticias_Santa_Cruz.git
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```
SANTA_CRUZ_URL=https://www.flashscore.com.br/equipe/santa-cruz/p0NN5gef/

# Configurações do scraper
HEADLESS=true
DELAY_MS=1000

# Configurações de E-mail (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_ou_email
EMAIL_RECIPIENT=destinatario@example.com
```

**Importante sobre as configurações de E-mail:**

- `EMAIL_USER`: Seu endereço de e-mail (ex: `seu_email@gmail.com`).
- `EMAIL_PASS`: Se estiver usando Gmail, você precisará gerar uma **senha de app** se tiver a verificação em duas etapas ativada. Caso contrário, pode ser necessário habilitar "Acesso a apps menos seguros" na sua conta Google (não recomendado para segurança).
- `EMAIL_RECIPIENT`: O endereço de e-mail para onde as notícias serão enviadas.

## Como Usar

Para executar o scraper e enviar o e-mail:

```bash
node scraper.js
```

O script irá:
1. Abrir um navegador (Puppeteer).
2. Navegar até a página do Santa Cruz no Flashscore.
3. Extrair as notícias.
4. Salvar as notícias em `noticias-santa-cruz.json`.
5. Enviar um e-mail com as notícias extraídas para o `EMAIL_RECIPIENT` configurado.

## Estrutura do Projeto

- `scraper.js`: Contém a lógica principal para o scraping das notícias.
- `emailSender.js`: Contém a função para configurar e enviar e-mails.
- `.env`: Arquivo para variáveis de ambiente (não deve ser versionado).
- `noticias-santa-cruz.json`: Arquivo onde as notícias extraídas são salvas.
- `package.json`: Define as dependências e scripts do projeto.

## Solução de Problemas

- **Erro de autenticação de e-mail (EAUTH)**: Verifique se `EMAIL_USER` e `EMAIL_PASS` estão corretos no seu arquivo `.env`. Se estiver usando Gmail, certifique-se de ter gerado uma senha de app ou habilitado o acesso a apps menos seguros.
- **Navegação do Puppeteer**: Se o scraper não conseguir navegar, verifique a `SANTA_CRUZ_URL` no `.env` e sua conexão com a internet.
