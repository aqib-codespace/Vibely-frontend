import { io } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  initializeSocket(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(BACKEND_URL, {
      auth: { token },
      autoConnect: false,
    });

    this.socket.connect();

    this.socket.on("connect", () => {
      console.log("Connected to socket.io");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket.io");
      this.isConnected = false;
    });

    this.socket.on("connected", () => {
      console.log("Socket confirmed connection");
    });

    return this.socket;
  }

  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join chat", chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave chat", chatId);
    }
  }

  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("new message", messageData);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("message received", callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off("message received");
    }
  }

  startTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing", chatId);
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("stop typing", chatId);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on("typing", callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on("stop typing", callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

const socketService = new SocketService();
export default socketService;
