import React, { useEffect, useState } from 'react'
import { dummyRecentMessagesData } from '../assets/assets'
import {Link} from "react-router-dom"
import moment from 'moment'

const RecentMessage = () => {
    const [message, setMessage] = useState([])

    useEffect(() => {
        const fethcRecentMessages = async () =>{
            setMessage(dummyRecentMessagesData)
        }

        fethcRecentMessages()
    }, [])
    
  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
        <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
        <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
            { message.map((msg,i)=>(
                <Link to={`/message/${msg.from_user_id._id}`} key={i} className='flex items-start gap-2 px-2 rounded py-2 hover:bg-slate-200'>
                    <img src={msg.from_user_id.profile_picture} className='w-8 h-8 rounded-full' alt="" />
                    <div className='w-full'>
                        <div className=' flex justify-between'>
                            <p className='font-medium'>{msg.from_user_id.full_name}</p>
                            <p className='text-[10px] text-slate-400'>{moment(msg.createdAt).fromNow()}</p>
                        </div>
                        <div className='flex justify-between'>
                            <p className='text-gray-500'>{msg.text ? msg.text : 'Media'}</p>
                            {!msg.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
                        </div>
                    </div>
                </Link>
            ))
            }
        </div>
    </div>
  )
}

export default RecentMessage
