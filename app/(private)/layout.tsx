import Header from "@/components/header";

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-2 space-y-4">
      <div className="fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-sm">
        <Header />
      </div>
      <div className="pt-16 p-2 mt-2">
        <div className="bg-white rounded-lg shadow-lg min-h-screen mb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PrivateLayout;
