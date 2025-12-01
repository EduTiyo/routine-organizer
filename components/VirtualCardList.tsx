import { useState } from "react";
import VirtualCardCard from "./VirtualCardCard";
import { VirtualCard } from "../app/(private)/dashboard/professor/cartoes-virtuais/types/VirtualCardTypes";

interface VirtualCardListProps {
  cards: VirtualCard[];
  onReorder?: (cards: VirtualCard[]) => void;
}

const VirtualCardList = ({ cards, onReorder }: VirtualCardListProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => (event: React.DragEvent) => {
    setDraggedId(id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetId: string) => (event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentIndex = cards.findIndex((c) => c.id === draggedId);
    const targetIndex = cards.findIndex((c) => c.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;

    const reordered = [...cards];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    onReorder?.(reordered.map((card, index) => ({ ...card, order: index })));
    setDraggedId(null);
  };

  const handleDragEnd = () => setDraggedId(null);

  if (!cards.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-600">
        Nenhum cartão virtual encontrado.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <li
          key={card.id}
          draggable
          onDragStart={handleDragStart(card.id)}
          onDragOver={handleDragOver}
          onDrop={handleDrop(card.id)}
          onDragEnd={handleDragEnd}
          className={`cursor-move ${
            draggedId === card.id ? "opacity-60" : ""
          }`}
        >
          <VirtualCardCard card={card} />
        </li>
      ))}
    </ul>
  );
};

export default VirtualCardList;
export type { VirtualCard };
