import express from 'express';
import { upload } from '../config/multer.js';
import { protect } from '../middleware/auth.js';
import { addPost, getFeedPost, likesPosts } from '../controllers/postController.js';

const postRouter = express.Router()

postRouter.post('/add',upload.array('images',4),protect,addPost);
postRouter.get('/feed',protect,getFeedPost);
postRouter.post('/like',protect,likesPosts)

export default postRouter


