const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const Contact = require("./db/Contact");
const auth = require("./auth");
// execute database connection
dbConnect();
const home = require('./routes')(app);

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// register endpoint
app.post("/register", (request, response) => {
  console.log(request.body.password,request.body.email,request.body.username);
  bcrypt
    .hash(request.body.password, 10)
    .then(async(hashedPassword) => {
      const user = new User({
        email: request.body.email,
        username: request.body.username,
        password: hashedPassword,
      });
      user
        .save()
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/login", (request, response) => {
  
  User.findOne({ email: request.body.email })
    .then((user) => {
      bcrypt
        .compare(request.body.password, user.password)
        .then((passwordCheck) => {

          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            billing_id: user.billing_id,
            token,
          });
        })
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

app.post("/save-form",(request,response)=>{
  const contact = new Contact({
    email: request.body.email,
    username: request.body.username,
    message: request.body.message,
    phone: request.body.number
  });
  contact
    .save()
    .then((result) => {
      response.status(201).send({
        message: "Details Saved Succcessfully",
        result,
      });
    })
    .catch((error) => {
      response.status(500).send({
        message: "Error in Saving Details",
        error,
      });
    });
});

app.get("/get-user-data", auth, (request,response) => {
  User.findOne({email: request.user.userEmail},(err,data)=>{
    err? console.log(err) : response.send(data);
  })
});


module.exports = app;
