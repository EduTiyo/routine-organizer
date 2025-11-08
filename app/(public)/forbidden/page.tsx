import { ForbiddenPage } from "@/components/ForbiddenPage";

export default function Forbidden403Page() {
  return (
    <ForbiddenPage
      title="403 - Acesso Proibido"
      message="Você não tem as permissões necessárias para acessar este recurso."
      backUrl="/dashboard"
    />
  );
}
