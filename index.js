const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('genius car server is running successfully!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jle6tre.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const servicescollection = client.db('gineusbduser').collection('service')
        const orderCollection = client.db('gineusbduser').collection('orders')


        function tokenVerify(req, res, next) {
            const authHeader = req.headers.authorization
            if (!authHeader) {
                return res.status(401).send(message, 'unauthorized access')
            }
            const token = authHeader.split(' ')[1]
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(401).send(message, 'unauthorized access')
                }
                res.decode = decoded
                next()
            });
        }


        app.post('/jwt', (req, res) => {
            const user = req.body
            console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })

        app.get('/services', async (req, res) => {
            const query = {}
            const order = req.query.order === 'Heigh' ? -1 : 1;
            const cursor = servicescollection.find().sort({ price: order })
            const service = await cursor.toArray()

            res.send(service)
        })

        app.get('/services/:id', async (req, res) => {
            id = req.params.id
            const query = { _id: ObjectId(id) };
            const service = await servicescollection.findOne(query)
            res.send(service)
        })

        app.get('/orders', tokenVerify, async (req, res) => {
            const decoded = req.decoded
            console.log(decoded)
            // if (decoded.email !== req.query.email) {
            //     return res.status(401).send(message, 'unauthorized access')
            // }


            let query = {}
            console.log(req.query.email)
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/orders', async (req, res) => {
            const orders = req.body
            const result = await orderCollection.insertOne(orders)
            res.send(result)
        });

        app.get('/orders/:id', async (req, res) => {
            id = req.params.id
            const query = { _id: ObjectId(id) };
            const orders = await orderCollection.findOne(query)
            res.send(orders)
        })


    }
    finally {

    }
}
run().catch(err => console.error(err))

app.listen(port, () => {
    console.log(`genius car server is running on ${port}`)
})
