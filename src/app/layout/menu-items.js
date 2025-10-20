import { ShoppingCart, SquarePlay } from "lucide-react";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { LiaHomeSolid } from "react-icons/lia";
import { LuUsers } from "react-icons/lu";
import { MdOutlineVideoLibrary } from "react-icons/md";

export const menuItems = [
  {
    name: "Feed",
    href: "/",
    icon: <LiaHomeSolid />,
  },
  {
    name: "Friends",
    href: "/friends",
    icon: <LuUsers />,
  },
  {
    name: "Watch Videos",
    href: "/watch-videos",
    icon: <MdOutlineVideoLibrary />,
  },
  {
    name: "Marketplace",
    href: "/marketplace",
    icon: <HiOutlineShoppingCart />,
  },
];
