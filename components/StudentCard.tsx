"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { Card } from "./ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { UserIcon } from "lucide-react";

interface StudentCardProps {
  student: Partial<User> & { isLinked?: boolean };
}

const StudentCard = ({ student }: StudentCardProps) => {
  const { data: session } = useSession();
  const [linked, setLinked] = useState(student.isLinked);

  const handleLink = async (studentId?: string) => {
    const beingLinked = !linked;
    setLinked(beingLinked);

    const teacherId = session?.user?.id;

    try {
      if (beingLinked) {
        const res = await fetch("/api/links/link-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, studentId }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Erro ao vincular aluno");
          setLinked(false);
          return;
        }

        toast.success("Aluno vinculado com sucesso!");
      } else {
        const res = await fetch("/api/links/unlink-student", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, studentId }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Erro ao desvincular aluno");
          setLinked(true);
          return;
        }

        toast.info("Aluno desvinculado!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado.");
    }
  };

  return (
    <Card className="flex flex-col justify-between p-6 mb-4 w-80 h-48 rounded-xl shadow-sm">
      <div className="flex">
        <UserIcon className="h-8 w-8 text-gray-300 mr-4" />
        <h2
          className="text-lg font-bold truncate mb-2"
          title={student.name || ""}
        >
          {student.name || "Sem nome"}
        </h2>
      </div>

      <p className="text-sm text-gray-600 truncate" title={student.email || ""}>
        {student.email}
      </p>

      <Toggle
        aria-label="Toggle vínculo"
        variant="outline"
        size="sm"
        pressed={linked}
        onPressedChange={() => handleLink(student.id)}
        className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
      >
        {linked ? "Vinculado" : "Vincular"}
      </Toggle>
    </Card>
  );
};

export default StudentCard;
