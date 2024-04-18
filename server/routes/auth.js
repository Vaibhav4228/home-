const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("../models/user.js");

/* Configurayion multer for file upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); //store uploaded files in the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage });

//user register

router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    //take all the informationof the form
    const { firstName, lastName, email, password } = req.body;

    /* the uploaded file is available as req. file*/
    const profileImage = req.files;

    if (!profileImage) {
      return res.status(400).send("No file uploaded from your side");
    }
    //path for the uploaded profile photo
    const profileImagePath = profileImage.path;

    //check if user exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "user exist already" });
    }
    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImagePath,
    });
    //save the new user
    await newUser.save();
    //send a success message
    res.status(200).json({ message: "user registered successfully" });

  } catch (err) {
    console.log( err);
    res.status(400).json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = router