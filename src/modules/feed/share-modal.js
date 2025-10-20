"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Copy, CheckCircle } from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  TelegramIcon,
} from "react-share";

const ShareModal = ({ isOpen, onClose, postId, title, content }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/post/${postId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="">
          <DialogTitle className="text-xl text-left md:text-center font-semibold">
            Share Post
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="flex  flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex  items-center space-x-2">
              <div className=" rounded-md md:w-full w-1/2  border border-gray-200 px-2 py-1.5 text-sm overflow-x-auto bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="md:border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium leading-none mb-4">
              Share on Social Media
            </h3>
            <div className="flex flex-wrap gap-3 justify-start">
              <FacebookShareButton url={shareUrl} quote={title || content}>
                <FacebookIcon size={40} round />
              </FacebookShareButton>

              <TwitterShareButton url={shareUrl} title={title || content}>
                <TwitterIcon size={40} round />
              </TwitterShareButton>

              <WhatsappShareButton url={shareUrl} title={title || content}>
                <WhatsappIcon size={40} round />
              </WhatsappShareButton>

              <LinkedinShareButton
                url={shareUrl}
                title={title || "Check out this post"}
                summary={content}
              >
                <LinkedinIcon size={40} round />
              </LinkedinShareButton>

              <TelegramShareButton url={shareUrl} title={title || content}>
                <TelegramIcon size={40} round />
              </TelegramShareButton>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Share this post with your friends and followers
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
