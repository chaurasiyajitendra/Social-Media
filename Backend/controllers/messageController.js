import fs from 'fs';
import imagekit from '../config/imageKit.js'
import Message from '../modules/Message.js';

const connection = {};

export const sseController = (req,res) =>{
    const {userId} = req.params
    console.log('New Clinet Connected : ',userId );

    res.setHeader('Content-Type','text/event-stream'); 
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Connection','keep-alive');
    res.setHeader('Access-Control-Allow-Origin','*')

    connection[userId] = res

    res.write('log : Connected to SSE stream\n\n');
    
    res.on('close',()=>{
        delete connection[userId]
        console.log('Client disconnected');
    })
}


export const sendMessage = async (req,res)=>{
    try {
        const {userId} = req.auth();
        const{to_user_id,text} = req.body;
        const image = req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text';
        if(message_type === 'image')
        {
            const fileBuffer = fs.readFileSync(image.path);
            const res = await imagekit.upload({
                file: fileBuffer,
                fileName: image.originalname,
            });
            media_url = imagekit.url({
                path: res.filePath,
                transformation:[
                    {quality:'auto'},
                    {format:'webp'},
                    {width:'1280'}
                ]
            })
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        })

        res.json({success:true,message})

        // send message to_user_id using sse 

        const messageWithUserData = await Message.findById(message._id).populate('from_user_id');

        if(connection[to_user_id]){
            connection[to_user_id].write(`data:${JSON.stringify(messageWithUserData)}\n\n`)
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export const getMessage = async (req,res) =>{
    try {
        const {userId} = req.auth();
        const {to_user_id} = req.body;

        const message = await Message.find({
            $or: [
                {from_user_id: userId,to_user_id},
                {from_user_id:to_user_id,to_user_id:userId}
            ]
        }).sort({created_at: -1})

        await Message.updateMany({from_user_id:to_user_id,to_user_id:userId},{seen:true})
        res.json({success:true ,message})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export const getUserRecentMessage = async (req,res)=>{
    try {
        const {userId} = req.auth();
        const message = await Message.find({to_user_id:userId}).populate('from_user_id to_user_id').sort({created_at: -1})    
        
        res.json({success:true, message})
    } catch (error) {
     console.log(error);
    res.json({success:false,message:error.message})   
    }
}