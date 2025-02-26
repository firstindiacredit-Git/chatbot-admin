

import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState, useRef } from "react";
import { FaFlag } from 'react-icons/fa';
import axios from "axios";
import io from "socket.io-client";
import moment from 'moment';
import { FaEllipsisV, FaPaperclip, FaPaperPlane, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import logoimage from '../assets/pizeonfly.png';


Chart.register(...registerables);

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUserss, setFilteredUserss] = useState([]); // State for filtered users based on selected property
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

  const [firstLiveTimes, setFirstLiveTimes] = useState({}); // State for first live times
  const [lastLiveTimes, setLastLiveTimes] = useState({}); // State for last live times
  const [liveUsers, setLiveUsers] = useState(new Set()); // State to track live users
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [liveUserCounts, setLiveUserCounts] = useState([]);
  const [userCounts, setUserCounts] = useState([]);


  const [serviceName, setServiceName] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [services, setServices] = useState([]);
  const [showCreatePropertyModal, setShowCreatePropertyModal] = useState(false);
  const [websiteName, setWebsiteName] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [websiteList, setWebsiteList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const createPropertyModalRef = useRef(null);
  const [propertydropdownOpen, setPropertydropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const addServiceModalRef = useRef(null);

  const [userCountry, setUserCountry] = useState({});
  const [searchPropertyQuery, setSearchPropertyQuery] = useState("");

  const [highlightedId, setHighlightedId] = useState(null);

  const handleCopy = (websiteId, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setHighlightedId(websiteId); // Highlight the copied text
      setTimeout(() => setHighlightedId(null), 2000); // Remove highlight after 2 seconds
    });
  };




  const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
  const token = localStorage.getItem("token");

  const formatTime = (timestamp) => moment(timestamp).format('h:mm A');
  const formatDate = (timestamp) => moment(timestamp).format("MMMM DD, YYYY");

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setPropertydropdownOpen(false); // Close dropdown if clicked outside
    }
    if (addServiceModalRef.current && !addServiceModalRef.current.contains(event.target)) {
      setShowAddServiceModal(false); // Close Add Service modal if clicked outside
    }
    if (createPropertyModalRef.current && !createPropertyModalRef.current.contains(event.target)) {
      setShowCreatePropertyModal(false); // Close Create Property modal if clicked outside
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside the dropdown
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);





  const fetchUserCounts = async (websiteId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/live-user-counts?websiteId=${websiteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data);

      // Check if the response contains the expected fields
      const todayUserCount = response.data.todayUserCount || 0; // Default to 0 if not provided
      const last7DaysUserCount = response.data.last7DaysUserCount || 0; // Default to 0 if not provided

      // Set live user counts, show -1 if there are no live users
      const todayLiveUserCount = response.data.todayLiveUserCount >= 0 ? response.data.todayLiveUserCount : 0;
      const last7DaysLiveUserCount = response.data.last7DaysLiveUserCount >= 0 ? response.data.last7DaysLiveUserCount : 0;

      setLiveUserCounts([todayLiveUserCount, last7DaysLiveUserCount]);
      setUserCounts([todayUserCount, last7DaysUserCount]);
      setLiveUserCount(todayLiveUserCount);
    } catch (err) {
      setError("Error fetching user counts");
    }
  };



  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(response.data);
      } catch (err) {
        setError("Error fetching services");
      }
    };

    fetchServices();
  }, [token]);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setError("Service name is required."); // Add error handling for empty service name
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/services", {
        name: serviceName,
        websiteId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices([...services, response.data]); // Update the services list
      setServiceName(""); // Clear the input
      setWebsiteId(""); // Clear the input
      setShowAddServiceModal(false);
    } catch (err) {
      setError("Error adding service: " + err.response?.data?.message || err.message);
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      // Create the website and its services
      const response = await axios.post("http://localhost:5000/api/properties", {
        name: websiteName,
        websiteId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdProperty = response.data;
      //localStorage.setItem("createdWebsiteId", createdProperty.websiteId);

      setWebsiteList([...websiteList, createdProperty]); // Update the website list
      setShowCreatePropertyModal(false); // Close the modal
      setWebsiteName(""); // Clear the input
      setWebsiteId(""); // Clear the input
      alert("Property created successfully!");

    } catch (err) {
      setError("Error creating property: " + (err.response?.data?.message || err.message));
    }
  };



  const fetchProperties = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/properties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWebsiteList(response.data); // Update the website list with fetched properties
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  // Call fetchProperties when the component mounts
  useEffect(() => {
    fetchProperties();
  }, []);

  const toggleCreatePropertyModal = () => {
    setShowCreatePropertyModal(!showCreatePropertyModal);
  };


  // Fetch selected property from localStorage on component mount
  useEffect(() => {
    const storedProperty = localStorage.getItem("selectedProperty");
    if (storedProperty) {
      const property = JSON.parse(storedProperty);
      setSelectedProperty(property); // Set the selected property
      setWebsiteName(property.name);
      setWebsiteId(property.websiteId);
      fetchUserCounts(property.websiteId);
    }
  }, []);




  const handleSelectProperty = async (property) => {
    setSelectedProperty(property);
    //setPropertydropdownOpen(false); // Close dropdown after selection
    // Fetch users associated with the selected property if needed
    // You can implement a fetch function here to get users based on the selected property

    setWebsiteId(property.websiteId);
    setWebsiteName(property.name);
    localStorage.setItem("selectedProperty", JSON.stringify(property));
    setPropertydropdownOpen(false);
    await fetchUsersByWebsiteId(property.websiteId);
    await fetchUserCounts(property.websiteId);
    setSelectedUser(null);
    setFilterUnread(false);
  };

  const fetchUsersByWebsiteId = async (websiteId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users?websiteId=${websiteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFilteredUserss(response.data); // Update the filtered users based on the selected website ID

    } catch (err) {
      setError("Error fetching users for the selected property");
    }
  };


  useEffect(() => {
    if (selectedProperty && users.length > 0) {
      // Filter users based on search query and selected property
      const filtered = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery);
        const belongsToProperty = user.websiteId === selectedProperty.websiteId;
        return matchesSearch && belongsToProperty;
      });
      setFilteredUserss(filtered);
    }
  }, [searchQuery, selectedProperty, users]);


  useEffect(() => {
    if (filterUnread && selectedProperty) {
      const unreadFiltered = users.filter(user =>
        user.websiteId === selectedProperty.websiteId && unreadCounts[user._id] > 0
      );
      setFilteredUserss(unreadFiltered);
    }
  }, [filterUnread, selectedProperty, unreadCounts, users]);


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
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit('join_room', adminId, websiteId);

    // Listen for live user updates
    newSocket.on('live_users_update', (users) => {
      setLiveUsers(new Set(users)); // Update live users set
    });

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
  }, [token, selectedUser, websiteId]);


  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/messages/${selectedUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserMessages((prev) => ({
          ...prev,
          [selectedUser]: response.data,
        }));

        await axios.post(
          `http://localhost:5000/api/messages/mark-read/${selectedUser}`,
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

      const response = await axios.post("http://localhost:5000/api/message", formData, {
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

  useEffect(() => {
    // Load first and last live times from localStorage on component mount
    const storedFirstLiveTimes = localStorage.getItem("firstLiveTimes");
    const storedLastLiveTimes = localStorage.getItem("lastLiveTimes");

    if (storedFirstLiveTimes) {
      setFirstLiveTimes(JSON.parse(storedFirstLiveTimes));
    }

    if (storedLastLiveTimes) {
      setLastLiveTimes(JSON.parse(storedLastLiveTimes));
    }
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    localStorage.setItem("selectedUser", userId); // Persist selected user

    const now = new Date().toISOString();

    // Update last live time
    setLastLiveTimes((prev) => {
      const updatedLastLiveTimes = {
        ...prev,
        [userId]: now,
      };
      localStorage.setItem("lastLiveTimes", JSON.stringify(updatedLastLiveTimes)); // Save to localStorage
      return updatedLastLiveTimes;
    });

    // Set first live time if not already set
    setFirstLiveTimes((prev) => {
      if (!prev[userId]) {
        const updatedFirstLiveTimes = {
          ...prev,
          [userId]: now,
        };
        localStorage.setItem("firstLiveTimes", JSON.stringify(updatedFirstLiveTimes)); // Save to localStorage
        return updatedFirstLiveTimes;
      }
      return prev;
    });




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

    if (!filterUnread) {
      // If filtering for unread messages, filter users based on selected property and unread counts
      const unreadFiltered = filteredUserss.filter(user => unreadCounts[user._id] > 0);
      setFilteredUserss(unreadFiltered);
    } else {
      // Reset to show all users for the selected property
      if (selectedProperty) {
        const filtered = users.filter(user => user.websiteId === selectedProperty.websiteId);
        setFilteredUserss(filtered);
      } else {
        // If no property is selected, clear the filtered users
        setFilteredUserss([]);
      }
    }

  };

  const handleBack = () => {
    setFilterUnread(false);
    setSearchQuery(""); // Optional: Reset search query

    // Reset to show all users for the selected property
    if (selectedProperty) {
      const filtered = users.filter(user => user.websiteId === selectedProperty.websiteId);
      setFilteredUserss(filtered);
    } else {
      // If no property is selected, clear the filtered users
      setFilteredUserss([]);
    }
  };

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
    <div className="flex h-[700px] overflow-y-hidden">
      <header className="fixed top-0 left-0 w-full bg-white-500 text-black flex items-center justify-between p-2 z-10 border-b ">
        <div className="flex items-center gap-4">
          <img src={logoimage} alt="Logo" className="h-10 w-10 rounded-full" />
          <div className="text-xl font-bold">Admin Panel</div>
        </div>


        <div className="flex items-center gap-4">


          <button
            onClick={() => setShowAddServiceModal(true)}
            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
          >
            Add Service
          </button>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setPropertydropdownOpen(!propertydropdownOpen)}
              className="bg-gray-300 text-black py-1 px-2 rounded hover:bg-gray-400"
            >
              {websiteName ? `${websiteName} ` : "Select Property"}
              {/* (ID: ${selectedProperty?.websiteId}) */}
            </button>
            {propertydropdownOpen && (
              <div ref={dropdownRef} className="absolute -right-24 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-md z-50">
                <div className="p-2">
                  <input
                    type="text"
                    value={searchPropertyQuery}
                    placeholder="Search or select a property..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-00"
                    onChange={(e) => setSearchPropertyQuery(e.target.value.toLowerCase())}
                  // Add an onChange handler if you want search functionality
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {websiteList.filter(website => website.name.toLowerCase().includes(searchPropertyQuery)).map((website) => (
                    <button
                      key={website._id}
                      onClick={() => {
                        handleSelectProperty(website);
                        setPropertydropdownOpen(false); // Close dropdown after selection
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {/* Avatar with initial */}
                      <div className="flex items-center justify-center bg-gray-400 text-white rounded-full h-8 w-8 mr-3">
                        {website.name.charAt(0).toUpperCase()}
                      </div>
                      {/* Website name */}
                      <span>{website.name}</span>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={toggleCreatePropertyModal}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Create Property
                  </button>
                </div>
              </div>
            )}

          </div>



          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>


      <aside className="w-2/6 bg-gray-200 p-3 mt-20">
        <div className="sticky top-0 bg-gray-200">
          <div className="flex items-center justify-between mb-2">
            {/* <h2 className="text-lg font-bold">Users</h2> */}
            <div>
              <h2 className="text-sm w-full font-bold">Users for {selectedProperty ? selectedProperty.name : "Select a Property"}</h2>
              <h3 className="text-xs w-full text-gray-600">Website ID: {selectedProperty ? selectedProperty.websiteId : "N/A"}</h3>
            </div>
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
        <div className="overflow-y-auto h-[500px]">
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {filteredUserss.map((user, index) => (
            <div
              key={user._id}
              className={`relative w-[99%] flex items-center gap-3 p-1 mb-1 bg-white cursor-pointer rounded ${selectedUser === user._id ? "bg-blue-400" : ""}`}
              onClick={() => handleUserSelect(user._id)}
            >
              {/* User Number */}
              <div className="font-bold text-gray-500 min-w-5">{index + 1}.</div>

              {/* Avatar */}
              <div className="relative w-7 h-7 flex items-center justify-center bg-gray-400 text-white font-bold rounded-full">
                {user.name.charAt(0).toUpperCase()
                } {liveUsers.has(user._id) && (
                  <span
                    className="absolute bottom-0 -right-1 border border-2 border-white w-3 h-3 bg-green-500 rounded-full"
                    title="Active"
                  ></span>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1">
                <p className="font-semibold uppercase flex items-center">
                  {user.name}

                </p>
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


      <div className='flex flex-col w-3/4 h-[620px] p-4 mt-16'>





        <main className="flex-1 flex flex-col h-2">
          {selectedUser ? (
            <>
              <div className="flex-1 overflow-y-auto  border border-gray-300 rounded-lg p-4 mb-2 break-words">
                {Object.keys(groupedMessages).map((date, idx) => (
                  <div key={idx}>
                    {/* Date Header */}
                    <div className="sticky top-0 text-center text-gray-500 text-sm mb-2 py-1 z-5">{date}</div>

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
                                    src={`http://localhost:5000${msg.attachment}`}
                                    alt="attachment"
                                    className="max-w-full h-auto rounded-md mt-2"
                                  />
                                ) : msg.attachment.endsWith(".mp4") ||
                                  msg.attachment.endsWith(".webm") ||
                                  msg.attachment.endsWith(".ogg") ? (
                                  <video
                                    src={`http://localhost:5000${msg.attachment}`}
                                    controls
                                    className="max-w-full rounded-md mt-2"
                                  />
                                ) : (
                                  <a
                                    href={`http://localhost:5000${msg.attachment}`}
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

              <div className="flex items-center">
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

        {/* Create Property Modal */}
        {showCreatePropertyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={createPropertyModalRef} className="bg-white w-[40%] h-auto p-6 rounded-lg shadow-xl">
              {/* Modal Header */}
              <h2 className="text-2xl font-semibold text-center mb-4 text-gray-700">
                Create Property
              </h2>

              {/* Create Property Form */}
              <form onSubmit={handleCreateProperty}>
                <input
                  type="text"
                  placeholder="Website Name"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Website ID"
                  value={websiteId}
                  onChange={(e) => setWebsiteId(e.target.value)}
                  className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  Create Property
                </button>
              </form>

              {/* Property List Section */}
              <div className="mt-6 max-h-60 w-auto overflow-y-auto border-t border-gray-200 pt-4">
                {websiteList.map((website) => (
                  <div key={website._id} className="mb-6">
                    <h3 className="font-medium text-gray-800 text-sm mb-2">
                      This Script for: {website.name}
                    </h3>
                    <div
                      className={`relative bg-gray-100 p-4 rounded-lg border text-sm ${highlightedId === website._id ? "bg-blue-100" : "bg-gray-100"
                        }`}
                    >
                      <pre className="overflow-auto">
                        <code>
                          {`<script>
document.addEventListener("DOMContentLoaded", () => {
  const createElement = (tag, attrs = {}, html = "") => Object.assign(document.createElement(tag), attrs, html ? { innerHTML: html } : {});
  const getLocation = (cb) => navigator.geolocation?.getCurrentPosition(
    ({ coords }) => cb(\`&latitude=\${coords.latitude}&longitude=\${coords.longitude}\`),
    () => cb("")
  ) || cb("");
  
  getLocation((loc) => {
    const iframe = createElement("iframe", {
      src: \`https://chatbot-user.vercel.app/?websiteId=${website.websiteId}\${loc}\`,
      style: "position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,0.2);display:none;background:white;",
      allow: "geolocation"
    });
    const chatIcon = createElement("div", {
      className: "chat",
      style: "position:fixed;bottom:20px;right:20px;width:64px;height:64px;background:#1950ff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10000;",
      onclick: () => (iframe.style.display = iframe.style.display === "none" ? "block" : "none")
    }, \`<svg width="30" height="30" fill="#fff"><circle cx="15" cy="15" r="12"></circle><text x="9" y="20" font-size="12">Chat</text></svg>\`);
    document.body.append(chatIcon, iframe);
  });
});
</script>`}
                        </code>
                      </pre>
                      <button
                        onClick={() =>
                          handleCopy(
                            website._id,
                            `<script>
document.addEventListener("DOMContentLoaded", () => {
  const createElement = (tag, attrs = {}, html = "") => Object.assign(document.createElement(tag), attrs, html ? { innerHTML: html } : {});
  const getLocation = (cb) => navigator.geolocation?.getCurrentPosition(
    ({ coords }) => cb(\`&latitude=\${coords.latitude}&longitude=\${coords.longitude}\`),
    () => cb("")
  ) || cb("");
  
  getLocation((loc) => {
    const iframe = createElement("iframe", {
      src: \`https://chatbot-user.vercel.app/?websiteId=${website.websiteId}\${loc}\`,
      style: "position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,0.2);display:none;background:white;",
      allow: "geolocation"
    });
    const chatIcon = createElement("div", {
      className: "chat",
      style: "position:fixed;bottom:20px;right:20px;width:64px;height:64px;background:#1950ff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10000;",
      onclick: () => (iframe.style.display = iframe.style.display === "none" ? "block" : "none")
    }, \`<svg width="30" height="30" fill="#fff"><circle cx="15" cy="15" r="12"></circle><text x="9" y="20" font-size="12">Chat</text></svg>\`);
    document.body.append(chatIcon, iframe);
  });
});
</script>`
                          )
                        }
                        className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Close Modal Button */}
              <button
                onClick={toggleCreatePropertyModal}
                className="mt-4 w-full bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddServiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={addServiceModalRef} className="bg-white p-4 rounded-lg shadow-lg max-w-md w-80">
              <h2 className="text-xl font-bold">Add Service</h2>
              <form onSubmit={handleAddService} className="mb-4">
                <input
                  type="text"
                  placeholder="Service Name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Website ID"
                  value={websiteId}
                  onChange={(e) => setWebsiteId(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Add Service
                </button>
              </form>

              {/* Services History Section */}
              <h2 className="text-lg font-bold mt-4">Services History</h2>
              <div className="overflow-y-auto max-h-40"> {/* Set max height for scrolling */}
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2">Service Name</th>
                      <th className="border border-gray-300 p-2">Website ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-100">
                        <td className="border border-gray-300 p-2">{service.name}</td>
                        <td className="border border-gray-300 p-2">{service.websiteId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setShowAddServiceModal(false)}
                className="mt-2 w-full bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="w-1/3 overflow-y-auto p-4 bg-gray-100 border-l border-gray-300 mt-20">
        <div className=''>
          {selectedUser ? (
            <div>

              {firstLiveTimes[selectedUser] && (
                <p className="text-sm text-gray-600">
                  First Live: {moment(firstLiveTimes[selectedUser]).format('MMMM DD, YYYY h:mm A')}
                </p>
              )}
              {lastLiveTimes[selectedUser] && (
                <p className="text-sm text-gray-600">
                  Last Live: {moment(lastLiveTimes[selectedUser]).format('MMMM DD, YYYY h:mm A')}
                </p>
              )}


              {/* Display the user's name */}
              <span className="text-2xl font-bold">
                {users.find((u) => u._id === selectedUser)?.name || "User"}
              </span>
              <br />
              <span className="text-sm text-gray-600">
                {users.find((u) => u._id === selectedUser)?.email || "User"}
              </span>
              <br />
              <span className="text-sm text-gray-600">
                {users.find((u) => u._id === selectedUser)?.phone || "User"}
              </span>

              <br />
              {/* Display the user's selected services */}
              <div className="mt-0 text-lg text-gray-600">
                {(users.find((u) => u._id === selectedUser)?.services || []).map(
                  (service, index) => (
                    <div key={index} className="ml-0">
                      {service}
                    </div>
                  )
                )}
              </div>
              {/* Display the user's location data */}
              <div className="mt-4 text-lg text-gray-600 break-words">
                <h3 className="font-semibold">Location Data:</h3>
                <div>
                  <p><strong>IP:</strong> {users.find((u) => u._id === selectedUser)?.location?.ip || "N/A"}</p>
                  <p><strong>Network:</strong> {users.find((u) => u._id === selectedUser)?.location?.network || "N/A"}</p>
                  <p><strong>Version:</strong> {users.find((u) => u._id === selectedUser)?.location?.version || "N/A"}</p>
                  <p><strong>City:</strong> {users.find((u) => u._id === selectedUser)?.location?.city || "N/A"}</p>
                  <p><strong>Region:</strong> {users.find((u) => u._id === selectedUser)?.location?.region || "N/A"}</p>
                  <p><strong>Region Code:</strong> {users.find((u) => u._id === selectedUser)?.location?.region_code || "N/A"}</p>
                  <p><strong>Country:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_name || "N/A"}</p>
                  <p><strong>Country Code:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_code || "N/A"}</p>
                  <p><strong>Country Code ISO3:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_code_iso3 || "N/A"}</p>
                  <p><strong>Country Capital:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_capital || "N/A"}</p>
                  <p><strong>Country TLD:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_tld || "N/A"}</p>
                  <p><strong>Continent Code:</strong> {users.find((u) => u._id === selectedUser)?.location?.continent_code || "N/A"}</p>
                  <p><strong>In EU:</strong> {users.find((u) => u._id === selectedUser)?.location?.in_eu ? "Yes" : "No"}</p>
                  <p><strong>Postal Code:</strong> {users.find((u) => u._id === selectedUser)?.location?.postal || "N/A"}</p>
                  <p><strong>Latitude:</strong> {users.find((u) => u._id === selectedUser)?.location?.latitude || "N/A"}</p>
                  <p><strong>Longitude:</strong> {users.find((u) => u._id === selectedUser)?.location?.longitude || "N/A"}</p>
                  <p><strong>Timezone:</strong> {users.find((u) => u._id === selectedUser)?.location?.timezone || "N/A"}</p>
                  <p><strong>UTC Offset:</strong> {users.find((u) => u._id === selectedUser)?.location?.utc_offset || "N/A"}</p>
                  <p><strong>Country Calling Code:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_calling_code || "N/A"}</p>
                  <p><strong>Currency:</strong> {users.find((u) => u._id === selectedUser)?.location?.currency || "N/A"}</p>
                  <p><strong>Currency Name:</strong> {users.find((u) => u._id === selectedUser)?.location?.currency_name || "N/A"}</p>
                  <p><strong>Languages:</strong> {users.find((u) => u._id === selectedUser)?.location?.languages || "N/A"}</p>
                  <p><strong>Country Area:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_area || "N/A"}</p>
                  <p><strong>Country Population:</strong> {users.find((u) => u._id === selectedUser)?.location?.country_population || "N/A"}</p>
                  <p><strong>ASN:</strong> {users.find((u) => u._id === selectedUser)?.location?.asn || "N/A"}</p>
                  <p><strong>Organization:</strong> {users.find((u) => u._id === selectedUser)?.location?.org || "N/A"}</p>
                  <p><strong>Os:</strong> {users.find((u) => u._id === selectedUser)?.location?.os || "N/A"}</p>
                  <p><strong>browser:</strong> {users.find((u) => u._id === selectedUser)?.location?.browser || "N/A"}</p>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-2xl">Select a user</span>
          )}
        </div>
      </div>


      <main className="w-1/3 mt-20">
        {/* Chart Section for User Counts */}
        {selectedProperty && (
          <div className="mb-0 bg-blue-50 p-2 rounded-lg shadow-sm h-[600px]">
            {/* <h2 className="text-lg font-bold">User Statistics for {selectedProperty.name}</h2> */}
            <div className="flex flex-col">
              <div className='flex flex-col mr-2'>
                <h3 className="text-xl font-semibold">Today User Count: {userCounts[0]}</h3>
                <h3 className="text-xl font-semibold">Last 7 Days User Count: {userCounts[1]}</h3>
                <Bar
                  data={{
                    labels: ['Today', 'Last 7 Days'],
                    datasets: [
                      {
                        label: 'User Count',
                        data: userCounts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />

              </div>
              <div className='flex flex-col mt-20'>
                {/* <h3 className="text-xl font-semibold">Live User Count: {liveUserCounts[0]-1}</h3> */}
                <h3 className="text-xl font-semibold">Live User Count: {Array.from(liveUsers).filter(userId =>
                  users.find(user => user._id === userId && user.websiteId === selectedProperty.websiteId)
                ).length}</h3>
                <h3 className="text-xl font-semibold">Last 7 Days Live User Count: {liveUserCounts[1] - 1}</h3>
                <Bar
                  data={{
                    labels: ['Today', 'Last 7 Days'],
                    datasets: [
                      {
                        label: 'Live User Count',
                        data: liveUserCounts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />

              </div>
            </div>

          </div>

        )}

      </main>







    </div>
  );
};

export default AdminPanel;



