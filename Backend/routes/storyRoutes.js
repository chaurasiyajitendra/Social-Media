import express from 'express';
import {upload} from '../config/multer.js'
import { addUserStory, getStories } from '../controllers/storycontroller.js';
import { protect } from '../middleware/auth.js';

const storyRoutesrs =   express.Router();

storyRoutesrs.post('/create', upload.single('media'), protect, addUserStory );
storyRoutesrs.get('/get',protect,getStories);

export default storyRoutesrs