import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import moment from 'moment';
import { FaPaperclip, FaPaperPlane, FaSignOutAlt } from 'react-icons/fa';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMessages, setUserMessages] = useState({});
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
  const token = localStorage.getItem("token");

  const formatTime = (timestamp) => moment(timestamp).format('h:mm A');

  useEffect(() => {
    // Initialize the socket connection
    const newSocket = io("https://chatbot.pizeonfly.com");
    setSocket(newSocket);

    // Join admin's room
    newSocket.emit('join_room', adminId);

    // Fetch users on mount
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

    // Listen for incoming messages
    newSocket.on('receive_message', (newMessage) => {
      // Update messages for the sender
      setUserMessages(prevMessages => {
        const senderId = newMessage.senderId;
        const currentMessages = prevMessages[senderId] || [];
        
        // Avoid duplicates
        const isDuplicate = currentMessages.some(msg => 
          msg._id === newMessage._id
        );

        if (isDuplicate) return prevMessages;

        return {
          ...prevMessages,
          [senderId]: [...currentMessages, newMessage]
        };
      });
    });

    // Cleanup socket connection on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!selectedUser) return;

    // Fetch messages for the selected user
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://chatbot.pizeonfly.com/api/messages/${selectedUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Store messages keyed by user ID
        setUserMessages(prev => ({
          ...prev,
          [selectedUser]: response.data
        }));
      } catch (err) {
        setError("Error fetching messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, token]);

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
          'Content-Type': 'multipart/form-data'
        },
      });

      const newMessage = response.data.message;

      // Emit the message via socket
      socket.emit("send_message", newMessage);

      // Update messages for the selected user
      setUserMessages(prevMessages => {
        const currentMessages = prevMessages[selectedUser] || [];
        return {
          ...prevMessages,
          [selectedUser]: [...currentMessages, newMessage]
        };
      });

      setMessage("");
      setFile(null);
    } catch (err) {
      setError("Error sending message");
      console.error(err.response?.data || err);
    }
  };

   const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
    };

    const handleLogout = () => {
          localStorage.removeItem("token");
          window.location.href = "/";  // Modify to match your login route
        };
      
      

  // Get messages for the currently selected user
  const currentMessages = selectedUser ? userMessages[selectedUser] || [] : [];

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
            onClick={() => setSelectedUser(user._id)}
          >
            {user.name}
          </div>
        ))}
        <div className="mt-4">
          <button
             onClick={handleLogout}
             className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 flex items-center justify-center"
           >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="w-3/4 p-4 flex flex-col">
        {selectedUser ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4">
              {currentMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.senderId === adminId ? 'justify-end' : 'justify-start'} mb-2`}>
                 <div className="flex flex-col">
                  <div
                    className={`p-2 rounded-lg max-w-xs sm:max-w-sm lg:max-w-md relative ${
                      msg.senderId === adminId
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200"
                    }`}
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
                             className="max-w-full h-auto rounded-md mt-2"
                           />
                         ) : msg.attachment.endsWith(".pdf") ? (
                           <a
                             href={`https://chatbot.pizeonfly.com${msg.attachment}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-white-500 underline mt-2"
                           >
                             View PDF
                           </a>
                        ) : (
                          <p className="text-gray-500 mt-2">Unsupported file type</p>
                         )}
                      </>
                    )}

                  </div>
                  <div className={`text-xs mt-1 ${msg.senderId === adminId ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.createdAt)}
                  </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Send Message */}
            <div className="flex items-center gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full flex-grow border border-gray-300 rounded p-2 mb-2"
                placeholder="Type your message here..."
              ></textarea>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-2 hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer flex-shrink-0 text-gray-700 hover:text-blue-600">
                 <FaPaperclip size={20} />
               </label>

              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                 <FaPaperPlane size={20} />
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






































