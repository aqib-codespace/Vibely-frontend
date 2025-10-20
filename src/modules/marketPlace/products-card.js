import Link from "next/link";
import React from "react";

const ProductCard = ({ item }) => {
  const { name, price, images = [], createdAt } = item;
  const imageUrl = images[0]?.url || "/not-found.png";
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <Link
      href={`/marketplace/${item._id}`}
      className="group bg-white cursor-pointer shadow rounded-3xl p-0 flex flex-col border-2 border-gray-50 hover:shadow-3xl hover:border-gray-200 transition-all duration-200 overflow-hidden relative min-h-[320px]"
    >
      <div className="w-full aspect-[4/3] bg-gradient-to-tr from-gray-100 to-white flex items-center justify-center overflow-hidden relative">
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-4 right-4 bg-white/90 text-blue-700 text-base font-extrabold px-4 py-1.5 rounded-full shadow border border-gray-100">
          ${price}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-6 py-4">
        <h2
          className="font-bold text-xl truncate text-gray-900 mb-1"
          title={name}
        >
          {name}
        </h2>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="">Listed on</span>
          <span className="text-gray-600 font-semibold">{date}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
