"use client";

import { Title, Text, Avatar, Button, Popover, Switch } from "rizzui";
import { useTheme } from "next-themes";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { logout } from "@/store/authSlice";

export default function ProfileMenu({ avatarClassName }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button>
          <Avatar
            src={user?.profilePicture?.url || "/avatar.webp"}
            name={user?.fullName || ""}
            className={cn(
              "!h-9 w-9 sm:!h-10 sm:!w-10 text-white",
              avatarClassName
            )}
          />
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0">
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

const menuItems = [
  {
    name: "My Profile",
    href: "/profile-setting/posts",
  },
  {
    name: "Account Settings",
    href: "/account-settings",
  },
];

function DropdownMenu() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const signOutHandler = async () => {
    localStorage.removeItem("persist:auth");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    router.push("/signin");
    setTimeout(() => {
      dispatch(logout());
    }, 2000);
  };
  const fullName = user?.firstName + " " + user?.lastName;
  return (
    <div className="w-full bg-gray-100 text-left min-w-[240px] max-w-[90vw] sm:max-w-[320px]">
      <div className="flex items-center border-b border-gray-300 px-4 sm:px-6 pb-4 sm:pb-5 pt-4 sm:pt-6">
        <Avatar
          src={user?.profilePicture?.url || "/avatar.webp"}
          name={fullName || ""}
          className="text-white !h-10 !w-10"
        />
        <div className="ms-3 overflow-hidden">
          <Title
            as="h6"
            className="font-semibold text-sm sm:text-base truncate"
          >
            {fullName}
          </Title>
          <Text className="text-gray-600 text-xs sm:text-sm truncate max-w-[180px] sm:max-w-[240px]">
            {user?.email}
          </Text>
        </div>
      </div>
      <div className="grid font-medium text-gray-700">
        {menuItems.map((item, index) => (
          <Link
            key={item?.name}
            href={item?.href}
            className={`group my-0.5 py-3 sm:py-4 px-4 sm:px-6 cursor-pointer flex items-center hover:bg-gray-100 focus:outline-none text-sm sm:text-base ${
              index !== menuItems.length - 1 ? "border-b border-gray-300" : ""
            }`}
          >
            {item?.name}
          </Link>
        ))}
      </div>

      <div className="border-t border-gray-300 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 sm:pt-5">
        <Button
          className="h-auto cursor-pointer w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0 text-sm sm:text-base"
          variant="text"
          onClick={signOutHandler}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
