const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

// 1. FIXED CORS: Exact match for your Vercel frontend
app.use(cors({
    origin: "https://bulkmail-kappa-plum.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

// 2. DATABASE CONNECTION
const mongoURI = process.env.MONGO_URI || "mongodb+srv://bharaniraja21_db_user:yagROitZKPOC2Q4A@cluster0.np2mfat.mongodb.net/bulkmail";

mongoose.connect(mongoURI)
    .then(() => console.log("Db connected"))
    .catch((err) => console.log("Db connection failed:", err));

// 3. FIXED MODEL: Defined outside the route to prevent 'OverwriteModelError'
const Credentials = mongoose.models.credentials || mongoose.model("credentials", {}, "credentials");

// Health Check for Render
app.get("/", (req, res) => res.send("BulkMail Backend is Live"));

// 4. MAIN MAIL ROUTE
app.post("/sendmail", async function (req, res) {
    const { msg, emaillist } = req.body;
    console.log(`Attempting to send ${emaillist?.length} emails...`);

    try {
        const data = await Credentials.find();

        if (!data || data.length === 0) {
            console.log("Error: No credentials found in MongoDB.");
            return res.status(500).send("No credentials found");
        }

        // 5. FIXED SMTP: Using Port 465 (Secure) to avoid 'ETIMEDOUT'
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            auth: {
                user: data[0].name,
                pass: data[0].pass, // MUST be a 16-digit Google App Password
            },
            connectionTimeout: 10000, // 10s timeout
        });

        // 6. SPEED OPTIMIZATION: Sending in parallel to avoid Render's 30s timeout
        const sendPromises = emaillist.map(email => 
            transporter.sendMail({
                from: data[0].name,
                to: email,
                subject: "Message from BulkMail",
                text: msg
            })
        );

        await Promise.all(sendPromises);
        
        console.log("Success: All emails sent.");
        res.send(true);

    } catch (error) {
        console.error("SERVER ERROR:", error.message);
        res.status(500).send(false);
    }
});

// 7. PORT BINDING: Critical for Render deployment
const PORT = process.env.PORT || 5002;
app.listen(PORT, "0.0.0.0", function () {
    console.log(`Server started on port ${PORT}`);
});