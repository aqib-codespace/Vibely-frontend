"use client";

import dynamic from "next/dynamic";
const AIAssistant = dynamic(() => import("@/components/ai-assistant"), {
  ssr: false,
});

export default function AIAssistantWrapper() {
  return <AIAssistant />;
}
