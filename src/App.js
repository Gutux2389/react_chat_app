import { db } from './libs/realtime_database';
import './App.css';
import { Router,Routes,Route,Link } from 'react-router-dom';
import {useState,useEffect,useRef} from 'react';
import { Auth } from './components/auth';
import Cookies from 'universal-cookie';
import { signOut,onAuthStateChanged } from 'firebase/auth';
import { auth } from './libs/realtime_database';
import {ref,set,get,onValue, remove} from 'firebase/database';
import  ChatRoom  from './components/chatroom';
import { NewChatRoom } from './components/newchatroom';
import { CreateAcc } from './components/createAcc';
import { LoginWithFirebase } from './components/login';
import {v4} from 'uuid';
import {CSSTransition} from 'react-transition-group';
import { memo } from 'react';

const cookies = new Cookies();

function App() {
  const [isAuth,setIsAuth] = useState(cookies.get("auth-token"));
  const [isMyAuth,setIsMyAuth] = useState(cookies.get('user'))
  const [roomName,setRoomName] = useState(null);
  const [rooms,setRooms] = useState(null);
  const [refresher,setRefresher] = useState(null);
  const [loggedUser,setLoggedUser] = useState(null);
  const [newChatShow,setNewChatShow] = useState(null);
  const [allUsers,setAllUsers] = useState(null);
  const [currUser,setCurrUser] = useState(null);
  const [roomTest,setRoomTest] = useState(null);
  const [userExist,setUserExist] = useState(v4());
  const [reloader,setReloader] = useState(null);
  const [chatSuggestion,setChatSuggestion] = useState(null);
  const [avaChats,setAvaChats] = useState(null);
  const [searchQuery,setSearchQuery] = useState(null);
  useEffect(()=>{
    fetchUsers();
  },[])
  useEffect(()=>{
    
    onAuthStateChanged(auth,(user)=>{
      setLoggedUser(user);
      cookies.set('current-user',user);
  })
  getRooms();
    
    if(cookies.get('current-user') && currUser === 'Create'){
      const authdata = cookies.get("current-user");
      const uuid = v4(); 
      if(userExist){
        const usersRef = ref(db,`/users/${uuid}`);
                  set(usersRef,{
                      username: authdata.email,
                      password: null,
                      photoURL: authdata.photoURL,
                      uuid: `${uuid}`
                  })
      }
      
      
    }
},[roomTest,refresher])

  useEffect(()=>{
  if(cookies.get('user')){
    if(allUsers){
      allUsers.map((user)=>{
        try{
            if(user.username === isMyAuth.username){
            setCurrUser(user);
            setRoomTest(user)
           }
        }catch(err){
          console.log(err)
        }
  
      })
    }
  }
  if(cookies.get('user-email')){
    const authdata = cookies.get('current-user');
    if(allUsers){
      setCurrUser('Create');
     allUsers.map((user)=>{
        try{
            
            if(user.username === authdata.email){
                
                setCurrUser(user);
                setRoomTest(user);
                setUserExist(null);
            }
            }catch(err){
                console.error(err)
            }
            
    })
    
    
  }
    }
  },[isAuth,isMyAuth,allUsers])
  useEffect(()=>{ 
    handleSearch();
  },[searchQuery,avaChats])
  const fetchUsers = () =>{
    const userRef = ref(db,'/users');
    onValue(userRef,(snapshot)=>{
        const data = snapshot.val();
        const datavalue = Object.values(data);
        const final = datavalue.map((value)=>{
          return value;
        })
        setAllUsers(final);
      })
      setRefresher(v4());
  }

  const getRooms = async () =>{
    const chatsRef = ref(db,"/chats");
    await get(chatsRef).then(snapchat =>{
      if(snapchat){
      const data = snapchat.val();
      if(data){
      const datavalue = Object.values(data);
      console.log(datavalue);
      let  final = datavalue.map((value)=>{
        return value
      })
      setAvaChats(final);
      if(roomTest){
        let finalrooms = [];
        final.map((room)=>{
          room.members.map((member)=>{
            if(member === roomTest.uuid){
              finalrooms.push(room);
            }
          })
        })
        setRooms(finalrooms);
      }else{
        console.log('Users are not found')
      }
        
      }
      } 
    })
    console.log(rooms);
  }
  const CreateAccSlide = () =>{
    const [createTextOpen,setCreateTextOpen] = useState(false);
    const [createLoginOn,setCreateLoginOn] = useState(false);


    return(
      <div className="myCreateAcc">
        <div  onMouseOver ={()=>setCreateTextOpen(true)} onMouseOut={()=>setCreateTextOpen(false)} >
          <CSSTransition in={createLoginOn === false} unmountOnExit timeout={500} classNames={'myCreateBtn'}>
          <button className='myCreateAuth' onClick={()=>setCreateLoginOn(true)}>Create an account on our website</button>
          </CSSTransition>
          
          
        
        
        </div>
        <CSSTransition in={createLoginOn === true} unmountOnExit timeout={500} classNames={"myAccCreate"}>
        <div className='accCreate'>
          <h6>Create Your Account<button class="float-end" onClick={()=>setCreateLoginOn(false)}>X</button></h6>
          
          <CreateAcc />
          
        </div>
        </CSSTransition>
              <CSSTransition in={createTextOpen === true && createLoginOn !== true} unmountOnExit timeout={500} classNames="myLoginAni"
              >
              <div className="mySlideText">
                <p>
                Don't have an Account?Join us by creating one.
                </p>
              </div>
              </CSSTransition>
      </div>
    )
  }
  const LoginSlide = () =>{
    const [textOpen,setTextOpen] = useState(false);
    const [loginOn,setLoginOn] = useState(false);


    return(
      <div className="myLogin">
        <div  onMouseOver ={()=>setTextOpen(true)} onMouseOut={()=>setTextOpen(false)} >
          <CSSTransition in={loginOn === false} unmountOnExit timeout={500} classNames={'myLoginBtn'}>
          <button className='myLoginAuth' onClick={()=>setLoginOn(true)}>Log in with Our Account</button>
          </CSSTransition>
          
          
        <CSSTransition in={loginOn === true} unmountOnExit timeout={500} classNames={"myAccLogin"}>
        <div className='accLogin'>
          <h6>Log in With Our Account<button class="float-end "onClick={()=>setLoginOn(false)}>X</button></h6>
          
          <LoginWithFirebase setIsMyAuth={setIsMyAuth}/>
          
        </div>
        </CSSTransition>
        
        </div>
        
              <CSSTransition in={textOpen === true && loginOn !== true} unmountOnExit timeout={500} classNames="myLoginAni"
              >
              <div className="mySlideText">
                <p>
                  Already have an Account?Log in to join the chats.
                </p>
              </div>
              </CSSTransition>
      </div>
    )
  }

  const EmailSlide = () =>{
    const [textOpen,setTextOpen] = useState(false);

    return(
      <div className="emailLogin">
        <div  onMouseOver ={()=>setTextOpen(true)} onMouseOut={()=>setTextOpen(false)}>
        <Auth setIsAuth={setIsAuth}/>
        </div>
        
              <CSSTransition in={textOpen === true} unmountOnExit timeout={500} classNames="emailLoginAni"
              >
              <div className="emailSlideText">
                <p>
                  You can directly Sign in and Start Using the App via Your email Account
                </p>
              </div>
              </CSSTransition>
      </div>
    )
  }
  const chatJoinRequest = (roomName,userInfo) =>{
    const newRequest = ref(db,`/chats/${roomName}/requests/${userInfo.uuid}`);
    set(newRequest,{
      userInfo: userInfo,
      requestPending: true
    });
    setRefresher(v4());
  }
  const cancelRequest = (roomName,userInfo) =>{
    const newRequest = ref(db,`chats/${roomName}/requests/${userInfo.uuid}`);
    remove(newRequest);
    setRefresher(v4());
  }
  const signOutUser = async () =>{
    await signOut(auth);
    cookies.remove("auth-token");
    cookies.remove("user-email");
    cookies.remove("user");
    cookies.remove("current-user");
    setIsAuth(false);
    setIsMyAuth(false);
  }
  const handleSearch = () =>{
    try{
    const query = searchQuery.toLowerCase();
    const suggestions = avaChats.filter((room) =>{
      const name = room.roomName.toLowerCase();
      return name.startsWith(query);
    })
    if(query){
      setChatSuggestion(suggestions);
    }else{
      setChatSuggestion(null);
    }
    console.log(chatSuggestion);
    }catch(e){
      console.error(e);
    }
  }
  return(
    <>


        {isAuth || isMyAuth
        ? 
            
            <div>
            <div class="offcanvas offcanvas-start w-10" id="offcanvas" data-bs-keyboard="false">
                    <div class="offcanvas-header">
                        <h6 id="offcanvas" class="offcanvas-title">Your Groups</h6>
                        <Link to='/Newchatroom' onClick={() =>{setNewChatShow(v4());setRoomName(null)}}>
                        <button className="newChat">Create New Chat</button>
                        </Link>
                        
                        <button class="btn-close" aria-label='Close' data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div class="offcanvas-body">
                    {rooms
                    ?<ul>
                    {rooms.map((room) =>{
                      return(
                      <Link to={`${room.roomName}`} state={{ roomName: room}} onClick={()=>{setRoomName(room.roomName);setNewChatShow(null)}}>
                      <li style={{listStyleType: "none"}} class="py-2 border border-2 rounded">
                        <button class="rounded m-1">{room.roomName}</button>
                        <span class="">{room.roomName}</span>
                      </li>
                      </Link>
                      )
                      })
                     }
                      </ul>
                    :<div></div>
                    }
                    </div>
                </div>
              <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
            
            <div class="nav-item">
            <button class="btn" data-bs-toggle="offcanvas" data-bs-target="#offcanvas">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16 " height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
      </svg>
            </button>
            </div>
            <div class="nav-item">
            <div class="dropdown">
            
            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"
              onChange={(e)=>setSearchQuery(e.target.value)} data-bs-toggle="dropdown" data-bs-auto-close="false"
            />
            
            <ul className='suggestion' class="dropdown-menu">
              {chatSuggestion
              ? chatSuggestion.map(room =>{
                const isMember = room.members.includes(roomTest.uuid);
                let hasRequest = null;
                if(room.requests){
                 hasRequest = Object.hasOwn(room.requests, roomTest.uuid);
                }
                return(
                <li  class="dropdown-item" >
                  {room.roomName}
                  
                    {isMember
                    ? null
                    :<span>
                      {room.requests
                      ? <span>
                        {hasRequest
                        ?<span style={{paddingLeft: 5}}>
                          
                          <button class="btn btn-outline-secondary" disabled>Pending</button>
                          <button class="btn btn-danger" onClick={()=>cancelRequest(room.roomName,roomTest)}>Cancel</button>
                          
                         </span>
                        :<span style={{paddingLeft: 5}}><button onClick={()=>chatJoinRequest(room.roomName,roomTest)}>Request</button></span>
                        }
                        </span>
                      : <span style={{paddingLeft: 5}}><button onClick={()=>chatJoinRequest(room.roomName,roomTest)}>Request</button></span>
                      }
                    </span>
                    }
                  
                </li> 
                )
              })
              : null}
            </ul>
            </div>
            </div>
            <div class="nav-item dropstart">
            {loggedUser || isMyAuth
            ?
            <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
                    <img className="dropImg" src={loggedUser? loggedUser.photoURL : isMyAuth.photoURL} />
            </a>
            :<div></div>
            }
            <ul class="dropdown-menu dropdown-menu-left">
              <li class="dropdown-item" onClick={signOutUser}>
                Log Out
              </li>
            </ul>
            </div>
            
            </div>
            </nav>
            <div>
            
            
            {roomName === null & newChatShow === null
            ?<div>
              <div className="welcomeMsg">
              <h3>Start a new group or Find Groups to Join</h3>
              </div>
            </div>
            :<div>
              <div className='chatCreate'>
              <Routes>
                {roomName
                ?  <Route path=":name" element={<ChatRoom isMyAuth={isMyAuth}/>}/>
                :  <Route path="/Newchatroom" element={<NewChatRoom />}/>
                }
              </Routes>
              </div>
            </div>
        }
          </div>
          </div>
          
          
            
            
            
            
          
        : 
        <div>
        </div>
        }
    <div>
      { isAuth || isMyAuth
      ? <div>
         
        </div>
      : 
        <div>
        <div className="GuestMainPage">
            <EmailSlide />
            <LoginSlide />
            <CreateAccSlide />
        </div>
        </div>
      }
    </div>
    </>
  )
}

export default App;
