// import { useEffect, useState } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import moment from 'moment';
// import { FaPaperclip, FaPaperPlane, FaSignOutAlt,FaTimes } from 'react-icons/fa';
// import logoimage from '../assets/pizeonfly.png';

// const AdminPanel = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userMessages, setUserMessages] = useState({});
//   const [message, setMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState({});



//   const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
//   const token = localStorage.getItem("token");

//   const formatTime = (timestamp) => moment(timestamp).format('h:mm A');

//   useEffect(() => {
//     // Initialize the socket connection
//     const newSocket = io("http://localhost:5000");
//     setSocket(newSocket);

//     // Join admin's room
//     newSocket.emit('join_room', adminId);

//     // Fetch users on mount
//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get("http://localhost:5000/api/admin/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(response.data);
//       } catch (err) {
//         setError("Error fetching users");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();

//     // Listen for incoming messages
//     newSocket.on('receive_message', (newMessage) => {
//       // Update messages for the sender
//       setUserMessages(prevMessages => {
//         const senderId = newMessage.senderId;
//         const currentMessages = prevMessages[senderId] || [];

//         // Avoid duplicates
//         const isDuplicate = currentMessages.some(msg =>
//           msg._id === newMessage._id
//         );

//         if (isDuplicate) return prevMessages;

//         return {
//           ...prevMessages,
//           [senderId]: [...currentMessages, newMessage]
//         };
//       });
//     });

//     // Cleanup socket connection on unmount
//     return () => {
//       newSocket.disconnect();
//     };
//   }, [token]);

//   useEffect(() => {
//     if (!selectedUser) return;

//     // Fetch messages for the selected user
//     const fetchMessages = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`http://localhost:5000/api/messages/${selectedUser}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         // Store messages keyed by user ID
//         setUserMessages(prev => ({
//           ...prev,
//           [selectedUser]: response.data
//         }));
//       } catch (err) {
//         setError("Error fetching messages");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [selectedUser, token]);


//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return; // Avoid errors for no file selection

//     setFile(selectedFile);

//     // Generate a preview for supported file types
//     if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
//       setFilePreview(URL.createObjectURL(selectedFile));
//     } else if (selectedFile.type === "application/pdf") {
//       setFilePreview("PDF File Selected");
//     } else {
//       setFilePreview("Unsupported File Type");
//     }

//     // Open the modal
//     setIsModalOpen(true);
//   };




//   const handleSendMessage = async () => {
//     if (!message.trim() && !file) return;

//     try {
//       const formData = new FormData();
//       formData.append("senderId", adminId);
//       formData.append("receiverId", selectedUser);
//       formData.append("content", message);
//       if (file) formData.append("attachment", file);

//       const response = await axios.post("http://localhost:5000/api/message", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data'
//         },
//       });

//       const newMessage = response.data.message;

//       // Emit the message via socket
//       socket.emit("send_message", newMessage);

//       // Update messages for the selected user
//       setUserMessages(prevMessages => {
//         const currentMessages = prevMessages[selectedUser] || [];
//         return {
//           ...prevMessages,
//           [selectedUser]: [...currentMessages, newMessage]
//         };
//       });

//       setMessage("");
//       setFile(null);
//     } catch (err) {
//       setError("Error sending message");
//       console.error(err.response?.data || err);
//     }
//   };


//   const closeModal = () => {
//     setFile(null);
//     setFilePreview(null);
//     setIsModalOpen(false);
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



//   // Get messages for the currently selected user
//   const currentMessages = selectedUser ? userMessages[selectedUser] || [] : [];

//   return (
//     <div className="flex h-screen">

//       {/* Header */}
//       <header className="fixed top-0 left-0 w-full bg-white-500 text-black flex items-center justify-between p-4 z-10 shadow-md">
//         <div className="flex items-center gap-4">
//           {/* Logo */}
//           <img
//             src={logoimage} // Update with your logo path
//             alt="Logo"
//             className="h-10 w-10 rounded-full"
//           />
//           <div className="text-xl font-bold">Admin Panel</div>
//         </div>
//         <div>
//           {selectedUser ? (
//             <span className="text-2xl">
//               {users.find((u) => u._id === selectedUser)?.name || "User"}
//             </span>
//           ) : (
//             <span className="text-2xl">Select a user</span>
//           )}
//         </div>
//         <button
//           onClick={handleLogout}
//           className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
//         >
//           Logout
//         </button>
//       </header>

