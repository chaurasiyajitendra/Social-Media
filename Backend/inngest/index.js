import {Inngest} from 'inngest';
import User from '../modules/User.js';
import Connection from '../modules/connection.js';
import sendEmail from '../config/nodeMailer.js'
import Story from '../modules/story.js';
import Message from '../modules/Message.js';

export const inngest = new Inngest({id: "panchyatt-app"});


// For create a user 
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) =>{
        const {id,first_name,last_name,email_addresses,image_url} = event.data
        let username = email_addresses[0].email_address.split('@')[0]

        const user = await User.findOne({username})
        if(user){
            username = username + Math.floor(Math.random()*10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        }
        await User.create(userData)
    }
)

// for update a user 
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) =>{
        const {id,first_name,last_name,email_addresses,image_url} = event.data;

        const updateUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url
        }
        await User.findByIdAndUpdate(id,updateUserData);
    }
)


// for delet a user 
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) =>{
        const {id} = event.data;
        await User.findOneAndDelete(id)
    }
)

// Reminder whene new connection request add 

const sendNewConnectionRequestReminder  = inngest.createFunction(
    {id:"send-new-connection-request-reminder"},
    {event:"app/connection-request"},
    async ({event,step}) => {
        const {connectionId} = event.data;
        
        await step.run('send-connection-request-mail',async () =>{
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
            const subject = '👋 New Connection Request';
            const body =`
            <div style="font-family: Arial, sans-serif; padding:20px;">
            <h2>Hi ${connection.to_user_id.full_name},</h2>
            <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username} </p>
            <p> Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981 ;">here </a> to accept or reject the request </p>
            <br/>
            <p>Thanks, <br/> Pnachyat - Stay Connected </p> 
            </div>`;

            await sendEmail({
                to:connection.to_user_id.email,
                subject,
                body
            })
        })

        const in24Hours = new Date(Date.now() + 20 * 60 * 60 * 1000) 
        await step.sleepUntil("Wait for 24 hours", in24Hours);
        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
            if(connection.status === 'accepted'){
                return {message: 'Already accepted'}
            }

            const subject = '👋 New Connection Request';
            const body =`
            <div style="font-family: Arial, sans-serif; padding:20px;">
            <h2>Hi ${connection.to_user_id.full_name},</h2>
            <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username} </p>
            <p> Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981 ;">here </a> to accept or reject the request </p>
            <br/>
            <p>Thanks, <br/> Pnachyat - Stay Connected </p> 
            </div>`;

            await sendEmail({
                to:connection.to_user_id.email,
                subject,
                body
            })
            return {message:"Reminder sent."}
        })
    }
)

// delet story in 24 hours 

const deleteStory = inngest.createFunction(
    {id:'story-delete'},
    {event:'app/story.delete'},
    async({event,step}) =>{
        const {storyId} = event.data;
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil('wait-for-24-hours',in24Hours)
        await step.run('delete-story',async () =>{
            await Story.findByIdAndDelete(storyId)
            return {message: "Story delete."}
        })
    }
)


const sendNotifictionOfUnseenMessage = inngest.createFunction(
    {id:"seen-unseen-message-notification"},
    {cron:"TZ=America/New_York 0 9 * * *"},
    async ({step}) =>{
        const messages = await Message.find({seen:false}).populate('to_user_id');
        const unseenCount = {}

        messages.map(message =>{
            unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0 ) + 1
        })

        for (const userId in unseenCount){
            const user = await User.findById(userId);

            const subject = ` 📬 You have ${unseenCount[userId]} unseen message`;
            const body =`
            <div style="font-family:Arial,sans-serif; padding:20;">
                <h2>Hi ${user.full_name},</h2>
                <p>You have ${unseenCount[userId]} unseen message </p>
                <p>Click <a herf="${process.env.FRONTEND_URL}/message" style="color: #10b981">Here </a> to view them </p>
                <br/>
                <p>Thanks,<br/>Panchyatt - stay Connected </p>
            </div>`;

            await sendEmail({
                to:user.email,
                subject,
                body
            })
        }
        return {message: "Notification Sent."}
    }
)

export const functions = 
[ 
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotifictionOfUnseenMessage
];