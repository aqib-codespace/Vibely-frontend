import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import "./globals-search.css";
import "@/components/global-search/global-search.css";
import StoreProvider from "./storeProvider";
import AuthWrapper from "@/components/AuthWrapper";
import AIAssistantWrapper from "@/components/ai-assistant/client-wrapper";
import { SocketProvider } from "@/contexts/SocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vibely - The Best Social Media Platform",
  description:
    "Experience the best of social media with Vibely. Connect, share, and engage with friends and communities like never before.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <SocketProvider>
            <NotificationProvider>
              <AuthWrapper>{children}</AuthWrapper>
             
              <Toaster />
            </NotificationProvider>
          </SocketProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
