const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  company: String,
});
module.exports = mongoose.model("products", productSchema);
// Note products is table name in mongodb
