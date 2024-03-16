import { db } from "./libs/realtime_database";
import "./App.css";
import { Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Auth } from "./components/auth";
import Cookies from "universal-cookie";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./libs/realtime_database";
import { ref, set, get, onValue, remove } from "firebase/database";
import ChatRoom from "./components/chatroom";
import { NewChatRoom } from "./components/newchatroom";
import { DirectMessage } from "./components/DirectMessage";
import { CreateAcc } from "./components/createAcc";
import { LoginWithFirebase } from "./components/login";
import { v4 } from "uuid";
import { CSSTransition } from "react-transition-group";
import { memo } from "react";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [isMyAuth, setIsMyAuth] = useState(cookies.get("user"));
  const [roomName, setRoomName] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [refresher, setRefresher] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [newChatShow, setNewChatShow] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [currUser, setCurrUser] = useState(null);
  const [roomTest, setRoomTest] = useState(null);
  const [userExist, setUserExist] = useState(v4());
  const [reloader, setReloader] = useState(null);
  const [chatSuggestion, setChatSuggestion] = useState(null);
  const [avaChats, setAvaChats] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [directMessage, setDirectMessage] = useState(null);
  const [lightDarkToggle,setLightDarkToggle] = useState(false);
  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setLoggedUser(user);
      cookies.set("current-user", user);
    });
    getRooms();

    if (cookies.get("current-user") && currUser === "Create") {
      const authdata = cookies.get("current-user");
      const uuid = v4();
      if (userExist) {
        const usersRef = ref(db, `/users/${uuid}`);
        set(usersRef, {
          username: authdata.email,
          password: null,
          photoURL: authdata.photoURL,
          uuid: `${uuid}`,
        });
      }
    }
  }, [roomTest, refresher]);

  useEffect(() => {
    if (cookies.get("user")) {
      if (allUsers) {
        allUsers.map((user) => {
          try {
            if (user.username === isMyAuth.username) {
              setCurrUser(user);
              setRoomTest(user);
            }
          } catch (err) {
            console.log(err);
          }
        });
      }
    }
    if (cookies.get("user-email")) {
      const authdata = cookies.get("current-user");
      if (allUsers) {
        setCurrUser("Create");
        allUsers.map((user) => {
          try {
            if (user.username === authdata.email) {
              setCurrUser(user);
              setRoomTest(user);
              setUserExist(null);
            }
          } catch (err) {
            console.error(err);
          }
        });
      }
    }
  }, [isAuth, isMyAuth, allUsers]);
  useEffect(() => {
    handleSearch();
  }, [searchQuery, avaChats]);
  const fetchUsers = () => {
    const userRef = ref(db, "/users");
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      const datavalue = Object.values(data);
      const final = datavalue.map((value) => {
        return value;
      });
      setAllUsers(final);
    });
    setRefresher(v4());
  };
  const directMsgRoom = (user) => {
    const dmName = user.uuid + ":" + roomTest.uuid;
    const members = [user, roomTest];
    const dmRef = ref(db, `/DMs/${dmName}`);
    set(dmRef, {
      members,
    });
    setRefresher(v4());
  };
  const getRooms = async () => {
    const chatsRef = ref(db, "/chats");
    const dmRef = ref(db, "/DMs");
    await get(chatsRef).then((snapchat) => {
      if (snapchat) {
        const data = snapchat.val();
        if (data) {
          const datavalue = Object.values(data);
          console.log(datavalue);
          let final = datavalue.map((value) => {
            return value;
          });
          setAvaChats(final);
          if (roomTest) {
            let finalrooms = [];
            final.map((room) => {
              room.members.map((member) => {
                if (member === roomTest.uuid) {
                  finalrooms.push(room);
                }
              });
            });
            setRooms(finalrooms);
          } else {
            console.log("Users are not found");
          }
        }
      }
    });
    await get(dmRef).then((snapshot) => {
      if (snapshot) {
        const data = snapshot.val();
        if (data) {
          const datavalue = Object.values(data);
          let final = datavalue.map((data) => {
            return data;
          });
          let DMFinal = final.filter((room) => {
            try {
              if (
                room.members[0].uuid === roomTest.uuid ||
                room.members[1].uuid === roomTest.uuid
              ) {
                return room;
              }
            } catch (e) {
              console.error(e);
            }
          });
          setDirectMessage(DMFinal);
        }
      }
    });
    console.log(rooms);
  };
  const CreateAccSlide = () => {
    const [createTextOpen, setCreateTextOpen] = useState(false);
    const [createLoginOn, setCreateLoginOn] = useState(false);

    return (
      <div className="myCreateAcc">
        <div
          onMouseOver={() => setCreateTextOpen(true)}
          onMouseOut={() => setCreateTextOpen(false)}
        >
          <CSSTransition
            in={createLoginOn === false}
            unmountOnExit
            timeout={500}
            classNames={"myCreateBtn"}
          >
            <button
              className="myCreateAuth"
              onClick={() => setCreateLoginOn(true)}
            >
              Create an account
            </button>
          </CSSTransition>
        </div>
        <CSSTransition
          in={createLoginOn === true}
          unmountOnExit
          timeout={500}
          classNames={"myAccCreate"}
        >
          <div className="accCreate">
            <h6>
              Create Your Account
              <button class="float-end" onClick={() => setCreateLoginOn(false)}>
                X
              </button>
            </h6>

            <CreateAcc />
          </div>
        </CSSTransition>
        <CSSTransition
          in={createTextOpen === true && createLoginOn !== true}
          unmountOnExit
          timeout={500}
          classNames="myLoginAni"
        >
          <div className="mySlideText">
            <p>Don't have an Account?Join us by creating one.</p>
          </div>
        </CSSTransition>
      </div>
    );
  };
  const LoginSlide = () => {
    const [textOpen, setTextOpen] = useState(false);
    const [loginOn, setLoginOn] = useState(false);

    return (
      <div className="myLogin">
        <div
          onMouseOver={() => setTextOpen(true)}
          onMouseOut={() => setTextOpen(false)}
        >
          <CSSTransition
            in={loginOn === false}
            unmountOnExit
            timeout={500}
            classNames={"myLoginBtn"}
          >
            <button className="myLoginAuth" onClick={() => setLoginOn(true)}>
              Log in
            </button>
          </CSSTransition>

          <CSSTransition
            in={loginOn === true}
            unmountOnExit
            timeout={500}
            classNames={"myAccLogin"}
          >
            <div className="accLogin">
              <h6>
                Log in With Our Account
                <button class="float-end " onClick={() => setLoginOn(false)}>
                  X
                </button>
              </h6>

              <LoginWithFirebase setIsMyAuth={setIsMyAuth} />
            </div>
          </CSSTransition>
        </div>

        <CSSTransition
          in={textOpen === true && loginOn !== true}
          unmountOnExit
          timeout={500}
          classNames="myLoginAni"
        >
          <div className="mySlideText">
            <p>Already have an Account?Log in to join the chats.</p>
          </div>
        </CSSTransition>
      </div>
    );
  };

  const EmailSlide = () => {
    const [textOpen, setTextOpen] = useState(false);

    return (
      <div className="emailLogin">
        <div
          onMouseOver={() => setTextOpen(true)}
          onMouseOut={() => setTextOpen(false)}
        >
          <Auth setIsAuth={setIsAuth} />
        </div>

        <CSSTransition
          in={textOpen === true}
          unmountOnExit
          timeout={500}
          classNames="emailLoginAni"
        >
          <div className="emailSlideText">
            <p>
              You can directly Sign in and Start Using the App via Your email
              Account
            </p>
          </div>
        </CSSTransition>
      </div>
    );
  };
  const chatJoinRequest = (roomName, userInfo) => {
    const newRequest = ref(db, `/chats/${roomName}/requests/${userInfo.uuid}`);
    set(newRequest, {
      userInfo: userInfo
    });
    setRefresher(v4());
  };
  const cancelRequest = (roomName, userInfo) => {
    const newRequest = ref(db, `chats/${roomName}/requests/${userInfo.uuid}`);
    remove(newRequest);
    setRefresher(v4());
  };
  const signOutUser = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    cookies.remove("user-email");
    cookies.remove("user");
    cookies.remove("current-user");
    setIsAuth(false);
    setIsMyAuth(false);
  };
  const handleSearch = () => {
    try {
      const query = searchQuery.toLowerCase();
      const chatSuggestions = avaChats.filter((room) => {
        const name = room.roomName.toLowerCase();
        return name.startsWith(query);
      });
      const allUsersSuggestions = allUsers.filter((user) => {
        const name = user.username.toLowerCase();
        return name.startsWith(query);
      });
      const usersSuggestions = allUsersSuggestions.filter((user) => {
        return user.uuid !== roomTest.uuid;
      });
      const suggestions = [...usersSuggestions, ...chatSuggestions];
      console.log(suggestions);
      if (suggestions[0] && query) {
        setChatSuggestion(suggestions);
      } else {
        setChatSuggestion(null);
      }
      console.log(chatSuggestion);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <>
      {isAuth || isMyAuth ? (
        <div>
          <div
            class="offcanvas offcanvas-start w-10"
            id="offcanvas"
            data-bs-keyboard="false"
          >
            <div class={`offcanvas-header ${lightDarkToggle ? "bg-dark text-white" : "bg-white text-dark" } `}>
              <h6 id="offcanvas" class="offcanvas-title">
                Your Chatrooms
              </h6>
              <Link
                to="/Newchatroom"
                onClick={() => {
                  setNewChatShow(v4());
                  setRoomName(null);
                }}
              >
                <button className="newChat">Create New Chat</button>
              </Link>

              <button
                class="btn-close"
                aria-label="Close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>
            <div class={`offcanvas-body ${lightDarkToggle ? "bg-dark text-white" : "bg-white text-dark" }`}>
              <div>
                {rooms ? (
                  <ul>
                    {rooms.map((room) => {
                      if (room.chat) {
                        const datavalue = Object.values(room.chat);
                        const final = datavalue.map((data) => {
                          return data;
                        });
                        const lastMsg = final.sort(
                          (a, b) => a.atimeStamp - b.atimeStamp
                        )[final.length - 1];
                        return (
                          <Link
                            to={`${room.roomName}`}
                            state={{ roomName: room }}
                            onClick={() => {
                              setRoomName("2");
                              setNewChatShow(null);
                            }}
                            data-bs-dismiss="offcanvas"
                          >
                            <li className="roomGroup">
                              <img
                                src={room.chatPhoto}
                                style={{
                                  padding: 5,
                                  width: 45,
                                  height: 45,
                                  borderRadius: 50,
                                }}
                              />
                              <span className={`recentMsg ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
                                <span>{room.roomName}</span>
                                <span className="latestMsg">
                                  {lastMsg.email}: {lastMsg.message}
                                </span>
                              </span>
                            </li>
                          </Link>
                        );
                      } else {
                        return (
                          <Link
                            to={`${room.roomName}`}
                            state={{ roomName: room }}
                            onClick={() => {
                              setRoomName("2");
                              setNewChatShow(null);
                            }}
                            data-bs-dismiss="offcanvas"
                          >
                            <li className="roomGroup">
                              <img
                                src={room.chatPhoto}
                                style={{
                                  padding: 5,
                                  width: 45,
                                  height: 45,
                                  borderRadius: 50,
                                }}
                              />
                              <span className={`recentMsg ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
                                <span>{room.roomName}</span>
                              </span>
                            </li>
                          </Link>
                        );
                      }
                    })}
                  </ul>
                ) : (
                  <div></div>
                )}
              </div>
              <div style={{ marginTop: -15 }}>
                {directMessage ? (
                  <ul>
                    {directMessage.map((dm) => {
                      if (dm.chat) {
                        const datavalue = Object.values(dm.chat);
                        let final = datavalue.map((msg) => {
                          return msg;
                        });
                        const lastMsg = final.sort(
                          (a, b) => a.atimeStamp - b.atimeStamp
                        )[final.length - 1];
                        let receiver = null;
                        dm.members.map((member) => {
                          if (member.uuid !== roomTest.uuid) {
                            console.log(member);
                            receiver = member;
                          }
                        });
                        return (
                          <Link
                            to={`${receiver.username}`}
                            state={{ DM: dm,receiver: receiver }}
                            onClick={() => {
                              setRoomName("1");
                              setNewChatShow(null);
                            }}
                            data-bs-dismiss="offcanvas"
                          >
                            <li className="roomGroup">
                              <img
                                src={receiver.photoURL}
                                style={{
                                  padding: 5,
                                  width: 45,
                                  height: 45,
                                  borderRadius: 50,
                                }}
                              />
                              <span className={`recentMsg ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
                                <span>{receiver.username}</span>
                                <span className="latestMsg">
                                  {lastMsg.email}: {lastMsg.message}
                                </span>
                              </span>
                            </li>
                          </Link>
                        );
                      } else {
                        let receiver = null;
                        dm.members.map((member) => {
                          if (member.uuid !== roomTest.uuid) {
                            console.log(member);
                            receiver = member;
                          }
                        });
                        console.log(receiver);
                        return (
                          <Link
                            to={`${receiver.username}`}
                            state={{ DM: dm,receiver: receiver }}
                            onClick={() => {
                              setRoomName("1");
                              setNewChatShow(null);
                            }}
                            data-bs-dismiss="offcanvas"
                          >
                            <li className="roomGroup">
                              <img
                                src={receiver.photoURL}
                                style={{
                                  padding: 5,
                                  width: 45,
                                  height: 45,
                                  borderRadius: 50,
                                }}
                              />
                              <span className={`recentMsg ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
                                <span>{receiver.username}</span>
                              </span>
                            </li>
                          </Link>
                        );
                      }
                    })}
                  </ul>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
          <div className={`TopBar ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
            <div className={`TopNavBar ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
              <div className="TopLeftBtn">
                <button
                  class="btn"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvas"
                >
                  <i class="fa-solid fa-bars" style={({backgroundColor: "white"})}></i>
                </button>
              </div>
              <div class="dropstart" className="TopRightBtn">
                {loggedUser || isMyAuth ? (
                  <a
                    class=" dropdown-toggle"
                    role="button"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                  >
                    <img
                      className="dropImg"
                      src={loggedUser ? loggedUser.photoURL : isMyAuth.photoURL}
                    />
                  </a>
                ) : (
                  <div></div>
                )}
                <ul class="dropdown-menu dropdown-menu-left">
                  <li class="dropdown-item" onClick={signOutUser}>
                    Log Out
                  </li>
                  <li
                    class="dropdown-item"
                  >
                    <div className={`modeToggle ${lightDarkToggle ? "BtnDark" : "BtnLight"}`}>
                      <button className={`ToggleBall ${lightDarkToggle ? "light" : "dark"}`} onClick={()=>setLightDarkToggle(!lightDarkToggle)}></button>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="TopSearchBar">
                <div className="searchBar">
                  <input
                    class="form-control"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%" }}
                  />

                  {chatSuggestion ? (
                    <div className="suggestion">
                      {chatSuggestion.map((room) => {
                        let isMember = null;
                        if (room.members) {
                          isMember = room.members.includes(roomTest.uuid);
                        }
                        let hasRequest = null;
                        if (room.requests) {
                          hasRequest = Object.hasOwn(
                            room.requests,
                            roomTest.uuid
                          );
                        }
                        let dmExists = null;
                        dmExists = directMessage.filter((dm) => {
                          if (
                            dm.members[0].uuid === room.uuid ||
                            dm.members[1].uuid === room.uuid
                          ) {
                            return dm;
                          }
                        });
                        console.log(dmExists);
                        return (
                          <div style={{ paddingTop: 7, paddingBottom: 7 }}>
                            {room.username ? (
                              <div>
                                <img
                                  src={room.photoURL}
                                  style={{
                                    padding: 5,
                                    width: 45,
                                    height: 45,
                                    borderRadius: 50,
                                  }}
                                />
                                {room.username}
                                {dmExists[0] ? null : (
                                  <span
                                    style={{ paddingLeft: 5, float: "right" }}
                                  >
                                    <button onClick={() => directMsgRoom(room)}>
                                      Message
                                    </button>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div>
                                <img
                                  src={room.chatPhoto}
                                  style={{
                                    padding: 5,
                                    width: 45,
                                    height: 45,
                                    borderRadius: 50,
                                  }}
                                />
                                {room.roomName}

                                {isMember ? null : (
                                  <span style={{ float: "right" }}>
                                    {room.requests ? (
                                      <span>
                                        {hasRequest ? (
                                          <span style={{ paddingLeft: 5 }}>
                                            <button
                                              class="btn btn-outline-secondary"
                                              disabled
                                            >
                                              Pending
                                            </button>
                                            <button
                                              class="btn btn-danger"
                                              onClick={() =>
                                                cancelRequest(
                                                  room.roomName,
                                                  roomTest
                                                )
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </span>
                                        ) : (
                                          <span style={{ paddingLeft: 5 }}>
                                            <button
                                              onClick={() =>
                                                chatJoinRequest(
                                                  room.roomName,
                                                  roomTest
                                                )
                                              }
                                            >
                                              Request
                                            </button>
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <span style={{ paddingLeft: 5 }}>
                                        <button
                                          onClick={() =>
                                            chatJoinRequest(
                                              room.roomName,
                                              roomTest
                                            )
                                          }
                                        >
                                          Request
                                        </button>
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div>
            {(roomName === null) & (newChatShow === null) ? (
              <div className={`welcomePage ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
                <div className={`welcomeMsg ${lightDarkToggle ? "overAllDark" : "overAllLight"}`}>
                  <h3>Start a new group or Find Groups to Join</h3>
                </div>
              </div>
            ) : (
              <div>
                <div className="chatCreate">
                  {roomName ? (
                    <Routes>
                      {roomName === "2" ? (
                        <Route
                          path=":name"
                          element={
                            <ChatRoom
                              isMyAuth={isMyAuth}
                              changeLatestMsg={setRefresher}
                              lightDarkToggle={lightDarkToggle}
                            />
                          }
                        />
                      ) : (
                        <Route
                          path=":username"
                          element={
                            <DirectMessage
                              isMyAuth={isMyAuth}
                              changeLatestMsg={setRefresher}
                              lightDarkToggle={lightDarkToggle}
                            />
                          }
                        />
                      )}
                    </Routes>
                  ) : (
                    <Routes>
                      <Route path="/Newchatroom" element={<NewChatRoom lightDarkToggle={lightDarkToggle}/>} />
                    </Routes>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div></div>
      )}
      <div>
        {isAuth || isMyAuth ? (
          <div></div>
        ) : (
          <div>
            <div className="GuestMainPage">
              <EmailSlide />
              <LoginSlide />
              <CreateAccSlide />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
