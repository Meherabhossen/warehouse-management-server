const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, MongoCursorInUseError } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Midlewere
app.use(cors());
app.use(express.json());

// Node mongodb CURD

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ohvmv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toyCollection = client.db('assignment-11').collection('mycollection')

        // JWT
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1y'
            });
            res.send({ accessToken });
        })

        // 

        app.get('/toyland', async (req, res) => {
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = toyCollection.find(query);
            let toys;
            if (page || size) {
                toys = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                toys = await cursor.toArray();
            }

            res.send(toys);
            // Load Item
            app.get('/user', async (req, res) => {
                const query = {}
                const cursor = toyCollection.find(query);
                const users = await cursor.toArray();
                res.send(users);
            });
            // Post Toyland (Add new laptop)
            app.post('/user', async (req, res) => {
                const newUser = req.body;
                console.log('new', newUser);
                const result = await toyCollection.insertOne(newUser);
                res.send(result);
            });
            // paigination
            app.get('/toycount', async (req, res) => {
                // const query = {};
                // const cursor = ToyCollection.find(query);
                const count = await toyCollection.estimatedDocumentCount();
                res.send({ count });
            })
        })
        // delete Toy
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('ToyLand werehouse server')
});

app.listen(port, () => {
    console.log('code is running', 5000)
})
