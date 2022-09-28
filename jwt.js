const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Router, response } = require("express");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const PORT = 8080;
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mysql = require("mysql");
const conn = {
  host: "localhost",
  port: "3306",
  user: "sdt",
  password: "1234",
  database: "yt",
};
let connection = mysql.createConnection(conn);

const profiles = [
  "http://talkimg.imbc.com/TVianUpload/tvian/TViews/image/2020/03/27/5561b209-4809-4c6e-9f8b-33d0e7792de8.jpg",
  "https://photo.newsen.com/mphoto/2022/06/24/202206241807463510_1.jpg",
  "https://cdn.spotvnews.co.kr/news/photo/202112/458893_583105_1601.jpg",
];

app.post("/register", function (req, res, next) {
  const username = req.body.username;
  const nickname = req.body.nickname;
  const password = req.body.password;
  let accessToken = generateAccessToken(username);
  let refreshToken = generateRefreshToken(username);
  connection.connect();
  const random = Math.floor(Math.random() * 3);

  let sql = `insert into user(username,nickname,password,profile,access_token,refresh_token) values ('${username}','${nickname}','${password}','${profiles[random]}','${accessToken}','${refreshToken}');`;
  connection.query(sql, function (err, result, fields) {
    if (err) {
      console.log(err);
      return res.status(400).json({
        code: 400,
        message: "Id is already used.",
      });
    }

    console.log(result);
    return res.status(200).json({
      profile: profiles[random],
      code: 200,
      message: "OK",
    });
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

app.post("/upload", (req, res) => {
  connection.connect();
  const title = req.body.title;
  const content = req.body.text;
  const tags = req.body.tags;
  for (let i = 0; i < tegs.length; i++) {
    let sql = `select cate_id from cate where cate_title = ${tags[i]};`;
    connection.query(sql, function (err, result) {
      if (result.length === 0) {
        sql = `insert into cate(cate_title) values(${tags[i]});`;
        connection.query(sql, function (err, result) {
          if (err) {
            console.log("insert faild");
          } else {
            console.log("insert success");
          }
        });
      } else {
        console.log(result);
      }
    });
  }
});

app.post("/login", (req, res) => {
  connection.connect();
  let username = req.body.username;
  let password = req.body.password;
  let token;
  let sql = `select access_token from user where username = '${username}' and password = '${password}';`;
  connection.query(sql, function (err, result, fields) {
    if (result.length === 0) {
      return res.status(400).json({
        code: 400,
        message: "ID or PASSWORD is wrong.",
      });
    }
    token = result[0].access_token;
    return res.status(200).json({
      code: 200,
      token: token,
      message: "OK",
    });
  });
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
