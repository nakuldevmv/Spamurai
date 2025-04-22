import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(express.json());
const PORT = 3000;
const uri=`mongodb://localhost:27017/`;
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
        console.log('Error in POST:: ',err.message);
        res.status(500).send({ error: "Internal Server Error" });
        console.log(process.env.DB_COLLECTION);
        console.log(process.env.DB_NAME);


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
        console.log('Error in GET:: ',err.message);
        res.status(500).send({ error: "Internal Server Error" });
        console.log(process.env.DB_COLLECTION)


    }
});

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is running at :: http://localhost:${PORT}`);
    });
    
}) 
process.on('SIGINT', async () => {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit();
});
