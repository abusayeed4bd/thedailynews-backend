const express = require('express')
const app = express()
const port = process.env.PORT || 5000;

var cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${USER}:${PASS}@cluster0.u7mxdsr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const newsCollection = client.db('news').collection('posts');

        app.post("/news", async (req, res) => {
            const data = req.body;
            const result = await newsCollection.insertOne(data);

            res.send(result);
        })

        app.get("/news", async (req, res) => {
            const q = req.query;
            const cursor = newsCollection.find(q);
            const iteams = await cursor.toArray();
            res.send(iteams);
        })

        app.get("/news/:id", async (req, res) => {
            const id = req.params.id;
            const q = { _id: ObjectId(id) };
            const cursor = await newsCollection.findOne(q);

            res.send(cursor)

        })




    }
    finally {

    }
}
run().catch(console.dir)






app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})