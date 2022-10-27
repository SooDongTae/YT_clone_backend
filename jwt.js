const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Router, response } = require("express");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const PORT = 8000;
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
  console.log(username);
  let accessToken = generateAccessToken(username);
  let refreshToken = generateRefreshToken(username);
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

app.get("/getonevideo", (req, res) => {
  const id = req.query.id;
  console.log(id);
  const sql = `select * from video where video_id = ${id};`;
  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    else {
      return res.status(200).json({
        code: 200,
        message: "OK",
        data: result,
      });
    }
  });
});

app.get("/searchbyname", (req, res) => {
  const name = req.query.name;
  const sql = `select * from video where title like '%${name}%';`;
  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    else {
      return res.status(200).json({
        code: 200,
        data: result,
        message: "good",
      });
    }
  });
});

app.get("/search", (req, res) => {
  const tag = req.query.tag;
  let sql = `select link, thumbnail from video where video_id in (select video_id from video_cate where cate_id in (select cate_id from cate where cate_title in ('${tag}')));`;
  connection.query(sql, function (err, result) {
    if (err) {
      return res.status(400).json({
        code: 400,
        message: "fuck you",
      });
    } else {
      return res.status(200).json({
        code: 200,
        data: result,
        message: "good",
      });
    }
  });
});

app.get("/getcomments", (req, res) => {
  const video_id = req.query.id;
  let sql = `select * from comment where video_id = ${video_id};`;
  connection.query(sql, function (err, result) {
    if (err) {
      return res.status(400).json({
        code: 400,
        message: "OK",
      });
    } else {
      console.log("성공");
      return res.status(200).json({
        code: 200,
        message: "OK",
        data: result,
      });
    }
  });
});

app.post("/addcomment", (req, res) => {
  const token = req.body.token;
  const text = req.body.text;
  const video_id = req.body.video_id;
  let user_id = null;
  console.log("add")
  console.log(text,token,video_id)

  let sql = `select user_id from user where access_token = '${token}';`;

  connection.query(sql, function (err, result) {
    if (err) {
      console.log(err)
      return res.status(400).json({
        code: 400,
        message: "user 존재하지 않음",
      });
    } else {
      user_id = result[0].user_id;
      sql = `insert into comment(owner,content,video_id,create_at) values(${user_id},'${text}',${video_id},'2022-12-12');`;
      connection.query(sql, function (err, result) {
        if (err) {
          return res.status(400).json({
            code: 400,
            message: "insert 실패",
          });
        } else {
          return res.status(200).json({
            code: 200,
            message: "성공",
          });
        }
      });
    }
  });
});
app.get("/getprofile1", (req, res) => {
  const token = req.query.token;
  let sql = `select * from user where access_token = '${token}';`;
  console.log("getprofile");
  connection.query(sql, function (err, result) {
    if (err) {
      return res.status(400).json({
        code: 400,
        message: "NO",
      });
    } else {
      return res.status(200).json({
        code: 200,
        message: "OK",
        data: result,
      });
    }
  });
});



app.get("/getprofile", (req, res) => {
  const id = req.query.id;
  let sql = `select * from user where user_id = ${id};`;
  console.log("getprofile");
  console.log(id);
  connection.query(sql, function (err, result) {
    if (err) {
      return res.status(400).json({
        code: 400,
        message: "NO",
      });
    } else {
      return res.status(200).json({
        code: 200,
        message: "OK",
        data: result,
      });
    }
  });
});
app.get("/getallvideo", (req, res) => {
  let sql = `select * from video;`;
  connection.query(sql, function (err, result) {
    if (err) {
      return res.status(400).json({
        code: 400,
        message: "OK",
      });
    } else {
      console.log("성공");

      return res.status(200).json({
        code: 200,
        message: "OK",
        data: result,
      });
    }
  });
});

app.post("/login", (req, res) => {
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

app.get("/user", authenticateAccessToken, (req, res) => {
  console.log(req.user);
  res.json(users.filter((user) => user.id === req.user.id));
});

server.listen(PORT, () => {
  console.log("SERVER ON");
});
