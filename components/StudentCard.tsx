import { User } from "@prisma/client";
import { Card } from "./ui/card";
import { Toggle } from "@/components/ui/toggle"

interface StudentCardProps {
  student: Partial<User>;
}

const StudentCard = ({ student }: StudentCardProps) => {
  return (
     <Card className="flex flex-col justify-between p-6 mb-4 w-80 h-50 rounded-xl shadow-sm">
      <h2
        className="text-lg font-bold truncate mb-2"
        title={student.name || ""}
      >
        {student.name || "Sem nome"}
      </h2>
      <p className="text-sm text-gray-600 truncate" title={student.email || ""}>
        {student.email}
      </p>
      <Toggle
        aria-label="Toggle bold"
        variant="outline"
        size="sm"
        className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
      >
        Vincular
      </Toggle>
    </Card>
  );
};

export default StudentCard;
