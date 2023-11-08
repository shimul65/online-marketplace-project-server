const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5055;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n45ephu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const jobsCollection = client.db('onlineMarketplaceDB').collection('jobs');
        const bidsCollection = client.db('onlineMarketplaceDB').collection('bids');

        // jobs related api
        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray();
            res.send(result);
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })





        //bids related api

        app.get('/bids', async (req, res) => {

            // let query = {};
            // if (req.query?.email) {
            //     query = { email: req.query.email };
            // }
            const result = await bidsCollection.find().toArray();
            res.send(result);
        })

        app.post('/bids', async (req, res) => {
            const bid = req.body;
            const result = await bidsCollection.insertOne(bid);
            res.send(result);
        });



















        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





























app.get('/', (req, res) => {
    res.send('online marketplace server is running')
})

app.listen(port, () => {
    console.log(`Simple online marketplace is running on port ${port}`)
})