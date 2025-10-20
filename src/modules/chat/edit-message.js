import React, { useState, useEffect } from "react";
import { MdOutlineEdit, MdClose } from "react-icons/md";
import { IoIosSend } from "react-icons/io";

const EditMessage = ({
  editModalOpen,
  setEditModalOpen,
  editMessageData,
  setEditMessageData,
  handleEditMessage,
  editLoading,
}) => {
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (editMessageData) {
      setEditedContent(editMessageData.content || editMessageData.text || "");
    }
  }, [editMessageData]);

  if (!editModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedContent.trim()) {
      handleEditMessage(editedContent.trim());
    }
  };

  const handleCancel = () => {
    setEditModalOpen(false);
    setEditMessageData(null);
    setEditedContent("");
  };

  return (
    <div>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="bg-blue-100 rounded-full p-2 mr-3">
                <MdOutlineEdit className="text-blue-500 h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-gray-800">
                Edit Message
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={editLoading}
            >
              <MdClose className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={12}
                disabled={editLoading}
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors flex items-center justify-center min-w-[100px]"
                disabled={editLoading || !editedContent.trim()}
              >
                {editLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <IoIosSend className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMessage;
