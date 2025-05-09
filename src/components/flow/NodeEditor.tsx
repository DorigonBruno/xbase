"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FlowNode,
  WhatsAppNodeData,
  ActionNodeData,
  NodeType,
} from "@/types/flow";
import { Trash } from "lucide-react";
import { useFlow } from "@/lib/providers/FlowProvider";

interface NodeEditorProps {
  node: FlowNode;
  onNodeChange: (nodeId: string, data: WhatsAppNodeData) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export function NodeEditor({
  node,
  onNodeChange,
  onDeleteNode,
}: NodeEditorProps) {
  const { deleteNode } = useFlow();
  const data = node.data as ActionNodeData;
  const type = node.type as NodeType;

  const handleChange = (field: string, value: any) => {
    onNodeChange(node.id, {
      ...data,
      [field]: value,
    });
  };

  const handleDelete = () => {
    deleteNode(node.id);
    if (onDeleteNode) onDeleteNode(node.id);
  };

  // Renderização dinâmica dos campos
  function renderFields() {
    // Trigger/init: não permite edição
    if (type === "init") {
      return (
        <div className="text-gray-500 text-center py-8">
          Este nó é o início do fluxo.
        </div>
      );
    }
    // WhatsApp Action
    if (type === "action" && data.type?.app === "WhatsApp") {
      if (data.type.operation === "send_message") {
        // ENVIAR MENSAGEM
        const variaveisDinamicas = [
          { label: "Nome do Cliente", value: "{{nome_cliente}}" },
          { label: "Horário Atual", value: "{{horario_atual}}" },
          { label: "Telefone", value: "{{telefone}}" },
        ];
        return (
          <>
            <div>
              <Label htmlFor="phone" className="mb-2">
                Telefone
              </Label>
              <Input
                id="phone"
                type="text"
                value={data.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Ex: +55 11 91234-5678"
              />
            </div>
            <div>
              <Label htmlFor="variaveis" className="mb-2">
                Inserir variável dinâmica
              </Label>
              <select
                id="variaveis"
                className="w-full border rounded px-2 py-1"
                onChange={(e) => {
                  if (e.target.value) {
                    handleChange(
                      "message",
                      (data.message || "") + e.target.value
                    );
                  }
                }}
                defaultValue=""
              >
                <option value="">Selecione uma variável</option>
                {variaveisDinamicas.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="message" className="mb-2">
                Mensagem
              </Label>
              <Textarea
                id="message"
                value={data.message || ""}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[120px]"
              />
            </div>
          </>
        );
      } else if (data.type.operation === "receive_message") {
        // RECEBER MENSAGEM
        type MensagemRecebida = { id: number; texto: string; de: string };
        const mensagensRecebidas: MensagemRecebida[] =
          data.receivedMessages || [
            { id: 1, texto: "Olá, quero saber mais!", de: "+55 11 90000-0001" },
            { id: 2, texto: "Me envie o catálogo", de: "+55 11 90000-0002" },
          ];
        const filtro: string = data.filterKeyword || "";
        const mensagensFiltradas = mensagensRecebidas.filter(
          (m: MensagemRecebida) =>
            m.texto.toLowerCase().includes(filtro.toLowerCase())
        );
        return (
          <>
            <div>
              <Label htmlFor="filter" className="mb-2">
                Filtrar por palavra-chave
              </Label>
              <Input
                id="filter"
                type="text"
                value={filtro}
                onChange={(e) => handleChange("filterKeyword", e.target.value)}
                placeholder="Ex: catálogo, orçamento..."
              />
            </div>
            <div>
              <Label className="mb-2">Mensagens Recebidas</Label>
              <div className="border rounded bg-gray-50 p-2 max-h-32 overflow-y-auto text-xs">
                {mensagensFiltradas.length === 0 && (
                  <div>Nenhuma mensagem encontrada.</div>
                )}
                {mensagensFiltradas.map((msg: MensagemRecebida) => (
                  <div key={msg.id} className="mb-1">
                    <b>{msg.de}:</b> {msg.texto}
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      }
      // fallback
      return <div>Selecione uma operação do WhatsApp.</div>;
    }
    // Webhook Action
    if (type === "action" && data.type?.app === "Webhook") {
      return (
        <>
          <div>
            <Label htmlFor="operation">Operação</Label>
            <select
              id="operation"
              className="w-full border rounded px-2 py-1"
              value={data.type.operation}
              onChange={(e) =>
                handleChange("type", {
                  ...data.type,
                  operation: e.target.value,
                })
              }
            >
              <option value="send_message">Enviar Webhook</option>
              <option value="receive_message">Receber Webhook</option>
            </select>
          </div>
        </>
      );
    }
    // End
    if (type === "end") {
      return (
        <div className="text-gray-500 text-sm">Este nó é o fim do fluxo.</div>
      );
    }
    // Condition
    if (type === "condition") {
      return (
        <div>
          <Label htmlFor="condition" className="mb-2">
            Condição
          </Label>
          <Textarea
            id="condition"
            value={data.condition || ""}
            onChange={(e) => handleChange("condition", e.target.value)}
            placeholder="Ex: x > 10"
            className="min-h-[60px]"
          />
        </div>
      );
    }
    // Webhook
    if (type === "webhook") {
      return (
        <div className="text-gray-500 text-sm">Configuração de Webhook.</div>
      );
    }
    // Instagram Action (mantém o compartilhar no story)
    if (type === "action" && data.type?.app === "Instagram") {
      if (data.type.operation === "post") {
        return (
          <>
            <div>
              <Label htmlFor="media" className="mb-2">
                Imagem ou Vídeo
              </Label>
              <Input
                id="media"
                type="file"
                accept="image/*,video/*"
                onChange={(e) =>
                  handleChange("media", e.target.files?.[0] || null)
                }
              />
              {data.media && (
                <div className="mt-2 text-xs text-gray-500">
                  Arquivo selecionado:{" "}
                  {typeof data.media === "string"
                    ? data.media
                    : data.media.name}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="caption" className="mb-2">
                Legenda
              </Label>
              <Textarea
                id="caption"
                value={data.caption || ""}
                onChange={(e) => handleChange("caption", e.target.value)}
                placeholder="Digite a legenda do post..."
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="hashtags" className="mb-2">
                Hashtags
              </Label>
              <Input
                id="hashtags"
                type="text"
                value={data.hashtags || ""}
                onChange={(e) => handleChange("hashtags", e.target.value)}
                placeholder="#hashtag1 #hashtag2"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                id="shareStory"
                type="checkbox"
                checked={!!data.shareStory}
                onChange={(e) => handleChange("shareStory", e.target.checked)}
                className="w-4 h-4 accent-pink-500 rounded border-gray-300 focus:ring-pink-400"
                style={{ minWidth: 16, minHeight: 16 }}
              />
              <Label htmlFor="shareStory" className="text-sm">
                Compartilhar no story
              </Label>
            </div>
          </>
        );
      } else if (data.type.operation === "reels") {
        return (
          <>
            <div>
              <Label htmlFor="reelsVideo" className="mb-2">
                Vídeo do Reels
              </Label>
              <Input
                id="reelsVideo"
                type="file"
                accept="video/*"
                onChange={(e) =>
                  handleChange("reelsVideo", e.target.files?.[0] || null)
                }
              />
              {data.reelsVideo && (
                <div className="mt-2 text-xs text-gray-500">
                  Arquivo selecionado:{" "}
                  {typeof data.reelsVideo === "string"
                    ? data.reelsVideo
                    : data.reelsVideo.name}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="reelsTitle" className="mb-2">
                Título do Reels
              </Label>
              <Input
                id="reelsTitle"
                type="text"
                value={data.reelsTitle || ""}
                onChange={(e) => handleChange("reelsTitle", e.target.value)}
                placeholder="Título do Reels"
              />
            </div>
          </>
        );
      }
      // fallback
      return <div>Selecione uma operação do Instagram.</div>;
    }
    // Assistente Virtual Model: opções Timeout e Max Retries
    if (type === "assistente_virtual" && data.type?.operation === "Model") {
      return (
        <>
          <div>
            <Label htmlFor="timeout" className="mb-2">
              Timeout
            </Label>
            <Input
              id="timeout"
              type="number"
              value={data.timeout || ""}
              onChange={(e) => handleChange("timeout", e.target.value)}
              placeholder="Timeout em segundos"
            />
          </div>
          <div>
            <Label htmlFor="maxRetries" className="mb-2">
              Max Retries
            </Label>
            <Input
              id="maxRetries"
              type="number"
              value={data.maxRetries || ""}
              onChange={(e) => handleChange("maxRetries", e.target.value)}
              placeholder="Número máximo de tentativas"
            />
          </div>
        </>
      );
    }
    // Assistente Virtual Memory: edição padrão
    if (type === "assistente_virtual" && data.type?.operation === "Memory") {
      return <div>Configuração de memória IA.</div>;
    }
    // fallback
    return <div>Selecione um tipo de nó válido.</div>;
  }

  return (
    <Card className="p-4 w-[400px] min-h-[350px]">
      <div className="mb-4 text-sm text-gray-600">
        {type && (
          <span>
            <b>Tipo:</b> {type}
          </span>
        )}
        {data.type?.app && (
          <span>
            {" "}
            &nbsp;|&nbsp; <b>App:</b> {data.type.app}
          </span>
        )}
        {data.type?.operation && (
          <span>
            {" "}
            &nbsp;|&nbsp; <b>Operação:</b>{" "}
            {data.type.operation.replace("_", " ")}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold">Editar Nó</h3>
        <button
          onClick={handleDelete}
          className="text-destructive hover:bg-destructive/10 rounded-full p-1 cursor-pointer"
          title="Excluir nó"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">{renderFields()}</div>
    </Card>
  );
}
