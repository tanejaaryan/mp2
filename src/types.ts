export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
}

export interface PokemonTypeEntry {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonStatEntry {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: PokemonSprites;
  types: PokemonTypeEntry[];
  stats: PokemonStatEntry[];
}


