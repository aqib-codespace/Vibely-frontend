"use client";

import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { forwardRef, useImperativeHandle } from "react";

import MentionList from "./mention-list";
import { GetFriends } from "@/app/api/friends";

const RichTextEditor = forwardRef(({ content, setContent }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention text-blue-600 font-semibold bg-blue-50 px-1 rounded",
        },
        renderText({ options, node }) {
          return `${options.suggestion.char}${node.attrs.label}`;
        },
        suggestion: {
          char: "@",
          items: async ({ query }) => {
            try {
              const { data } = await GetFriends(1, 10, query);
              const friends = data.map((friend) => ({
                id: friend._id,
                label: friend.firstName + " " + friend.lastName,
                avatar: friend.profilePicture?.url,
              }));
              return friends;
            } catch (error) {
              console.error("Error fetching friends for mention:", error);
              return [];
            }
          },
          render: () => {
            let reactRenderer;
            let popup;

            return {
              onStart: (props) => {
                console.log("Mention started with props:", props);
                reactRenderer = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) {
                  console.warn("No clientRect provided");
                  return;
                }

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: reactRenderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                  zIndex: 99999,
                  animation: false,
                });
              },
              onUpdate(props) {
                console.log("Mention update with props:", props);
                if (reactRenderer) {
                  reactRenderer.updateProps(props);
                }
                if (popup && popup[0] && props.clientRect) {
                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                  });
                }
              },
              onKeyDown(props) {
                if (props.event.key === "Escape") {
                  if (popup && popup[0]) {
                    popup[0].hide();
                  }
                  return true;
                }
                return reactRenderer.ref?.onKeyDown?.(props);
              },
              onExit() {
                console.log("Mention exiting");
                if (popup && popup[0]) {
                  popup[0].destroy();
                }
                if (reactRenderer) {
                  reactRenderer.destroy();
                }
              },
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      console.log("Editor created:", editor);
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none w-full min-h-[120px] max-h-[200px] custom-scrollbar overflow-y-auto",
      },
    },
  });

  useImperativeHandle(ref, () => ({
    insertMention: () => {
      console.log("insertMention called, editor:", editor);
      if (editor && editor.commands) {
        try {
          editor.commands.focus();
          editor.commands.insertContent("@");
          console.log("Mention inserted successfully");
        } catch (error) {
          console.error("Error inserting mention:", error);
        }
      } else {
        console.warn("Editor or commands not available");
      }
    },
    getEditor: () => editor,
  }));

  if (!editor) {
    console.log("Editor not ready yet");
    return null;
  }

  return (
    <div className="rounded-md bg-gray-50 p-2">
      <EditorContent editor={editor} />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
