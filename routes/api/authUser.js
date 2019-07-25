const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const authMiddleware = require("../../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");
const nodemailer = require('nodemailer')
const User = require("../../models/User");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// *** Check if authentication of the user - from header of request***
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error - User cannot be found");
  }
});

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({
            errors: [{ msg: "Invalid Credentials - please try again" }]
          });
      }

      if (!user.confirmed) {
        return res
          .status(400)
          .json({
            errors: [{ msg: "Please validate your account first" }]
          });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({
            errors: [{ msg: "Invalid Credentials - please try again" }]
          });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWTSECRET,

        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/forgot/",
  
  async (req, res) => {
    
    
    const { email} = req.body;
    console.log(email)

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({
            errors: [{ msg: "Invalid Credentials - please try again" }]
          });
      }

      if (!user.confirmed) {
        return res
          .status(400)
          .json({
            errors: [{ msg: "Invalid Credentials - please try again" }]
          });
      }


      const payload = {
        user: {
          email: email
        }
      };

      jwt.sign(
        payload,
        process.env.PASSWORD_SECRET,

        { expiresIn: 3600 },
        (err, passwordToken) => {
          if (err) throw err;
          
          
          
          const url = `http://localhost:3000/forgot/${passwordToken}`;
                    
          transporter.sendMail({
            to: user.email,
            subject: "Password Reset - Kitchen Catalogue",
            html: `Please click this email to reset your password: <a href="${url}">${url}</a>`
          });
          res.json({msg: "A password reset email has been sent to your email address"});
          console.log('password reset email sent')
        }
      );
    } catch (err) {
      res.status(500).send("Server error");
    }
  }
);

// router.get('/forgot/:password_token', async (req,res)=>{
//   try{
//     const decoded = jwt.verify(req.params.password_token, process.env.PASSWORD_SECRET)
//     console.log(decoded)

//     await User.findOne({email: decoded.user.email})
//     res.json({msg: "Plese enter your new password"})
// }catch (e) {
//     console.log(e)
//     res.send('error');
//   }
// })

router.post('/forgot/:password_token', async (req,res)=>{

  const {password} = req.body
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try{
    const decoded = jwt.verify(req.params.password_token, process.env.PASSWORD_SECRET)
    console.log(decoded)

    await User.findOneAndUpdate({email: decoded.user.email}, {password: hashedPassword})
    res.json({msg: "Password Changes, please login"})
}catch (e) {
    console.log(e)
    res.send('error');
  }
})


module.exports = router;
