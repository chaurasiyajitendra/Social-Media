import {Inngest} from 'inngest';
import User from '../modules/User.js';

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

export const functions = [ syncUserCreation,syncUserUpdation,syncUserDeletion];