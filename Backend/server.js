import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb from './config/db.js';
import {inngest,functions} from './inngest/index.js';
import {serve} from 'inngest/express';

const app = express();
await connectDb();


app.use(express.json());
app.use(cors());


app.get('/',(req,res)=>{
    res.send("Server running ")
})
app.use('/api/inngest',serve({client: inngest,functions}))

const PORT = process.env.PORT || 4000

app.listen(PORT,()=>(
    console.log(`Server is running in ${PORT}`)
))