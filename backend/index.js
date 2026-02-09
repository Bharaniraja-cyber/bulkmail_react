const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({
    origin: "https://bulkmail-kappa-plum.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

const mongoURI = process.env.MONGO_URI || "mongodb+srv://bharaniraja21_db_user:yagROitZKPOC2Q4A@cluster0.np2mfat.mongodb.net/bulkmail";

mongoose.connect(mongoURI)
    .then(() => console.log("Db connected"))
    .catch((err) => console.log("Connection failed:", err));

// --- FIX STARTS HERE ---
// Defining the model OUTSIDE the route so it only runs ONCE when the server starts.
const credentialsSchema = new mongoose.Schema({}, { strict: false });
const Credentials = mongoose.models.credentials || mongoose.model("credentials", credentialsSchema, "credentials");
// --- FIX ENDS HERE ---

app.post("/sendmail", async function (req, res) {
    const { msg, emaillist } = req.body;

    try {
        // Now we just use the 'Credentials' variable defined above
        const data = await Credentials.find();

        if (!data || data.length === 0) {
            return res.status(500).send("No email credentials found in DB");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: data[0].name || data[0].toJSON().name,
                pass: data[0].pass || data[0].toJSON().pass,
            },
        });

        for (let i = 0; i < emaillist.length; i++) {
            await transporter.sendMail({
                from: data[0].name || data[0].toJSON().name,
                to: emaillist[i],
                subject: "Message from BulkMail",
                text: msg
            });
            console.log("Email sent successfully to: " + emaillist[i]);
        }

        res.send(true);
    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).send(false);
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, "0.0.0.0", function () {
    console.log(`Server started on port ${PORT}`);
});