"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { MessageSquare, Trash } from "lucide-react";
import { WhatsAppNodeData } from "@/types/flow";
import { useFlow } from "@/lib/providers/FlowProvider";

interface WhatsAppNodeProps {
  data: WhatsAppNodeData;
  id?: string;
}

export const WhatsAppNode = memo(({ data, id }: WhatsAppNodeProps) => {
  console.log("WhatsAppNode props:", { data, id });
  const { deleteNode } = useFlow();

  return (
    <div className="p-4 min-w-[200px] relative group bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
      <Handle type="target" position={Position.Top} />

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (id) deleteNode(id);
        }}
        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title="Excluir nó"
      >
        <Trash className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4" />
        <span className="font-semibold">
          {data.name || "Mensagem WhatsApp"}
        </span>
      </div>

      <div className="text-sm text-gray-600">
        {data.message || "Nenhuma mensagem definida"}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

WhatsAppNode.displayName = "WhatsAppNode";
