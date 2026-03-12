const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Submission = require("../models/submission");

//register feature
const register = async (req, res) => {
  try {
    //validate  the data
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    //password ko hash karna padega kyuki nrmal password ko store nhi karna chahiye
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    //user ko create karne se pehle check karna padega ki kya ye valid email id hai ya nhi hai but yaha jo niche hai User.create se
    // already pata chal jayega kyuki ye dusri baar same id se create hone bhi nhi dega but agar man hai toh dobara check kar lo
    const user = await User.create(req.body);

    //signing json webtoken with id, email and "fjknsdkjfn"(ye key ko generate karna ka bhi tarika hai) is key and {expiresin time = 1hr}
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: "user" },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 },
    );

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    //60*60*1000 is in milliseconds
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(201).json({
      user: reply,
      message: "User registered Successfully",
    });
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
};

//login feature
const login = async (req, res) => {
  try {
    //emailid aur pass se login karega
    const { emailId, password } = req.body;

    //agar email nhi diya
    if (!emailId) throw new Error("Invalid Credentials");

    //agar password nhi mila toh
    if (!password) throw new Error("Invalid Credentials");

    //email aur password enter kara liya toh ab match karne k liye sys se nikalna padega toh niche likhe wale se user milgya
    const user = await User.findOne({ emailId });

    //ab password matching
    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new Error("Invalid Credentials");

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
      score: user.score || 0
    };

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 },
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(201).json({
      user: reply,
      message: "Logged in Successfully",
    });
  } catch (err) {
    res.status(401).send("Error: " + err);
  }
};

// logOut feature
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena....

    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("Logged Out Succesfully");
  } catch (err) {
    res.status(503).send("Error: " + err);
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    // req.body.role = "admin";

    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 },
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(201).send("User Registered Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;

    //user schema se dlete kr diya
    await User.findByIdAndDelete(userId);

    //submission se bhi delete karo    #1- and 2nd method is in userschema in user.js
    // await Submission.deleteMany({userId});

    res.status(200).send("Deleted Successfully");
  } catch (err) {
    res.status(500).send("Internal server Error");
  }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };
