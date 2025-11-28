import StudentCardSkeleton from "./StudentCardSkeleton";

const StudentListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 px-10 py-5">
      {Array.from({ length: 15 }).map((_, index) => (
        <StudentCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
};

export default StudentListSkeleton;
