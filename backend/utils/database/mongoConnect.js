import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const PORT = 3000;
const uri=`mongodb+srv://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.CLUSTER}`;
const client = new MongoClient(uri);
let db;

app.use(express.json());

export default async function connectDB(){
    try {
        await client.connect();
        db = client.db(process.env.DB_NAME);
        console.log("🗃️ Connected to Spamurai's Database");
        return db;
    } catch (err) {
        console.log('Error :: ',err);

    }
}

app.post('/link',async(req, res)=>{
    try {
        const link = req.body;
        const result = await db.collection(process.env.DB_COLLECTION).insertOne(link);
        res.status(201).send(result);
    } catch (err) {
        console.log('Error in POST:: ',err);
        res.status(500).send({ error: "Internal Server Error" });

    }
});

app.get('/', (req, res) => {
    res.send('✨ Welcome to the Spamurai API ✨');
  });

app.get('/link', async (req, res)=>{
    try {
        const link = await db.collection(process.env.DB_COLLECTION).find().toArray();
        res.status(200).send(link);
    } catch (err) {
        console.log('Error in GET:: ',err);
        res.status(500).send({ error: "Internal Server Error" });

    }
});

app.listen(PORT,()=>{
    console.log(`Server is running at :: http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit();
});
