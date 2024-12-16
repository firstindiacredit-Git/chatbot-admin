import { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const loadMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(userId);
      setMessages(response.data);
    } catch (err) {
      setError("Error fetching messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;

    try {
      const formData = new FormData();
      formData.append("senderId", adminId);
      formData.append("receiverId", selectedUser);
      formData.append("content", message);
      if (file) formData.append("attachment", file);

      const response = await axios.post("http://localhost:5000/api/message", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prevMessages) => [...prevMessages, response.data.message]);
      setMessage("");
      setFile(null);
    } catch (err) {
      setError("Error sending message");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Users</h2>
        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {users.map((user) => (
          <div
            key={user._id}
            className={`p-2 mb-2 bg-white cursor-pointer rounded ${
              selectedUser === user._id ? "bg-blue-100" : ""
            }`}
            onClick={() => loadMessages(user._id)}
          >
            {user.name}
          </div>
        ))}
      </aside>

      {/* Main Chat Area */}
      <main className="w-3/4 p-4 flex flex-col">
        {selectedUser ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4">
              {messages.map((msg, index) => (
                <div key={index} className="my-2">
                  <div
                    className={`p-2 rounded ${
                      msg.senderId === adminId
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.attachment && (
                    <a
                      href={`http://localhost:5000${msg.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      View Attachment
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Send Message */}
            <div className="flex flex-col">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 mb-2"
                placeholder="Type your message here..."
              ></textarea>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-2"
              />

              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a user to view and send messages</p>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;






































// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import moment from 'moment';
// import { FaPaperclip, FaPaperPlane, FaSignOutAlt } from 'react-icons/fa';

// const AdminPanel = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
//   const token = localStorage.getItem("token");

//   const socketRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const formatTime = (timestamp) => moment(timestamp).format('h:mm A');

//   useEffect(() => {
//     socketRef.current = io("http://localhost:5000");
//     socketRef.current.emit('register', adminId);

//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get("http://localhost:5000/api/admin/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(response.data);
//       } catch (err) {
//         setError("Failed to fetch users");
//         console.error("Users fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();

//     socketRef.current.on("receive_message", (newMessage) => {
//       if (
//         newMessage.senderId === selectedUser ||
//         newMessage.receiverId === selectedUser
//       ) {
//         setMessages((prevMessages) => {
//           if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
//             return [...prevMessages, newMessage];
//           }
//           return prevMessages;
//         });
//         scrollToBottom();
//       }
//     });

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, [token, selectedUser]);

//   const loadMessages = async (userId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `http://localhost:5000/api/messages/${userId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSelectedUser(userId);
//       setMessages(response.data);
//       scrollToBottom();
//     } catch (err) {
//       setError("Failed to load messages");
//       console.error("Messages load error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);

//     if (selectedFile) {
//       const reader = new FileReader();
//       reader.onload = () => setPreview(reader.result);
//       reader.readAsDataURL(selectedFile);
//     } else {
//       setPreview(null);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!selectedUser) {
//       setError("Please select a user first");
//       return;
//     }

//     if (!message.trim() && !file) {
//       setError("Message or file is required");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("senderId", adminId);
//       formData.append("receiverId", selectedUser);
//       formData.append("content", message);
//       if (file) formData.append("attachment", file);

//       const response = await axios.post("http://localhost:5000/api/message", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       const newMessage = response.data.message;

//       socketRef.current.emit("send_message", {
//         senderId: adminId,
//         receiverId: selectedUser,
//         content: newMessage.content,
//         attachment: newMessage.attachment,
//       });

//       setMessages((prevMessages) => {
//         if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
//           return [...prevMessages, newMessage];
//         }
//         return prevMessages;
//       });
//       scrollToBottom();

//       setMessage("");
//       setFile(null);
//       setPreview(null);
//       setError(null);
//     } catch (err) {
//       setError("Failed to send message");
//       console.error("Message send error:", err);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/AdminLogin"; // Modify to match your login route
//   };

//   return (
//     <div className="flex h-screen">
//       <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto flex flex-col h-full">
//         <h2 className="text-lg font-bold mb-4">Users</h2>
//         {loading && <p>Loading users...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         {users.map((user) => (
//           <div
//             key={user._id}
//             className={`p-2 mb-2 bg-white cursor-pointer rounded ${
//               selectedUser === user._id ? "bg-blue-100" : ""
//             }`}
//             onClick={() => loadMessages(user._id)}
//           >
//             {user.name}
//           </div>
//         ))}
//         <div className="mt-auto">
//           <button
//             onClick={handleLogout}
//             className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 flex items-center justify-center"
//           >
//             <FaSignOutAlt className="mr-2" />
//             Logout
//           </button>
//         </div>
//       </aside>

//       <main className="w-3/4 p-4 flex flex-col">
//         {selectedUser ? (
//           <>
//             <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4">
//               {loading ? (
//                 <p>Loading messages...</p>
//               ) : (
//                 messages.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`flex ${
//                       msg.senderId === adminId
//                         ? "justify-end"
//                         : "justify-start"
//                     } mb-2`}
//                   >
//                     <div className="flex flex-col">
//                       <div
//                         className={`max-w-[100%] p-2 rounded ${
//                           msg.senderId === adminId
//                             ? "bg-blue-500 text-white"
//                             : "bg-gray-200 text-black"
//                         }`}
//                       >
//                         {msg.content}
//                         <img src={`http://localhost:5000${msg.attachment}`} alt="" className="max-w-[200px] h-auto rounded-md" />
//                         {/* {msg.attachment && (
//                           <div className="mt-2">
//                             <a
//                               href={`http://localhost:5000${msg.attachment}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-200 underline"
//                             >
//                               View Attachment
//                             </a>
//                           </div>
//                         )} */}
//                       </div>
//                       <div
//                         className={`text-xs mt-1 ${
//                           msg.senderId === adminId ? "text-right" : "text-left"
//                         }`}
//                       >
//                         {formatTime(msg.createdAt)}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="send-message flex items-center gap-2">
//               <textarea
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="flex-grow border border-gray-300 rounded p-2"
//                 placeholder="Type your message here..."
//                 rows={1}
//               />
//               <input
//                 type="file"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="fileInput"
//               />
//               <label
//                 htmlFor="fileInput"
//                 className="cursor-pointer flex-shrink-0 text-gray-700 hover:text-blue-600"
//               >
//                 <FaPaperclip size={20} />
//               </label>
//               <button
//                 onClick={handleSendMessage}
//                 disabled={loading || !selectedUser}
//                 className={`flex-shrink-0 bg-blue-500 text-white p-2 rounded ${
//                   loading || !selectedUser
//                     ? "opacity-50 cursor-not-allowed"
//                     : "hover:bg-blue-600"
//                 }`}
//               >
//                 <FaPaperPlane size={20} />
//               </button>
//             </div>
//           </>
//         ) : (
//           <p className="text-center text-gray-500">Select a user to start chatting</p>
//         )}
//       </main>
//     </div>
//   );
// };

// export default AdminPanel;







// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import moment from 'moment';
// import { FaPaperclip, FaPaperPlane, FaSignOutAlt } from 'react-icons/fa';

// const AdminPanel = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
//   const token = localStorage.getItem("token");

//   const socketRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const formatTime = (timestamp) => moment(timestamp).format('h:mm A');

//   useEffect(() => {
//     socketRef.current = io("http://localhost:5000");
//     socketRef.current.emit('register', adminId);

//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get("http://localhost:5000/api/admin/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(response.data);
//       } catch (err) {
//         setError("Failed to fetch users");
//         console.error("Users fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();

//     socketRef.current.on("receive_message", (newMessage) => {
//       if (
//         (newMessage.senderId === selectedUser && newMessage.receiverId === adminId) ||
//         (newMessage.receiverId === selectedUser && newMessage.senderId === adminId)
//       ) {
//         setMessages((prevMessages) => {
//           if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
//             return [...prevMessages, newMessage];
//           }
//           return prevMessages;
//         });
//       }
//       scrollToBottom();
//     });
    

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [token, selectedUser]);

//   const loadMessages = async (userId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSelectedUser(userId);
//       const uniqueMessages = response.data.filter(
//         (msg, index, self) => self.findIndex((m) => m._id === msg._id) === index
//       );
//       setMessages(uniqueMessages);
//       scrollToBottom();
//     } catch (err) {
//       setError("Failed to load messages");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//   };

//   const handleSendMessage = async () => {
//     if (!selectedUser) {
//       setError("Please select a user first");
//       return;
//     }

//     if (!message.trim() && !file) {
//       setError("Message or file is required");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("senderId", adminId);
//       formData.append("receiverId", selectedUser);
//       formData.append("content", message);
//       if (file) formData.append("attachment", file);

//       const response = await axios.post("http://localhost:5000/api/message", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       const newMessage = response.data.message;

//       // Emit message via socket only after saving
//       socketRef.current.emit("send_message", {
//         senderId: adminId,
//         receiverId: selectedUser,
//         content: newMessage.content,
//         attachment: newMessage.attachment,
//       });

//       // Update local messages
//       setMessages((prevMessages) => {
//         if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
//           return [...prevMessages, newMessage];
//         }
//         return prevMessages;
//       });
//       scrollToBottom();

//       // Reset form
//       setMessage("");
//       setFile(null);
//       setError(null);
//     } catch (err) {
//       setError("Failed to send message");
//       console.error("Message send error:", err);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/";  // Modify to match your login route
//   };

//   return (
//     <div className="flex h-screen">
//       <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
//         <h2 className="text-lg font-bold mb-4">Users</h2>
//         {loading && <p>Loading users...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         {users.map((user) => (
//           <div
//             key={user._id}
//             className={`p-2 mb-2 bg-white cursor-pointer rounded ${selectedUser === user._id ? "bg-blue-100" : ""
//               }`}
//             onClick={() => loadMessages(user._id)}
//           >
//             {user.name}
//           </div>
//         ))}
//         <div className="mt-4">
//           <button
//             onClick={handleLogout}
//             className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 flex items-center justify-center"
//           >
//             <FaSignOutAlt className="mr-2" />
//             Logout
//           </button>
//         </div>
//       </aside>

//       <main className="w-3/4 p-4 flex flex-col">
//         {selectedUser ? (
//           <>
//             <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4">
//               {loading ? (
//                 <p>Loading messages...</p>
//               ) : (
//                 messages.map((msg) => (
//                   <div key={msg._id} className={`flex ${msg.senderId === adminId ? 'justify-end' : 'justify-start'} mb-2`}>
//                     <div className="flex flex-col">
//                       <div className={`max-w-[70%] p-2 rounded ${msg.senderId === adminId ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
//                         {msg.content}
//                         {msg.attachment && (
//                           <div className="mt-2">
//                             <a href={`http://localhost:5000${msg.attachment}`} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline">
//                               View Attachment
//                             </a>
//                           </div>
//                         )}
//                       </div>
//                       <div className={`text-xs mt-1 ${msg.senderId === adminId ? 'text-right' : 'text-left'}`}>
//                         {formatTime(msg.createdAt)}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="send-message flex items-center gap-2">
//               <textarea
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="flex-grow border border-gray-300 rounded p-2"
//                 placeholder="Type your message here..."
//                 rows={1}
//               />
//               <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" />
//               <label htmlFor="fileInput" className="cursor-pointer flex-shrink-0 text-gray-700 hover:text-blue-600">
//                 <FaPaperclip size={20} />
//               </label>
//               <button
//                 onClick={handleSendMessage}
//                 disabled={loading || !selectedUser}
//                 className={`flex-shrink-0 bg-blue-500 text-white p-2 rounded ${loading || !selectedUser ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
//               >
//                 <FaPaperPlane size={20} />
//               </button>
//             </div>
//           </>
//         ) : (
//           <p className="text-center text-gray-500">Select a user to start chatting</p>
//         )}
//       </main>
//     </div>
//   );
// };

// export default AdminPanel;