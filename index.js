const express = require("express");
require("./db/config");
const reg = require("./db/user");
const bcrypt = require("bcryptjs"); // Add bcrypt for password hashing
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const jwt = require("jsonwebtoken");

// Create Signup API

app.post("/reg", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if email already exists
    let existingUser = await reg.findOne({ email });
    if (existingUser) {
      return res.send({ message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    let user = new reg({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store the hashed password
    });

    // Save the user to the database
    let result = await user.save();

    // Remove password from response
    result = result.toObject();
    delete result.password;

    res
      .status(201)
      .send({ message: "Account created successfully", user: result });
  } catch (error) {
    // Handle any errors
    res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
});

// Create Login API

// Secret key for JWT

const JWT_SECRET = "hahahahahaah";
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await reg.findOne({ email });
    if (!user) {
      return res.send({ message: "Invalid email or password" });
    }

    // Compare provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    if (user) {
      jwt.sign({ user }, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
        if (err) {
          res.send({ message: "Something went wrong, please try again." });
        }
        res.status(201).send({
          message: "Login successful",
          user: userResponse,
          token: token,
        });
      });
    }
  } catch (error) {
    // Handle any errors
    res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
});

//Create Products Api
const Product = require("./db/product");

app.post("/add-product", async (req, res) => {
  try {
    const { name, price, category, company } = req.body;

    // Create a new product
    let newProduct = new Product({
      name,
      price,
      category,
      company,
    });

    // Save the product to the database
    let result = await newProduct.save();

    res
      .status(201)
      .send({ message: "Product added successfully", product: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
});

// Get Api Add Product

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    if (products.length > 0) {
      res.status(201).send(products);
    } else {
      res.send({ message: "No Record Found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
});

// Delete Product API
app.delete("/delete-product/:id", async (req, res) => {
  try {
    // Find the product by ID and delete it
    const deletedProduct = await Product.deleteOne({ _id: req.params.id });

    res.status(201).send({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Product not found." });
  }
});

// Get Single Product API
app.get("/eiditProduct/:id", async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);

    if (product) {
      res.status(201).send(product); // Send the found product
    } else {
      res.status(404).send({ message: "Product not found." }); // Not found
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
