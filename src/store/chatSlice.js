import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  friends: [],
  chats: {}, // { [chatId]: { messages: [], hasMore: true, isLoading: false } }
  selectedChatId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setFriends(state, action) {
      state.friends = action.payload;
    },
    setChats(state, action) {
      state.chats = action.payload;
    },
    setSelectedChatId(state, action) {
      state.selectedChatId = action.payload;
    },
    setChatMessages(state, action) {
      const { chatId, messages, hasMore } = action.payload;
      state.chats[chatId] = {
        ...state.chats[chatId],
        messages,
        hasMore,
        isLoading: false,
      };
    },
    addChatMessage(state, action) {
      const { chatId, message } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = { messages: [], hasMore: true, isLoading: false };
      }
      state.chats[chatId].messages.push(message);
    },
    setChatLoading(state, action) {
      const { chatId, isLoading } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = { messages: [], hasMore: true, isLoading };
      } else {
        state.chats[chatId].isLoading = isLoading;
      }
    },
    clearChatMessages(state, action) {
      const chatId = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].messages = [];
        state.chats[chatId].hasMore = true;
      }
    },
  },
});

export const {
  setFriends,
  setChats,
  setSelectedChatId,
  setChatMessages,
  addChatMessage,
  setChatLoading,
  clearChatMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
