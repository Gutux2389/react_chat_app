import { db } from "../libs/realtime_database";
import { useState,useEffect } from "react";
import { ref,set,get, onValue } from "firebase/database";
import { auth } from "../libs/realtime_database";
import { getAuth } from "firebase/auth";
import {v4} from 'uuid';
export const NewChatRoom = () =>{
    const [roomName,setRoomName] = useState();
    const [avaUsers,setAvaUsers] = useState(null);
    const [selectedUsers,setSelectedUsers] = useState([]);
    const [refresher,setRefresher] = useState(null);
    const addedUser = [];
    useEffect(()=>{
      const userREf = ref(db,'/users');
      onValue(userREf,(snapshot)=>{
        const data = snapshot.val();
        const datavalue = Object.values(data);
        const final = datavalue.map((value)=>{
          return value;
        })
        setAvaUsers(final);
      })
      
    },[refresher])
    const takeOutUser = (e) =>{
      e.preventDefault();
      const Btn = document.getElementById(e.target.value);
      Btn.style.backgroundColor = 'white';
      const users = selectedUsers.filter((user)=>{
        return user !== e.target.value;
      })
      setSelectedUsers(users);
    }
    const initialUser = (e) =>{
      e.preventDefault();
      if(e.currentTarget.style.backgroundColor === 'rgb(0, 230, 115)'){
        const final = selectedUsers.filter((user)=>{
          return user !== e.target.value;
        })
        e.currentTarget.style.backgroundColor = 'white';
        setSelectedUsers(final);
      }else{
      e.currentTarget.style.backgroundColor = '#00e673';
      const addedUser = selectedUsers.concat(e.target.value);
      setSelectedUsers(addedUser);
      }
      }
      
    
    const createRoom = (e) =>{
        
        const chatsRef = ref(db,`/chats/${roomName}`);

        set(chatsRef,{
            roomName: roomName,
            members: selectedUsers
        });
        setRefresher(v4());
      }

    return(
    <div class="newchatroom">
    <h2>Create A New ChatRoom</h2>
    <form onSubmit={createRoom}>
              <input class="form-control" onChange={(e)=>{setRoomName(e.target.value)}} placeholder="Create Your ChatRoom..."/>
              {selectedUsers[0]
              ?<ul>
                {selectedUsers.map((user)=>{
                  return(
                  avaUsers.map((avaUser)=>{
                    if(avaUser.uuid === user){
                      return(
                        <li><img style={{width:20,height:20}} src={avaUser.photoURL} />{avaUser.username}<button onClick={takeOutUser}>X</button></li>
                        
                      )
                    }
                  }))
                })}
              </ul>
              :null}
              {avaUsers
              ?
              <div className="selectUser">
                {avaUsers.map((user)=>{
                  return(
                  <button id={user.uuid} onClick={initialUser} value={user.uuid}>
                    <img style={{width:20,height:20}} src={user.photoURL}/>{user.username}
                  </button>
                  )
                })}
              </div>
              : null
              }
              <button class='btn btn-primary'>Create Your Room</button>
    </form>
    <button onClick={()=>console.log(selectedUsers)}>Test</button>
    </div>
    )
}