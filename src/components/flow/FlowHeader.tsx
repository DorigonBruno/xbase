"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import { API_URL } from "@/config";
import axios from "axios";

interface FlowOption {
  id: string;
  name: string;
}

interface FlowHeaderProps {
  selectedFlowId: string | undefined;
  onSelectFlow: (id: string) => void;
  onCreateFlow: (name: string) => Promise<string>;
  onDeleteFlow: (id: string) => Promise<void>;
}

export function FlowHeader({
  selectedFlowId,
  onSelectFlow,
  onCreateFlow,
  onDeleteFlow,
}: FlowHeaderProps) {
  const [flows, setFlows] = useState<FlowOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingFlow, setCreatingFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");

  // Função para buscar fluxos
  const fetchFlows = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/flows`);
      setFlows(
        (res.data?.data || []).map((f: any) => ({
          id: f.id,
          name: f.attributes?.name || "Sem nome",
        }))
      );
    } catch (err) {
      setFlows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  // Criar novo fluxo e atualizar lista
  const handleCreate = async () => {
    setCreatingFlow(true);
    setNewFlowName("");
  };

  const handleConfirmCreate = async () => {
    if (!newFlowName.trim()) return;
    const newId = await onCreateFlow(newFlowName.trim());
    await fetchFlows();
    onSelectFlow(newId);
    setCreatingFlow(false);
    setNewFlowName("");
  };

  // Excluir fluxo e atualizar lista
  const handleDelete = async () => {
    if (selectedFlowId) {
      await onDeleteFlow(selectedFlowId);
      await fetchFlows();
      onSelectFlow("");
    }
  };

  return null;
}
