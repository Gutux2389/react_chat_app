import { db } from "../libs/realtime_database";
import { useState } from "react";
import { ref,set } from "firebase/database";
import {v4} from 'uuid';
import { addDoc, collection } from "firebase/firestore";

export const CreateAcc = () =>{
    const [accName,setAccName] = useState();
    const [accPassword,setAccPassword] = useState();
    const uuid = v4();

    const newUser = (e) =>{
        
        const userRef = ref(db,`users/${uuid}`);
        set(userRef,{
            username: accName,
            password: accPassword,
            photoURL: "https://cdn.worldvectorlogo.com/logos/react-1.svg",
            uuid: `${uuid}`
        })
    }

    return(
        <div>
        <form onSubmit={newUser}>
            <input type="text" class="form-control mb-2" onChange={(e)=>{setAccName(e.target.value)}} placeholder="Username"/>
            
            <input type="password" class="form-control" onChange={(e)=>{setAccPassword(e.target.value)}} placeholder="Password"/>
            <button type="submit" class="btn btn-primary">Create Account</button>
        </form>
        </div>
    )
}