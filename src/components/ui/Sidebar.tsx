"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaUser, FaTrash } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://api.xbase.app/api";

// Definir tipo para projeto conforme resposta da API
interface ProjectType {
  id: number | string;
  attributes: {
    name: string;
  };
}

export function Sidebar({
  onSelectProject,
  selectedProjectId,
}: {
  onSelectProject: (id: string | number | null) => void;
  selectedProjectId: string | number | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await axios.get(
          `${API_URL}/flows?filters[name][$contains]=bruno&pagination[pageSize]=1000`
        );
        if (res.data && res.data.data) {
          setProjects(res.data.data);
        }
      } catch (err) {
        setError("Erro ao buscar projetos");
      }
    }
    fetchProjects();
  }, []);

  // Criar novo projeto
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const payload = {
        name: newProjectName.trim(),
        status: null,
        billing: "free",
        published: true,
        data: {
          nodes: [],
          edges: [],
        },
      };
      console.log("Payload enviado:", payload);
      const res = await axios.post(`${API_URL}/flows`, {
        data: payload,
      });
      console.log("Resposta da API:", res.data);
      setModalOpen(false);
      setNewProjectName("");
      if (res.data && res.data.data) {
        setProjects((prev) => [...prev, res.data.data]);
        onSelectProject(res.data.data.id);
        toast.success("Fluxo criado com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
      setError("Erro ao criar projeto");
      toast.error("Erro ao criar Fluxo");
    } finally {
      setCreating(false);
    }
  };

  // Deletar projeto
  const handleDeleteProject = async (id: string | number) => {
    setDeletingId(id);
    setError("");
    try {
      await axios.delete(`${API_URL}/flows/${id}`);
      setProjects((prev) => prev.filter((proj) => proj.id !== id));
      if (selectedProjectId === id) {
        onSelectProject(null);
      }
      toast.success("Fluxo excluído com sucesso!");
    } catch {
      setError("Erro ao deletar projeto");
      toast.error("Erro ao deletar projeto");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className="h-screen w-56 bg-[#23272f] text-white flex flex-col justify-between fixed left-0 top-0 z-40 shadow-lg">
      <div>
        {/* Logo e nome */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10 bg-[#18181b]">
          <span className="w-6 h-6 flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="3"
                width="16"
                height="16"
                rx="4"
                stroke="#8B5CF6"
                strokeWidth="2.5"
              />
            </svg>
          </span>
          <span className="font-extrabold text-xl tracking-tight text-white">
            XBASE
          </span>
        </div>
        {/* Overview */}
        <div className="px-4 py-3">
          <button className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-white/10">
            <span className="bg-white/10 rounded p-1">
              <FaUser />
            </span>
            <span>Overview</span>
          </button>
        </div>
        {/* Botão Add project */}
        <div className="px-4 mt-2">
          <div className="text-xs text-white/60 mb-1">Projects</div>
          <button
            className="w-full flex items-center gap-2 border border-white/20 rounded px-2 py-1 text-sm hover:bg-white/10 mb-2"
            onClick={() => setModalOpen(true)}
          >
            <FaPlus /> Add project
          </button>
          {projects.map((proj: ProjectType) => (
            <div
              key={proj.id}
              className={`flex items-center gap-2 mb-2 group rounded cursor-pointer transition-colors ${
                selectedProjectId === proj.id
                  ? "bg-[#353945] font-bold"
                  : "hover:bg-[#353945]/80"
              }`}
              style={{ padding: "0.5rem 0.5rem" }}
              onClick={() => onSelectProject(proj.id)}
            >
              <FaUser className="text-white/60" />
              <span className="flex-1 truncate">{proj.attributes.name}</span>
              <button
                className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                title="Excluir projeto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(proj.id);
                }}
                disabled={deletingId === proj.id}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Modal de novo projeto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
            <DialogDescription>
              Digite o nome do novo projeto.
            </DialogDescription>
          </DialogHeader>
          <input
            className="w-full border rounded px-2 py-1 text-black"
            placeholder="Nome do projeto"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            autoFocus
          />
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800"
                type="button"
              >
                Cancelar
              </button>
            </DialogClose>
            <button
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
              onClick={handleCreateProject}
              disabled={creating || !newProjectName.trim()}
              type="button"
            >
              {creating ? "Criando..." : "Criar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Usuário no rodapé */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center font-bold text-white">
          BD
        </div>
        <span className="font-medium">Bruno Dorigon</span>
      </div>
    </aside>
  );
}