//       {/* Sidebar */}
//       <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto mt-20">
//         <h2 className="text-lg font-bold mb-4">Users</h2>
//         {loading && <p>Loading users...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         {users.map((user) => (
//           <div
//             key={user._id}
//             className={`p-2 mb-2 bg-white cursor-pointer rounded ${selectedUser === user._id ? "bg-gray-300" : ""
//               }`}
//             onClick={() => setSelectedUser(user._id)}
//           >
//             <p>{user.name}</p>
//             {user.phone}
//           </div>
//         ))}
//         {/* <div className="mt-4">
//           <button
//              onClick={handleLogout}
//              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 flex items-center justify-center"
//            >
//             <FaSignOutAlt className="mr-2" />
//             Logout
//           </button>
//         </div> */}
//       </aside>

//       {/* Main Chat Area */}
//       <main className="w-3/4 p-4 flex flex-col mt-16">
//         {selectedUser ? (
//           <>
//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 break-words">
//               {currentMessages.map((msg, index) => (
//                 <div key={index} className={`flex ${msg.senderId === adminId ? 'justify-end' : 'justify-start'} mb-2`}>
//                   <div className="flex flex-col">
//                     <div
//                       className={`p-2 rounded-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg break-words relative ${msg.senderId === adminId
//                         ? "bg-blue-500 text-white self-end"
//                         : "bg-gray-200"
//                         }`}
//                     >
//                       {msg.content && <p>{msg.content}</p>}
//                       {msg.attachment && (
//                         <>
//                           {msg.attachment.endsWith(".jpg") ||
//                             msg.attachment.endsWith(".jpeg") ||
//                             msg.attachment.endsWith(".png") ||
//                             msg.attachment.endsWith(".gif") ? (
//                             <img
//                               src={`http://localhost:5000${msg.attachment}`}
//                               alt="attachment"
//                               className="max-w-full h-auto rounded-md mt-2"
//                             />
//                           ) : msg.attachment.endsWith(".mp4") ||
//                             msg.attachment.endsWith(".webm") ||
//                             msg.attachment.endsWith(".ogg") ? (
//                             <video
//                               src={`http://localhost:5000${msg.attachment}`}
//                               controls
//                               className="max-w-full h-auto rounded-md mt-2"
//                             />
//                           ) : msg.attachment.endsWith(".pdf") ? (
//                             <a
//                               href={`http://localhost:5000${msg.attachment}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-white-500 underline mt-2"
//                             >
//                               View PDF
//                             </a>
//                           ) : (
//                             <p className="text-gray-500 mt-2">Unsupported file type</p>
//                           )}
//                         </>
//                       )}

//                     </div>
//                     <div className={`text-xs mt-1 ${msg.senderId === adminId ? 'text-right' : 'text-left'}`}>
//                       {formatTime(msg.createdAt)}
//                     </div>
//                   </div>

//                 </div>
//               ))}
//             </div>

//             {/* Send Message */}
//             <div className="flex items-center gap-2">
//               <textarea
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="w-full flex-grow border border-gray-300 rounded p-2 mb-2"
//                 placeholder="Type your message here..."
//               ></textarea>

//               <input
//                 type="file"
//                 // onChange={(e) => setFile(e.target.files[0])}
//                 onChange={handleFileChange}
//                 className="mb-2 hidden"
//                 id="fileInput"
//               />
//               <label htmlFor="fileInput" className="cursor-pointer flex-shrink-0 text-gray-700 hover:text-blue-600">
//                 <FaPaperclip size={20} />
//               </label>

//               <button
//                 onClick={handleSendMessage}
//                 className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//               >
//                 <FaPaperPlane size={20} />
//               </button>
//             </div>
//           </>
//         ) : (
//           <p>Select a user to view and send messages</p>
//         )}
//       </main>

//       {isModalOpen && file && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//     <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-80">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">Preview Attachment</h2>
//         <button onClick={closeModal} className="text-gray-500 hover:text-red-500">
//           <FaTimes size={20} />
//         </button>
//       </div>
//       <div className="file-preview mb-4">
//         {file.type.startsWith("image/") && (
//           <img src={filePreview} alt="Preview" className="max-w-full h-80 rounded-md" />
//         )}
//         {file.type.startsWith("video/") && (
//           <video src={filePreview} controls className="max-w-full h-80 rounded-md" />
//         )}
//         {file.type === "application/pdf" && <p>PDF File Selected</p>}
//         {!file.type.startsWith("image/") &&
//           !file.type.startsWith("video/") &&
//           file.type !== "application/pdf" && (
//             <p className="text-red-500">Unsupported File Type</p>
//           )}
//       </div>
//       <div className="flex justify-start gap-2">
//         <button
//           onClick={closeModal}
//           className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleSendMessage}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   </div>
// )}


