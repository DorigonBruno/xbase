"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { CHAT_DIMENSIONS } from "@/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Aqui você pode implementar a integração com a API do assistente
    // Por enquanto, vamos apenas simular uma resposta
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "Entendi sua solicitação. Como posso ajudar com o fluxo?",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card
      className="fixed bottom-4 right-4 flex flex-col"
      style={{
        width: CHAT_DIMENSIONS.width,
        height: CHAT_DIMENSIONS.height,
      }}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Assistente de Fluxo</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Fechar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
