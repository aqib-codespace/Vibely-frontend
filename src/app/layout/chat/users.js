"use client";
import React, { useEffect, useState } from "react";

import Image from "next/image";
import { ListFilter, Smile, SquarePen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ChatSection from "./chat";

export default function Messages({ users }) {
  console.log(users, "users in message component");
  const normalizedUsers = Array.isArray(users)
    ? users.map((user) => ({
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim(),
        avatar: user?.profilePicture?.url || "/avatar.webp",
        userName: user.userName || "",
        email: user.email || "",
      }))
    : [];
  const [tab, setTab] = useState("primary");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (selectedUser && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            from: "them",
            text: `Hi, I'm ${selectedUser.name || selectedUser.userName}!`,
          },
        ]);
      }, 500);
    }
  }, [selectedUser]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { from: "me", text: input }]);
      setInput("");
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { from: "them", text: "Thanks for your message!" },
        ]);
      }, 1000);
    }
  };

  if (selectedUser) {
    return (
      <ChatSection
        user={selectedUser}
        messages={messages}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">Messages</span>
        <div className="flex gap-2">
          <SquarePen className="text-gray-400 cursor-pointer" size={16} />
        </div>
      </div>
      <div className="relative mb-4 w-full">
        <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <ListFilter className="text-gray-500 h-5 w-5" />
        </span>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-100"
        />
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
        </Tabs>
        <button className="text-blue-500 text-sm px-2 py-1 whitespace-nowrap rounded hover:bg-blue-50 ml-auto">
          Requests (4)
        </button>
      </div>
      {tab === "primary" && (
        <>
          <div className="flex flex-col h-[50vh] overflow-y-auto custom-scrollbar gap-2 ">
            {(showAll
              ? normalizedUsers.filter((user) =>
                  [user.name, user.userName, user.email]
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
              : normalizedUsers
                  .filter((user) =>
                    [user.name, user.userName, user.email]
                      .join(" ")
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .slice(0, 10)
            ).map((user) => (
              <div
                key={user.id || user._id}
                className="flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full border border-gray-100"
                  />
                  {user.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <span className="font-medium text-sm">{user.name}</span>
                {/* <span className="text-xs text-gray-500 ml-2">
                  @{user.userName}
                </span> */}
              </div>
            ))}
          </div>
          {!showAll &&
            normalizedUsers.filter((user) =>
              [user.name, user.userName, user.email]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
            ).length > 10 && (
              <button
                className="w-full text-blue-500 text-sm pt-3 hover:underline"
                onClick={() => setShowAll(true)}
              >
                View All
              </button>
            )}
          {showAll && (
            <button
              className="w-full text-blue-500 text-sm pt-3 hover:underline"
              onClick={() => setShowAll(false)}
            >
              Show Less
            </button>
          )}
        </>
      )}
      {tab === "general" && (
        <div className="flex flex-col h-[50vh] items-center justify-center text-gray-800">
          <div className="mb-2 ">
            <Smile className="h-8 w-8 text-blue-primary" />
          </div>

          <span className="text-lg">Nothing Found</span>
        </div>
      )}
    </div>
  );
}
