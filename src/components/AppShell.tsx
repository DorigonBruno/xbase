"use client";
import React, { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | number | null
  >(null);

  return (
    <>
      <Sidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
      {children}
    </>
  );
}
