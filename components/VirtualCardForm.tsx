"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const createVirtualCardFormSchema = z.object({
  title: z.string().min(1, "Informe um título"),
  estimatedTime: z
    .union([z.literal(""), z.coerce.number().int().min(1, "Tempo inválido")])
    .optional(),
  image: z.any(),
});

type CreateVirtualCardFormSchema = z.infer<typeof createVirtualCardFormSchema>;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const defaultFormValues: CreateVirtualCardFormSchema = {
  title: "",
  estimatedTime: "",
  image: undefined,
};

type VirtualCardFormProps = {
  onSuccess?: () => void | Promise<void>;
  onForbidden?: () => void;
};

const VirtualCardForm = ({ onSuccess, onForbidden }: VirtualCardFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateVirtualCardFormSchema>({
    resolver: zodResolver(createVirtualCardFormSchema),
    defaultValues: defaultFormValues,
  });

  const handleDialogToggle = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      form.reset(defaultFormValues);
      form.clearErrors();
    }
  };

  const onSubmit = async (values: CreateVirtualCardFormSchema) => {
    const fileList = values.image as FileList | null;
    const file = fileList?.item(0);

    if (!file) {
      form.setError("image", { message: "Selecione uma imagem" });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      form.setError("image", {
        message: "A imagem deve ter no máximo 5MB",
      });
      return;
    }

    const estimatedTimeValue =
      typeof values.estimatedTime === "number"
        ? values.estimatedTime
        : undefined;

    const payload = new FormData();
    payload.append("title", values.title);

    if (estimatedTimeValue !== undefined) {
      payload.append("estimatedTime", String(estimatedTimeValue));
    }

    payload.append("image", file, file.name);

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/cartoes-virtuais", {
        method: "POST",
        body: payload,
      });

      if (res.status === 403) {
        onForbidden?.();
        throw new Error("Acesso não autorizado");
      }

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Falha ao criar cartão virtual");
      }

      await onSuccess?.();
      toast.success("Cartão virtual criado com sucesso!");
      handleDialogToggle(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao criar cartão virtual";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogToggle}>
      <DialogTrigger asChild>
        <Button className="bg-violet-600 hover:bg-violet-500">
          Criar Cartão Virtual
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cartão Virtual</DialogTitle>
          <DialogDescription>
            Preencha o formulário para adicionar uma nova atividade.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cartão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Estimado (entre 1 e 5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Opcional"
                    />
                  </FormControl>
                  <FormDescription>
                    1 - Bem rápido. 2 - Rápido. 3 - Médio. 4 - Demorado. 5 -
                    Muito demorado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => {
                const selectedFile =
                  field.value instanceof FileList ? field.value.item(0) : null;

                return (
                  <FormItem>
                    <FormLabel>Imagem</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const files = event.target.files;
                          field.onChange(files);
                        }}
                      />
                    </FormControl>
                    {selectedFile?.name && (
                      <p className="text-xs text-muted-foreground">
                        Selecionado: {selectedFile.name}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleDialogToggle(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar cartão
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualCardForm;
