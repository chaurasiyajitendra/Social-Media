import imagekit from "../config/imageKit.js";
import { inngest } from "../inngest/index.js";
import Connection from "../modules/connection.js";
import Post from "../modules/post.js";

import User from "../modules/User.js"
import fs from 'fs'

export const getUserData = async (req,res)=>{
    try{
        const {userId} = req.auth()
        const user = await User.findById(userId);
        if(!user)
        {
            return res.json({success: false, message: "User not found"});
        }
        res.json({success: true, user});
    }catch(err){
        console.log(err);
        return res.json({success: false, message: err.message});
    }
}

export const upadteUserData = async (req,res)=>{
    try{
        const {userId} = req.auth()
        let {username,bio,location,full_name} = req.body;
        
        const tempuser = await User.findById(userId); 

        !username && (username = tempuser.username)

        if(tempuser.username !== username)
        {
            const user = await User.findOne({username})
            if(user){
                username = tempuser.username
            }
        }

        const updateData ={
            username,
            location,
            bio,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.cover[0]

        if(profile)
        {
            const buffer = fs.readFileSync(profile.path)
            const res = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            })

            const url = imagekit.url({
                path: res.filePath,
                transformation:[
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '512'}              
                ]
            })

            updateData.profile_picture = url;

        }

        if(cover)
        {
            const buffer = fs.readFileSync(cover.path)
            const res = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname,
            })

            const url = imagekit.url({
                path: res.filePath,
                transformation:[
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '1280'}              
                ]
            })
            updateData.cover_photo = url;   
        }

        const user = await User.findByIdAndUpdate(userId,updateData,{new: true})
        res.json({success: true, user , message: "Profile update successfully"})

    }catch(err){
        console.log(err);
        return res.json({success: false, message: err.message});
    }
}


export const discoverUsers = async (req,res)=>{
    try{
        const {userId} = req.auth()
        const {input} = req.body;

        const allUser = await User.find({
            $or:[
                {username: new RegExp(input,'i')},
                {email: new RegExp(input,'i')},
                {location: new RegExp(input,'i')},
                {full_name: new RegExp(input,'i')}
            ]
        })

        const filteredUsers = allUser.filter(user => user._id !== userId );
        return res.json({success: true, users: filteredUsers});

    }catch(err){
        console.log(err);
        return res.json({success: false, message: err.message});
    }
}

export const followUser = async (req,res)=>{
    try{
        const {userId} = req.auth()
        const {id} = req.body;

        const user = await User.findById(userId);
        if(user.following.includes(id))
        {
            return res.json({success: false, message:"You are laready following this user"})
        }

        user.following.push(id);
        await User.save();

        const toUser = await User.findById(id);
        toUser.followers.push(userId)
        await toUser.save();

        res.json({success:true,message:'Now you are following this user'})

    }catch(err){
        console.log(err);
        return res.json({success: false, message: err.message});
    }
}

export const unfollowUser = async (req,res)=>{
    try{
        const {userId} = req.auth()
        const {id} = req.body;

        const user = await User.findById(userId);
        user.following = user.following.filter(user => user !== id);
        await user.save()

        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(user => user !== userId)
        await toUser.save();

        res.json({success:true,message:'You are no longer following this user'})

    }catch(err){
        console.log(err);
        return res.json({success: false, message: err.message});
    }
}

export const sendConnectionRequest = async (req,res) =>{
    try{
        const {userId} = req.auth()
        const {id} = req.body;

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const connectionRequests = await Connection.find({from_user_id: userId, createdAt:{$gt: last24Hours}})
        if(connectionRequests.length >= 20){
            return res.json({success: false, message:'You have sent more then 20 connection requests in the last 24 hour'})
        }

        const connection = await Connection.findOne({
            $or:[
                {from_user_id:userId, to_user_id:id},
                {from_user_id:id,to_user_id:userId}
            ]
        })

        if(!connection){
            const newConnection = await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })

            await inngest.send({
                name:'app/connection-request',
                data:{connectionId: newConnection._id}
            })
            return res.json({success:true, message:"connection request sent successfully "})
        }else if(connection && connection.status === 'accepted'){
            return res.json({success:false,message:'You are already connected with this user'})
        }
        return res.json({success:false,message:'Connection request panding'})

    }catch(err)
    {
        console.log(err);
        return res.json({success:false,message: err.message})
    }
}

export const getUserConnection = async (req,res) =>{
    try{
        const {userId} = req.auth()
        const user = await User.findById(userId).populate('connection followers following')

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({to_user_id:userId, status:'pending'})
        .populate('from_user_id')).map(connection => connection.from_user_id)
        
        return res.json({success:true, connections,followers,following,pendingConnections})
    }catch(err)
    {
        console.log(err);
        return res.json({success:false,message: err.message})
    }
}

export const accepteConnectionRequest = async (req,res) =>{
    try{
        const {userId} = req.auth()
        const {id} = req.body;

        const connection = await Connection.findOne({from_user_id:id,to_user_id:userId})

        if(connection){
            return res.json({success:false, message:'Connection not found'});
        }

        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save();

        connection.status ='accepted';
        await connection.save();

        return res.json({success:true , message:'Connection accepted successfully'})

    }catch(err)
    {
        console.log(err);
        return res.json({success:false,message: err.message})
    }
}

export const getUsersProfile = async (req,res)=>{
    try {
        const {profileId} = req.body;
        const profile = await User.findById(profileId);
        if(!profileId){
            return res.json({success:false,message:"Profile not found"})
        }
        const posts = await Post.find({user:profileId}).populate('User')

        res.json({success:true,profile,posts})
    } catch (error) {   
        console.log(error);
        res.json({success:false,message:error.message})
    }
}