
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connection from './pages/Connection'
import Descover from './pages/Descover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import { useAuth, useUser } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'

const App = () => {
  const {user} = useUser();
  const {getToken} = useAuth();

  useEffect(() => {
    if(user)
    {
      getToken().then((token)=> console.log(token))
    }

  }, [user])
  
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path='/' element={!user ? <Login /> : <Layout/>} >
        <Route index element={<Feed />}/>
        <Route path='messages' element={<Messages/>} />
        <Route path='messages/:userId' element={<ChatBox/>} />
        <Route path='connections' element={<Connection/>}/>
        <Route path='discover' element={<Descover/>}/>
        <Route path='profile' element={<Profile/>}/>
        <Route path='profile/:profileId' element={<Profile />}/>
        <Route path='create-post' element={<CreatePost/>}/>

      </Route>
    </Routes>
    </>
  )
}

export default App