//     </div>
//   );
// };

// export default AdminPanel;


// import { useEffect, useState } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import moment from 'moment';
// import { FaPaperclip, FaPaperPlane, FaSignOutAlt, FaTimes } from 'react-icons/fa';
// import logoimage from '../assets/pizeonfly.png';

// const AdminPanel = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userMessages, setUserMessages] = useState({});
//   const [message, setMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState({});

//   const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
//   const token = localStorage.getItem("token");

//   const formatTime = (timestamp) => moment(timestamp).format('h:mm A');

//   useEffect(() => {
//     const newSocket = io("http://localhost:5000");
//     setSocket(newSocket);

//     newSocket.emit('join_room', adminId);

//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get("http://localhost:5000/api/admin/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(response.data);
//       } catch (err) {
//         setError("Error fetching users");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();

//     newSocket.on('receive_message', (newMessage) => {
//       const senderId = newMessage.senderId;

//       if (senderId !== selectedUser) {
//         setUnreadCounts((prevCounts) => ({
//           ...prevCounts,
//           [senderId]: (prevCounts[senderId] || 0) + 1,
//         }));
//       }

//       setUserMessages((prevMessages) => {
//         const currentMessages = prevMessages[senderId] || [];
//         return {
//           ...prevMessages,
//           [senderId]: [...currentMessages, newMessage],
//         };
//       });
//     });

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [token, selectedUser]);

//   useEffect(() => {
//     if (!selectedUser) return;

//     const fetchMessages = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`http://localhost:5000/api/messages/${selectedUser}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setUserMessages((prev) => ({
//           ...prev,
//           [selectedUser]: response.data,
//         }));

//         setUnreadCounts((prevCounts) => {
//           const updatedCounts = { ...prevCounts };
//           delete updatedCounts[selectedUser];
//           return updatedCounts;
//         });
//       } catch (err) {
//         setError("Error fetching messages");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [selectedUser, token]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);

//     if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
//       setFilePreview(URL.createObjectURL(selectedFile));
//     } else if (selectedFile.type === "application/pdf") {
//       setFilePreview("PDF File Selected");
//     } else {
//       setFilePreview("Unsupported File Type");
//     }

//     setIsModalOpen(true);
//   };

//   const handleSendMessage = async () => {
//     if (!message.trim() && !file) return;

//     try {
//       const formData = new FormData();
//       formData.append("senderId", adminId);
//       formData.append("receiverId", selectedUser);
//       formData.append("content", message);
//       if (file) formData.append("attachment", file);

//       const response = await axios.post("http://localhost:5000/api/message", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const newMessage = response.data.message;

//       socket.emit("send_message", newMessage);

//       setUserMessages((prevMessages) => {
//         const currentMessages = prevMessages[selectedUser] || [];
//         return {
//           ...prevMessages,
//           [selectedUser]: [...currentMessages, newMessage],
//         };
//       });

//       setUnreadCounts((prevCounts) => {
//         const updatedCounts = { ...prevCounts };
//         delete updatedCounts[selectedUser];
//         return updatedCounts;
//       });

//       setMessage("");
//       setFile(null);
//     } catch (err) {
//       setError("Error sending message");
//       console.error(err.response?.data || err);
//     }
//   };

//   const closeModal = () => {
//     setFile(null);
//     setFilePreview(null);
//     setIsModalOpen(false);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/";
//   };

//   const handleUserSelect = (userId) => {
//     setSelectedUser(userId);
//     setUnreadCounts((prevCounts) => {
//       const updatedCounts = { ...prevCounts };
//       delete updatedCounts[userId];
//       return updatedCounts;
//     });
//   };

//   const currentMessages = selectedUser ? userMessages[selectedUser] || [] : [];

//   return (
//     <div className="flex h-screen">
//       <header className="fixed top-0 left-0 w-full bg-white-500 text-black flex items-center justify-between p-4 z-10 shadow-md">
//         <div className="flex items-center gap-4">
//           <img src={logoimage} alt="Logo" className="h-10 w-10 rounded-full" />
//           <div className="text-xl font-bold">Admin Panel</div>
//         </div>
//         <div>
//           {selectedUser ? (
//             <span className="text-2xl">
//               {users.find((u) => u._id === selectedUser)?.name || "User"}
//             </span>
//           ) : (
//             <span className="text-2xl">Select a user</span>
//           )}
//         </div>
//         <button
//           onClick={handleLogout}
//           className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
//         >
//           Logout
//         </button>
//       </header>

