const express = require("express");
// const mysql = require("mysql2");
const bodyParser = require("body-parser");
const routers = require('./router');

const app = express();
let PORT = 4000;
    
app.use('/routers', routers);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  });
