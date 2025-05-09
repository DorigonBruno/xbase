"use client";

import React, { useState } from "react";
import { FlowProvider } from "@/lib/providers/FlowProvider";
import { FlowEditor } from "@/components/flow/FlowEditor";
import { AssistantChat } from "@/components/flow/AssistantChat";
import { Sidebar } from "@/components/ui/Sidebar";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | number | null
  >(null);

  return (
    <main className="min-h-screen p-8">
      <Sidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
      <FlowProvider selectedProjectId={selectedProjectId}>
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Editor de Fluxos de Automação
          </h1>
          <FlowEditor />
        </div>
        <AssistantChat />
      </FlowProvider>
      <Toaster position="top-center" />
    </main>
  );
}
