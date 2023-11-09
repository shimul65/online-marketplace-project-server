const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5055;

app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());



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

        //auth api
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production" ? true : false,
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                })
                .send({ success: true });
        })


        // jobs related api
        app.get('/jobs', async (req, res) => {
            let query = {};
            if (req.query?.employerEmail) {
                query = { employerEmail: req.query.employerEmail };
            }
            const result = await jobsCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        })


        app.put('/jobs/:id', async (req, res) => {
            const newJob = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateJob = {
                $set: {
                    jobTitle: newJob.jobTitle,
                    deadline: newJob.deadline,
                    categoryName: newJob.categoryName,
                    minimumPrice: newJob.minimumPrice,
                    maximumPrice: newJob.maximumPrice,
                    employerEmail: newJob.employerEmail,
                    description: newJob.description,
                }
            }
            const result = await jobsCollection.updateOne(query, updateJob, options);
            res.send(result);
        })


        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob);
            res.send(result);
        })

        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.deleteOne(query);
            res.send(result);
        })





        //bids related api

        app.get('/bids', async (req, res) => {

            let query = {};
            if (req.query?.buyerEmail) {
                query = { buyerEmail: req.query.buyerEmail };
            }
            else if (req.query?.employerEmail) {
                query = { employerEmail: req.query.employerEmail };
            }
            const options = {
                // Sort returned documents in ascending order by title (A->Z)
                sort: { bidStatus: 1 }
            };
            const result = await bidsCollection.find(query, options).toArray();
            res.send(result);
        })

        app.patch('/bids/:id', async (req, res) => {
            const updateStatus = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateBids = {
                $set: {
                    bidStatus: updateStatus.bidStatus,
                    bidRequestStatus: updateStatus.bidRequestStatus
                }
            }
            const result = await bidsCollection.updateOne(query, updateBids, options);
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