"use client";

import { useEffect, useState } from "react";
import ForbiddenPage from "@/components/ForbiddenPage";
import VirtualCardList from "@/components/VirtualCardList";
import VirtualCardListSkeleton from "@/components/VirtualCardListSkeleton";
import { VirtualCard } from "@/components/VirtualCardTypes";

const CartoesVirtuaisPage = () => {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    async function fetchVirtualCards() {
      try {
        const res = await fetch("/api/cartoes-virtuais");

        if (res.status === 403) {
          setIsForbidden(true);
        }

        if (!res.ok) {
          throw new Error("Falha ao carregar cartões virtuais");
        }

        const data = await res.json();
        setCards(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVirtualCards();
  }, []);

  if (isForbidden) {
    return (
      <ForbiddenPage
        title="403 - Acesso Proibido"
        message="Você não tem as permissões necessárias para acessar este recurso."
        backUrl="/dashboard"
        showHomeButton={false}
      />
    );
  }

  if (error) return <div style={{ color: "red" }}>Erro: {error}</div>;

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Lista de Cartões Virtuais</h1>
        {loading ? (
          <VirtualCardListSkeleton />
        ) : (
          <VirtualCardList cards={cards} />
        )}
      </div>
    </div>
  );
};

export default CartoesVirtuaisPage;
