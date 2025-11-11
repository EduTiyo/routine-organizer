import { User } from "@prisma/client";
import StudentCard from "./StudentCard";

interface StudentListProps {
  students: Partial<User>[];
}

const StudentList = ({ students }: StudentListProps) => {
  return (
    <ul className="flex flex-wrap gap-4 justify-between items-center px-10 py-5">
      {students.map((student) => (
        <li key={student.id}>
          <StudentCard student={student} />
        </li>
      ))}
    </ul>
  );
};

export default StudentList;
