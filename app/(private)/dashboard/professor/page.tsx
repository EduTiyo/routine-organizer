"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import StudentList from "@/components/StudentList";
import ForbiddenPage from "@/components/ForbiddenPage";

export default function ProfessorDashboard() {
  const [students, setStudents] = useState<Partial<User>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/students");

        if (res.status === 403) {
          setIsForbidden(true);
        }

        if (!res.ok) {
          throw new Error("Falha ao carregar alunos");
        }

        const data = await res.json();
        setStudents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
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
  if (loading) return <div>Carregando alunos...</div>;
  if (error) return <div style={{ color: "red" }}>Erro: {error}</div>;

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Lista de Alunos Registrados</h1>
        {students.length === 0 ? (
          <p>Nenhum aluno registrado encontrado.</p>
        ) : (
          <StudentList students={students} />
        )}
      </div>
    </div>
  );
}
