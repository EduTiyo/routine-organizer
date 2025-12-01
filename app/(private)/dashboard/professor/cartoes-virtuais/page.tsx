"use client";

import { useCallback, useEffect, useState } from "react";
import ForbiddenPage from "@/components/ForbiddenPage";
import VirtualCardList from "@/components/VirtualCardList";
import VirtualCardListSkeleton from "@/components/VirtualCardListSkeleton";
import { VirtualCard } from "@/app/(private)/dashboard/professor/cartoes-virtuais/types/VirtualCardTypes";
import { toast } from "react-toastify";
import VirtualCardForm from "@/components/VirtualCardForm";

const CartoesVirtuaisPage = () => {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);

  type FetchVirtualCardsOptions = {
    showSkeleton?: boolean;
    silentError?: boolean;
  };

  const fetchVirtualCards = useCallback(
    async (options: FetchVirtualCardsOptions = {}) => {
      const { showSkeleton = false, silentError = false } = options;

      if (showSkeleton) {
        setLoading(true);
      }

      if (!silentError) {
        setError("");
      }

      try {
        const res = await fetch("/api/cartoes-virtuais");

        if (res.status === 403) {
          setIsForbidden(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Falha ao carregar cartões virtuais");
        }

        const data = (await res.json()) as VirtualCard[];
        const sorted = [...data].sort(
          (a, b) =>
            (a.order ?? Number.MAX_SAFE_INTEGER) -
            (b.order ?? Number.MAX_SAFE_INTEGER)
        );
        setCards(sorted);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Falha ao carregar cartões virtuais";
        if (silentError) {
          toast.error(message);
        } else {
          setError(message);
        }
      } finally {
        if (showSkeleton) {
          setLoading(false);
        }
      }
    },
    []
  );

  const persistOrder = useCallback(async (newOrder: string[]) => {
    try {
      const res = await fetch("/api/cartoes-virtuais/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newOrder }),
      });

      if (res.status === 403) {
        setIsForbidden(true);
        throw new Error("Acesso não autorizado");
      }

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Falha ao salvar ordem");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao salvar ordem";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    fetchVirtualCards({ showSkeleton: true });
  }, [fetchVirtualCards]);

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Lista de Cartões Virtuais</h1>
          <VirtualCardForm
            onForbidden={() => setIsForbidden(true)}
            onSuccess={() => fetchVirtualCards({ silentError: true })}
          />
        </div>
        {loading ? (
          <VirtualCardListSkeleton />
        ) : (
          <VirtualCardList
            cards={cards}
            onReorder={(reordered) => {
              setCards(reordered);
              persistOrder(reordered.map((c) => c.id));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CartoesVirtuaisPage;
