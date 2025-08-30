import express from 'express';
import { protect } from '../middleware/auth.js';
import { accepteConnectionRequest, discoverUsers, followUser, getUserConnection, getUserData, sendConnectionRequest, unfollowUser, upadteUserData , getUsersProfile} from '../controllers/userControll.js';
import { upload } from '../config/multer.js';
import { getUserRecentMessage } from '../controllers/messageController.js';


const userRouter = express.Router();

userRouter.get('/data',protect,getUserData);
userRouter.post('/update',upload.fields([{name: 'profile', maxCount: 1},{name:'cover', maxCount:1}]),protect,upadteUserData)
userRouter.post('/discover',protect,discoverUsers)
userRouter.post('/follow',protect,followUser)
userRouter.post('/unfollow',protect,unfollowUser)
userRouter.post('/connect',protect,sendConnectionRequest)
userRouter.post('/accept',protect,accepteConnectionRequest)
userRouter.get('/connections',protect,getUserConnection)
userRouter.post('/profiles',getUsersProfile)
userRouter.get('/recent-messages',protect,getUserRecentMessage)

export default userRouter