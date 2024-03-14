import { ref, get, set, onValue, update } from "firebase/database";
import { ref as sref } from "firebase/storage";
import { db, auth, storage } from "../libs/realtime_database";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { v4 } from "uuid";
import Cookies from "universal-cookie";
import { uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { memo } from "react";
import EmojiPicker from "emoji-picker-react";
import { useRef } from "react";
const cookies = new Cookies();

export const DirectMessage = (props) => {
  const location = useLocation();
  const {DM,receiver} = location.state;
  const [currChats, setCurrChats] = useState();
  const [currUser, setCurrUser] = useState();
  const [sendMessage, setSendMessage] = useState(null);
  const [realTimeImg, setRealTimeImg] = useState(null);
  const [newMessage,setNewMessage] = useState('');
  const [msgImage,setMsgImage] = useState(null);
  const [emojiPickerShower,setEmojiPickerShower] = useState(false);
  const uuid = v4();
  const { isMyAuth,changeLatestMsg } = props;
  const [realUser,setRealUser] = useState(null);
  const [realUserProfile,setRealUserProfile] = useState(null);
  const dummy = useRef();
  const roomName = DM.members[0].uuid + ':' + DM.members[1].uuid;
  const chatRef = ref(db, `DMs/${roomName}/chat/${uuid}`);
  const getImgRef = sref(
    storage,
    `chats/${roomName}/chat/${uuid}/${msgImage}`
  );
  const currTime = new Date();
  useEffect(() => {
    console.log(roomName);
    getAllMessages();
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
          image: realTimeImg,
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
      setNewMessage('');
      dummy.current.scrollIntoView({ behavior : 'smooth'});
      changeLatestMsg(v4());
    }
    console.log("Test3");
  }, [realTimeImg]);

  const onEmojiClick = (emojiObject) =>{
    const newString = newMessage + emojiObject.emoji;
    console.log(newString);
    setNewMessage(newString);
    setEmojiPickerShower(!emojiPickerShower);
  }
  const addNewMessage = async (e) => {
    e.preventDefault();

    await uploadBytes(getImgRef, msgImage);
    const realtimeImageURL = await getDownloadURL(getImgRef);
    setRealTimeImg(realtimeImageURL);
    setSendMessage(v4());
  };
  const getAllMessages = () => {
    const msgRef = ref(db, `DMs/${roomName}/chat`);
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
        <div className="chatroomNavName">{receiver.username}</div>
      </div>
      <div className="chatspace">
        <div className="msgArea">
          {currChats 
          ? <div>
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
          : <div></div>}
          {emojiPickerShower ? (
            <div className="emojiPicker">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          ) : null}
          <div ref={dummy}></div>
        </div>
        <div className="inputBox">
        <form onSubmit={addNewMessage} className="inputOverallForm">
          <span className="inputForm">
          <input
            className="textInput"
            type="text"
            maxLength={230}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              console.log(newMessage);
            }}
          />
          <input
              id="actual-file"
              type="file"
              onChange={(e) => {
                setMsgImage(e.target.files[0]);
              }}
              hidden
            />
          <label for="actual-file" class="insideInputIcon">
          <i class="fa-solid fa-circle-plus"></i>
          </label>
          <span className="emojiControl" onClick={()=>setEmojiPickerShower(!emojiPickerShower)}>
          <i class="fa-solid fa-face-smile"></i>
          </span>
            </span>
          <span className="iconInput">
            
            
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
          </span>
        </form>
      </div>
      </div>
    </div>
  );
};
