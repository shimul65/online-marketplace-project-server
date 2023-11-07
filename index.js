const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5055;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => { res.send('Simple coffees server is running') })
app.listen(port, () => { console.log(`Simple coffees server is running on port ${port}`) })