"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFlow } from "@/lib/providers/FlowProvider";
import { Copy, ClipboardPaste, Check } from "lucide-react";

export function FlowStatus() {
  const { nodes, edges, pasteFlow } = useFlow();
  const [showJson, setShowJson] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [copied, setCopied] = useState(false);

  // Atualiza o JSON sempre que nodes/edges mudarem e o painel estiver aberto
  useEffect(() => {
    if (showJson) {
      setJsonValue(JSON.stringify({ nodes, edges }, null, 2));
    }
  }, [nodes, edges, showJson]);

  // Atualiza o fluxo ao editar o JSON manualmente
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      if (parsed.nodes && parsed.edges) {
        pasteFlow(parsed);
      }
    } catch {
      // Ignora erros de parse até o JSON ser válido
    }
  };

  const handleCopy = () => {
    const flowData = JSON.stringify({ nodes, edges }, null, 2);
    navigator.clipboard.writeText(flowData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonValue(text);
      const parsedData = JSON.parse(text);
      if (parsedData.nodes && parsedData.edges) {
        pasteFlow(parsedData);
      }
    } catch (error) {
      console.error("Erro ao colar JSON:", error);
    }
  };

  const handleShowJson = () => {
    if (!showJson) {
      setJsonValue(JSON.stringify({ nodes, edges }, null, 2));
    }
    setShowJson(!showJson);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Status do Fluxo</h3>
        <Button
          variant="outline"
          onClick={handleShowJson}
          className="cursor-pointer"
        >
          {showJson ? "Ocultar JSON" : "Mostrar JSON"}
        </Button>
      </div>

      {showJson && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copiado!" : "Copiar JSON"}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePaste}>
              <ClipboardPaste className="w-4 h-4" />
              Colar JSON
            </Button>
          </div>

          <Textarea
            value={jsonValue}
            onChange={handleJsonChange}
            placeholder="Cole o JSON do fluxo aqui..."
            className="h-[500px]"
          />
        </div>
      )}
    </Card>
  );
}
