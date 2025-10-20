import { ArrowLeft, Send } from "lucide-react";
import Image from "next/image";
import React from "react";

const ChatSection = ({ user, messages, input, setInput, onSend, onBack }) => {
  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex w-full bg-blue-primary rounded px-3 py-4 items-center  gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-gray-100  py-1 rounded hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Image
          src={user.avatar || "/avatar.webp"}
          alt={user.name}
          width={30}
          height={30}
          className="rounded-full"
        />
        <span className="font-semibold text-white text-lg">{user.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-2 px-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.from === "me" ? "justify-end" : "justify-start"
            } mb-1`}
          >
            <span
              className={`px-3 py-1 rounded-sm mb-2 text-sm ${
                msg.from === "me"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex px-3 py-3 relative gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
          placeholder="Type a message..."
          className="w-full px-3 py-1 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-100"
        />
        <button
          onClick={onSend}
          className="px-2 py-1 bg-blue-primary text-white rounded hover:bg-blue-600"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
