// Required Modules
var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var app = express();
var path = require('path');


var port = process.env.PORT || 3001;
var User = require('./models/User');

// Connect to DB
mongoose.connect("mongodb://localhost:27017/test5");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/app/views');
app.use(express.static(path.join(__dirname, 'app')));


app.get("/", function (req, res) {
  res.render("index.html");
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});


app.post('/authenticate', function (req, res) {
  console.log('req.body.email -->', req.body.email)
  User.findOne({email: req.body.email, password: req.body.password}, function (err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        res.json({
          type: true,
          data: user,
          token: user.token
        });
      } else {
        res.json({
          type: false,
          data: "Incorrect email/password"
        });
      }
    }
  });
});


app.post('/signin', function (req, res) {
  console.log('signin ---> req.body.email -->', req.body.email)
  User.findOne({email: req.body.email, password: req.body.password}, function (err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        res.json({
          type: false,
          data: "User already exists!"
        });
      } else {
        var userModel = new User();
        userModel.email = req.body.email;
        userModel.password = req.body.password;
        userModel.save(function (err, user) {
        user.token = jwt.sign(user, 'm7837hyt363hc6gHJddy32d687GGHbdy');
        user.save(function (err, user1) {
          res.json({
            type: true,
            data: user1,
            token: user1.token
          });
        });
        })
      }
    }
  });
});

app.get('/me', ensureAuthorized, function (req, res) {
  console.log('headers ->', req.headers, ' ---->', req.token);
  User.findOne({token: req.token}, function (err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      res.json({
        type: true,
        data: user
      });
    }
  });
});

function ensureAuthorized(req, res, next) {
  var bearerToken;
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).end();
  }
}

process.on('uncaughtException', function (err) {
  console.log('uncaught error --> ', err);
});

// Start Server
app.listen(port, function () {
  console.log("Express server listening on port " + port);
});