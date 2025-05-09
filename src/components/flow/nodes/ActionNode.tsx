import React from "react";
import { Handle, Position } from "reactflow";
import {
  FaWhatsapp,
  FaPlay,
  FaStop,
  FaCodeBranch,
  FaGlobe,
  FaBolt,
  FaInstagram,
  FaRobot,
  FaDatabase,
} from "react-icons/fa";
import { ActionNodeData, NodeType } from "@/types/flow";
import { useFlow } from "@/lib/providers/FlowProvider";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";

interface ActionNodeProps {
  id: string;
  type: NodeType;
  data: ActionNodeData;
}

const typeStyles: Record<NodeType, string> = {
  init: "border-blue-500 bg-blue-50",
  end: "border-gray-500 bg-gray-50",
  action: "border-green-500 bg-green-50",
  condition: "border-yellow-500 bg-yellow-50",
  webhook: "border-purple-500 bg-purple-50",
  assistente_virtual: "border-violet-700 bg-violet-50",
};

const typeIcons: Record<NodeType, React.ReactNode> = {
  init: <FaPlay className="text-blue-500 text-2xl" />,
  end: <FaStop className="text-gray-500 text-2xl" />,
  action: <FaBolt className="text-green-500 text-2xl" />,
  condition: <FaCodeBranch className="text-yellow-500 text-2xl" />,
  webhook: <FaGlobe className="text-purple-500 text-2xl" />,
  assistente_virtual: <FaRobot className="text-violet-700 text-2xl" />,
};

const appIcons: Record<string, React.ReactNode> = {
  WhatsApp: <FaWhatsapp className="text-green-600 text-2xl" />,
  Instagram: <FaInstagram className="text-pink-500 text-2xl" />,
};

export function ActionNode({ id, type, data }: ActionNodeProps) {
  const { deleteNode } = useFlow();
  // Detecta se é uma action de receber mensagem do WhatsApp
  const isReceive =
    data.type?.app === "WhatsApp" && data.type?.operation === "receive_message";
  // Detecta se é Instagram
  const isInstagram = data.type?.app === "Instagram";
  const isInstagramPost = isInstagram && data.type?.operation === "post";
  const isInstagramReels = isInstagram && data.type?.operation === "reels";
  const isIA = data.type?.app === "IA";
  const isIAModel = isIA && data.type?.operation === "Model";
  const isIAMemory = isIA && data.type?.operation === "Memory";
  return (
    <div
      className={`min-w-[220px] max-w-[260px] relative group rounded-xl border-2 p-4 shadow-md flex flex-col items-center gap-2
        ${
          isReceive
            ? "border-blue-600 bg-blue-50"
            : isInstagramPost
            ? "border-pink-400 bg-pink-50"
            : isInstagramReels
            ? "border-purple-500 bg-purple-50"
            : isIAModel
            ? "border-violet-700 bg-violet-50"
            : isIAMemory
            ? "border-green-800 bg-green-50"
            : typeStyles[type]
        }
      `}
    >
      <Handle type="target" position={Position.Top} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (id) {
            deleteNode(id);
            toast.success("Nó excluído!");
          }
        }}
        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title="Excluir nó"
      >
        <Trash className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center gap-2 mb-2 w-full">
        <div className="flex items-center gap-2 justify-center w-full">
          {isIAModel ? (
            <FaRobot className="text-violet-700 text-2xl" />
          ) : isIAMemory ? (
            <FaDatabase className="text-green-800 text-2xl" />
          ) : (
            typeIcons[type]
          )}
          {isReceive ? (
            <FaWhatsapp className="text-blue-600 text-2xl" />
          ) : isInstagramPost ? (
            <FaInstagram className="text-pink-500 text-2xl" />
          ) : isInstagramReels ? (
            <FaInstagram className="text-purple-500 text-2xl" />
          ) : (
            data.type?.app && appIcons[data.type.app]
          )}
          <span
            className={`font-bold text-base
              ${
                isReceive
                  ? "text-blue-600"
                  : isInstagramPost
                  ? "text-pink-600"
                  : isInstagramReels
                  ? "text-pink-600"
                  : isIAModel
                  ? "text-violet-600"
                  : isIAMemory
                  ? "text-green-800"
                  : type === "init"
                  ? "text-blue-600"
                  : type === "condition"
                  ? "text-amber-700"
                  : type === "webhook"
                  ? "text-violet-700"
                  : type === "end"
                  ? "text-gray-700"
                  : "text-emerald-600"
              }`}
          >
            {data.name}
          </span>
        </div>
        {/* Exibir operação para WhatsApp receber mensagem também */}
        {data.type?.operation && (
          <div
            className={`text-xs mb-1 text-center w-full ${
              isReceive
                ? "text-blue-700"
                : isInstagramPost
                ? "text-pink-700"
                : isInstagramReels
                ? "text-purple-700"
                : type === "init"
                ? "text-blue-700"
                : type === "condition"
                ? "text-yellow-700"
                : type === "webhook"
                ? "text-purple-700"
                : isIAModel
                ? "text-violet-700"
                : isIAMemory
                ? "text-green-800"
                : type === "assistente_virtual"
                ? "text-violet-700"
                : type === "end"
                ? "text-gray-700"
                : "text-gray-600"
            }`}
          >
            {data.type.operation.replace("_", " ")}
          </div>
        )}
      </div>
      {/* Instagram Post: Exibir legenda, hashtags e story */}
      {isInstagramPost && (
        <div className="w-full text-left mt-1">
          {data.caption && (
            <div className="text-xs text-pink-800 italic truncate">
              {data.caption}
            </div>
          )}
          {data.hashtags && (
            <div className="text-xs text-pink-700 truncate">
              {data.hashtags}
            </div>
          )}
          {data.shareStory && (
            <div className="text-[10px] text-pink-500 font-semibold">
              Compartilhar no story
            </div>
          )}
        </div>
      )}
      {/* Instagram Reels: Exibir título */}
      {isInstagramReels && data.reelsTitle && (
        <div className="text-xs text-purple-800 italic truncate w-full text-left mt-1">
          {data.reelsTitle}
        </div>
      )}
      {data.message && (
        <div
          className={`text-xs italic mb-1
            ${
              isReceive
                ? "text-blue-800"
                : isInstagramPost
                ? "text-pink-800"
                : isInstagramReels
                ? "text-purple-800"
                : "text-gray-700"
            }
          `}
        >
          {data.message}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
