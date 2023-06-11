import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/RoomList.css'
const RoomList=() => {
  const navigate=useNavigate()
  const [verficationSession,setVerficationSession]=useState(false)
  const [awaitSendInfo,setAwaitSendInfo]=useState(false)
  const connectWithDashborad=async()=>{
    await axios.get('http://localhost:80/dashboradServer/dashborad-info-TC')
  }
  connectWithDashborad().then(()=>{
    setAwaitSendInfo(()=>{
      return true
    })
  })
  useEffect(()=>{
    if(window.sessionStorage.getItem('idUser') && window.sessionStorage.getItem('idUserSerie') && window.sessionStorage.getItem('name')){
      setVerficationSession(()=>{
        return true
      })
    }else{
      navigate('/SignIn',{replace:true})
    }
  },[])
  if(verficationSession && awaitSendInfo){
    return<>
    <div className='Principale'>
        <div className='Room-selection'>
                <div className="tigeLogo-and-title">
                    <img src={require('../img/logoTiger2.png')} alt="Logo Tiger" />
                    <h1>Room</h1>
                </div>
                <Link className='btn1' to='/CreateRoom'>Create Room</Link>
                <Link className='btn2' to='/ConnectionRoom'>Connection Room</Link>
                <Link className='btn2' to='/Dashborad'>Dashborad</Link>
        </div>
    </div>
  </>
  }
}
export default RoomList