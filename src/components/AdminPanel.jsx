import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFlag,
  FaChevronDown,
  FaChevronRight,
  FaMapMarkerAlt,
  FaGlobe,
  FaDesktop,
  FaMoneyBillWave,
  FaUser,
  FaCog,
  FaBell,
  FaUserCircle,
  FaSearch,
  FaPlus,
  FaBars,
  FaUsers,
  FaComment,
  FaInfo,
  FaChartBar,
  FaTimes,
  FaCamera,
  FaEnvelope,
  FaLock,
  FaSave,
  FaSignOutAlt,  // Add this
  FaEllipsisV,
  FaPaperclip,
  FaPaperPlane,
  FaTrash
} from 'react-icons/fa';

import axios from "axios";
import io from "socket.io-client";
import moment from 'moment';
import logoimage from '../assets/pizeonfly.png';
import chatbg from '../assets/chatbg.jpg'; // You'll need to add this image to your assets folder


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

  const messagesEndRef = useRef(null);

  const [userCountry, setUserCountry] = useState({});
  const [searchPropertyQuery, setSearchPropertyQuery] = useState("");

  const [highlightedId, setHighlightedId] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    services: true,
    basic: true,
    location: true,
    technical: true,
    regional: true
  });


  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeMobileSection, setActiveMobileSection] = useState('chat'); // Default to chat view

  const [showChartModal, setShowChartModal] = useState(false);

  // Add these new state variables at the top with other states
  const [chartData, setChartData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState('daily');

  // Add new state for total users
  const [totalUsers, setTotalUsers] = useState(0);

  const [websiteLogo, setWebsiteLogo] = useState("");
  const [websiteColor, setWebsiteColor] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const [adminData, setAdminData] = useState({
    name: localStorage.getItem('adminName') || '',
    email: localStorage.getItem('adminEmail') || '', // Add email
    profileImage: localStorage.getItem('profileImage'),
    id: localStorage.getItem('adminId')
  });

  // Add this state near other state declarations
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [propertyColor, setPropertyColor] = useState('#3B82F6'); // Default blue color

  // Add these state variables at the top with other states
  const [editPropertyName, setEditPropertyName] = useState('');
  const [editPropertyColor, setEditPropertyColor] = useState('');
  const [editPropertyLogo, setEditPropertyLogo] = useState(null);

  // Add these state variables at the top with other states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminPhoto, setEditAdminPhoto] = useState(null);

  // Add this state near your other state declarations
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSuccessProfileMessage,setShowSuccessProfileMessage] = useState(false);
  const [showPropertyUpdateMessage,setShowPropertyUpdateMessage] = useState(false);

  // Add this state near your other state declarations
  const [showPropertySuccessMessage, setShowPropertySuccessMessage] = useState(false);

  // Add this function for handling property updates
  const handleUpdateProperty = async (propertyId) => {
    try {
      const formData = new FormData();
      formData.append('name', editPropertyName);
      formData.append('color', editPropertyColor);
      formData.append('adminId', adminData.id);
      if (editPropertyLogo) {
        formData.append('logo', editPropertyLogo);
      }

      const response = await axios.put(
        `https://chatbot.pizeonfly.com/api/properties/${propertyId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update the property in the websiteList
      setWebsiteList(websiteList.map(website =>
        website._id === propertyId
          ? response.data
          : website
      ));
      setShowPropertyUpdateMessage(true); // Show success message
      setTimeout(() => setShowPropertyUpdateMessage(false), 3000);

      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
    }
  };

  // Update admin data when localStorage changes
  useEffect(() => {
    const updateAdminData = () => {
      setAdminData({
        name: localStorage.getItem('adminName') || '',
        email: localStorage.getItem('adminEmail') || '', // Add email
        profileImage: localStorage.getItem('profileImage'),
        id: localStorage.getItem('adminId')
      });
    };

    window.addEventListener('storage', updateAdminData);
    return () => window.removeEventListener('storage', updateAdminData);
  }, []);

  const handleCopy = (websiteId, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setHighlightedId(websiteId); // Highlight the copied text
      setTimeout(() => setHighlightedId(null), 2000); // Remove highlight after 2 seconds
    });
  };

  // Add these utility functions at the top of your component
  const getLastNDays = (n) => {
    const dates = [];
    for (let i = 0; i < n; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.unshift(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const token = localStorage.getItem("adminToken");  // Changed from "token" to "adminToken"
  const navigate = useNavigate();

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
      setLiveUserCount(todayLiveUserCount);
    } catch (err) {
      setError("Error fetching user counts");
    }
  };

  // // Add this function to fetch total users
  // const fetchTotalUsers = async (websiteId) => {
  //   try {
  //     const response = await axios.get(`https://chatbot.pizeonfly.com/api/admin/total-users?websiteId=${websiteId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setTotalUsers(response.data.totalUsers || 0);
  //   } catch (err) {
  //     console.error("Error fetching total users:", err);
  //   }
  // };

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
      setError("Service name is required.");
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
      setShowSuccessMessage(true); // Show success message
      setTimeout(() => setShowSuccessMessage(false), 3000); // Hide after 3 seconds
    } catch (err) {
      setError("Error adding service: " + err.response?.data?.message || err.message);
    }
  };

  const [formErrors, setFormErrors] = useState({
    name: '',
    logo: '',
    color: ''
  });

  const handleCreateProperty = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setFormErrors({
      name: '',
      logo: '',
      color: ''
    });

    // Validate form
    let hasError = false;
    const errors = {
      name: '',
      logo: '',
      color: ''
    };

    if (!websiteName.trim()) {
      errors.name = 'Property name is required';
      hasError = true;
    }

    if (!logoFile) {
      errors.logo = 'Logo is required';
      hasError = true;
    }

    if (!websiteColor) {
      errors.color = 'Color is required';
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", websiteName);
      // formData.append("websiteId", websiteId);
      formData.append("color", websiteColor);
      formData.append("logo", logoFile);
      formData.append("adminId", adminData.id);

      const response = await axios.post(
        "https://chatbot.pizeonfly.com/api/properties",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Add the new property to the list
      setWebsiteList([...websiteList, response.data]);
      setShowCreatePropertyModal(false);

      // Reset form
      setWebsiteName("");
      // setWebsiteId("");
      setWebsiteColor("");
      setLogoFile(null);
      
      // Show success message
      setShowPropertySuccessMessage(true);
      setTimeout(() => setShowPropertySuccessMessage(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error("Error creating property:", error);
      if (error.response?.data?.message) {
        // Show backend validation error if any
        setFormErrors({
          ...formErrors,
          name: error.response.data.message
        });
      }
    }
  };



  const fetchProperties = async () => {
    try {
      const response = await axios.get(`https://chatbot.pizeonfly.com/api/properties?adminId=${adminData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWebsiteList(response.data);
      if (response.data.length > 0 && !selectedProperty) {
        setSelectedProperty(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
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
    try {
      setSelectedProperty(property);

      // Store complete property data
      localStorage.setItem('selectedProperty', JSON.stringify(property));

      setWebsiteId(property.websiteId);
      setWebsiteName(property.name);
      setPropertydropdownOpen(false);

      // Clear selected user when changing property
      setSelectedUser(null);
      localStorage.removeItem('selectedUser');

      // Fetch associated data
      await fetchUsersByWebsiteId(property.websiteId);
      await fetchUserCounts(property.websiteId);
      setFilterUnread(false);
    } catch (error) {
      console.error('Error selecting property:', error);
    }
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
    const newSocket = io("https://chatbot.pizeonfly.com");
    setSocket(newSocket);

    newSocket.emit('join_room', adminData.id, websiteId);

    // Listen for live user updates
    newSocket.on('live_users_update', (users) => {
      setLiveUsers(new Set(users)); // Update live users set
    });

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
    const newSocket = io("https://chatbot.pizeonfly.com", {
      query: { userId: adminData.id },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("message", (message) => {
      setUserMessages((prev) => ({
        ...prev,
        [message.senderId]: [...(prev[message.senderId] || []), message],
      }));

      // Update unread counts if the message is not from admin
      if (message.senderId !== adminData.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));

        // Add notification for new message
        setNotifications(prev => [{
          message: `New message from ${users.find(u => u._id === message.senderId)?.name || 'User'}`,
          time: new Date()
        }, ...prev]);
      }
    });

    newSocket.on("userOnline", (userId) => {
      setLiveUsers((prev) => new Set([...prev, userId]));
      setFirstLiveTimes((prev) => ({
        ...prev,
        [userId]: prev[userId] || new Date().toISOString(),
      }));
      setLastLiveTimes((prev) => ({
        ...prev,
        [userId]: new Date().toISOString(),
      }));
    });

    newSocket.on("userOffline", (userId) => {
      setLiveUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setLastLiveTimes((prev) => ({
        ...prev,
        [userId]: new Date().toISOString(),
      }));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);


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
      formData.append("senderId", adminData.id);
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
    try {
      // Remove specific items instead of clearing all localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('profileImage');
      localStorage.removeItem('adminId');

      // Force reload the page after navigation to clear any remaining state
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
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






  useEffect(() => {
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

    // Listen for live user updates
    socket?.on('live_users_update', (users) => {
      setLiveUsers(new Set(users)); // Update live users set
    });

    return () => {
      socket?.off('live_users_update');
    };
  }, [socket, token]);

  // First, add this function to check if a user is live
  const isUserLive = (userId) => {
    return liveUsers.has(userId);
  };

  // Add this function to get live users for a specific property
  const getLiveUsersForProperty = (propertyId) => {
    return Array.from(liveUsers).filter(userId =>
      users.find(user => user._id === userId && user.websiteId === propertyId)
    ).length;
  };

  // Update the fetchStatistics function
  const fetchStatistics = async () => {
    try {
      // Use the existing user counts data
      const dates = {
        daily: getLastNDays(7),
        weekly: getLastNDays(28),
        monthly: getLastNDays(30)
      };

      // Create formatted data for each time range using userCounts and liveUserCounts
      const formattedData = {
        daily: dates.daily.map((date, index) => ({
          date,
          users: index === 0 ? userCounts[0] : 0, // Today's count
          liveUsers: index === 0 ? liveUserCounts[0] : 0 // Today's live count
        })),
        weekly: dates.weekly.map((date, index) => ({
          date,
          users: index < 7 ? Math.round(userCounts[1] / 7) : 0, // Distribute weekly count
          liveUsers: index < 7 ? Math.round(liveUserCounts[1] / 7) : 0 // Distribute weekly live count
        })),
        monthly: dates.monthly.map((date, index) => ({
          date,
          users: index < 30 ? Math.round(userCounts[1] / 30) : 0, // Distribute monthly count
          liveUsers: index < 30 ? Math.round(liveUserCounts[1] / 30) : 0 // Distribute monthly live count
        }))
      };

      // Set the chart data
      setChartData(formattedData);

    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Update the useEffect for fetching data
  useEffect(() => {
    if (selectedProperty?.websiteId) {
      // First fetch user counts
      Promise.all([
        fetchUserCounts(selectedProperty.websiteId),
        // fetchTotalUsers(selectedProperty.websiteId)
      ]).then(() => {
        // Then update the chart data
        fetchStatistics();
      });
    }
  }, [selectedProperty?.websiteId]);

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await axios.delete(`https://chatbot.pizeonfly.com/api/properties/${propertyId}?adminId=${adminData.id}`);

        // Remove the property from the list
        setWebsiteList(websiteList.filter(website => website._id !== propertyId));

        // If the deleted property was selected, clear the selection
        if (selectedProperty?._id === propertyId) {
          setSelectedProperty(null);
          localStorage.removeItem('selectedProperty');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  // Add this function to handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPropertyLogo(file);
    }
  };

  // Add this useEffect to initialize edit values when modal opens
  useEffect(() => {
    if (selectedProperty && showSettingsModal) {
      setEditPropertyName(selectedProperty.name);
      setEditPropertyColor(selectedProperty.color || '#3B82F6');
    }
  }, [selectedProperty, showSettingsModal]);

  // Add this function to handle admin photo change
  const handleAdminPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditAdminPhoto(file);
    }
  };

  // Add this function to handle admin profile update
  const handleUpdateAdminProfile = async () => {
    try {
      const formData = new FormData();

      // Only append fields that have changed
      if (editAdminName) {
        formData.append('name', editAdminName);
      }
      if (editAdminEmail) {
        formData.append('email', editAdminEmail);
      }
      if (editAdminPhoto) {
        formData.append('profileImage', editAdminPhoto);
      }

      const response = await axios.put(
        `https://chatbot.pizeonfly.com/api/admin/profile/${adminData.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update only changed fields in localStorage
      if (response.data.name) {
        localStorage.setItem('adminName', response.data.name);
      }
      if (response.data.profileImage) {
        localStorage.setItem('profileImage', response.data.profileImage);
      }
      if (response.data.email) {
        localStorage.setItem('adminEmail', response.data.email);
      }

      // Update state with new data
      setAdminData(prev => ({
        ...prev,
        name: response.data.name || prev.name,
        email: response.data.email || prev.email,
        profileImage: response.data.profileImage || prev.profileImage,
      }));
      setShowSuccessProfileMessage(true); // Show success message
      setTimeout(() => setShowSuccessProfileMessage(false), 3000);

      setShowProfileModal(false);

      // Clear edit states
      setEditAdminName('');
      setEditAdminEmail('');
      setEditAdminPhoto(null);

    } catch (error) {
      console.error('Error updating admin profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  // Add this useEffect near other useEffects
  useEffect(() => {
    const restoreSelectedProperty = async () => {
      const savedProperty = localStorage.getItem('selectedProperty');
      if (savedProperty) {
        try {
          const property = JSON.parse(savedProperty);

          // First fetch the current property data from the websiteList
          const response = await axios.get(`https://chatbot.pizeonfly.com/api/properties?adminId=${adminData.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Find the matching property from current data
          const currentProperty = response.data.find(p => p._id === property._id);

          if (currentProperty) {
            // Set the property with current data
            setSelectedProperty(currentProperty);
            setWebsiteId(currentProperty.websiteId);
            setWebsiteName(currentProperty.name);

            // Fetch associated data
            await fetchUsersByWebsiteId(currentProperty.websiteId);
            await fetchUserCounts(currentProperty.websiteId);

            // Restore selected user if exists
            const savedUserId = localStorage.getItem('selectedUser');
            if (savedUserId) {
              setSelectedUser(savedUserId);
            }
          } else {
            // If property no longer exists, clear storage
            localStorage.removeItem('selectedProperty');
            localStorage.removeItem('selectedUser');
          }
        } catch (error) {
          console.error('Error restoring selected property:', error);
        }
      }
    };

    restoreSelectedProperty();
  }, []); // Run once on component mount

  // Add this function near your other handlers
  const handleDeleteService = async (serviceId) => {
    try {
      await axios.delete(`https://chatbot.pizeonfly.com/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update services list after deletion
      setServices(services.filter(service => service._id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [userMessages]);


  return (
    <div className='flex flex-col lg:flex-row w-full h-screen overflow-hidden'>
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 items-center justify-between px-6">
        <div className="w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src={logoimage} alt="Logo" className="h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-shadow" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                  <p className="text-xs text-gray-500">{selectedProperty?.name || 'No property selected'}</p>
                </div>
              </div>
            </div>

            {/* Center section - Property Selection and Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <button
                  onClick={() => setPropertydropdownOpen(!propertydropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center space-x-3">
                    {selectedProperty && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                        {selectedProperty?.logo ? (
                          <img
                            src={`https://chatbot.pizeonfly.com${selectedProperty.logo}`}
                            alt={selectedProperty.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 text-lg">
                            {selectedProperty?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-gray-700">{selectedProperty ? selectedProperty.name : "Select Property"}</span>
                  </div>
                  <FaChevronDown className={`transition-transform duration-200 ${propertydropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Property Dropdown */}
                {propertydropdownOpen && (
                  <div ref={dropdownRef} className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchPropertyQuery}
                          placeholder="Search properties..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => setSearchPropertyQuery(e.target.value.toLowerCase())}
                        />
                      </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {websiteList
                        .filter(website => website.name.toLowerCase().includes(searchPropertyQuery))
                        .map((website) => (
                          <button
                            key={website._id}
                            onClick={() => handleSelectProperty(website)}
                            className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                                {website.logo ? (
                                  <img
                                    src={`https://chatbot.pizeonfly.com${website.logo}`}
                                    alt={website.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-blue-600 text-lg">
                                    {website.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="text-left p-1">
                                <p className="font-semibold text-gray-700">{website.name}</p>
                                <p className="text-xs text-gray-500">ID: {website.websiteId}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                                <span className={`w-2 h-2 rounded-full ${getLiveUsersForProperty(website.websiteId) > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                {getLiveUsersForProperty(website.websiteId)}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>

                    <div className="p-3 border-t bg-gray-50">
                      <button
                        onClick={toggleCreatePropertyModal}
                        className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <FaPlus className="mr-2" />
                        Create New Property
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right section - Actions and User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Service
              </button>

              <button
                onClick={() => setShowChartModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FaChartBar className="w-4 h-4" />
                <span className="text-sm font-medium">Statistics</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FaBell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaCog className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {adminData.profileImage && adminData.profileImage !== 'undefined' ? (
                    <img
                      src={`https://chatbot.pizeonfly.com${adminData.profileImage}`}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                      {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <FaChevronDown className={`transition-transform duration-200 ${showUserMenu ? 'transform rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowUserMenu(false);
                          setEditAdminName(adminData.name);
                          setEditAdminEmail(adminData.email || localStorage.getItem('adminEmail') || '');  // Add this
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <FaUserCircle className="mr-2" />
                          Profile
                        </div>
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <img src={logoimage} alt="Logo" className="h-8" />
            <span className="text-xs font-bold text-gray-800">Admin Panel</span>
          </div>
         

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative"
            >
              <FaBell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0.5 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaCog className="h-5 w-5" />
            </button>

            <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {adminData.profileImage && adminData.profileImage !== 'undefined' ? (
                    <img
                      src={`https://chatbot.pizeonfly.com${adminData.profileImage}`}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                      {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <FaChevronDown className={`transition-transform duration-200 hidden md:block${showUserMenu ? 'transform rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowUserMenu(false);
                          setEditAdminName(adminData.name);
                          setEditAdminEmail(adminData.email || localStorage.getItem('adminEmail') || '');  // Add this
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <FaUserCircle className="mr-2" />
                          Profile
                        </div>
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <FaBars className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="p-4 space-y-3">
              <div className="flex-1 max-w-2xl mx-4">
                <div className="relative">
                  <button
                    onClick={() => setPropertydropdownOpen(!propertydropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center space-x-3">
                      {selectedProperty && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                          {selectedProperty?.logo ? (
                            <img
                              src={`https://chatbot.pizeonfly.com${selectedProperty.logo}`}
                              alt={selectedProperty.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 text-lg font-bold">
                              {selectedProperty?.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-gray-700">{selectedProperty ? selectedProperty.name : "Select Property"}</span>
                    </div>
                    <FaChevronDown className={`transition-transform duration-200 ${propertydropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>

                  {/* Property Dropdown */}
                  {propertydropdownOpen && (
                    <div ref={dropdownRef} className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={searchPropertyQuery}
                            placeholder="Search properties..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setSearchPropertyQuery(e.target.value.toLowerCase())}
                          />
                        </div>
                      </div>

                      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {websiteList
                          .filter(website => website.name.toLowerCase().includes(searchPropertyQuery))
                          .map((website) => (
                            <button
                              key={website._id}
                              onClick={() => handleSelectProperty(website)}
                              className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                                  {website.logo ? (
                                    <img
                                      src={`https://chatbot.pizeonfly.com${website.logo}`}
                                      alt={website.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-blue-600 text-lg font-bold">
                                      {website.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-gray-700">{website.name}</p>
                                  <p className="text-xs text-gray-500">ID: {website.websiteId}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                                  <span className={`w-2 h-2 rounded-full ${getLiveUsersForProperty(website.websiteId) > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                  {getLiveUsersForProperty(website.websiteId)}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>

                      {/* <div className="p-3 border-t bg-gray-50">
                      <button
                        onClick={toggleCreatePropertyModal}
                        className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <FaPlus className="mr-2" />
                        Create New Property
                      </button>
                    </div> */}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  toggleCreatePropertyModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <FaPlus className="w-4 h-4" />
                <span className="text-sm font-medium">New Property</span>
              </button>

              <button
                onClick={() => {
                  setShowAddServiceModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
              >
                <FaMoneyBillWave className="w-4 h-4" />
                <span className="text-sm font-medium">Add Service</span>
              </button>

              <button
                onClick={() => setShowChartModal(true)}
                className="flex items-center w-full gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FaChartBar className="w-4 h-4" />
                <span className="text-sm font-medium">Statistics</span>
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around p-1">
          <button
            onClick={() => setActiveMobileSection('users')}
            className={`p-2 rounded-lg flex flex-col items-center relative ${activeMobileSection === 'users' ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <FaUsers className="w-5 h-5" />
            <span className="text-xs">Users</span>
            {liveUsers.size > 0 && (
              <span className="absolute top-0.5 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
              {getLiveUsersForProperty(selectedProperty?.websiteId)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMobileSection('chat')}
            className={`p-2 rounded-lg flex flex-col items-center relative ${activeMobileSection === 'chat' ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <FaComment className="w-5 h-5" />
            <span className="text-xs">Chat</span>
            {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMobileSection('details')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeMobileSection === 'details' ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <FaInfo className="w-5 h-5" />
            <span className="text-xs ">Details</span>
          </button>
        </div>
      </div>

      {/* Add a mobile header status bar */}
      <div className="lg:hidden bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Online Users:</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-sm font-medium">
            {getLiveUsersForProperty(selectedProperty?.websiteId)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Unread:</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-sm font-medium">
              {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Users List Section */}
      <aside className={`w-full lg:w-1/4 bg-zinc-100 p-2 md:mt-32 border-r border-gray-200 h-[calc(100vh-25rem) mt-5 md:h-[calc(100vh-4rem)] 
        ${activeMobileSection === 'users' ? 'block' : 'hidden lg:block'}`}  // Hide on mobile when not active
      >
        <div className="sticky top-0 bg-zinc-100 pb-4 space-y-2">
          {/* Property Info Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold capitalize text-gray-800">
                {selectedProperty ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                      {selectedProperty?.logo ? (
                        <img
                          src={`https://chatbot.pizeonfly.com${selectedProperty.logo}`}
                          alt={selectedProperty.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 text-xl">
                          {selectedProperty?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    {selectedProperty.name}
                  </div>
                ) : "Select a Property"}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">
                  ID: {selectedProperty ? selectedProperty.websiteId : "Unknown"}
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-md font-medium">
                  {getLiveUsersForProperty(selectedProperty?.websiteId)} Online
                </span>
              </div>
            </div>

            {/* Filter Button */}
            <div className="relative">
              {filterUnread ? (
                <button
                  onClick={handleBack}
                  className="p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Back to All Users"
                >
                  <FaTimes size={16} />
                </button>
              ) : (
                <button
                  onClick={handleDropdownToggle}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                  title="Filter Options"
                >
                  <FaEllipsisV size={16} className="text-gray-600" />
                </button>
              )}

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={handleFilterUnread}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FaBell className="text-blue-500" />
                    Unread Messages
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
            <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Users List */}
        <div className="mt-1 overflow-y-auto p-1 pb-10 h-[calc(100vh-15rem)] space-y-2 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 bg-red-50 p-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {filteredUserss.map((user, index) => (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user._id)}
              className={`
                relative flex items-center gap-2 p-1 md:p-1 rounded-lg cursor-pointer
                transition-all duration-200 border border-transparent
                ${selectedUser === user._id
                  ? 'bg-blue-500 shadow-md'
                  : 'bg-white hover:border-gray-200 hover:shadow-sm'
                }
              `}
            >
              {/* Index Number */}
              <span className={`text-sm ml-1 font-medium ${selectedUser === user._id ? 'text-blue-100' : 'text-gray-400'
                }`}>
                {index + 1}.
              </span>

              {/* User Avatar */}
              <div className="relative">
                <div className={`
                  w-8 h-8 flex items-center justify-center rounded-full
                  ${selectedUser === user._id
                    ? 'bg-white text-blue-500'
                    : 'bg-blue-50 text-blue-600'
                  }
                `}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Online Status */}
                {isUserLive(user._id) && (
                  <span
                    className="absolute bottom-0 -right-0 w-3 h-3 bg-green-500 
                      rounded-full border-2 border-white"
                    title="Online"
                  />
                )}
              </div>

              {/* User Name */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium capitalize truncate max-w-[13ch]  ${selectedUser === user._id ? 'text-white' : 'text-gray-700'
                  }`}>
                  {user.name}
                </h3>
              </div>

              {/* Unread Count Badge */}
              {unreadCounts[user._id] > 0 && (
                <span className="
                  flex items-center justify-center w-6 h-6 
                  bg-red-500 text-white text-xs font-bold rounded-full
                  shadow-sm animate-pulse
                ">
                  {unreadCounts[user._id]}
                </span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Section */}
      <div className={`flex flex-col h-full w-full md:w-3/4 md:h-[calc(100vh-4rem)] pb-5 md:p-4 p-1 mt-6 md:mt-32 overflow-hidden 
        ${activeMobileSection === 'chat' ? 'block' : 'hidden lg:block'}`}  // Hide on mobile when not active
      >
        <main className="flex-1 flex flex-col h-2">
          {selectedUser ? (
            <>
              {/* Chat Messages Container */}
              <div
                className="flex-1 overflow-y-auto border border-gray-200 rounded-lg shadow-sm mb-4 md:max-h-[calc(100vh-1rem)] max-h-[calc(100vh-13.5rem)] custom-scrollbar"
                style={{
                  background: `
                    linear-gradient(
                      rgba(255, 255, 255, 0.70), 
                      rgba(255, 255, 255, 0.70)
                    ),
                    url(${chatbg})
                  `,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '400px',
                  backgroundPosition: 'center'
                }}
              >

                {Object.keys(groupedMessages).map((date, idx) => (
                  <div key={idx} className="px-4">
                    {/* Date Header */}
                    <div className="sticky top-0 text-center py-2 z-10">
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                        {date}
                      </span>
                    </div>

                    {/* Messages for the Date */}
                    <div className="space-y-4 py-4">
                      {groupedMessages[date].map((msg, index) => (
                        <div key={index}
                          className={`flex ${msg.senderId === adminData.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex flex-col max-w-[70%] ${msg.senderId === adminData.id ? 'items-end' : 'items-start'}`}>
                            <div className={`
                              rounded-2xl px-4 py-2 shadow-sm
                              ${msg.senderId === adminData.id
                                ? "bg-blue-500 text-white"
                                : "bg-white border border-gray-200"
                              }
                            `}>
                              {/* Message Content */}
                              {msg.content && (
                                <p className={`text-sm ${msg.senderId === adminData.id ? 'text-white' : 'text-gray-700'}`}>
                                  {msg.content}
                                </p>
                              )}

                              {/* Attachments */}
                              {msg.attachment && (
                                <div className="mt-2">
                                  {msg.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <img
                                      src={`https://chatbot.pizeonfly.com${msg.attachment}`}
                                      alt="attachment"
                                      className="max-w-full rounded-lg border border-gray-100 shadow-sm"
                                      loading="lazy"
                                    />
                                  ) : msg.attachment.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video
                                      src={`https://chatbot.pizeonfly.com${msg.attachment}`}
                                      controls
                                      className="max-w-full rounded-lg border border-gray-100 shadow-sm"
                                    />
                                  ) : (
                                    <a
                                      href={`https://chatbot.pizeonfly.com${msg.attachment}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 bg-blue-50 px-3 py-2 rounded-lg"
                                    >
                                      <FaPaperclip className="text-blue-400" />
                                      View Attachment
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Timestamp */}
                            <span className="text-xs text-gray-400 mt-1 px-2">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Area */}
              <div className="bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full outline-none focus:outline-none border-none focus:ring-0 placeholder:text-gray-400"
                  />

                  <label
                    htmlFor="file-input"
                    className="p-2.5 bg-gray-200 text-gray-500 hover:bg-gray-300 rounded-full cursor-pointer transition-colors"
                  >
                    <FaPaperclip className="w-5 h-5" />
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <FaPaperPlane className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Select a user to start chatting</p>
              </div>
            </div>
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
          <div className="fixed inset-0 bg-black w-full bg-opacity-50 flex items-center justify-center z-50">
            <div ref={createPropertyModalRef} className="bg-white w-[90%] lg:w-[40%] h-auto p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold">Create Property</h2>
              <form onSubmit={handleCreateProperty}>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Website Name"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    className={`w-full p-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded`}
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Website Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className={`w-full p-2 border ${formErrors.logo ? 'border-red-500' : 'border-gray-300'} rounded`}
                    required
                  />
                  {formErrors.logo && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.logo}</p>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Website Color</label>
                  <input
                    type="color"
                    value={websiteColor}
                    onChange={(e) => setWebsiteColor(e.target.value)}
                    className={`w-28 border ${formErrors.color ? 'border-red-500' : 'border-gray-300'} rounded`}
                    required
                  />
                  {formErrors.color && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Create Property
                </button>
              </form>

              {/* Property List Section */}
              <div className="mt-6 max-h-60 w-auto overflow-y-auto border-t border-gray-200 pt-4">
                {websiteList.map((website) => (
                  <div key={website._id} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800 text-sm">
                        This Script for: {website.name}
                      </h3>
                      <button
                        onClick={() => handleDeleteProperty(website._id)}
                        className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
                        title="Delete Property"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div
                      className={`relative bg-gray-100 p-4 rounded-lg border text-sm ${highlightedId === website._id ? "bg-blue-100" : "bg-gray-100"
                        }`}
                    >
                      <pre className="overflow-auto">
                        <code>
                          {`<script>
    document.addEventListener('DOMContentLoaded',()=>{
      const i=document.createElement('iframe'),c=document.createElement('div'),
      chat='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      close='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      i.src='https://chatbot-user.vercel.app/?websiteId=${website.websiteId}';i.style.cssText='position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);display:none;background:#fff;z-index:9999;transition:.3s ease';
      c.innerHTML=chat;c.style.cssText='position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:${website.color || '#1950ff'};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(89,146,238,.4);z-index:10000;transition:.3s ease';
      c.onmouseover=()=>{c.style.transform='scale(1.1)';c.style.boxShadow='0 6px 16px rgba(89,146,238,.5)'};
      c.onmouseout=()=>{c.style.transform='scale(1)';c.style.boxShadow='0 4px 12px rgba(89,146,238,.4)'};
      c.onclick=()=>{const v=i.style.display==='block';i.style.display=v?'none':'block';i.style.transform=v?'translateY(20px)':'translateY(0)';i.style.opacity=v?'0':'1';c.style.transform=v?'rotate(0deg)':'rotate(360deg)';setTimeout(()=>c.innerHTML=v?chat:close,150)};
      document.body.append(i,c);
});
</script>`}
                        </code>
                      </pre>
                      <button
                        onClick={() =>
                          handleCopy(
                            website._id,
                            `<script>
    document.addEventListener('DOMContentLoaded',()=>{
      const i=document.createElement('iframe'),c=document.createElement('div'),
      chat='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      close='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      i.src='https://chatbot-user.vercel.app/?websiteId=${website.websiteId}';i.style.cssText='position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);display:none;background:#fff;z-index:9999;transition:.3s ease';
      c.innerHTML=chat;c.style.cssText='position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:${website.color || '#1950ff'};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(89,146,238,.4);z-index:10000;transition:.3s ease';
      c.onmouseover=()=>{c.style.transform='scale(1.1)';c.style.boxShadow='0 6px 16px rgba(89,146,238,.5)'};
      c.onmouseout=()=>{c.style.transform='scale(1)';c.style.boxShadow='0 4px 12px rgba(89,146,238,.4)'};
      c.onclick=()=>{const v=i.style.display==='block';i.style.display=v?'none':'block';i.style.transform=v?'translateY(20px)':'translateY(0)';i.style.opacity=v?'0':'1';c.style.transform=v?'rotate(0deg)':'rotate(360deg)';setTimeout(()=>c.innerHTML=v?chat:close,150)};
      document.body.append(i,c);
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
          <div className="fixed inset-0  bg-black bg-opacity-50  flex items-center justify-center z-50 p-2">
            <div ref={addServiceModalRef} className="bg-white w-[90%] lg:w-[40%] h-[96%] p-4 rounded-lg shadow-xl">
              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaMoneyBillWave className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Add Service</h2>
                    <p className="text-sm text-gray-600">Create a new service for your platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4">
                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Service Name</label>
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Website ID</label>
                    <input
                      type="text"
                      placeholder="Website ID"
                      value={websiteId}
                      onChange={(e) => setWebsiteId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      required
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Add Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddServiceModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Services History Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Services History</h3>
                  <div className="overflow-y-auto max-h-64 custom-scrollbar rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50 sticky top-0">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website ID</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((service) => (
                          <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{service.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{service.websiteId}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this service?')) {
                                    handleDeleteService(service._id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete Service"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">User Statistics</h2>
                <button
                  onClick={() => setShowChartModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4">
                {selectedProperty ? (
                  <div className="space-y-2">
                    {/* Time Range Selector */}
                    <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-lg">
                      {['daily', 'weekly', 'monthly'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setSelectedTimeRange(range)}
                          className={`px-4 py-2 rounded-lg capitalize transition-colors ${selectedTimeRange === range
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>

                    {/* Stats Cards - Simplified */}
                    <div className="grid grid-cols-4 gap-4">
                      {/* <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                        <div className="text-3xl font-bold text-purple-600">
                          {totalUsers}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">All time users</div>
                      </div> */}

                      <div className="bg-blue-50 p-2 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-800">Today's Users</h3>
                        <div className=" font-bold text-blue-600">
                          {userCounts[0] || 0}
                        </div>
                        <div className="text-xs text-gray-600">Active today</div>
                      </div>

                      <div className="bg-indigo-50 p-2 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-800">Last 7 Days Users</h3>
                        <div className=" font-bold text-indigo-600">
                          {userCounts[1] || 0}
                        </div>
                        <div className="text-xs text-gray-600">Active past week</div>
                      </div>

                      <div className="bg-green-50 p-2 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-800">Today's Live Users</h3>
                        <div className=" font-bold text-green-600">
                          {liveUserCounts[0] - 1 || 0}
                        </div>
                        <div className="text-xs text-gray-600">Online today</div>
                      </div>

                      <div className="bg-emerald-50 p-2 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-800">Last 7 Days Live Users</h3>
                        <div className=" font-bold text-emerald-600">
                          {liveUserCounts[1] || 0}
                        </div>
                        <div className="text-xs text-gray-600">Online past week</div>
                      </div>
                    </div>

                    {/* Main Chart - Updated height and options */}
                    <div className="bg-white p-2 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">
                        User Activity - {selectedTimeRange.charAt(0).toUpperCase() + selectedTimeRange.slice(1)}
                      </h3>
                      <div style={{ height: '400px' }}>
                        <Bar
                          data={{
                            labels: ['Today', 'Last 7 Days'],
                            datasets: [
                              {
                                label: 'Total Users',
                                data: userCounts,
                                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                borderColor: 'rgb(59, 130, 246)',
                                borderWidth: 1,
                                yAxisID: 'y',
                              },
                              {
                                label: 'Live Users',
                                data: liveUserCounts,
                                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                                borderColor: 'rgb(16, 185, 129)',
                                borderWidth: 1,
                                yAxisID: 'y1',
                              }
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                              mode: 'index',
                              intersect: false,
                            },
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              tooltip: {
                                mode: 'index',
                                intersect: false,
                              },
                            },
                            scales: {
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                  display: true,
                                  text: 'Total Users'
                                },
                                min: 0,
                              },
                              y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                  display: true,
                                  text: 'Live Users'
                                },
                                grid: {
                                  drawOnChartArea: false,
                                },
                                min: 0,
                              },
                              x: {
                                grid: {
                                  display: false,
                                }
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Please select a property to view statistics
                  </div>
                )}
              </div>
            </div>
          </div>
        )}



        {showSettingsModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[94%] h-[96%] max-w-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Property Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Property Logo */}
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                      {selectedProperty?.logo ? (
                        <img
                          src={`https://chatbot.pizeonfly.com${selectedProperty.logo}`}
                          alt={selectedProperty.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 text-3xl font-bold">
                          {selectedProperty?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <FaCamera className="text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editPropertyName}
                      onChange={(e) => setEditPropertyName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Property Name"
                    />
                    <p className="text-sm text-gray-500 mt-1">ID: {selectedProperty.websiteId}</p>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Color
                  </label>
                  <input
                    type="color"
                    value={editPropertyColor}
                    onChange={(e) => setEditPropertyColor(e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>


                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800 text-sm">
                    This Script for: {selectedProperty.name}
                  </h3>
                </div>
                <div
                  className={`relative bg-gray-100 p-3 rounded-lg border text-sm ${highlightedId === selectedProperty.websiteId ? "bg-blue-100" : "bg-gray-100"
                    }`}
                >
                  <pre className="overflow-auto">
                    <code>
                      {`<script>
    document.addEventListener('DOMContentLoaded',()=>{
      const i=document.createElement('iframe'),c=document.createElement('div'),
      chat='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      close='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      i.src='https://chatbot-user.vercel.app/?websiteId=${selectedProperty.websiteId}';i.style.cssText='position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);display:none;background:#fff;z-index:9999;transition:.3s ease';
      c.innerHTML=chat;c.style.cssText='position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:${selectedProperty.color || '#1950ff'};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(89,146,238,.4);z-index:10000;transition:.3s ease';
      c.onmouseover=()=>{c.style.transform='scale(1.1)';c.style.boxShadow='0 6px 16px rgba(89,146,238,.5)'};
      c.onmouseout=()=>{c.style.transform='scale(1)';c.style.boxShadow='0 4px 12px rgba(89,146,238,.4)'};
      c.onclick=()=>{const v=i.style.display==='block';i.style.display=v?'none':'block';i.style.transform=v?'translateY(20px)':'translateY(0)';i.style.opacity=v?'0':'1';c.style.transform=v?'rotate(0deg)':'rotate(360deg)';setTimeout(()=>c.innerHTML=v?chat:close,150)};
      document.body.append(i,c);
    });
  </script>`}
                    </code>
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        selectedProperty.websiteId,
                        `<script>
    document.addEventListener('DOMContentLoaded',()=>{
      const i=document.createElement('iframe'),c=document.createElement('div'),
      chat='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      close='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      i.src='https://chatbot-user.vercel.app/?websiteId=${selectedProperty.websiteId}';i.style.cssText='position:fixed;bottom:100px;right:20px;width:350px;height:500px;border:none;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);display:none;background:#fff;z-index:9999;transition:.3s ease';
      c.innerHTML=chat;c.style.cssText='position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:${selectedProperty.color || '#1950ff'};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(89,146,238,.4);z-index:10000;transition:.3s ease';
      c.onmouseover=()=>{c.style.transform='scale(1.1)';c.style.boxShadow='0 6px 16px rgba(89,146,238,.5)'};
      c.onmouseout=()=>{c.style.transform='scale(1)';c.style.boxShadow='0 4px 12px rgba(89,146,238,.4)'};
      c.onclick=()=>{const v=i.style.display==='block';i.style.display=v?'none':'block';i.style.transform=v?'translateY(20px)':'translateY(0)';i.style.opacity=v?'0':'1';c.style.transform=v?'rotate(0deg)':'rotate(360deg)';setTimeout(()=>c.innerHTML=v?chat:close,150)};
      document.body.append(i,c);
    });
  </script>`
                      )
                    }
                    className="absolute px-1 py-2 top-1 right-2 bg-blue-500 text-white md:px-2 md:py-1 text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    Copy
                  </button>
                </div>


                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this property?')) {
                        handleDeleteProperty(selectedProperty._id);
                      }
                    }}
                    className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Delete Property
                  </button>
                  <button
                    onClick={() => handleUpdateProperty(selectedProperty._id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>


      {/* User Details Section */}




      <div className={`w-full overflow-y-scroll lg:w-3/4 md:overflow-y-scroll h-screen custom-scrollbar p-4 pb-20 
          bg-gradient-to-r from-green-100 to-sky-200 border-l border-gray-200 md:mt-16 
          ${activeMobileSection === 'details' ? 'block' : 'hidden lg:block'}`}  // Hide on mobile when not active
      >
        {selectedUser ? (
          <div className="space-y-4 mt-12">
            {/* User Header Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-semibold">
                  {users.find((u) => u._id === selectedUser)?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-md capitalize font-semibold text-gray-800">
                    {users.find((u) => u._id === selectedUser)?.name || "User"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {users.find((u) => u._id === selectedUser)?.email || "No email"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {users.find((u) => u._id === selectedUser)?.phone || "No phone no."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded-md">
                  <p className="text-gray-600">First Live</p>
                  <p className="font-medium">
                    {firstLiveTimes[selectedUser]
                      ? moment(firstLiveTimes[selectedUser]).format("MMM DD, YYYY h:mm A")
                      : "Unknown"}
                  </p>
                </div>
                <div className="bg-green-50 p-2 rounded-md">
                  <p className="text-gray-600">Last Live</p>
                  <p className="font-medium">
                    {lastLiveTimes[selectedUser]
                      ? moment(lastLiveTimes[selectedUser]).format("MMM DD, YYYY h:mm A")
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, services: !prev.services }))}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <FaMoneyBillWave className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-700">Services</span>
                </div>
                {expandedSections.services ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
              </button>

              {expandedSections.services && (
                <div className="p-4 bg-gray-50 border-t">
                  {(users.find((u) => u._id === selectedUser)?.services || []).map((service, index) => (
                    <div key={index} className="bg-blue-100 p-2 rounded-md mb-2 text-gray-700">
                      {service}
                    </div>
                  ))}
                  {(users.find((u) => u._id === selectedUser)?.services || []).length === 0 && (
                    <p className="text-gray-500 text-sm">No services selected</p>
                  )}
                </div>
              )}
            </div>

            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, basic: !prev.basic }))}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-700">Basic Information</span>
                </div>
                {expandedSections.basic ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
              </button>

              {expandedSections.basic && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-white rounded-md ">
                      <span className="text-gray-600">IP Address</span>
                      <span className="font-medium break-all">{users.find((u) => u._id === selectedUser)?.location?.ip || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-md">
                      <span className="text-gray-600">Network</span>
                        <span className="font-medium">{users.find((u) => u._id === selectedUser)?.location?.network || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-md">
                      <span className="text-gray-600">Organization</span>
                      <span className="font-medium">{users.find((u) => u._id === selectedUser)?.location?.organization
                        || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSections((prev) => ({ ...prev, location: !prev.location }))}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-700">Location Details</span>
                </div>
                {expandedSections.location ? (
                  <FaChevronDown className="text-gray-400" />
                ) : (
                  <FaChevronRight className="text-gray-400" />
                )}
              </button>

              {expandedSections.location && (
                <div className="p-4 bg-gray-50 border-t space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-semibold mb-2 text-blue-700">City & Region</p>
                      <p className="text-sm">
                        🏙️ {users.find((u) => u._id === selectedUser)?.location?.city || "Unknown"}
                      </p>
                      <p className="text-sm">
                        📍 {users.find((u) => u._id === selectedUser)?.location?.region || "Unknown"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-semibold mb-2 text-green-700">Coordinates</p>
                      <p className="text-sm">
                        📍 Lat: {users.find((u) => u._id === selectedUser)?.location?.latitude || "Unknown"}
                      </p>
                      <p className="text-sm">
                        📍 Long: {users.find((u) => u._id === selectedUser)?.location?.longitude || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* System Information Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, technical: !prev.technical }))}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                    <FaDesktop className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-700">System Information</span>
                </div>
                {expandedSections.technical ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
              </button>

              {expandedSections.technical && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-semibold mb-2 text-gray-700">Device Info</p>
                      <p className="text-sm">💻 OS: {users.find((u) => u._id === selectedUser)?.location?.os || "Unknown"}</p>
                      <p className="text-sm">🌐 Browser: {users.find((u) => u._id === selectedUser)?.location?.browser || "Unknown"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="font-semibold mb-2 text-gray-700">Network Info</p>
                      <p className="text-sm">🔌 ASN: {users.find((u) => u._id === selectedUser)?.location?.asn || "Unknown"}</p>
                      <p className="text-sm">🌐 Version: {users.find((u) => u._id === selectedUser)?.location?.version || "Unknown"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Regional Information Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, regional: !prev.regional }))}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <FaGlobe className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-700">Regional Information</span>
                </div>
                {expandedSections.regional ? <FaChevronDown className="text-gray-400" /> : <FaChevronRight className="text-gray-400" />}
              </button>

              {expandedSections.regional && (
                <div className="p-4 bg-gray-50 border-t space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="font-semibold mb-2 text-purple-700">Country Details</p>
                      <p className="text-sm">🏳️ {users.find((u) => u._id === selectedUser)?.location?.country || "Unknown"}</p>
                      <p className="text-sm">🏛️ Capital: {users.find((u) => u._id === selectedUser)?.location?.countryCode || "Unknown"}</p>
                      <p className="text-sm">📞 {users.find((u) => u._id === selectedUser)?.location?.country_calling_code || "Unknown"}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="font-semibold mb-2 text-yellow-700">Currency & Language</p>
                      <p className="text-sm">💰 {users.find((u) => u._id === selectedUser)?.location?.currency_name || "Unknown"}</p>
                      <p>⏰ Timezone: {users.find((u) => u._id === selectedUser)?.location?.timezone || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-semibold mb-2 text-blue-700">Additional Information</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p>👥 Population: {users.find((u) => u._id === selectedUser)?.location?.country_population?.toLocaleString() || "Unknown"}</p>
                      <p>📏 Area: {users.find((u) => u._id === selectedUser)?.location?.country_area?.toLocaleString() || "Unknown"} km²</p>
                      <p>🌍 In EU: {users.find((u) => u._id === selectedUser)?.location?.in_eu ? "Yes" : "No"}</p>
                      <p className="text-sm">🗣️ {users.find((u) => u._id === selectedUser)?.location?.languages || "Unknown"}</p>

                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Select a user to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[94%] max-w-md p-8 transform transition-all">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Admin Photo Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-50 shadow-lg">
                    {adminData.profileImage ? (
                      <img
                        src={`https://chatbot.pizeonfly.com${adminData.profileImage}`}
                        alt={adminData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <FaUserCircle className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-all duration-200">
                      <FaCamera className="text-white text-xl mb-1" />
                      <span className="text-white text-xs">Change Photo</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAdminPhotoChange}
                      />
                    </label>
                  </div>
                </div>
                {editAdminPhoto && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    New photo selected
                  </p>
                )}
              </div>

              {/* Admin Details Form */}
              <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                {/* Admin Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={editAdminName}
                      onChange={(e) => setEditAdminName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={editAdminEmail}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="your.email@example.com"
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaLock className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <FaInfo className="w-3 h-3 mr-1" />
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAdminProfile}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <FaSave className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p>Service added successfully!</p>
          </div>
        </div>
      )}

      {showSuccessProfileMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p>Profile Update successfully!</p>
          </div>
        </div>
      )}

      {showPropertySuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p>Property created successfully!</p>
          </div>
        </div>
      )}

      {showPropertyUpdateMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p>Property Update successfully!</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;