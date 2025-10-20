import React from "react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import {
  HiUsers,
  HiShoppingBag,
  HiChatBubbleLeft,
  HiPlay,
} from "react-icons/hi2";
import { TrendingUp, Zap, Shield } from "lucide-react";

export const AuthRightSide = () => {
  return (
    <div className="hidden lg:flex w-full bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-yellow-300/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-300/10 rounded-full blur-xl animate-pulse"></div>

      <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
        <div className="absolute top-20 left-16 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-3xl">
          <div className="text-sm text-gray-500 mb-1">Content Views</div>
          <div className="text-2xl font-bold text-gray-900">2.5M</div>
          <div className="flex items-center mt-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <svg className="w-14 h-6" viewBox="0 0 100 30">
                <path
                  d="M0 25 Q20 10 40 20 T80 8 L100 12"
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-16 right-20 space-y-3">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:shadow-2xl transition-all duration-200">
            <FaInstagram className="w-5 h-5 text-pink-600" />
          </div>

          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:shadow-2xl transition-all duration-200">
            <FaFacebookF className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="absolute top-2/5 right-16 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-2xl transform rotate-3 hover:rotate-1 transition-all duration-300 max-w-xs">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="font-semibold text-gray-900 text-sm">
              Your data, your rules
            </div>
          </div>
          <div className="text-xs text-gray-600 leading-relaxed">
            We protect your privacy with end-to-end encryption and give you full
            control over your data.
          </div>
        </div>

        <div className="absolute bottom-20 left-16 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-sm transform -rotate-1 hover:rotate-0 transition-all duration-300">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                All-in-One Social Hub
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            Chat with friends, share reels, explore marketplace, and discover
            amazing content all in one place.
          </div>
        </div>

        <div className="absolute top-1/2 left-1/4 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center transform rotate-12 hover:rotate-6 transition-all duration-300">
          <HiShoppingBag className="w-6 h-6 text-green-600" />
        </div>

        <div className="absolute bottom-1/4 right-1/5 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-all duration-300">
          <HiChatBubbleLeft className="w-5 h-5 text-blue-500" />
        </div>

        <div className="absolute top-1/4 left-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl flex items-center justify-center transform rotate-45 hover:rotate-12 transition-all duration-300">
          <HiPlay className="w-5 h-5 text-red-500" />
        </div>
      </div>
    </div>
  );
};