//       <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto mt-20">
//         <h2 className="text-lg font-bold mb-4">Users</h2>
//         {loading && <p>Loading users...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         {users.map((user) => (
//           <div
//             key={user._id}
//             className={`p-2 mb-2 bg-white cursor-pointer rounded ${selectedUser === user._id ? "bg-gray-300" : ""}`}
//             onClick={() => handleUserSelect(user._id)}
//           >
//             <p>{user.name}</p>
//             {user.phone}
//             {unreadCounts[user._id] > 0 && (
//               <span className="ml-2 text-red-500 font-bold">({unreadCounts[user._id]})</span>
//             )}
//           </div>
//         ))}
//       </aside>

//       <main className="w-3/4 p-4 flex flex-col mt-16">
//         {selectedUser ? (
//           <>
//             <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 break-words">
//               {currentMessages.map((msg, index) => (
//                 <div key={index} className={`flex ${msg.senderId === adminId ? 'justify-end' : 'justify-start'} mb-2`}>
//                   <div className="flex flex-col">
//                     <div
//                       className={`p-2 rounded-lg max-w-lg break-words relative ${msg.senderId === adminId
//                         ? "bg-blue-500 text-white self-end"
//                         : "bg-gray-200"}`}
//                     >
//                       {msg.content && <p>{msg.content}</p>}
//                       {msg.attachment && (
//                         <>
//                           {msg.attachment.endsWith(".jpg") ||
//                           msg.attachment.endsWith(".jpeg") ||
//                           msg.attachment.endsWith(".png") ||
//                           msg.attachment.endsWith(".gif") ? (
//                             <img
//                               src={`http://localhost:5000${msg.attachment}`}
//                               alt="attachment"
//                               className="max-w-full h-auto rounded-md mt-2"
//                             />
//                           ) : msg.attachment.endsWith(".mp4") ||
//                             msg.attachment.endsWith(".webm") ||
//                             msg.attachment.endsWith(".ogg") ? (
//                             <video
//                               src={`http://localhost:5000${msg.attachment}`}
//                               controls
//                               className="max-w-full h-auto rounded-md mt-2"
//                             />
//                           ) : (
//                             <a
//                               href={`http://localhost:5000${msg.attachment}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-500 underline mt-2"
//                             >
//                               Download Attachment
//                             </a>
//                           )}
//                         </>
//                       )}
//                     </div>
//                     <span className="text-xs text-gray-500 mt-1">
//                       {formatTime(msg.timestamp)}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="flex items-center gap-4">
//               <textarea
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder="Type your message..."
//                 className="flex-1 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring"
//               ></textarea>
//               <label className="cursor-pointer">
//                 <FaPaperclip className="text-gray-500" size={24} />
//                 <input
//                   type="file"
//                   className="hidden"
//                   onChange={handleFileChange}
//                 />
//               </label>
//               <button
//                 onClick={handleSendMessage}
//                 className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//               >
//                 <FaPaperPlane size={20} />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="text-center text-gray-500">
//             <p>Select a user to start a conversation</p>
//           </div>
//         )}
//       </main>

//       {isModalOpen && file && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//     <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-80">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold">Preview Attachment</h2>
//         <button onClick={closeModal} className="text-gray-500 hover:text-red-500">
//           <FaTimes size={20} />
//         </button>
//       </div>
//       <div className="file-preview mb-4">
//         {file.type.startsWith("image/") && (
//           <img src={filePreview} alt="Preview" className="max-w-full h-80 rounded-md" />
//         )}
//         {file.type.startsWith("video/") && (
//           <video src={filePreview} controls className="max-w-full h-80 rounded-md" />
//         )}
//         {file.type === "application/pdf" && <p>PDF File Selected</p>}
//         {!file.type.startsWith("image/") &&
//           !file.type.startsWith("video/") &&
//           file.type !== "application/pdf" && (
//             <p className="text-red-500">Unsupported File Type</p>
//           )}
//       </div>
//       <div className="flex justify-start gap-2">
//         <button
//           onClick={closeModal}
//           className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleSendMessage}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default AdminPanel;





// import { useEffect, useState } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import moment from 'moment';
// import { FaEllipsisV, FaPaperclip, FaPaperPlane, FaSignOutAlt, FaTimes } from 'react-icons/fa';
// import logoimage from '../assets/pizeonfly.png';

