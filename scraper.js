const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { sendNewsEmail } = require("./emailSender");
require("dotenv").config();

/**
 * Extrai notícias do Santa Cruz usando Puppeteer e Cheerio
 * @returns {Promise<Array>} Lista de notícias em formato JSON
 */
async function scrapeSantaCruzNews() {
  let browser;

  try {
    console.log("🚀 Iniciando scraper do Santa Cruz...");

    // Configuração do Puppeteer
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS === "true",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Configurar User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Configurar viewport
    await page.setViewport({ width: 1366, height: 768 });

    console.log("📄 Navegando para a página do Santa Cruz...");

    // Navegar para a URL
    await page.goto(process.env.SANTA_CRUZ_URL, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    console.log("⏳ Aguardando carregamento completo...");

    // Delay adicional para garantir carregamento
    await page.waitForTimeout(parseInt(process.env.DELAY_MS) || 1000);

    const html = await page.content();

    console.log("🔍 Extraindo notícias com Cheerio...");

    // Carregar HTML no Cheerio
    const $ = cheerio.load(html);

    const noticias = [];

    // Buscar por diferentes seletores possíveis de notícias
    const possibleSelectors = [
      ".fsNewsWidget__articleTitle",
      ".newsListItem",
      ".news-item",
      ".article-item",
      '[class*="news"]',
      '[class*="article"]',
      ".match-info",
      ".event-row",
    ];

    let foundNews = false;

    for (const selector of possibleSelectors) {
      const elements = $(selector);

      if (elements.length > 0) {
        console.log(
          `✅ Encontrados ${elements.length} elementos com seletor: ${selector}`
        );
        foundNews = true;

        elements.each((index, element) => {
          const $element = $(element);

          // Tentar extrair link
          let link =
            "https://www.flashscore.com.br/equipe/santa-cruz/p0NN5gef/";
          const linkElement = $element.is("a")
            ? $element
            : $element.find("a").first();
          if (linkElement.length > 0) {
            link = linkElement.attr("href") || "#";
          }

          // Converter link relativo para absoluto
          if (link && link.startsWith("/")) {
            link = "https://www.flashscore.com.br" + link;
          }

          // Tentar extrair fonte
          let fonte =
            $element
              .find('.source, .author, [class*="source"]')
              .text()
              .trim() || "Flashscore";

          // Tentar extrair título
          let titulo =
            $element
              .find('h3, h2, h1, .title, [class*="title"], .headline')
              .first()
              .text()
              .trim() ||
            $element.text().trim().split("\n")[0] ||
            "Título não encontrado";

          // Filtrar conteúdo relevante
          if (titulo && titulo.length > 10 && !titulo.includes("Publicidade")) {
            noticias.push({
              titulo: titulo.substring(0, 200), // Limitar tamanho
              link: link,
              fonte: fonte,

              dataExtracao: new Date().toISOString(),
            });
          }
        });

        break;
      }
    }

    // Se não encontrou notícias específicas, tentar extrair informações gerais
    if (!foundNews) {
      console.log(
        "⚠️ Seletores específicos não encontraram notícias. Tentando extração geral..."
      );

      // Buscar por links e textos relevantes
      $("a").each((index, element) => {
        const $element = $(element);
        const texto = $element.text().trim();
        const link = $element.attr("href");

        if (
          texto &&
          texto.length > 20 &&
          texto.length < 200 &&
          (texto.toLowerCase().includes("santa cruz") ||
            texto.toLowerCase().includes("jogo") ||
            texto.toLowerCase().includes("partida"))
        ) {
          let fullLink = link;
          if (link && link.startsWith("/")) {
            fullLink = "https://www.flashscore.com.br" + link;
          }

          noticias.push({
            titulo: texto,
            link: fullLink || "#",
            fonte: "Flashscore",
            dataExtracao: new Date().toISOString(),
          });
        }
      });
    }

    // Remover duplicatas
    const noticiasUnicas = noticias.filter(
      (noticia, index, self) =>
        index === self.findIndex((n) => n.titulo === noticia.titulo)
    );

    console.log(`📰 Total de notícias extraídas: ${noticiasUnicas.length}`);

    return noticiasUnicas.slice(0, 10); // Limitar a 10 notícias
  } catch (error) {
    console.error("❌ Erro durante o scraping:", error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Navegador fechado.");
    }
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    const noticias = await scrapeSantaCruzNews();

    console.log("\n📋 Resultado final:");
    console.log(JSON.stringify(noticias, null, 2));

    // Salvar em arquivo JSON
    const fs = require("fs");
    fs.writeFileSync(
      "noticias-santa-cruz.json",
      JSON.stringify(noticias, null, 2)
    );
    console.log("\n💾 Notícias salvas em: noticias-santa-cruz.json");

    // Enviar e-mail com as notícias
    if (noticias.length > 0) {
      await sendNewsEmail(noticias);
    } else {
      console.log("📧 Nenhuma notícia para enviar por e-mail.");
    }
  } catch (error) {
    console.error("💥 Erro na execução:", error);
    process.exit(1);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { scrapeSantaCruzNews };
