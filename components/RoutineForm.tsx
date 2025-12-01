"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

type Atividade = {
  id: string;
  title: string;
};

type RoutineFormProps = {
  studentId: string;
  onSuccess?: () => void | Promise<void>;
  onForbidden?: () => void;
};

const RoutineForm = ({ studentId, onSuccess, onForbidden }: RoutineFormProps) => {
  const [availableActivities, setAvailableActivities] = useState<Atividade[]>(
    []
  );
  const [formDate, setFormDate] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch("/api/cartoes-virtuais");

        if (res.status === 403) {
          onForbidden?.();
          return;
        }

        if (!res.ok) {
          throw new Error("Falha ao carregar atividades");
        }

        const data = (await res.json()) as Atividade[];
        setAvailableActivities(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Falha ao carregar atividades";
        toast.error(message);
      }
    }

    fetchActivities();
  }, [onForbidden]);

  const resetForm = () => {
    setFormDate("");
    setSelectedActivities([]);
  };

  const handleDialogToggle = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleActivitiesChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedActivities(values);
  };

  const handleSubmit = async () => {
    if (!studentId) {
      toast.error("Estudante inválido");
      return;
    }

    if (!formDate) {
      toast.error("Informe a data de realização");
      return;
    }

    const selectedDate = new Date(`${formDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      toast.error("A data não pode estar no passado");
      return;
    }

    if (!selectedActivities.length) {
      toast.error("Selecione pelo menos uma atividade");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/rotinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateOfRealization: formDate,
          atividadeIds: selectedActivities,
          studentId,
        }),
      });

      if (res.status === 403) {
        onForbidden?.();
        throw new Error("Acesso não autorizado");
      }

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Falha ao criar rotina");
      }

      await onSuccess?.();
      toast.success("Rotina criada com sucesso!");
      handleDialogToggle(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao criar rotina";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogToggle}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="cursor-pointer bg-violet-600 hover:bg-violet-500"
        >
          Criar nova rotina
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova rotina</DialogTitle>
          <DialogDescription>
            Preencha os campos para criar uma rotina para este aluno.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data de realização</Label>
            <Input
              id="date"
              type="date"
              min={minDate}
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activities">Atividades</Label>
            <select
              id="activities"
              multiple
              className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={selectedActivities}
              onChange={handleActivitiesChange}
            >
              {availableActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Selecione uma ou mais atividades já cadastradas.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleDialogToggle(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar rotina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoutineForm;
