import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useQuery } from "react-query";
import '../styles/Dashborad.css'
import axios from 'axios';
const Dashborad=()=>{
    const navigate = useNavigate();
    const [verficationSession, setVerficationSession] = useState(false);
    const [datenow,setDateNow]=useState(new Date())
    const [listMonth,setListMonth]=useState(["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"])
    const getDataDashborad=useQuery('DashboradDataGet',() => {
        return axios.get('http://localhost:80/dashboradServer/dashborad-info-TC/getData',{headers:{Authorization:`Bearer ${window.sessionStorage.getItem('idUserSerie')}`}})
    },{
        refetchInterval:1000,
        refetchIntervalInBackground:true
    })
    useEffect(() => {
        if (
          window.sessionStorage.getItem("idUser") &&
          window.sessionStorage.getItem("idUserSerie") &&
          window.sessionStorage.getItem("name")
        ) {
          setVerficationSession(() => {
            return true;
          });
        } else {
          navigate("/SignIn", { replace: true });
        }
      }, []);
    
      if (verficationSession){
        if(!getDataDashborad.isLoading){
            if(parseInt(getDataDashborad.data.data[0].operation)===1){
                return<>
            <div className='DashboradMain'>

                <header className='DashboradMenu'>
                    <section className='dateDashborad'>
                        <h1>Date : {`${datenow.getDate()}-${listMonth[datenow.getMonth()]}-${datenow.getFullYear()}`}</h1>
                    </section>

                    <section className='imgTitleDashborad'>
                        <img src={require("../img/logoTiger2.png")} alt="Logo Tiger" />
                        <h1>Tiger Chat Dashborad</h1>
                    </section>

                    <section className='LinkBack'>
                        <Link className='link' to='/RoomList'>Back to Room List</Link>
                        <FaArrowRight className='iconRight' />
                    </section>
                </header>

                <div className='GlobalElements'>
                    <main className='DashboradElement'>
                        <div className='statistiquesDashborad'>
                            <h1>Users Online</h1>
                            <h3>{getDataDashborad.data.data[0].data[0].UsersOnline}</h3>
                        </div>
                        <div className='statistiquesDashborad'>
                            <h1>Users Offline</h1>
                            <h3>{getDataDashborad.data.data[0].data[0].UsersOffline}</h3>
                        </div>
                        <div className='statistiquesDashborad'>
                            <h1>Total Rooms Created</h1>
                            <h3>{getDataDashborad.data.data[0].data[0].TotalRoomsCreated}</h3>
                        </div>
                        <div className='statistiquesDashborad'>
                            <h1>Total Rooms Online</h1>
                            <h3>{getDataDashborad.data.data[0].data[0].TotalRoomsOnline}</h3>
                        </div>
                        <div className='statistiquesDashborad'>
                            <h1>Total Rooms Deleted</h1>
                            <h3>{getDataDashborad.data.data[0].data[0].TotalRoomsDeleted}</h3>
                        </div>
                        <div className='statistiquesDashborad'>
                            <h1>Total Messages</h1>
                            <h3>{getDataDashborad.data.data[0].data[0].TotalMessages}</h3>
                        </div>
                    </main>
                </div>
            </div>
        </>
            }
            
        }
      }
}
export default Dashborad