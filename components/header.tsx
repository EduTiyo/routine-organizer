"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Role } from "@prisma/client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/public/icons/AppIcon";

export function Header() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex justify-start gap-6 items-center">
          <AppIcon className="h-10 w-10" />
          {/* Seção da esquerda - Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              {status === "loading" && (
                <NavigationMenuItem>
                  <Skeleton className="h-9 w-20 rounded-md" />
                </NavigationMenuItem>
              )}

              {status === "unauthenticated" && (
                <>
                  <NavigationMenuItem>
                    <Link
                      href="/login"
                      className={navigationMenuTriggerStyle()}
                    >
                      Login
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link
                      href="/register"
                      className={navigationMenuTriggerStyle()}
                    >
                      Registrar
                    </Link>
                  </NavigationMenuItem>
                </>
              )}

              {status === "authenticated" && (
                <>
                  {userRole === Role.TEACHER && (
                    <NavigationMenuItem>
                      <Link
                        href="/dashboard/professor"
                        className={navigationMenuTriggerStyle()}
                      >
                        Dashboard (Professor)
                      </Link>
                      <Link
                        href="/dashboard/professor/cartoes-virtuais"
                        className={navigationMenuTriggerStyle()}
                      >
                        Cartões Virtuais
                      </Link>
                    </NavigationMenuItem>
                  )}

                  {userRole === Role.STUDENT && (
                    <NavigationMenuItem>
                      <Link
                        href="/dashboard/aluno"
                        className={navigationMenuTriggerStyle()}
                      >
                        Minha Rotina (Aluno)
                      </Link>
                    </NavigationMenuItem>
                  )}
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Seção da direita - Botão Sair */}
        {status === "authenticated" && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, {session?.user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
