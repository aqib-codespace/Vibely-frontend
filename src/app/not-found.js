"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

const NotFoundPage = () => {
  const route = useRouter();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <motion.img
        src="/logo.png"
        alt="Logo"
        onClick={() => route.push("/")}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-60 h-auto z-50 cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <motion.span
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 80 }}
          className="text-[40vw] font-extrabold text-blue-200 drop-shadow-lg"
        >
          404
        </motion.span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center px-6 py-12 "
      >
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          className="text-6xl md:text-7xl font-bold text-blue-700 mb-4"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-700 mb-8"
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex gap-4"
        >
          <motion.a
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            href="/"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Go to Home
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => route.back()}
            className="px-5 py-2 rounded-lg bg-white text-blue-700 font-semibold border border-blue-500 shadow hover:bg-blue-50 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
