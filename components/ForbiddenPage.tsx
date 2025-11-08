import Link from "next/link";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

interface ForbiddenPageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  backUrl?: string;
}

export function ForbiddenPage({
  title = "Acesso Negado",
  message = "Você não tem permissão para acessar esta página.",
  showBackButton = true,
  showHomeButton = true,
  backUrl = "/dashboard",
}: ForbiddenPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500">
            <p>
              Código do erro: <span className="font-mono">403</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showBackButton && (
              <Button variant="outline" size="sm" asChild>
                <Link href={backUrl} className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            )}

            {showHomeButton && (
              <Button size="sm" asChild>
                <Link href="/" className="inline-flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Ir para Home
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForbiddenPage;
