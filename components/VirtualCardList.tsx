import VirtualCardCard from "./VirtualCardCard";
import { VirtualCard } from "./VirtualCardTypes";

interface VirtualCardListProps {
  cards: VirtualCard[];
}

const VirtualCardList = ({ cards }: VirtualCardListProps) => {
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
        <li key={card.id}>
          <VirtualCardCard card={card} />
        </li>
      ))}
    </ul>
  );
};

export default VirtualCardList;
export type { VirtualCard };