// const AdminPanel = () => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userMessages, setUserMessages] = useState({});
//   const [message, setMessage] = useState("");
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState({});
//   const [showUnread, setShowUnread] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
//   const token = localStorage.getItem("token");

//   const formatTime = (timestamp) => moment(timestamp).format('h:mm A');

//   useEffect(() => {
//     const newSocket = io("http://localhost:5000");
//     setSocket(newSocket);

//     newSocket.emit('join_room', adminId);

//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get("http://localhost:5000/api/admin/users", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUsers(response.data);
//       } catch (err) {
//         setError("Error fetching users");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();

//     newSocket.on('receive_message', (newMessage) => {
//       const senderId = newMessage.senderId;

//       if (senderId !== selectedUser) {
//         setUnreadCounts((prevCounts) => ({
//           ...prevCounts,
//           [senderId]: (prevCounts[senderId] || 0) + 1,
//         }));
//       }

//       setUserMessages((prevMessages) => {
//         const currentMessages = prevMessages[senderId] || [];
//         return {
//           ...prevMessages,
//           [senderId]: [...currentMessages, newMessage],
//         };
//       });
//     });

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [token, selectedUser]);

//   useEffect(() => {
//     if (!selectedUser) return;

//     const fetchMessages = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`http://localhost:5000/api/messages/${selectedUser}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setUserMessages((prev) => ({
//           ...prev,
//           [selectedUser]: response.data,
//         }));

//         setUnreadCounts((prevCounts) => {
//           const updatedCounts = { ...prevCounts };
//           delete updatedCounts[selectedUser];
//           return updatedCounts;
//         });
//       } catch (err) {
//         setError("Error fetching messages");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [selectedUser, token]);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);

//     if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
//       setFilePreview(URL.createObjectURL(selectedFile));
//     } else if (selectedFile.type === "application/pdf") {
//       setFilePreview("PDF File Selected");
//     } else {
//       setFilePreview("Unsupported File Type");
//     }

//     setIsModalOpen(true);
//   };

//   const handleSendMessage = async () => {
//     if (!message.trim() && !file) return;

//     try {
//       const formData = new FormData();
//       formData.append("senderId", adminId);
//       formData.append("receiverId", selectedUser);
//       formData.append("content", message);
//       if (file) formData.append("attachment", file);

//       const response = await axios.post("http://localhost:5000/api/message", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const newMessage = response.data.message;

//       socket.emit("send_message", newMessage);

//       setUserMessages((prevMessages) => {
//         const currentMessages = prevMessages[selectedUser] || [];
//         return {
//           ...prevMessages,
//           [selectedUser]: [...currentMessages, newMessage],
//         };
//       });

//       setUnreadCounts((prevCounts) => {
//         const updatedCounts = { ...prevCounts };
//         delete updatedCounts[selectedUser];
//         return updatedCounts;
//       });

//       setMessage("");
//       setFile(null);
//     } catch (err) {
//       setError("Error sending message");
//       console.error(err.response?.data || err);
//     }
//   };

//   const closeModal = () => {
//     setFile(null);
//     setFilePreview(null);
//     setIsModalOpen(false);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/";
//   };

