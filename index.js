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

app.listen(4000, () => console.log("Server running on port 4000"));
