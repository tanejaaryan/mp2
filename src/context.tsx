import React from 'react';

export interface PokemonIndexContextValue {
  orderedNames: string[];
  setOrderedNames: (names: string[]) => void;
}

export const PokemonIndexContext = React.createContext<PokemonIndexContextValue | undefined>(undefined);

export function PokemonIndexProvider({ children }: { children: React.ReactNode }) {
  const [orderedNames, setOrderedNames] = React.useState<string[]>([]);
  const value = React.useMemo(() => ({ orderedNames, setOrderedNames }), [orderedNames]);
  return <PokemonIndexContext.Provider value={value}>{children}</PokemonIndexContext.Provider>;
}

export function usePokemonIndex() {
  const ctx = React.useContext(PokemonIndexContext);
  if (!ctx) throw new Error('usePokemonIndex must be used within PokemonIndexProvider');
  return ctx;
}


