import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    color : {type: String, required: true},
    size : {type: String, required: true},
    price : Number,
})

const productSchema = new mongoose.Schema({
    name : {type: String, required: true},
    variants : [variantSchema],
})

export default mongoose.model("Product", productSchema);

//Product Schema shows us how we are storing the data in mongodb