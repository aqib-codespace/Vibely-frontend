"use client";
import React, { useEffect, useState } from "react";
import Messages from "./users";
import { getAllUsersApi } from "@/app/api/userApis";

const MessagesSection = () => {
  const [users, setUsers] = useState();
  console.log(users, "users in message section component");

  const FetchAllUsers = async () => {
    try {
      const response = await getAllUsersApi();
      setUsers(response?.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    FetchAllUsers();
  }, []);

  return (
    <div className="bg-white rounded-xl fixed right-4 top-28 shadow-sm  w-64">
      <Messages users={users} />
    </div>
  );
};

export default MessagesSection;
