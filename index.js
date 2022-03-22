const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


/*========= Middleware============== */
app.use(cors())
app.use(express.json())

/* ===========MongoDb================ */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2rvjh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Hospital_Plus");
        const serviceCollection = database.collection("services");
        const appointmentsCollection = database.collection("appointments");
        const usersCollection = database.collection("users")
        const coustomerReviewCollection = database.collection("review")

        /* --------GET FOR APPOINTMENTS--------- */
        app.get('/services', async (req, res) => {
            const services = await serviceCollection.find({}).toArray()
            // console.log(services);
            res.json(services)
        })

        //* -------post patient appointment------*//
        app.post('/appointments', async (req, res) => {
            const result = await appointmentsCollection.insertOne(req.body)
            // console.log(result);
            res.send(result)

        })

        /* ==User data Post api for save user email,name in db=== */

        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body)
            res.send(result)
            // console.log(result);
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            // console.log(result);
            res.json(result);
        })


        /*---- my appointment ----*/

        // app.get('/userAppointment', async (req, res) => {
        //     const email = req.query.email;
        //     const result = await appointmentsCollection.find({ email: email }).toArray()
        //     res.send(result)
        // })

        app.get('/allAppointments', async (req, res) => {
            const result = await appointmentsCollection.find({}).toArray()

            res.json(result)
        })
        /*--------------- update appointment status--------------*/

        app.put('/allAppointments', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) }
            const updateDoc = {
                $set: { status: req.body.status },
            };
            const result = await appointmentsCollection.updateOne(filter, updateDoc)
            // console.log(result);
            res.send(result)
        })
        /*---------------Review update --------------*/

        app.put('/updateReviewStatus', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) }
            const updateDoc = {
                $set: { status: req.body.status },
            };
            const result = await coustomerReviewCollection.updateOne(filter, updateDoc)
            // console.log(result);
            res.send(result)
        })
        /* -----------Delete review------- */
        app.delete('/deleteReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await coustomerReviewCollection.deleteOne(query)
            // console.log(result);
            res.json(result)
        })
        /* -------Delete Appointment ----------*/
        app.delete('/allAppointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await appointmentsCollection.deleteOne(query)
            res.json(result)
        })
        /* ====== user review POST API ======== */
        app.post('/coustomerReview', async (req, res) => {
            const result = await coustomerReviewCollection.insertOne(req.body);
            res.send(result)
        })

        app.get('/coustomerReview', async (req, res) => {
            const result = await coustomerReviewCollection.find({}).toArray()
            res.send(result)
        })

        /* ========= Find Admin */
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc,)
            // console.log(result);
            res.json(result)
        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hospital plus!')
})

app.listen(port, () => {
    console.log(`listening at :${port}`)
})
