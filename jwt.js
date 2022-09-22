require("dotenv").config();

const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Router, response } = require("express");

const app = express();
const server = http.createServer(app);
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/register", function (req, res, next) {
  const mysql = require("mysql");
  const conn = {
    host: "localhost",
    port: "3306",
    user: "sdt",
    password: "1234",
    database: "yt",
  };
  const username = req.body.username;
  const nickname = req.body.nickname;
  const password = req.body.password;
  const profile = req.body.profile;
  let accessToken = generateAccessToken(username);
  let refreshToken = generateRefreshToken(username);
  let connection = mysql.createConnection(conn);
  connection.connect();
  let sql = `insert into user(username,nickname,password,profile,access_token,refresh_token) values ('${username}','${nickname}','${password}','${profile}','${accessToken}','${refreshToken}');`;
  connection.query(sql, function (err, result, fields) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        code: 400,
        message: "Id is already used.",
      });
    }
    return res.status(200).json({
      code: 200,
      token: accessToken,
      message: "OK",
    });
    console.log(result);
  });


  // console.log(accessToken);
  // console.log(refreshToken);
  // sql = "SELECT * FROM USER";
  // connection.query(sql, function (err, results, fields) {
  //   if (err) console.log(err);
  //   console.log(results);
  // });
  // connection.end();
  
});

const login = (id, pw) => {
  return id;
};
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "180 days",
  });
};

app.post("/login", (req, res) => {
  let id = req.body.name;
  let pw = req.body.password;
  let user = login(id, pw);
  let accessToken = generateAccessToken(user);
  let refreshToken = generateRefreshToken(user);

  res.json({ accessToken, refreshToken });
});

const authenticateAccessToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("err");
    return res.sendStatus(400);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) {
      console.log(error);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

app.post("/refresh", (req, res) => {
  let refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    if (error) return res.sendStatus(403);

    const accessToken = generateAccessToken(user.id);

    res.json({ accessToken });
  });
});

app.get("/user", authenticateAccessToken, (req, res) => {
  console.log(req.user);
  res.json(users.filter((user) => user.id === req.user.id));
});

server.listen(PORT, () => {
  console.log("SERVER ON");
});
