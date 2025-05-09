import { WhatsAppNode } from "@/components/flow/nodes/WhatsAppNode";
import ButtonEdge from "@/components/flow/ButtonEdge";
import { NODE_TYPES } from "./index";
import { ActionNode } from "@/components/flow/nodes/ActionNode";

export const nodeTypes = {
  [NODE_TYPES.WHATSAPP]: WhatsAppNode,
  init: ActionNode,
  end: ActionNode,
  action: ActionNode,
  condition: ActionNode,
  webhook: ActionNode,
  assistente_virtual: ActionNode,
};

export const edgeTypes = {
  button: ButtonEdge,
};
