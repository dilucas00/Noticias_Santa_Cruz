const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendNewsEmail(newsList) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const currentDate = new Date().toLocaleDateString("pt-BR");

  let emailBody = `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(90deg, #000000, #d40000); padding: 20px; color: #ffffff; text-align: center;">
          <h1 style="margin: 0;">Notícias do Santa Cruz</h1>
          <p style="margin-top: 5px;">Atualização de ${currentDate}</p>
        </div>

        <div style="padding: 25px;">
          <p style="font-size: 16px; color: #333;">Confira as últimas notícias do nosso querido <strong>Santa Cruz Futebol Clube</strong>:</p>
          <ul style="list-style: none; padding: 0; margin: 0;">
  `;

  if (newsList && newsList.length > 0) {
    newsList.forEach((news) => {
      emailBody += `
            <li style="margin-bottom: 25px; border: 1px solid #ddd; border-left: 6px solid #d40000; padding: 20px; border-radius: 8px;">
              <h2 style="margin-top: 0; color: #000;">${news.titulo}</h2>
              <p style="margin: 5px 0; color: #555;"><strong>Fonte:</strong> ${
                news.fonte
              }</p>
              <p style="margin: 5px 0; color: #555;"><strong>Data de Extração:</strong> ${new Date(
                news.dataExtracao
              ).toLocaleDateString("pt-BR")}</p>
              <a href="https://www.flashscore.com.br/equipe/santa-cruz/p0NN5gef/" target="_blank" style="display: inline-block; margin-top: 10px; background-color: #d40000; color: #fff; padding: 10px 15px; border-radius: 5px; text-decoration: none;">🔗 Leia a notícia completa</a>
            </li>
      `;
    });
  } else {
    emailBody += `
            <li style="padding: 20px; color: #555;">
              Nenhuma notícia disponível no momento.
            </li>
    `;
  }

  emailBody += `
          </ul>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="text-align: center; font-size: 13px; color: #999;">
            Este e-mail foi enviado automaticamente. Para mais informações, acesse nosso site oficial ou entre em contato com a equipe de comunicação.
          </p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Santa Cruz Notícias" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECIPIENT,
    subject: "⚽ Atualização Diária | Notícias do Santa Cruz",
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 E-mail de notícias enviado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    throw error;
  }
}

module.exports = { sendNewsEmail };
