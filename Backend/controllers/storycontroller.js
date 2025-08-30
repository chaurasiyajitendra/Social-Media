import fs from 'fs';
import imagekit from '../config/imageKit.js'
import Story from '../modules/story.js';
import User from '../modules/User.js'
import { error } from 'console';
import { inngest } from '../inngest/index.js';

export const addUserStory = async (req,res) =>{
    try {
        const {userId} =req.auth();
        const {content,media_type,background_color} = req.body;
        const media = req.file
        let media_url = ''
        
        if(media_type === 'image' || media_type === 'video'){
            const fileBuffer = fs.readFileSync(media.path)
            const res = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,
            })

            media_url = res.url
        }

        const story = await Story.create({
            user: userId,
            content,
            media_type,
            media_url,
            background_color
        })

        // shedul to delete story in 24 hours 
        await inngest.send({
            name:'app/story.delete',
            data: {storyId: story._id}
        })

        res.json({success:true})

    } catch (error) {
        console.log(error);
        res.json({success:false,message: error.message})
    }
}

export const getStories = async (req,res) =>{
    try {
        const {userId} = req.auth();
        const user =  await User.findById(userId);
        
        const userIds = [userId, ...user.connections, ...user.following]

        const stores = await Story.findById({
            user:{$in: userId}
        }).populate('user').sort({createdAt: -1})

        res.json({success:true,message:error.message})
    } catch (error) {
        console.log(error);
        res.json({success:false,message: error.message})   
    }
}