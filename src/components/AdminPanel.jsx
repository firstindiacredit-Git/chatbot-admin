






import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState } from "react";
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
  const [propertydropdownOpen, setPropertydropdownOpen] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const [userCountry, setUserCountry] = useState({});


  const adminId = "675980503b55ec4b1208890b"; // Static Admin ID
  const token = localStorage.getItem("token");

  const formatTime = (timestamp) => moment(timestamp).format('h:mm A');
  const formatDate = (timestamp) => moment(timestamp).format("MMMM DD, YYYY");

  const fetchUserCountry = async (latitude, longitude, userId) => {
    try {
      const response = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      const country = response.data.countryCode; // Get the country code
      setUserCountry((prev) => ({ ...prev, [userId]: country })); // Store country code by user ID
    } catch (error) {
      console.error("Error fetching country data:", error);
    }
  };

  useEffect(() => {
    // Fetch country for each user with location data
    filteredUserss.forEach(user => {
      if (user.location) {
        fetchUserCountry(user.location.latitude, user.location.longitude, user._id);
      }
    });
  }, [filteredUserss]);



  const fetchUserCounts = async (websiteId) => {
    try {
      const response = await axios.get(`https://chatbot.pizeonfly.com/api/admin/live-user-counts?websiteId=${websiteId}`, {
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
    } catch (err) {
      setError("Error fetching user counts");
    }
  };



  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("https://chatbot.pizeonfly.com/api/services", {
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
      const response = await axios.post("https://chatbot.pizeonfly.com/api/services", {
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
      const response = await axios.post("https://chatbot.pizeonfly.com/api/properties", {
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
      const response = await axios.get("https://chatbot.pizeonfly.com/api/properties", {
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

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    //setPropertydropdownOpen(false); // Close dropdown after selection
    // Fetch users associated with the selected property if needed
    // You can implement a fetch function here to get users based on the selected property
    setWebsiteId(property.websiteId);
    setWebsiteName(property.name);
    setPropertydropdownOpen(false);
    fetchUsersByWebsiteId(property.websiteId);
    fetchUserCounts(property.websiteId);
  };

  const fetchUsersByWebsiteId = async (websiteId) => {
    try {
      const response = await axios.get(`https://chatbot.pizeonfly.com/api/users?websiteId=${websiteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilteredUserss(response.data); // Update the filtered users based on the selected website ID
    } catch (err) {
      setError("Error fetching users for the selected property");
    }
  };


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

    newSocket.emit('join_room', adminId, websiteId);

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
  }, [token, selectedUser, websiteId]);


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

  // const filteredUsers = users.filter((user) => {
  //   const matchesSearch = user.name.toLowerCase().includes(searchQuery);
  //   if (filterUnread) {
  //     return matchesSearch && unreadCounts[user._id] > 0;
  //   }
  //   return matchesSearch;
  // });

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
      <header className="fixed top-0 left-0 w-full bg-white-500 text-black flex items-center justify-between p-4 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <img src={logoimage} alt="Logo" className="h-10 w-10 rounded-full" />
          <div className="text-xl font-bold">Admin Panel</div>
        </div>
        <div>
          {selectedUser ? (
            <div>
              {/* Display the user's name */}
              <span className="text-2xl font-bold">
                {users.find((u) => u._id === selectedUser)?.name || "User"}
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
            </div>
          ) : (
            <span className="text-2xl">Select a user</span>
          )}
        </div>

        <div className="flex items-center gap-1">

          <div className="relative inline-block text-left">
            <button
              onClick={() => setPropertydropdownOpen(!propertydropdownOpen)}
              className="bg-gray-300 text-black py-1 px-2 rounded hover:bg-gray-400"
            >
              {websiteName ? `${websiteName} ` : "Select Property"}
              {/* (ID: ${selectedProperty?.websiteId}) */}
            </button>
            {propertydropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                {websiteList.map((website) => (
                  <button
                    key={website._id}
                    onClick={() => {
                      // setWebsiteName(website.name);
                      // setSelectedProperty(website); // Set the selected property
                      // setPropertydropdownOpen(false); // Close the dropdown after selection
                      handleSelectProperty(website)
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    {website.name}
                    {/* (ID: {website.websiteId}) */}

                  </button>
                ))}

                <div className='ml-4'>
                  <button
                    onClick={toggleCreatePropertyModal}
                    className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                  >
                    Create Property
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Property Modal */}
        {showCreatePropertyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full h-auto">
              <h2 className="text-xl font-bold">Create Property</h2>
              <form onSubmit={handleCreateProperty}>
                <input
                  type="text"
                  placeholder="Website Name"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
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
                  className="w-full bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Create Property
                </button>
              </form>



              {/* <div className="mt-4 max-h-60 overflow-y-auto">
                {websiteList.map((website) => (
                  <div key={website._id} className="mb-2">
                    <h3 className="font-bold">Integration Script for this Property: {website.name}</h3>
                    <textarea
                      readOnly
                      // value={`<script src="https://pranjalscripts.github.io/integrate/embed.js/?websiteId=${website.websiteId}"></script>`}
                      value={`<script src="https://pranjalscripts.github.io/integrate/embed.js/?websiteId=${website.websiteId}"></script>`}
                      className="w-full p-2 border border-gray-300 rounded mt-2"
                    />
                  </div>
                ))}
              </div> */}

              <div className="mt-4 max-h-60 overflow-y-auto"> {/* Set max height and enable scrolling */}
                {websiteList.map((website) => (
                  <div key={website._id} className="mb-2">
                    <h3 className="font-bold">Integration Script for this Property: {website.name}</h3>
                    <textarea
                      readOnly
                      value={`<script>
                      document.addEventListener("DOMContentLoaded", () => {
                      const s = (t, a = {}, c = "") => Object.assign(document.createElement(t), a, c ? { innerHTML: c } : {}); 
                      const iframe = s("iframe", { src: "https://chatbot-user.vercel.app/?websiteId=${website.websiteId}", style: "position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;z-index:9999;box-shadow:0 4px 8px rgba(0,0,0,0.2);display:none;background:white;" });
                      const chatIcon = s("div", { className: "chat", style: "position:fixed;bottom:20px;right:20px;width:64px;height:64px;background:#1950ff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10000;" }, \`<svg width="30" height="30" fill="#fff"><circle cx="15" cy="15" r="12" stroke="none"></circle><text x="9" y="20" font-size="12">Chat</text></svg>\`);
                      chatIcon.addEventListener("click", () => { iframe.style.display = iframe.style.display === "none" ? "block" : "none"; });
                      document.body.append(chatIcon, iframe);
                      });
                      </script>`}
                      className="w-full p-2 border border-gray-300 rounded mt-2"
                    />
                  </div>
                ))}
              </div>




              <button
                onClick={toggleCreatePropertyModal}
                className="mt-2 w-full bg-gray-300 text-black px-2 py-1 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowAddServiceModal(true)}
          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
        >
          Add Service
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>



      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-80">
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

      <aside className="w-1/4 bg-gray-200 p-4 mt-24">
        <div className="sticky top-0 bg-gray-200">
          <div className="flex items-center justify-between mb-4">
            {/* <h2 className="text-lg font-bold">Users</h2> */}
            <h2 className="text-lg font-bold">Users for {selectedProperty ? selectedProperty.name : "Select a Property"}</h2>
            <h3 className="text-sm text-gray-600">Website ID: {selectedProperty ? selectedProperty.websiteId : "N/A"}</h3>
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
        <div className="overflow-y-auto h-[450px]">
          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {filteredUserss.map((user, index) => (
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
                {userCountry[user._id] && (
                  <>
                    {/* Debugging: Log the country code and URL */}
                    {console.log(`Country Code: ${userCountry[user._id]}`)}
                    <img
                      src={`https://flagcdn.com/w320/${userCountry[user._id].toLowerCase()}.png`} // Correct URL for flag image
                      alt={`${userCountry[user._id]} flag`}
                      className="w-5 h-3 inline-block ml-2"
                      onError={(e) => {
                        console.error(`Failed to load image: ${e.target.src}`); // Log error if image fails to load
                        e.target.onerror = null; // Prevent looping
                        e.target.src = 'https://via.placeholder.com/20'; // Fallback image
                      }}
                    />
                  </>
                )}

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


      <div className='flex flex-col w-3/4 p-4 m-20'>




        <main className="mb-0">
          {/* Chart Section for User Counts */}
          {selectedProperty && (
            <div className="mb-0 bg-blue-50 p-2 rounded-lg shadow-sm">
              {/* <h2 className="text-lg font-bold">User Statistics for {selectedProperty.name}</h2> */}
              <div className="flex justify-between w-full">
                <div className='flex flex-col w-1/2 mr-2'>
                  <h3 className="text-xl font-semibold">Today User Count: {userCounts[0]}</h3>
                  <h3 className="text-xl font-semibold">Last 7 Days User Count: {userCounts[1]}</h3>

                </div>
                <div className='flex flex-col w-1/2 ml-2'>
                  <h3 className="text-xl font-semibold">Live User Count: {liveUserCounts[0]}</h3>
                  <h3 className="text-xl font-semibold">Last 7 Days Live User Count: {liveUserCounts[1]}</h3>

                </div>
              </div>
            </div>
          )}
        </main>

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

      </div>

    </div>
  );
};

export default AdminPanel;



