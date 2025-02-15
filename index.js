import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import productsRoutes from "./routes/productsRoutes.js";

dotenv.config();

// This is the entry point of the backend system


const app = express();
app.use(express.json());
app.use(cors({origin : "*"}));

//Connecting the database

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Mongo db connection error --> ${err}`));

// app.use("/products", authMiddleware);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/auth", authRoutes);

app.use("/products", productsRoutes);

app.listen(3000, () => console.log(`Server running`));

//dummy data
/*
  {
    "name": "Frok",
    "variants": [
      {
        "color": "Red",
        "size": "M",
        "price": 2000
      },
      {
        "color": "Blue",
        "size": "L",
        "price": 2500
      }
    ]
  }

*/

/*
{
  "name" : "sahil",
  "email" : "sahil@gmail.com"
  "password" : "password"
}
*/

/*Create a feature for adding product variants (such as color and size) and 
make the price dynamic according to the selected variant.*/
