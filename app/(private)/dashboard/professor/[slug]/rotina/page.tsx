"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ForbiddenPage from "@/components/ForbiddenPage";
import { Skeleton } from "@/components/ui/skeleton";
import RoutineForm from "@/components/RoutineForm";

type Atividade = {
  id: string;
  title: string;
  imageUrl: string;
  estimatedTime: number | null;
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rotina.atividades.map((atividade) => (
                        <div
                          key={atividade.id}
                          className="border rounded-md p-3 bg-slate-50"
                        >
                          <p className="font-medium">{atividade.title}</p>
                          {atividade.estimatedTime !== null && (
                            <p className="text-xs text-muted-foreground">
                              Tempo estimado: {atividade.estimatedTime}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
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
