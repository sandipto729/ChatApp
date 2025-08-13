const User = require('../model/User');
const Chat = require('../model/Chat');
const Message = require('../model/Message');
const { getIO } = require("../socketInstance"); // helper to get io instance 


const fetchContacts = async (req, res) => {
  try {
    // Get current user ID from the authenticated request
    const currentUserId = req.userId;
    
    // Find all users except the current user
    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password -refreshToken');
    
    const contacts = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      status: user.status
    }));

    res.status(200).json({
      message: 'Contacts fetched successfully',
      contacts: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

const newChat=async(req,res)=>{
    try{
        const {userId}=req.body; // Receive userId from frontend
        const senderId=req.userId; // Current logged-in user ID from token
        
        // Debug logging
        console.log('Request body:', req.body);
        console.log('SenderId from token:', senderId);
        console.log('UserId from body:', userId);
        
        // Validate input
        if (!userId) {
            return res.status(400).json({ message: 'UserId is required' });
        }
        
        if (!senderId) {
            return res.status(401).json({ message: 'Unauthorized - no sender ID from token' });
        }
        
        // Check if both users exist
        const sender = await User.findById(senderId);
        const receiver = await User.findById(userId);

        console.log('Sender found:', sender ? sender.name : 'null');
        console.log('Receiver found:', receiver ? receiver.name : 'null');

        if (!sender) {
            return res.status(404).json({ message: 'Sender user not found' });
        }
        
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver user not found' });
        }

        // Check if chat already exists between these users
        const existingChat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [senderId, userId] }
        }).populate('users', '-password -refreshToken')
          .populate('latestMessage');

        if (existingChat) {
            return res.status(200).json({
                message: 'Chat already exists',
                chat: existingChat
            });
        }

        // Create new chat
        const chat = new Chat({
            name: `${sender.name} and ${receiver.name}`,
            isGroupChat: false,
            users: [senderId, userId],
            latestMessage: null
        });

        await chat.save();

        // Populate the chat with user details
        const populatedChat = await Chat.findById(chat._id)
            .populate('users', '-password -refreshToken');

        res.status(201).json({
            message: 'New chat created successfully',
            chat: populatedChat
        });

    }catch(e){
        console.error('Error creating new chat:', e);
        res.status(500).json({ message: 'Error creating new chat' });
    }
}

const userChatFetch=async(req,res)=>{
    try{
        const userId=req.userId;

        const chats = await Chat.find({
            users: userId
        }).populate('users', '-password -refreshToken')
          .populate('latestMessage')
          .sort({ updatedAt: -1 });

        // Add users field for compatibility and add unread count
        const formattedChats = chats.map(chat => ({
            ...chat.toObject(),
            unreadCount: 0 // TODO: Implement actual unread count logic
        }));

        res.status(200).json({
            message: 'User chats fetched successfully',
            chats: formattedChats
        });
    }catch(e){
        console.error('Error fetching user chats:', e);
        res.status(500).json({ message: 'Error fetching user chats' });
    }
}
const fetchChatMessage=async(req,res)=>{
    try{
        const chatId=req.params.chatId;

        const messages = await Message.find({ chat: chatId })
            .populate('sender', '-password -refreshToken')
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: 'Chat messages fetched successfully',
            messages: messages
        });
    }catch(e){
        console.error('Error fetching chat messages:', e);
        res.status(500).json({ message: 'Error fetching chat messages' });
    }
}


const saveMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const chatId = req.params.chatId;
    const { content } = req.body;

    console.log('=== saveMessage Debug ===');
    console.log('req.body:', req.body);
    console.log('content extracted:', content);
    console.log('content type:', typeof content);
    console.log('req.body keys:', Object.keys(req.body));
    console.log('========================');

    if (!content || !content.trim()) {
      console.log("Invalid content received:", content);
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    console.log('Saving message:', content);

    const message = new Message({
      sender: senderId,
      chat: chatId,
      content: content.trim()
    });

    const savedMessage = await message.save();
    const chat = await Chat.findById(chatId);
    chat.latestMessage = savedMessage;
    await chat.save();

    // Populate sender data for frontend
    await savedMessage.populate("sender", "name profilePic");

    // Emit to all users in this chat room
    const io = getIO();
    io.to(chatId).emit("messageReceived", savedMessage);

    res.status(201).json({
      message: "Message saved successfully",
      messageData: savedMessage
    });

  } catch (e) {
    console.error("Error saving message:", e);
    res.status(500).json({ message: "Error saving message" });
  }
};


module.exports = {
  fetchContacts,
  newChat,
  userChatFetch,
  fetchChatMessage,
  saveMessage
};
