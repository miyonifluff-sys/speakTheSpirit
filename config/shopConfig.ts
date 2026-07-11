export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  costLabel: string;
  stateKey: 'hasSwordOfTruth' | 'hasHolyWater' | null;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'TICKET',
    name: 'Basecamp Ticket',
    description: 'Needed to rescue freed Songbeasts.',
    cost: 3,
    icon: '🎟️',
    costLabel: 'Cupcakes 🧁',
    stateKey: null,
  },
  {
    id: 'SWORD',
    name: 'Sword of Truth',
    description: 'Shatters Silencer barriers instantly.',
    cost: 8,
    icon: '⚔️',
    costLabel: 'Cupcakes 🧁',
    stateKey: 'hasSwordOfTruth',
  },
  {
    id: 'WATER',
    name: 'Holy Water Spray',
    description: "Breaches Love Island's Static Barrier.",
    cost: 5,
    icon: '🧪',
    costLabel: 'Cupcakes 🧁',
    stateKey: 'hasHolyWater',
  },
];
