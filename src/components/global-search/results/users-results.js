"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserPlus, UserCheck, Clock, UserX } from "lucide-react";

const UsersSearchResults = ({ users = [] }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  const getRelationshipIcon = (status) => {
    switch (status) {
      case "friend":
        return <UserCheck className="h-4 w-4 text-green-500" title="Friend" />;
      case "request_sent":
        return (
          <Clock className="h-4 w-4 text-amber-500" title="Request sent" />
        );
      case "request_received":
        return (
          <UserPlus
            className="h-4 w-4 text-blue-500"
            title="Request received"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const userId = user._id;
        const userName = user.userName;
        const fullName = `${user.firstName || ""} ${
          user.lastName || ""
        }`.trim();
        const profileImage = user.profilePicture?.url || "/avatar.webp";
        const relationship = user.relationshipStatus;

        return (
          <Link
            key={userId}
            href={`/profile/${userId}`}
            className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={profileImage}
                alt={fullName}
                fill
                className="object-cover"
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium text-sm">{fullName}</p>
              <p className="text-gray-500 text-xs">@{userName}</p>
            </div>
            {getRelationshipIcon(relationship)}
          </Link>
        );
      })}
    </div>
  );
};

export default UsersSearchResults;
