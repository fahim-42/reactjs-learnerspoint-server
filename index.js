const express = require('express');
const app = express();
const port = process.env.PORT || 3030;

require('dotenv').config();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p55ig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('LearnersPoint');

        const coursesCollection = database.collection('courses');
        const bookingsCollection = database.collection('bookings');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // load all courses
        app.get('/courses', async (req, res) => {
            const allCourses = coursesCollection.find({});
            const courses = await allCourses.toArray();

            // catch details by id
            const selectedCourse = req.query.pkg;
            const queryCourse = { _id: ObjectId(selectedCourse) };
            const queryCourseInfo = await coursesCollection.find(queryCourse).toArray();

            res.send({
                courses,
                queryCourseInfo
            });
        })
        // post new course
        app.post('/courses', async (req, res) => {
            const addCourse = req.body;
            const result = await coursesCollection.insertOne(addCourse);
            res.json(result);
        })
        // delete a course
        app.delete('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await coursesCollection.deleteOne(query);
            res.json(result);
        })


        // load all reviews
        app.get('/reviews', async (req, res) => {
            const allReviews = reviewsCollection.find({});
            const reviews = await allReviews.toArray();
            res.send(reviews);
        })
        // post a review
        app.post('/reviews', async (req, res) => {
            const postReview = req.body;
            const result = await reviewsCollection.insertOne(postReview);
            res.json(result);
        })

        
        // load all bookings
        app.get('/bookings', async (req, res) => {
            const allBookings = bookingsCollection.find({});
            const bookings = await allBookings.toArray();

            // MyOrders.js => query-order
            const myBooking = req.query.email;
            const queryMyBooking = { email: myBooking };
            const myBookingInfo = await bookingsCollection.find(queryMyBooking).toArray();

            res.send({
                bookings,
                myBookingInfo
            });
        })
        // post a booking
        app.post('/bookings', async (req, res) => {
            const postBookingInfo = req.body;
            const result = await bookingsCollection.insertOne(postBookingInfo);
            res.json(result);
        })
        // update booking status
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const bookingStatus = req.body.status;

            const filter = { _id: ObjectId(id) };
            const updateDoc = { $set: { status: bookingStatus } };
            const options = { upsert: true };

            const result = await bookingsCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        // delete a booking
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.json(result);
        })


        // load all users
        app.get('/users', async (req, res) => {
            const allUsers = usersCollection.find({});
            const users = await allUsers.toArray();
            res.send(users);
        })
        // collect user data
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        // upsert user data
        app.put('/users', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const updateDoc = { $set: user };
            const options = { upsert: true };

            const result = await usersCollection.updateOne(filter, updateDoc, options);

            res.json(result);
        });


        // set user as admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };

            const result = await usersCollection.updateOne(filter, updateDoc);

            res.json(result);
        });
        // check user as admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('LearnersPoint Server is running');
})
app.listen(port, () => {
    console.log('Server running at:', port);
})