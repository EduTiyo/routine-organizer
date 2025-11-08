import Header from "@/components/header";

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default PrivateLayout;
