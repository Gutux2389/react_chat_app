import { ref, get, set, onValue, update } from "firebase/database";
import { ref as sref } from "firebase/storage";
import { db, auth, storage } from "../libs/realtime_database";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { v4 } from "uuid";
import Cookies from "universal-cookie";
import { uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { memo } from "react";
const cookies = new Cookies();

const ChatRoom = (props) => {
  const location = useLocation();
  const { roomName } = location.state;
  const [newMessage, setNewMessage] = useState(null);
  const [currChats, setCurrChats] = useState();
  const [currUser, setCurrUser] = useState();
  const [msgImage, setMsgImage] = useState(null);
  const [realUser, setRealUser] = useState(null);
  const [selectUsers, setSelectUsers] = useState([]);
  const [takeOutUsers, setTakeOutUsers] = useState([]);
  const [realUserProfile, setRealUserProfile] = useState(null);
  const [avaUsers, setAvaUsers] = useState(null);
  const [realtimeImg, setRealTimeImg] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [notMembers, setNotMembers] = useState(null);
  const [isMembers, setIsMembers] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(null);
  const [refresher,setRefresher] = useState(null);
  const uuid = v4();
  const { isMyAuth } = props;
  const chatRef = ref(db, `chats/${roomName.roomName}/chat/${uuid}`);
  const getImgRef = sref(
    storage,
    `chats/${roomName.roomName}/chat/${uuid}/${msgImage}`
  );
  const currTime = new Date();

  useEffect(() => {
    getRequests();
    console.log(roomName);
  },[refresher,roomName]);
  useEffect(() => {
    setCurrChats();
    getAllMessages();
    memberList();
    if (auth.photoURL || auth.currentUser) {
      setRealUserProfile(auth.photoURL || auth.currentUser.photoURL);
    } else {
      setRealUserProfile(isMyAuth.photoURL);
    }
    if (cookies.get("user-email")) {
      setRealUser(cookies.get("user-email"));
    } else {
      setRealUser(cookies.get("user").username);
    }
    console.log("Test2");
  }, [roomName]);
  useEffect(() => {
    if (sendMessage) {
      if (msgImage) {
        set(chatRef, {
          atimeStamp: currTime.getTime(),
          message: newMessage,
          email: realUser,
          profile: realUserProfile,
          image: realtimeImg,
        });
        setMsgImage(null);
      } else {
        set(chatRef, {
          atimeStamp: currTime.getTime(),
          message: newMessage,
          email: realUser,
          profile: realUserProfile,
        });
      }
    }
    console.log("Test3");
  }, [realtimeImg]);
  const getRequests =  () =>{
    const requestsRef = ref(db,`chats/${roomName.roomName}/requests`);
    onValue(requestsRef,snapshot =>{
      if(snapshot){
        const data = snapshot.val();
        if(data){
        const realdata = Object.values(data);
        let final = realdata.map((data)=>{
          return data;
        })
        setPendingRequests(final);
      }
      else{
        setPendingRequests(null);
      }
      }
    })
  }
  const initialUser = (e) => {
    e.preventDefault();
    if (e.currentTarget.style.backgroundColor === "rgb(0, 230, 115)") {
      const final = selectUsers.filter((user) => {
        return user !== e.target.value;
      });
      e.currentTarget.style.backgroundColor = "white";
      setSelectUsers(final);
    } else {
      e.currentTarget.style.backgroundColor = "#00e673";
      const addedUser = selectUsers.concat(e.target.value);
      setSelectUsers(addedUser);
    }
  };
  const outUser = (e) => {
    e.preventDefault();
    if (e.currentTarget.style.backgroundColor === "rgb(0, 230, 115)") {
      const final = takeOutUsers.filter((user) => {
        return user !== e.target.value;
      });
      e.currentTarget.style.backgroundColor = "white";
      setTakeOutUsers(final);
    } else {
      e.currentTarget.style.backgroundColor = "#00e673";
      const addedUser = takeOutUsers.concat(e.target.value);
      setTakeOutUsers(addedUser);
    }
  };
  const addNewMessage = async (e) => {
    e.preventDefault();

    await uploadBytes(getImgRef, msgImage);
    const realtimeimageURL = await getDownloadURL(getImgRef);
    setRealTimeImg(realtimeimageURL);
    setSendMessage(v4());
  };
  const addMemberUpdate = () => {
    const chatroomRef = ref(db, `chats/${roomName.roomName}`);
    let memberUUID = isMembers.map((member) => {
      return member.uuid;
    });
    const finalUsers = [...memberUUID, ...selectUsers];
    update(chatroomRef, {
      members: finalUsers,
    });
    window.location.reload();
  };
  const removeMemberUpdate = () => {
    const chatroomRef = ref(db, `chats/${roomName.roomName}`);
    let memberUUID = isMembers.map((member) => {
      return member.uuid;
    });
    const finalUsers = memberUUID.filter((id) => !takeOutUsers.includes(id));
    update(chatroomRef, {
      members: finalUsers,
    });
    window.location.reload();
  };
  const leaveSelf = () => {
    const chatroomRef = ref(db, `chats/${roomName.roomName}`);
    let memberUUID = isMembers.map((member) => {
      return member.uuid;
    });
    if (cookies.get("user-email")) {
      const selfRef = ref(db, `users/${cookies.get("current-user").email}`);
      onValue(selfRef, (snapshot) => {
        const data = snapshot;
        const finalUsers = memberUUID.filter((id) => data.uuid !== id);
        update(chatroomRef, {
          members: finalUsers,
        });
        window.location.reload();
      });
    } else if (cookies.get("user")) {
      const data = cookies.get("user").uuid;
      const finalUsers = memberUUID.filter((id) => data !== id);
      update(chatroomRef, {
        members: finalUsers,
      });
      window.location.reload();
    }
  };
  const memberList = () => {
    const memberRef = ref(db, `chats/${roomName.roomName}/members`);
    const usersRef = ref(db, "/users");
    onValue(memberRef, (snapshot) => {
      const memberData = snapshot.val();
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const datavalue = Object.values(data);
        const final = datavalue.map((value) => {
          return value;
        });
        setAvaUsers(final);
        let notMembers = [];
        let isMembers = [];
        memberData.map((member) => {
          final.map((user) => {
            if (member !== user.uuid) {
              notMembers.push(user);
            } else {
              isMembers.push(user);
            }
          });
        });
        setIsMembers(isMembers);
        const uniqueNames = [...new Set(notMembers)];
        let result = uniqueNames.filter((user) => !isMembers.includes(user));
        setNotMembers(result);
      });
    });
  };
  const getAllMessages = () => {
    const msgRef = ref(db, `chats/${roomName.roomName}/chat`);
    onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        const datavalue = Object.values(data);
        const final = datavalue.map((value) => {
          return value;
        });
        const sortedmessages = final.sort(
          (a, b) => a.atimeStamp - b.atimeStamp
        );
        if (cookies.get("user-email")) {
          setCurrUser(cookies.get("user-email"));
        } else if (cookies.get("user")) {
          setCurrUser(cookies.get("user").username);
        }
        setCurrChats(sortedmessages);
      }
    });
  };

  return (
    <div className="chatbox">
      <div className="chatroomNav">
        <div className="chatroomNavName">{roomName.roomName}</div>
        <div className="chatroomNavBtns">
          <div
            class="modal fade"
            id="addMemberModal"
            tabindex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">
                    Add new members to the group
                  </h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  {notMembers
                    ? notMembers.map((member) => {
                        return (
                          <div style={{ padding: 2 }}>
                            <button
                              id={member.uuid}
                              onClick={initialUser}
                              value={member.uuid}
                            >
                              <img
                                style={{ width: 20, height: 20 }}
                                src={member.photoURL}
                              />
                              {member.username}
                            </button>
                          </div>
                        );
                      })
                    : null}
                  {selectUsers[0] ? (
                    <ul>
                      {selectUsers.map((user) => {
                        return avaUsers.map((avaUser) => {
                          if (avaUser.uuid === user) {
                            return (
                              <li>
                                <img
                                  style={{ width: 20, height: 20 }}
                                  src={avaUser.photoURL}
                                />
                                {avaUser.username}
                              </li>
                            );
                          }
                        });
                      })}
                    </ul>
                  ) : null}
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick={addMemberUpdate}
                  >
                    Add selected members
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#addMemberModal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-person-add"
              viewBox="0 0 16 16"
            >
              <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0m-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
              <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z" />
            </svg>
          </button>
          <div class="modal" tabindex="-1" id="banMemberModal">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Ban or remove members</h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                  {isMembers
                    ? isMembers.map((member) => {
                        return (
                          <div style={{ padding: 2 }}>
                            <button
                              id={member.uuid}
                              onClick={outUser}
                              value={member.uuid}
                            >
                              <img
                                style={{ width: 20, height: 20 }}
                                src={member.photoURL}
                              />
                              {member.username}
                            </button>
                          </div>
                        );
                      })
                    : null}
                  {takeOutUsers[0] ? (
                    <ul>
                      {takeOutUsers.map((user) => {
                        return avaUsers.map((avaUser) => {
                          if (avaUser.uuid === user) {
                            return (
                              <li>
                                <img
                                  style={{ width: 20, height: 20 }}
                                  src={avaUser.photoURL}
                                />
                                {avaUser.username}
                              </li>
                            );
                          }
                        });
                      })}
                    </ul>
                  ) : null}
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick={removeMemberUpdate}
                  >
                    Remove or ban selected Members
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button data-bs-toggle="modal" data-bs-target="#banMemberModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-person-dash"
              viewBox="0 0 16 16"
            >
              <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m0-7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
              <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z" />
            </svg>
          </button>
          <div class="modal" tabindex="-1" id="leaveSelfModal">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Are you sure you want to leave?</h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">Hi</div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick={leaveSelf}
                  >
                    Yes,I am sure.
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="nav-item dropstart">
            <button data-bs-toggle="dropdown">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-gear"
                viewBox="0 0 16 16"
              >
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
              </svg>
            </button>
            <ul class="dropdown-menu dropdown-menu-left">
              <li
                class="dropdown-item"
                data-bs-toggle="modal"
                data-bs-target="#leaveSelfModal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-door-open"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1" />
                  <path d="M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117M11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5M4 1.934V15h6V1.077z" />
                </svg>
                <bold> Leave</bold>
              </li>
              <li class="dropdown-item" data-bs-toggle="modal" data-bs-target="#pendingRequests">
                Join Requests
              </li>
              <li class="dropdown-item" onClick={()=>console.log(pendingRequests)}>
                  Test
              </li>
            </ul>
          </div>
          <div class="modal" tabindex="-1" id="pendingRequests">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Pending Requests</h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="modal-body">
                      {pendingRequests
                      ? pendingRequests.map((request) =>{
                        return(
                          <div className="pendingRequests">
                            <img
                              src={request.userInfo.photoURL}
                              style={{width: 30,  height: 35}}
                            />
                            <span style={{paddingTop: 5}}>{request.userInfo.username}</span>
                            <button class="btn btn-success">Accept</button>
                            <button class="btn btn-danger">Decline</button>
                          </div>
                        )
                      })
                      : null
                      }
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="chatspace">
        {currChats ? (
          <div>
            {currChats.map((msg) => {
              return msg.email === currUser ? (
                <div className="message sent">
                  <div className="flexProfile">
                    <img className="sentProfile" src={msg.profile} />
                  </div>
                  <div className="msgContent">
                    {msg.image ? (
                      <img className="sentPhoto" src={msg.image} />
                    ) : (
                      <img />
                    )}
                    {msg.message ? <p>{msg.message}</p> : <div></div>}
                  </div>
                </div>
              ) : (
                <div className="message received">
                  <div className="flexProfile">
                    <img className="sentProfile" src={msg.profile} />
                  </div>
                  <div className="msgContent">
                    {msg.image ? (
                      <img className="sentPhoto" src={msg.image} />
                    ) : (
                      <img />
                    )}
                    {msg.message ? <p>{msg.message}</p> : <div></div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="inputBox">
        <form onSubmit={addNewMessage} className="inputForm">
          <input
            className="textInput"
            type="text"
            maxLength={230}
            placeholder=""
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
          />
          <div className="iconInput">
            <input
              id="actual-file"
              type="file"
              onChange={(e) => {
                setMsgImage(e.target.files[0]);
              }}
              hidden
            />
            <label for="actual-file">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-file-earmark-image"
                viewBox="0 0 16 16"
              >
                <path d="M6.502 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                <path d="M14 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM4 1a1 1 0 0 0-1 1v10l2.224-2.224a.5.5 0 0 1 .61-.075L8 11l2.157-3.02a.5.5 0 0 1 .76-.063L13 10V4.5h-2A1.5 1.5 0 0 1 9.5 3V1z" />
              </svg>
            </label>
            <button type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-send"
                viewBox="0 0 16 16"
              >
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(ChatRoom);
