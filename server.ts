import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ dest: "uploads/" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send Email
  app.post("/api/send-email", upload.single("attachment"), async (req, res) => {
    const { to, subject, message } = req.body;
    const file = req.file;

    if (!to || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields: to, subject, message" });
    }

    // Configure Nodemailer
    // Users should set these in their environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      const mailOptions: any = {
        from: process.env.EMAIL_FROM || `"SPIKEDAI" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: message,
      };

      if (file) {
        mailOptions.attachments = [
          {
            filename: file.originalname,
            path: file.path,
          },
        ];
      }

      await transporter.sendMail(mailOptions);

      // Clean up uploaded file
      if (file) {
        fs.unlinkSync(file.path);
      }

      res.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
      console.error("Email sending error:", error);
      // Clean up uploaded file on error
      if (file) {
        fs.unlinkSync(file.path);
      }
      res.status(500).json({ error: "Failed to send email", details: error.message });
    }
  });

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
