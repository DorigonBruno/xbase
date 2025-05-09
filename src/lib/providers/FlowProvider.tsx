"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import {
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
} from "reactflow";
import axios from "axios";
import { WhatsAppNodeData, FlowData, Flow } from "@/types/flow";
import { API_URL, AUTOSAVE_DELAY } from "@/config";

interface FlowContextType {
  nodes: Node<WhatsAppNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<WhatsAppNodeData>) => void;
  updateNode: (nodeId: string, data: Partial<WhatsAppNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  saveFlow: (flowId?: string) => Promise<void>;
  loadFlow: (id: string) => Promise<void>;
  pasteFlow: (flowData: FlowData) => void;
  createFlow: (flowData: {
    name: string;
    nodes: Node<WhatsAppNodeData>[];
    edges: Edge[];
  }) => Promise<Flow>;
  updateFlow: (
    flowId: string,
    flowData: {
      name?: string;
      nodes?: Node<WhatsAppNodeData>[];
      edges?: Edge[];
    }
  ) => Promise<Flow>;
  deleteFlow: (flowId: string) => Promise<void>;
  listFlows: () => Promise<Flow[]>;
  isSaving: boolean;
  lastSaved: Date | null;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

interface FlowProviderProps {
  children: React.ReactNode;
  selectedProjectId: string | null;
}

export function FlowProvider({
  children,
  selectedProjectId,
}: FlowProviderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<WhatsAppNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [flowName, setFlowName] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const addNode = useCallback(
    (node: Node<WhatsAppNodeData>) => {
      setNodes((nds) => [...nds, node]);
    },
    [setNodes]
  );

  const updateNode = useCallback(
    (nodeId: string, data: Partial<WhatsAppNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Função para listar fluxos
  const listFlows = useCallback(async (): Promise<Flow[]> => {
    const response = await axios.get(`${API_URL}/flows`);
    // Corrige para o padrão da API: data.data
    const flows = (response.data?.data || []).map((f: any) => ({
      id: f.id,
      name: f.attributes?.name || "Sem nome",
      // Adicione outros campos se necessário
    }));
    return flows;
  }, []);

  // Função para criar fluxo
  const createFlow = useCallback(
    async (flowData: {
      name: string;
      nodes: Node<WhatsAppNodeData>[];
      edges: Edge[];
    }): Promise<Flow> => {
      const response = await axios.post(`${API_URL}/flows`, {
        data: {
          attributes: {
            name: flowData.name,
            status: "draft",
            billing: "free",
            published: true,
            data: {
              nodes: flowData.nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  name: node.data.name || "Novo Nó",
                },
              })),
              edges: flowData.edges,
            },
          },
        },
      });
      return response.data as Flow;
    },
    []
  );

  // Função para atualizar fluxo
  const updateFlow = useCallback(
    async (
      flowId: string,
      flowData: {
        name?: string;
        nodes?: Node<WhatsAppNodeData>[];
        edges?: Edge[];
      }
    ): Promise<Flow> => {
      const response = await axios.put(`${API_URL}/flows/${flowId}`, {
        data: {
          name: flowData.name || flowName,
          data: {
            nodes: flowData.nodes,
            edges: flowData.edges,
          },
        },
      });
      return response.data as Flow;
    },
    [flowName]
  );

  // Função para deletar fluxo
  const deleteFlow = useCallback(async (flowId: string): Promise<void> => {
    await axios.delete(`${API_URL}/flows/${flowId}`);
  }, []);

  // Função para salvar fluxo (cria ou atualiza)
  const saveFlow = useCallback(
    async (flowId?: string): Promise<void> => {
      try {
        if (flowId) {
          await updateFlow(flowId, { name: flowName, nodes, edges });
        } else {
          const newFlow = await createFlow({
            name: flowName || "Novo Fluxo",
            nodes,
            edges,
          });
          // Atualiza o ID do fluxo após criar
          if (newFlow.id) {
            window.location.href = `?flow=${newFlow.id}`;
          }
        }
      } catch (error) {
        console.error("Erro ao salvar o fluxo:", error);
      }
    },
    [nodes, edges, createFlow, updateFlow, flowName]
  );

  const loadFlow = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/flows/${id}`);
      const flowData = response.data?.data?.attributes?.data;
      const loadedNodes = flowData?.nodes || [];
      const loadedEdges = flowData?.edges || [];
      setNodes(loadedNodes);
      setEdges(loadedEdges);

      console.log("loadedNodes", loadedNodes);
    } catch {
      setNodes([]);
      setEdges([]);
    }
  };

  const pasteFlow = useCallback(
    (flowData: FlowData) => {
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
    },
    [setNodes, setEdges]
  );

  // Novo autosave: salva imediatamente a cada modificação
  useEffect(() => {
    let cancelled = false;
    async function doSave() {
      setIsSaving(true);
      try {
        if (selectedProjectId) {
          await updateFlow(selectedProjectId.toString(), {
            name: flowName,
            nodes,
            edges,
          });
          if (!cancelled) setLastSaved(new Date());
        }
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    }
    doSave();
    return () => {
      cancelled = true;
    };
  }, [nodes, edges]);

  // Carregar fluxo ao mudar selectedProjectId
  useEffect(() => {
    if (selectedProjectId) {
      (async () => {
        try {
          const response = await axios.get(
            `${API_URL}/flows/${selectedProjectId}`
          );
          // A API retorna { data: { attributes: { data: { nodes, edges }, name } } }
          const flowData = response.data?.data?.attributes?.data;
          const flowNameApi = response.data?.data?.attributes?.name || "";
          setFlowName(flowNameApi);
          if (
            flowData &&
            Array.isArray(flowData.nodes) &&
            Array.isArray(flowData.edges)
          ) {
            const nodes = flowData.nodes.map((node: unknown) => ({
              ...(node as any),
              type: (node as any).type || "whatsapp",
              position: (node as any).position || { x: 0, y: 0 },
              data: (node as any).data || {},
            }));
            const edges = flowData.edges.map((edge: unknown) => ({
              ...(edge as any),
              type: (edge as any).type || undefined,
              data: (edge as any).data || {},
            }));
            setNodes(nodes);
            setEdges(edges);
          } else {
            setNodes([]);
            setEdges([]);
          }
        } catch {
          setNodes([]);
          setEdges([]);
        }
      })();
    } else {
      setNodes([]);
      setEdges([]);
      setFlowName("");
    }
  }, [selectedProjectId, setNodes, setEdges]);

  // Após o useEffect de carregar fluxo, adicione:
  useEffect(() => {
    if (!selectedProjectId) {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedProjectId, setNodes, setEdges]);

  const handleCreateFlow = async (name: string): Promise<string> => {
    const flow = await createFlow({ name, nodes: [], edges: [] });
    return flow.id;
  };

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        updateNode,
        deleteNode,
        saveFlow,
        loadFlow,
        pasteFlow,
        createFlow,
        updateFlow,
        deleteFlow,
        listFlows,
        isSaving,
        lastSaved,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error("useFlow deve ser usado dentro de um FlowProvider");
  }
  return context;
}
