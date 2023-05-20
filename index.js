const express = require('express')
const cors = require('cors')
require("dotenv").config();
const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('toy cars is running')
})




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://toyCars:admin123@cluster0.dgqtjig.mongodb.net/?retryWrites=true&w=majority";

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const carsCollection = client.db("toyCar").collection("cars");
        // console.log(carsCollection);

        // cars 
        app.get('/cars', async (req, res) => {
            let query = {}
            if (req?.query?.category) {
                query = { category: req.query.category }
            }
            if (req?.query?.email) {
                query = { seller_email: req.query.email }
            }
            console.log(query);
            const result = await carsCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.findOne(query)
            res.send(result)
        })

        app.post('/cars', async (req, res) => {
            const toyInfo = req.body
            // console.log(toyInfo);
            const result = await carsCollection.insertOne(toyInfo)
            console.log(result);
            const data = {
                ...toyInfo, _id: result.insertedId
            }
            res.send({ ...result, data })

        })

        app.patch('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const carInfo = req.body;
            // console.log(carInfo);
            const updateData = {
                img: carInfo.img,
                name: carInfo.name,
                seller_name: carInfo.seller_name,
                seller_email: carInfo.seller_name,
                category: carInfo.seller_name,
                price: carInfo.price,
                rating: carInfo.rating,
                available_quantity: carInfo.available_quantity,
                description: carInfo.description,

            }
            const updatedCar = {
                $set: updateData
            };


            const result = await carsCollection.updateOne(query, updatedCar, options)
            const updateDataResult = { _id: id, ...updateData }
            console.log(result);
            res.send({ ...result, data: updateDataResult })
        })

        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`toy car is running on port ${port}`);
})