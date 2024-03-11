import { auth,provider } from '../libs/realtime_database';
import {signInWithPopup} from 'firebase/auth';
import { db } from '../libs/realtime_database';
import { get,set,ref,onValue } from 'firebase/database';
import { useState,useEffect } from 'react';
import {v4} from 'uuid';
import Cookies from 'universal-cookie';
const cookies = new Cookies();



export const Auth = (props)=>{
    const [users,setUsers] = useState(null);
    const [reminder,setReminder] = useState(null);
    const {setIsAuth} = props;

    
    
    const signUpWithGoogle = async () =>{
        try{
        const result = await signInWithPopup(auth,provider);
        cookies.set("auth-token", result.user.refreshToken);
        cookies.set("user-email",result.user.email);
        setReminder(v4());
        console.log(result.user);
        console.log(users); 
        setIsAuth(true);
        
        }catch(err){
            console.error(err);
        }
    }
    return(
    <div>
        <div>
            <button  className='emailauth' onClick={signUpWithGoogle}>Sign in with google</button>
        </div>
    </div>
    )
}