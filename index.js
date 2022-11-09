const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5001;

//middle wares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Eagle server is running');
})

app.listen(port, () => {
  console.log(`Eagle server is running on ${port}`)
})