"use client";

import React, { useCallback, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { useFlow } from "@/lib/providers/FlowProvider";
import { Card } from "@/components/ui/card";
import { NodeEditor } from "./NodeEditor";
import { FlowStatus } from "./FlowStatus";
import { Node } from "reactflow";
import { WhatsAppNodeData } from "@/types/flow";
import { NodeType, FlowNode } from "@/types/flow";
import { NODE_TYPES, FLOW_EDITOR_DIMENSIONS } from "@/config";
import { FlowHeader } from "./FlowHeader";
import axios from "axios";
import { API_URL } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FaPlus,
  FaWhatsapp,
  FaInstagram,
  FaPlay,
  FaBolt,
  FaCodeBranch,
  FaGlobe,
  FaStop,
} from "react-icons/fa";
import { nodeTypes, edgeTypes } from "@/config/flow";
import { Send, Mail } from "lucide-react";

export function FlowEditor() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    loadFlow,
    pasteFlow,
    isSaving,
    lastSaved,
  } = useFlow();

  const [selectedNode, setSelectedNode] =
    useState<Node<WhatsAppNodeData> | null>(null);
  const [selectedFlowId, setSelectedFlowId] = useState<string | undefined>(
    undefined
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<
    null | "whatsapp" | "instagram"
  >(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState<
    "type" | "actionApp" | "actionOp" | null
  >(null);
  const [newNodeType, setNewNodeType] = useState<NodeType | null>(null);
  const [newActionApp, setNewActionApp] = useState<string | null>(null);
  const [newActionOp, setNewActionOp] = useState<string | null>(null);
  const [createStepIA, setCreateStepIA] = useState<null | "iaType" | "iaOp">(
    null
  );
  const [newIAType, setNewIAType] = useState<string | null>(null);

  // Busca o nó atualizado pelo ID
  const currentNode = selectedNode
    ? nodes.find((n) => n.id === selectedNode.id) || null
    : null;

  // Carregar fluxo ao selecionar
  const handleSelectFlow = async (id: string) => {
    setSelectedFlowId(id);
    await loadFlow(id);
    setSelectedNode(null);
  };

  // Criar novo fluxo
  const handleCreateFlow = async (name: string): Promise<string> => {
    const res = await axios.post(`${API_URL}/flows`, {
      data: {
        name: name || "Novo Fluxo",
        data: {
          nodes: [],
          edges: [],
        },
      },
    });
    const newId = res.data?.data?.id;
    setSelectedFlowId(newId);
    pasteFlow({ nodes: [], edges: [] });
    setSelectedNode(null);
    return newId;
  };

  // Excluir fluxo
  const handleDeleteFlow = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/flows/${id}`);
    setSelectedFlowId(undefined);
    pasteFlow({ nodes: [], edges: [] });
    setSelectedNode(null);
  };

  // Função para deletar aresta
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      onEdgesChange([{ id: edgeId, type: "remove" }]);
    },
    [onEdgesChange]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<WhatsAppNodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const handleNodeChange = useCallback(
    (nodeId: string, data: WhatsAppNodeData) => {
      updateNode(nodeId, data);
    },
    [updateNode]
  );

  // Função para criar node com base na escolha
  function handleCreateNode(type?: NodeType, forcedOp?: string) {
    const nodeType = type || newNodeType;
    if (!nodeType) return;
    let nodeData: any = {};
    let nodeLabel = "";
    if (nodeType === "action") {
      const app = newActionApp || "WhatsApp";
      const operation = forcedOp || newActionOp || "send_message";
      let actionType = "";
      let actionName = "";
      let image;
      if (app === "WhatsApp" && operation === "send_message") {
        actionType = "whatsapp_send";
        actionName = "WhatsApp Enviar mensagem";
        image = "/whatsapp.svg";
      } else if (app === "WhatsApp" && operation === "receive_message") {
        actionType = "whatsapp_receive";
        actionName = "WhatsApp Receber mensagem";
        image = "/whatsapp.svg";
      } else if (app === "Instagram" && operation === "post") {
        actionType = "instagram_post";
        actionName = "Instagram Adicionar post";
        image = undefined;
      } else if (app === "Instagram" && operation === "reels") {
        actionType = "instagram_reels";
        actionName = "Instagram Adicionar Reels";
        image = undefined;
      } else {
        actionType = `${app.toLowerCase()}_${operation}`;
        actionName = `${app} ${operation.replace("_", " ")}`;
        image = undefined;
      }
      nodeData = {
        image,
        type: {
          app,
          operation,
        },
        actionType,
        name: actionName,
      };
      nodeLabel = nodeData.name;
    } else if (nodeType === "init") {
      nodeData = {
        name: "Trigger",
        type: { app: "Trigger", operation: "init" },
      };
      nodeLabel = "Trigger";
    } else if (nodeType === "end") {
      nodeData = { name: "End", type: { app: "End", operation: "end" } };
      nodeLabel = "End";
    } else if (nodeType === "condition") {
      nodeData = {
        name: "Condition",
        type: { app: "Condition", operation: "if" },
      };
      nodeLabel = "Condition";
    } else if (nodeType === "webhook") {
      nodeData = {
        name: "Webhook",
        type: { app: "Webhook", operation: "webhook" },
      };
      nodeLabel = "Webhook";
    }
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      position: { x: 400, y: 200 },
      type: nodeType,
      data: nodeData,
    };
    addNode(newNode as any);
    setModalOpen(false);
    setCreateStep(null);
    setNewNodeType(null);
    setNewActionApp(null);
    setNewActionOp(null);
  }

  // Renderização do modal de seleção de canal
  function renderNodeTypeDrawer() {
    if (!modalOpen) return null;
    return (
      <>
        {/* Backdrop para outside click */}
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setModalOpen(false);
            setCreateStep(null);
            setNewNodeType(null);
            setNewActionApp(null);
            setNewActionOp(null);
          }}
        />
        <div
          className={`fixed top-0 right-0 h-full w-[340px] bg-white shadow-2xl z-50 transition-transform duration-300 ${
            modalOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-bold mb-1">Adicionar etapa</h2>
                <p className="text-gray-500 text-sm">
                  Escolha o tipo de etapa para adicionar ao fluxo.
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => {
                  setModalOpen(false);
                  setCreateStep(null);
                  setNewNodeType(null);
                  setNewActionApp(null);
                  setNewActionOp(null);
                }}
                title="Fechar"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-6">
              {/* Passo 1: Seleção do tipo de node */}
              {!createStepIA && (!createStep || createStep === "type") && (
                <>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNode("init");
                    }}
                  >
                    <FaPlay className="text-blue-500" /> Trigger (Início)
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewNodeType("action");
                      setCreateStep("actionApp");
                    }}
                  >
                    <FaBolt className="text-green-500" /> Ação (Action)
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNode("condition");
                    }}
                  >
                    <FaCodeBranch className="text-yellow-500" /> Condição (If)
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 flex items-center gap-2 bg-white text-black cursor-pointer"
                    type="button"
                    onClick={() => {
                      setCreateStepIA("iaType");
                      setNewIAType(null);
                    }}
                  >
                    <span className="text-xl">🤖</span> Assistente Virtual
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNode("webhook");
                    }}
                  >
                    <FaGlobe className="text-purple-500" /> Webhook
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNode("end");
                    }}
                  >
                    <FaStop className="text-gray-500" /> Fim (End)
                  </button>
                </>
              )}
              {/* Passo 2: Seleção do app da action */}
              {createStep === "actionApp" && (
                <>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionApp("WhatsApp");
                      setCreateStep("actionOp");
                    }}
                  >
                    <FaWhatsapp className="text-green-500" /> WhatsApp
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionApp("Instagram");
                      setCreateStep("actionOp");
                    }}
                  >
                    <FaInstagram className="text-pink-500" /> Instagram
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateStep("type");
                      setNewNodeType(null);
                    }}
                  >
                    Voltar
                  </button>
                </>
              )}
              {/* Passo 3: Seleção da operação da action */}
              {createStep === "actionOp" && newActionApp === "WhatsApp" && (
                <>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionOp("send_message");
                      handleCreateNode("action", "send_message");
                    }}
                  >
                    <Send className="w-5 h-5 text-green-600" /> Enviar mensagem
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionOp("receive_message");
                      handleCreateNode("action", "receive_message");
                    }}
                  >
                    <Mail className="w-5 h-5 text-blue-600" /> Receber mensagem
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateStep("actionApp");
                      setNewActionOp(null);
                    }}
                  >
                    Voltar
                  </button>
                </>
              )}
              {createStep === "actionOp" && newActionApp === "Webhook" && (
                <>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionOp("send_message");
                      setTimeout(() => handleCreateNode("send_message"), 0);
                    }}
                  >
                    Enviar Webhook
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionOp("receive_message");
                      setTimeout(() => handleCreateNode("receive_message"), 0);
                    }}
                  >
                    Receber Webhook
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateStep("actionApp");
                      setNewActionOp(null);
                    }}
                  >
                    Voltar
                  </button>
                </>
              )}
              {createStep === "actionOp" && newActionApp === "Instagram" && (
                <>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionOp("post");
                      handleCreateNode("action", "post");
                    }}
                  >
                    <FaInstagram className="text-pink-500" /> Adicionar post
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewActionOp("reels");
                      handleCreateNode("action", "reels");
                    }}
                  >
                    <FaInstagram className="text-pink-500" /> Adicionar Reels
                  </button>
                  <button
                    className="w-48 p-4 border rounded-lg mb-2 cursor-pointer hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCreateStep("actionApp");
                      setNewActionOp(null);
                    }}
                  >
                    Voltar
                  </button>
                </>
              )}
              {/* Workflow da Assistente Virtual - Sidebar igual às actions */}
              {createStepIA === "iaType" && (
                <>
                  <div className="w-full flex flex-col items-center mt-6">
                    <button
                      className="w-48 p-4 border rounded-lg mb-4 cursor-pointer hover:bg-accent flex items-center gap-2 text-lg"
                      onClick={() => {
                        setNewIAType("Model");
                        setCreateStepIA("iaOp");
                      }}
                    >
                      <span className="text-xl">🤖</span> Model
                    </button>
                    <button
                      className="w-48 p-4 border rounded-lg mb-4 cursor-pointer hover:bg-accent flex items-center gap-2 text-lg"
                      onClick={() => {
                        setNewIAType("Memory");
                        setCreateStepIA("iaOp");
                      }}
                    >
                      <span className="text-xl">🤖</span> Memory
                    </button>
                    <button
                      className="w-48 p-2 border rounded-lg mt-2 cursor-pointer hover:bg-accent"
                      onClick={() => setCreateStepIA(null)}
                    >
                      Voltar
                    </button>
                  </div>
                </>
              )}
              {createStepIA === "iaOp" && newIAType === "Model" && (
                <>
                  <div className="w-full flex flex-col items-center mt-6">
                    <button
                      className="w-48 p-4 border rounded-lg mb-4 cursor-pointer hover:bg-accent flex items-center gap-2 text-lg"
                      onClick={() => handleCreateIANode("Model", "gpt-3")}
                    >
                      <span className="text-xl">🤖</span> gpt-3
                    </button>
                    <button
                      className="w-48 p-4 border rounded-lg mb-4 cursor-pointer hover:bg-accent flex items-center gap-2 text-lg"
                      onClick={() => handleCreateIANode("Model", "gpt-4")}
                    >
                      <span className="text-xl">🤖</span> gpt-4
                    </button>
                    <button
                      className="w-48 p-2 border rounded-lg mt-2 cursor-pointer hover:bg-accent"
                      onClick={() => setCreateStepIA("iaType")}
                    >
                      Voltar
                    </button>
                  </div>
                </>
              )}
              {createStepIA === "iaOp" && newIAType === "Memory" && (
                <>
                  <div className="w-full flex flex-col items-center mt-6">
                    <button
                      className="w-48 p-4 border rounded-lg mb-4 cursor-pointer hover:bg-accent flex items-center gap-2 text-lg"
                      onClick={() => handleCreateIANode("Memory", "redis")}
                    >
                      <span className="text-xl">🤖</span> redis
                    </button>
                    <button
                      className="w-48 p-4 border rounded-lg mb-4 cursor-pointer hover:bg-accent flex items-center gap-2 text-lg"
                      onClick={() => handleCreateIANode("Memory", "mysql")}
                    >
                      <span className="text-xl">🤖</span> mysql
                    </button>
                    <button
                      className="w-48 p-2 border rounded-lg mt-2 cursor-pointer hover:bg-accent"
                      onClick={() => setCreateStepIA("iaType")}
                    >
                      Voltar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Função para limpar campos indesejados do data
  function cleanData(obj: any) {
    if (!obj || typeof obj !== "object") return obj;
    const { className, ...rest } = obj;
    return rest;
  }

  // Limpa nodes e edges antes de passar para o React Flow
  const safeNodes = (nodes || []).map((node) => {
    let type = node.type;
    if (!type) {
      if (node.data?.type?.app === "Trigger") type = "init";
      else if (node.data?.type?.app === "End") type = "end";
      else if (node.data?.type?.app === "Condition") type = "condition";
      else if (node.data?.type?.app === "Webhook") type = "webhook";
      else type = "action";
    }
    return {
      ...node,
      type,
      data: cleanData(node.data),
    };
  });

  const safeEdges = (edges || []).map((edge) => ({
    ...edge,
    data: cleanData(edge.data),
  }));

  // Novo componente para status de salvamento
  function FlowSaveStatus() {
    return (
      <div className="flex items-center ml-2 min-w-[120px]">
        {isSaving ? (
          <span className="text-xs text-blue-500 flex items-center gap-1">
            <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></span>
            Salvando...
          </span>
        ) : lastSaved ? (
          <span className="text-xs text-green-600">
            Salvo às {lastSaved.toLocaleTimeString()}
          </span>
        ) : null}
      </div>
    );
  }

  function handleCreateIANode(iaType: string, iaOp: string) {
    const nodeData = {
      type: {
        app: "IA",
        operation: iaType,
        model: iaOp,
      },
      name: `IA ${iaType} ${iaOp}`,
    };
    const newNode: FlowNode = {
      id: `node-ia-${Date.now()}`,
      position: { x: 400, y: 200 },
      type: "assistente_virtual",
      data: nodeData,
    };
    addNode(newNode as any);
    setModalOpen(false);
    setCreateStepIA(null);
    setNewIAType(null);
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {renderNodeTypeDrawer()}
      <div className="flex items-center gap-4 mb-2">
        <FlowHeader
          selectedFlowId={selectedFlowId}
          onSelectFlow={handleSelectFlow}
          onCreateFlow={handleCreateFlow}
          onDeleteFlow={handleDeleteFlow}
        />
        <FlowSaveStatus />
      </div>
      <div className="flex gap-4">
        <Card
          className="flex-1 relative"
          style={{ height: FLOW_EDITOR_DIMENSIONS.height }}
        >
          {/* Botão de adicionar no canto superior direito do dashboard */}
          <button
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded border border-gray-400 bg-background flex items-center justify-center text-xl shadow hover:bg-accent cursor-pointer"
            onClick={() => setModalOpen(true)}
            title="Adicionar novo nó"
          >
            <FaPlus />
          </button>

          {/* Botão centralizado se não houver nodes */}
          {(!nodes || nodes.length === 0) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <button
                className="border-2 border-dashed border-gray-400 rounded-lg w-20 h-20 flex flex-col items-center justify-center text-4xl text-gray-400 hover:bg-accent transition mb-2 cursor-pointer"
                onClick={() => setModalOpen(true)}
                title="Adicionar primeiro passo"
              >
                <FaPlus />
              </button>
              <span className="text-gray-300 mt-2 text-lg">
                Add first step...
              </span>
            </div>
          )}

          <ReactFlow
            nodes={safeNodes}
            edges={safeEdges.map((edge) => ({
              ...edge,
              type: "button",
              data: { ...edge.data, onDelete: handleDeleteEdge },
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </Card>

        <div className="flex flex-col gap-4 w-80">
          <FlowStatus />
        </div>
      </div>

      {/* Modal de edição do nó */}
      <Dialog open={!!currentNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nó</DialogTitle>
            <DialogDescription>
              Edite as informações do nó selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className={"flex justify-center items-center w-full"}>
            {currentNode && (
              <NodeEditor
                node={currentNode}
                onNodeChange={handleNodeChange}
                onDeleteNode={() => setSelectedNode(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