//   const handleUserSelect = (userId) => {
//     setSelectedUser(userId);
//     setUnreadCounts((prevCounts) => {
//       const updatedCounts = { ...prevCounts };
//       delete updatedCounts[userId];
//       return updatedCounts;
//     });
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const filteredUsers = users.filter((user) => {
//     if (showUnread && !unreadCounts[user._id]) {
//       return false;
//     }

//     if (searchTerm.trim()) {
//       return user.name.toLowerCase().includes(searchTerm.toLowerCase());
//     }

//     return true;
//   });

//   const currentMessages = selectedUser ? userMessages[selectedUser] || [] : [];

//   return (
//     <div className="flex h-screen">
//       <header className="fixed top-0 left-0 w-full bg-white-500 text-black flex items-center justify-between p-4 z-10 shadow-md">
//         <div className="flex items-center gap-4">
//           <img src={logoimage} alt="Logo" className="h-10 w-10 rounded-full" />
//           <div className="text-xl font-bold">Admin Panel</div>
//         </div>
//         <div>
//           {selectedUser ? (
//             <span className="text-2xl">
//               {users.find((u) => u._id === selectedUser)?.name || "User"}
//             </span>
//           ) : (
//             <span className="text-2xl">Select a user</span>
//           )}
//         </div>
//         <button
//           onClick={handleLogout}
//           className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
//         >
//           Logout
//         </button>
//       </header>

//       <aside className="w-1/4 bg-gray-200 p-4 overflow-y-auto mt-20 relative">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-bold">Users</h2>
//           <div className="relative">
//             <FaEllipsisV
//               className="cursor-pointer text-xl"
//               onClick={() => setShowUnread((prev) => !prev)}
//             />
//           </div>
//         </div>

//         <input
//           type="text"
//           className="w-full p-2 mb-4 border border-gray-300 rounded"
//           placeholder="Search users..."
//           value={searchTerm}
//           onChange={handleSearchChange}
//         />

//         {loading && <p>Loading users...</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         {filteredUsers.map((user) => (
//           <div
//             key={user._id}
//             className={`p-2 mb-2 bg-white cursor-pointer rounded ${selectedUser === user._id ? "bg-gray-300" : ""}`}
//             onClick={() => handleUserSelect(user._id)}
//           >
//             <p>{user.name}</p>
//             {user.phone}
//             {unreadCounts[user._id] > 0 && (
//               <span className="ml-2 text-red-500 font-bold">({unreadCounts[user._id]})</span>
//             )}
//           </div>
//         ))}
//       </aside>

//       <main className="w-3/4 p-4 flex flex-col mt-16">
//         {selectedUser ? (
//           <>
//             <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 break-words">
//               {currentMessages.map((msg, index) => (
//                 <div key={index} className={`flex ${msg.senderId === adminId ? 'justify-end' : 'justify-start'} mb-2`}>
//                   <div className="flex flex-col">
//                     <div
//                       className={`p-2 rounded-lg max-w-lg break-words relative ${msg.senderId === adminId
//                         ? "bg-blue-500 text-white self-end"
//                         : "bg-gray-200"}`}
//                     >
//                       {msg.content && <p>{msg.content}</p>}
//                       {msg.attachment && (
//                         <>
//                           {msg.attachment.endsWith(".jpg") ||
//                           msg.attachment.endsWith(".jpeg") ||
//                           msg.attachment.endsWith(".png") ||
//                           msg.attachment.endsWith(".gif") ? (
//                             <img
//                               src={`http://localhost:5000${msg.attachment}`}
//                               alt="attachment"
//                               className="max-w-full h-auto rounded-md mt-2"
//                             />
//                           ) : msg.attachment.endsWith(".mp4") ||
//                             msg.attachment.endsWith(".webm") ||
//                             msg.attachment.endsWith(".ogg") ? (
//                             <video
//                               src={`http://localhost:5000${msg.attachment}`}
//                               controls
//                               className="max-w-full rounded-md mt-2"
//                             />
//                           ) : (
//                             <a
//                               href={`http://localhost:5000${msg.attachment}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-500 underline mt-2"
//                             >
//                               View Attachment
//                             </a>
//                           )}
//                         </>
//                       )}
//                     </div>
//                     <span className="text-xs mt-1 self-end text-gray-500">
//                       {formatTime(msg.createdAt)}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-center mt-auto">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder="Type your message..."
//                 className="flex-1 border border-gray-300 rounded-l-lg p-2"
//               />
//               <label htmlFor="file-input" className="bg-gray-200 p-2 border-t border-b border-gray-300 cursor-pointer">
//                 <FaPaperclip />
//               </label>
//               <input
//                 id="file-input"
//                 type="file"
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
//               <button
//                 onClick={handleSendMessage}
//                 className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
//               >
//                 <FaPaperPlane />
//               </button>
//             </div>
//           </>
//         ) : (
//           <p className="text-center text-gray-500">Select a user to start chatting</p>
//         )}
//       </main>

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-4 rounded-lg">
//             <div className="flex justify-between items-center">
//               <h2 className="text-lg font-bold">Attachment Preview</h2>
//               <button onClick={closeModal} className="text-red-500">
//                 <FaTimes />
//               </button>
//             </div>
//             <div className="mt-4">
//               {filePreview &&
//                 (filePreview.startsWith("data:image") ? (
//                   <img src={filePreview} alt="Preview" className="max-w-full h-auto" />
//                 ) : filePreview.startsWith("data:video") ? (
//                   <video src={filePreview} controls className="max-w-full" />
//                 ) : (
//                   <p>{filePreview}</p>
//                 ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPanel;







import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import moment from 'moment';
import { FaEllipsisV, FaPaperclip, FaPaperPlane, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import logoimage from '../assets/pizeonfly.png';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMessages, setUserMessages] = useState({});
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [filterUnread, setFilterUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
  const token = localStorage.getItem("token");

  const formatTime = (timestamp) => moment(timestamp).format('h:mm A');
  const formatDate = (timestamp) => moment(timestamp).format("MMMM DD, YYYY");

  useEffect(() => {
    // Load unread counts from localStorage on component mount
    const storedUnreadCounts = localStorage.getItem("unreadCounts");
    if (storedUnreadCounts) {
      setUnreadCounts(JSON.parse(storedUnreadCounts));
    }
  }, []);

  // Persist unread counts to localStorage
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", selectedUser);
    }
  }, [selectedUser]);


  useEffect(() => {
    const newSocket = io("https://chatbot.pizeonfly.com");
    setSocket(newSocket);

    newSocket.emit('join_room', adminId);

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://chatbot.pizeonfly.com/api/admin/users", {
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

    newSocket.on('receive_message', (newMessage) => {
      const senderId = newMessage.senderId;

      if (senderId !== selectedUser) {
        setUnreadCounts((prevCounts) => {
          const updatedCounts = {
            ...prevCounts,
            [senderId]: (prevCounts[senderId] || 0) + 1,
          };
          localStorage.setItem("unreadCounts", JSON.stringify(updatedCounts));
          return updatedCounts;
        });
      }

      setUserMessages((prevMessages) => {
        const currentMessages = prevMessages[senderId] || [];
        return {
          ...prevMessages,
          [senderId]: [...currentMessages, newMessage],
        };
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://chatbot.pizeonfly.com/api/messages/${selectedUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserMessages((prev) => ({
          ...prev,
          [selectedUser]: response.data,
        }));

        await axios.post(
          `https://chatbot.pizeonfly.com/api/messages/mark-read/${selectedUser}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          delete updatedCounts[selectedUser];
          localStorage.setItem("unreadCounts", JSON.stringify(updatedCounts));
          return updatedCounts;
        });
      } catch (err) {
        setError("Error fetching messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, token]);


  useEffect(() => {
    const storedSelectedUser = localStorage.getItem("selectedUser");
    if (storedSelectedUser) {
      setSelectedUser(storedSelectedUser);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
      setFilePreview(URL.createObjectURL(selectedFile));
    } else if (selectedFile.type === "application/pdf") {
      setFilePreview("PDF File Selected");
    } else {
      setFilePreview("Unsupported File Type");
    }

    setIsModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;

    try {
      const formData = new FormData();
      formData.append("senderId", adminId);
      formData.append("receiverId", selectedUser);
      formData.append("content", message);
      if (file) formData.append("attachment", file);

      const response = await axios.post("https://chatbot.pizeonfly.com/api/message", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newMessage = response.data.message;

      socket.emit("send_message", newMessage);

      setUserMessages((prevMessages) => {
        const currentMessages = prevMessages[selectedUser] || [];
        return {
          ...prevMessages,
          [selectedUser]: [...currentMessages, newMessage],
        };
      });

      setUnreadCounts((prevCounts) => {
        const updatedCounts = { ...prevCounts };
        delete updatedCounts[selectedUser];
        return updatedCounts;
      });

      setMessage("");
      setFile(null);
    } catch (err) {
      setError("Error sending message");
      console.error(err.response?.data || err);
    }
  };

  const closeModal = () => {
    setFile(null);
    setFilePreview(null);
    setIsModalOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    localStorage.setItem("selectedUser", userId); // Persist selected user
    setUnreadCounts((prevCounts) => {
      const updatedCounts = { ...prevCounts };
      if (updatedCounts[userId]) {
        delete updatedCounts[userId];
        localStorage.setItem("unreadCounts", JSON.stringify(updatedCounts)); // Update localStorage
      }
      return updatedCounts;
    });
  };


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleFilterUnread = () => {
    setFilterUnread((prev) => !prev);
    setDropdownOpen(false);
  };

  const handleBack = () => {
    setFilterUnread(false);
    setSearchQuery(""); // Optional: Reset search query
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery);
    if (filterUnread) {
      return matchesSearch && unreadCounts[user._id] > 0;
    }
    return matchesSearch;
  });

  const currentMessages = selectedUser ? userMessages[selectedUser] || [] : [];

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, msg) => {
      const date = formatDate(msg.createdAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(currentMessages);


  return (
    <div className="flex h-screen overflow-y-hidden">
      <header className="fixed top-0 left-0 w-full bg-white-500 text-black flex items-center justify-between p-4 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <img src={logoimage} alt="Logo" className="h-10 w-10 rounded-full" />
          <div className="text-xl font-bold">Admin Panel</div>
        </div>
        <div>
          {selectedUser ? (
            <span className="text-2xl">
              {users.find((u) => u._id === selectedUser)?.name || "User"}
            </span>
          ) : (
            <span className="text-2xl">Select a user</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <aside className="w-1/4 bg-gray-200 p-4 mt-20">
        <div className="sticky top-0 bg-gray-200 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Users</h2>
            <div className="relative">
              {filterUnread ? (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full hover:bg-gray-300"
                  title="Back to All Users"
                >
                  <FaTimes />
                </button>
              ) : (
                <button
                  onClick={handleDropdownToggle}
                  className="p-2 rounded-full hover:bg-gray-300"
                  title="Filter Options"
                >
                  <FaEllipsisV />
                </button>
              )}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded border border-gray-200">
                  <button
                    onClick={handleFilterUnread}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Unread Messages
                  </button>
                </div>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded"
          />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {filteredUsers.map((user, index) => (
            <div
              key={user._id}
              className={`relative flex items-center gap-3 p-2 mb-2 bg-white cursor-pointer rounded ${selectedUser === user._id ? "bg-gray-300" : ""}`}
              onClick={() => handleUserSelect(user._id)}
            >
              {/* User Number */}
              <div className="font-bold text-gray-500">{index + 1}.</div>

              {/* Avatar */}
              <div className="w-10 h-10 flex items-center justify-center bg-gray-400 text-white font-bold rounded-full">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {/* User Details */}
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {unreadCounts[user._id] > 0 && (
                <span className="absolute top-5 right-5 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md transform translate-x-1/2 -translate-y-1/2">
                  {unreadCounts[user._id]}
                </span>
              )}

            </div>
          ))}
        </div>
      </aside>

      <main className="w-3/4 p-4 flex flex-col mt-16">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 break-words">
              {Object.keys(groupedMessages).map((date, idx) => (
                <div key={idx}>
                  {/* Date Header */}
                  <div className="sticky top-0 text-center text-gray-500 text-sm mb-2 py-1 z-10">{date}</div>

                  {/* Messages for the Date */}
                  {groupedMessages[date].map((msg, index) => (
                    <div key={index} className={`flex ${msg.senderId === adminId ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className="flex flex-col">
                        <div
                          className={`p-2 rounded-lg max-w-lg break-words relative ${msg.senderId === adminId
                            ? "bg-blue-500 text-white self-end"
                            : "bg-gray-200"}`}
                        >
                          {msg.content && <p>{msg.content}</p>}
                          {msg.attachment && (
                            <>
                              {msg.attachment.endsWith(".jpg") ||
                                msg.attachment.endsWith(".jpeg") ||
                                msg.attachment.endsWith(".png") ||
                                msg.attachment.endsWith(".gif") ? (
                                <img
                                  src={`https://chatbot.pizeonfly.com${msg.attachment}`}
                                  alt="attachment"
                                  className="max-w-full h-auto rounded-md mt-2"
                                />
                              ) : msg.attachment.endsWith(".mp4") ||
                                msg.attachment.endsWith(".webm") ||
                                msg.attachment.endsWith(".ogg") ? (
                                <video
                                  src={`https://chatbot.pizeonfly.com${msg.attachment}`}
                                  controls
                                  className="max-w-full rounded-md mt-2"
                                />
                              ) : (
                                <a
                                  href={`https://chatbot.pizeonfly.com${msg.attachment}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline mt-2"
                                >
                                  View Attachment
                                </a>
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-xs mt-1 self-end text-gray-500">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center mt-auto">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg p-2"
              />
              <label htmlFor="file-input" className="bg-gray-200 p-2 border-t border-b border-gray-300 cursor-pointer">
                <FaPaperclip />
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">Select a user to start chatting</p>
        )}
      </main>

      {isModalOpen && file && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-80">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Preview Attachment</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-500">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="file-preview mb-4">
              {file.type.startsWith("image/") && (
                <img src={filePreview} alt="Preview" className="max-w-full h-80 rounded-md" />
              )}
              {file.type.startsWith("video/") && (
                <video src={filePreview} controls className="max-w-full h-80 rounded-md" />
              )}
              {file.type === "application/pdf" && <p>PDF File Selected</p>}
              {!file.type.startsWith("image/") &&
                !file.type.startsWith("video/") &&
                file.type !== "application/pdf" && (
                  <p className="text-red-500">Unsupported File Type</p>
                )}
            </div>
            <div className="flex justify-start gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
