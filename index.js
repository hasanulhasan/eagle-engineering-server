const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5001;

//middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zjh2ngr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SCECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    req.decoded = decoded;
    next();
  })
}



async function run() {
  try {
    const serviceCollection = client.db('eagleEngineering').collection('services');
    const reviewCollection = client.db('eagleEngineering').collection('reviews');

    //for access token
    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SCECRET)
      res.send({ token })
    })


    //this is used for service page
    app.get('/servicesall', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //this is used for home service with limit
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.skip(3).toArray();
      res.send(services);
    });
    //adding service
    app.post('/services', async (req, res) => {
      const services = req.body;
      const result = await serviceCollection.insertOne(services);
      res.send(result);
    });

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //review api for posting
    app.post('/reviews', async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(result);
    });

    //review with logic
    app.get('/reviews', async (req, res) => {
      let query = {};
      // const decoded = req.decoded;
      // if (decoded.email !== req.query.email) {
      //   res.status(403).send({ message: 'unauthorized access' })
      // }

      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //review sorting and logic
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { serviceId: id };
      const cursor = reviewCollection.find(query).sort({ _id: -1 });
      const result = await cursor.toArray();
      res.send(result)
    });

    //review for deleting
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result)
    });
  }
  finally {
  }
}
run().catch(e => console.error(e))

app.get('/', (req, res) => {
  res.send('Eagle server is running');
})

app.listen(port, () => {
  console.log(`Eagle server is running on ${port}`)
})