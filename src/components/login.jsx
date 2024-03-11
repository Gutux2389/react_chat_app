import { useState,useEffect } from "react";
import { db } from "../libs/realtime_database";
import { get,ref } from "firebase/database";
import Cookies from "universal-cookie";
const cookies = new Cookies();

export const LoginWithFirebase = (props) =>{
    const {setIsMyAuth} = props;
    const [firebaseName,setFirebaseName] = useState(null);
    const [firebasePass,setFirebasePass] = useState(null);
    const [users,setUsers] = useState(null);
    useEffect(()=>{
        const userRef = ref(db,'/users');
        get(userRef).then((snapshot)=>{
            const data = snapshot.val();
            const userdata = Object.values(data);
            setUsers(userdata);
            console.log(userdata);
        });
    },[])
    const firebaseLogin = (e) =>{
        
        users.map((user)=>{
            if(user.username === firebaseName && user.password === firebasePass){
                cookies.set('current-user',user);
                cookies.set('user',user);
                setIsMyAuth(user);
                
            }
        })
    }

    return(
        <div>
            <form onSubmit={firebaseLogin}>
            <input type="text" class="form-control mb-2" onChange={(e)=>setFirebaseName(e.target.value)} placeholder="Enter your name here"/>
            <input type="password" class="form-control" onChange={(e)=>setFirebasePass(e.target.value)} placeholder="Enter your password"/>
            <button class="btn btn-primary">Create Account</button>
        </form>
        </div>
    )
}