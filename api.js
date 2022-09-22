
const express = require("express");

const app = express(); 


app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.get("/", (req, res) => {
    res.send("Hello World");
});
  
// http listen port 생성 서버 실행
app.listen(3000, () => console.log("HI"));