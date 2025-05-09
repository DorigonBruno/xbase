import { Node, Edge } from "reactflow";

export interface WhatsAppNodeData {
  name: string;
  message: string;
  parameters?: Record<string, any>;
}

export interface FlowData {
  nodes: Node<WhatsAppNodeData>[];
  edges: Edge[];
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: Node<WhatsAppNodeData>[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

export type NodeType =
  | "init"
  | "end"
  | "action"
  | "condition"
  | "webhook"
  | "assistente_virtual";

export interface ActionNodeData {
  image?: string;
  type: {
    app: "WhatsApp" | "Webhook" | string;
    operation: "receive_message" | "send_message" | string;
  };
  [key: string]: any; // outros campos dinâmicos
}

export interface FlowNode {
  id: string;
  position: { x: number; y: number };
  type: NodeType;
  data: ActionNodeData;
}
