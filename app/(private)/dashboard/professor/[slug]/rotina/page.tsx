"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ForbiddenPage from "@/components/ForbiddenPage";
import { Skeleton } from "@/components/ui/skeleton";
import RoutineForm from "@/components/RoutineForm";
import { toast } from "react-toastify";

type Atividade = {
  id: string;
  title: string;
  imageUrl: string;
  estimatedTime: number | null;
  dayPeriod: "MORNING" | "AFTERNOON" | "EVENING";
  timeInSeconds: number | null;
};

type Rotina = {
  id: string;
  dateOfRealization: string | null;
  status: string;
  creator: {
    id: string;
    name: string | null;
  };
  atividades: Atividade[];
};

const StudentRoutinePage = () => {
  const params = useParams();
  const slugParam = params?.slug;
  const studentId = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);
  const [dragging, setDragging] = useState<{
    rotinaId: string;
    atividadeId: string;
  } | null>(null);

  const formattedStudentName = useMemo(
    () => studentName || "Aluno",
    [studentName]
  );

  const fetchRotinas = useCallback(async () => {
    if (!studentId) {
      setError("Estudante inválido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/rotinas?studentId=${studentId}`);

      if (res.status === 403) {
        setIsForbidden(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Falha ao carregar rotinas do estudante");
      }

      const data = (await res.json()) as {
        student: { id: string; name: string | null };
        rotinas: Rotina[];
      };
      setRotinas(data.rotinas);
      setStudentName(data.student.name);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao carregar rotinas do estudante";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchRotinas();
  }, [fetchRotinas]);

  const persistOrder = useCallback(
    async (rotinaId: string, atividadeIds: string[]) => {
      try {
        const res = await fetch("/api/rotinas/reorder-atividades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rotinaId, atividadeIds }),
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
        // Recarrega para restaurar ordem caso falhe
        fetchRotinas();
      }
    },
    [fetchRotinas]
  );

  const handleDragStart = (rotinaId: string, atividadeId: string) => {
    return (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = "move";
      setDragging({ rotinaId, atividadeId });
    };
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (rotinaId: string, targetAtividadeId: string) => {
    return (event: React.DragEvent) => {
      event.preventDefault();
      if (!dragging || dragging.rotinaId !== rotinaId) return;

      const rotinaIndex = rotinas.findIndex((r) => r.id === rotinaId);
      if (rotinaIndex === -1) return;

      const atividades = rotinas[rotinaIndex].atividades;
      const fromIndex = atividades.findIndex(
        (a) => a.id === dragging.atividadeId
      );
      const toIndex = atividades.findIndex((a) => a.id === targetAtividadeId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

      const updatedAtividades = [...atividades];
      const [moved] = updatedAtividades.splice(fromIndex, 1);
      updatedAtividades.splice(toIndex, 0, moved);

      const updatedRotinas = [...rotinas];
      updatedRotinas[rotinaIndex] = {
        ...rotinas[rotinaIndex],
        atividades: updatedAtividades.map((a, idx) => ({ ...a, order: idx })),
      };

      setRotinas(updatedRotinas);
      setDragging(null);
      persistOrder(
        rotinaId,
        updatedRotinas[rotinaIndex].atividades.map((a) => a.id)
      );
    };
  };

  const handleDragEnd = () => setDragging(null);

  if (isForbidden) {
    return (
      <ForbiddenPage
        title="403 - Acesso Proibido"
        message="Você não tem as permissões necessárias para acessar este recurso."
        backUrl="/dashboard/professor"
        showHomeButton={false}
      />
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>Erro: {error}</div>;
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Sem data definida";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
    }).format(new Date(date));
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Concluída";
      case "IN_PROGRESS":
        return "Em andamento";
      case "SKIPPED":
        return "Ignorada";
      case "PENDING":
      default:
        return "Pendente";
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-lg border p-4 shadow-sm space-y-3 bg-white"
        >
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex w-full justify-between">
            <div>
              <h1 className="text-2xl font-bold">Rotina do estudante</h1>
              <p className="text-sm text-muted-foreground">
                Aluno: {formattedStudentName}
              </p>
            </div>
            {studentId && (
              <RoutineForm
                studentId={studentId}
                onSuccess={fetchRotinas}
                onForbidden={() => setIsForbidden(true)}
              />
            )}
          </div>
        </div>

        {loading && renderSkeleton()}

        {!loading && rotinas.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-600">
            Nenhuma rotina registrada para este aluno ainda.
          </div>
        )}

        {!loading && rotinas.length > 0 && (
          <ul className="space-y-4">
            {rotinas.map((rotina) => (
              <li
                key={rotina.id}
                className="rounded-lg border p-4 shadow-sm bg-white"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Rotina</h2>
                    <p className="text-sm text-muted-foreground">
                      Data de realização: {formatDate(rotina.dateOfRealization)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Professor: {rotina.creator.name || "Sem nome"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {formatStatus(rotina.status)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold">Atividades</p>
                  {rotina.atividades.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade cadastrada.
                    </p>
                  ) : (
                    <>
                      {["MORNING", "AFTERNOON", "EVENING"].map((period) => {
                        const atividadesFiltradas = rotina.atividades.filter(
                          (a) => a.dayPeriod === period
                        );
                        const titulo =
                          period === "MORNING"
                            ? "Manhã"
                            : period === "AFTERNOON"
                            ? "Tarde"
                            : "Noite";

                        if (!atividadesFiltradas.length) return null;

                        return (
                          <div key={period} className="space-y-2">
                            <p className="text-sm font-semibold">{titulo}</p>
                            <div className="overflow-x-auto pb-2">
                              <div className="flex flex-nowrap gap-3">
                                {atividadesFiltradas.map((atividade, idx) => (
                                  <div
                                    key={atividade.id}
                                    className={`border rounded-md p-3 bg-slate-50 min-w-[220px] max-w-xs flex-shrink-0 ${
                                      dragging?.atividadeId === atividade.id
                                        ? "opacity-60"
                                        : ""
                                    }`}
                                    draggable
                                    onDragStart={handleDragStart(
                                      rotina.id,
                                      atividade.id
                                    )}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop(rotina.id, atividade.id)}
                                    onDragEnd={handleDragEnd}
                                  >
                                    <div className="space-y-1">
                                      <p className="font-medium">
                                        {atividade.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Ordem: {idx + 1}
                                      </p>
                                      {atividade.estimatedTime !== null && (
                                        <p className="text-xs text-muted-foreground">
                                          Tempo estimado: {atividade.estimatedTime}
                                        </p>
                                      )}
                                      {atividade.timeInSeconds !== null && (
                                        <p className="text-xs text-muted-foreground">
                                          Tempo (s): {atividade.timeInSeconds}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentRoutinePage;
