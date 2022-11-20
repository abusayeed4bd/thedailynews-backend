const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

var cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.u7mxdsr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const newsCollection = client.db('news').collection('posts');
        const userCollection = client.db('news').collection('user');

        // news post/ get/ single post get methods

        app.post("/news", async (req, res) => {
            const data = req.body;
            const result = await newsCollection.insertOne(data);

            res.send(result);
        })

        app.put("/update-news/:id", async (req, res) => {
            const id = req.params.id;
            const news = req.body;
            const filter = { _id: ObjectId(id) }

            const option = { upsert: true };
            const updateDoc = {
                $set: news,
            };

            const result = await newsCollection.updateOne(filter, updateDoc, option);
            res.send(result);

        })

        app.delete("/news/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await newsCollection.deleteOne(filter);

            res.send(result)
        })

        app.get("/news", async (req, res) => {
            const q = req.query;
            const cursor = newsCollection.find(q);
            const iteams = await cursor.toArray();
            res.send(iteams);
        })
        app.get("/news/national", async (req, res) => {
            const q = { category: "Natioanl" };
            const cursor = newsCollection.find(q);
            const iteams = await cursor.toArray();
            res.send(iteams);
        })
        app.get("/news/international", async (req, res) => {
            const q = { category: "International" };
            const cursor = newsCollection.find(q);
            const iteams = await cursor.toArray();
            res.send(iteams);
        })
        app.get("/news/sports", async (req, res) => {
            const q = { category: "Sports" };
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

        app.get("/user/editorial/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;

            const user = await userCollection.findOne({ email: email });

            const isEditorial = (user.role === "editor" || user.role === "admin" || user.role === "Super Admin");

            res.send({ editorial: isEditorial })
        })

        // user collection update or insert methods


        app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            };

            const result = await userCollection.updateOne(filter, updateDoc, option);
            var token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
            res.send({ result, token });
        })
        app.put("/user/editor/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === "editor" || "admin" || "Super Admin") {
                const filter = { email: email };

                const updateDoc = {
                    $set: {
                        role: "editor"
                    },
                };

                const result = await userCollection.updateOne(filter, updateDoc);

                res.send(result);
            } else {
                res.status(403).send({ message: "forbidden" })
            }
        })
        app.put("/user/admin/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });

            if (requesterAccount.role === "admin" || "Super Admin") {

                const filter = { email: email };

                const updateDoc = {
                    $set: {
                        role: "admin"
                    },
                };

                const result = await userCollection.updateOne(filter, updateDoc);

                res.send(result);
            } else {
                res.status(403).send({ message: "forbidden" })
            }
        })

        app.put("/user/superadmin/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });

            if (requesterAccount.role === "Super Admin") {

                const filter = { email: email };

                const updateDoc = {
                    $set: {
                        role: "Super Admin"
                    },
                };

                const result = await userCollection.updateOne(filter, updateDoc);

                res.send(result);
            } else {
                res.status(403).send({ message: "forbidden" })
            }
        })

        app.get("/user", verifyJWT, async (req, res) => {
            const q = {};
            const result = await userCollection.find(q).toArray();
            res.send(result)
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