import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import mainRouter from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import CartRouter from "./routes/cartRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { BlogRouter , BlogCategoryRouter } from "./routes/blogRoutes.js";

dotenv.config();

const app = express();
app.set("view engine", "ejs");

connectDB();

app.use(express.json());

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api", mainRouter);
app.use("/api", userRoutes);
app.use(CartRouter);
app.use("/api/blogcategories/", BlogCategoryRouter);
app.use("/api/blogs/", BlogRouter);

// Serve static files from the "public/uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));

app.get("/", (req, res) => {
  res.render("test.ejs");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
