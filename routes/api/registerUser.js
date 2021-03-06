const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");
const nodemailer = require("nodemailer");
const User = require("../../models/User");

// transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// *** Register a new user ***
router.post(
  "/",
  [
    check("username", "A username is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 8 or more characters"
    ).isLength({ min: 8 })
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg:
                "A user with that email has already been registered - please use a different email"
            }
          ]
        });
      }
      user = new User({
        username,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.REGISTER_SECRET,

        { expiresIn: 3600 },
        (err, registerToken) => {
          if (err) throw err;

          const url = `${process.env.LOCAL_HOST}confirm/${registerToken}`;

          const emailBody = ` 
          <div style={text-align: left; style={color:black}}>
          <p style={color:black}>Hello,</p>
          <p style={color:black}>Welcome to Kitchen Catalogue. Please click on the following link to confirm your email address.</p>
          <a href="${url}">${url}</a>

          <p>Thank you, </p>                                              
          <p>Kitchen Catalogue</p>
          </div>`;

          transporter.sendMail({
            to: user.email,
            subject: "Kitchen Catalogue: Please Confirm Email",
            html: emailBody
          });
          res.json({
            msg: "A confirmation email has been sent to your email address"
          });
          console.log("register email sent");
        }
      );
    } catch (err) {
      res.status(500).send("Server error");
    }
  }
);

// *** Confirm user email ***

router.get("/:emailToken", async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.params.emailToken,
      process.env.REGISTER_SECRET
    );

    const confirmedUser = await User.findOneAndUpdate(
      { _id: decoded.user.id },
      { confirmed: true },
      { new: true }
    );
    res.json({ msg: "Your account has been verified" });
  } catch (e) {
    res.send("error");
  }
});

router.post("/resendConfirmation", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        msg: "This email does not exist - please register first"
      });
    }
    if (user && user.confirmed) {
      return res
        .status(400)
        .json({ msg: "This email address has already been registered" });
    } else {
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.REGISTER_SECRET,

        { expiresIn: 3600 },
        (err, registerToken) => {
          if (err) throw err;

          const url = `${process.env.LOCAL_HOST}confirm/${registerToken}`;

          transporter.sendMail({
            to: user.email,
            subject: "Please Confirm Email - Kitchen Catalogue -resent",
            html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
          });
          res.json({
            msg: "A confirmation email has been sent to your email address"
          });
        }
      );

      res.json({
        msg: "A confirmation email has been sent to your email address"
      });
    }
  } catch (err) {
    res.send("error");
  }
});

module.exports = router;
