"use client";

import React, { useEffect, useState } from "react";
import { useFlow } from "@/lib/providers/FlowProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flow } from "@/types/flow";

interface FlowSelectProps {
  onSelectFlow: (flowId: string) => void;
  selectedFlowId?: string;
  onFlowsLoaded?: (flows: Flow[]) => void;
}

export function FlowSelect({
  onSelectFlow,
  selectedFlowId,
  onFlowsLoaded,
}: FlowSelectProps) {
  const { listFlows } = useFlow();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      try {
        const flowsList = await listFlows();
        setFlows(flowsList);
        if (onFlowsLoaded) onFlowsLoaded(flowsList);
      } catch (error) {
        console.error("Erro ao carregar fluxos:", error);
        setFlows([]);
        if (onFlowsLoaded) onFlowsLoaded([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, [listFlows, onFlowsLoaded]);

  return (
    <Select
      value={selectedFlowId}
      onValueChange={onSelectFlow}
      disabled={loading}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecione um fluxo" />
      </SelectTrigger>
      <SelectContent>
        {flows.map((flow) => (
          <SelectItem key={flow.id} value={flow.id}>
            {flow.name || "Fluxo sem nome"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
