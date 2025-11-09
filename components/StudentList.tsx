import { User } from "@prisma/client";
import StudentCard from "./StudentCard";

interface StudentListProps {
  students: Partial<User>[];
}

const StudentList = ({ students }: StudentListProps) => {
  return (
    <ul className="flex flex-wrap gap-6 justify-center">
      {students.map((student) => (
        <li key={student.id}>
          <StudentCard student={student} />
        </li>
      ))}
    </ul>
  );
};

export default StudentList;
