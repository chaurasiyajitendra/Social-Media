import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb from './config/db.js';
import {inngest,functions} from './inngest/index.js';
import {serve} from 'inngest/express'; 
import {clerkMiddleware} from '@clerk/express'
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRouter.js';
import storyRoutesrs from './routes/storyRoutes.js';
import messageRouter from './routes/messageRouters.js';

const app = express();
await connectDb();


app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/',(req,res)=>{
    res.send("Server running ")
})
app.use('/api/inngest',serve({client: inngest,functions}))
app.use('/api/user',userRouter);
app.use('/api/post',postRouter);
app.use('/api/story',storyRoutesrs);
app.use('/api/message',messageRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT,()=>(
    console.log(`Server is running in ${PORT}`)
))