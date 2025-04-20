import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";

const app = express();

// Configure CORS properly
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ limit: "50kb", extended: true }));

app.set("PORT", process.env.PORT || 3000);

const server = createServer(app);

// Configure socket.io with CORS
const io = connectToSocket(server);

app.use("/api/v1/users", userRoutes);

app.get("/start", (req, res) => {
	res.json({ message: "Server is running" });
});

const start = async () => {
	try {
		const db = await mongoose.connect(
			"mongodb+srv://videoconference123:videoconference123@videoconference.u4cpp.mongodb.net/?retryWrites=true&w=majority&appName=Videoconference"
		);
		console.log("Database connected");

		server.listen(app.get("PORT"), () => {
			console.log("Server is running on port", app.get("PORT"));
		});
	} catch (error) {
		console.error("Failed to start server:", error);
	}
};

start();
