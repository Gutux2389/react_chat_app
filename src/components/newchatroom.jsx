import { db, storage } from "../libs/realtime_database";
import { useState,useEffect } from "react";
import { ref,set,get, onValue } from "firebase/database";
import { getDownloadURL, ref as sref, uploadBytes } from "firebase/storage";
import { auth } from "../libs/realtime_database";
import { getAuth } from "firebase/auth";
import {v4} from 'uuid';

export const NewChatRoom = (props) =>{
    const [roomName,setRoomName] = useState();
    const [avaUsers,setAvaUsers] = useState(null);
    const [selectedUsers,setSelectedUsers] = useState([]);
    const [refresher,setRefresher] = useState(null);
    const [startCreate,setStartCreate] = useState(null);
    const [chatPhoto,setChatPhoto] = useState(null);
    const uuid =  v4();
    const {lightDarkToggle} = props;
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
    useEffect(()=>{
      if(startCreate){
      if(chatPhoto){
      const chatsRef = ref(db,`/chats/${roomName}`);
      
        set(chatsRef,{
          roomName: roomName,
          members: selectedUsers,
          chatPhoto
      });
        window.location.reload();
      }else{
        const chatsRef = ref(db,`/chats/${roomName}`);
      
        set(chatsRef,{
          roomName: roomName,
          members: selectedUsers,
          chatPhoto: "https://cdn.worldvectorlogo.com/logos/react-1.svg"
      });
        window.location.reload();
      }
      }
      
    },[startCreate])
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
      
    
    const createRoom = async (e) =>{
      e.preventDefault();
      if(chatPhoto){
      const getImgRef = sref(storage,`/chats/${roomName}/profile/${uuid}/${chatPhoto}`);

      await uploadBytes(getImgRef, chatPhoto);
      const chatProfile = await getDownloadURL(getImgRef);
      setChatPhoto(chatProfile);
      setStartCreate(v4());
      }else{
        setStartCreate(v4());
      }
      }

    return(
    <div className={`entireNewChat ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
    <div className={`newchatroom ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
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
              <input type="file" onChange={(e)=>{setChatPhoto(e.target.files[0]);console.log(e.target.files[0])}} />
              <button class='btn btn-primary'>Create Your Room</button>
    </form>
    
    </div>
    </div>
    )
}