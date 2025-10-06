import axios from 'axios';
import type { PokemonDetail, PokemonListResponse } from './types';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Simple in-memory cache keyed by URL
const responseCache = new Map<string, unknown>();

async function getCached<T>(url: string): Promise<T> {
  if (responseCache.has(url)) {
    return responseCache.get(url) as T;
  }
  const res = await axios.get<T>(url);
  responseCache.set(url, res.data);
  return res.data;
}

export async function fetchPokemonList(limit = 2000): Promise<PokemonListResponse> {
  const url = `${BASE_URL}/pokemon?limit=${limit}&offset=0`;
  return getCached<PokemonListResponse>(url);
}

export async function fetchPokemonByName(name: string): Promise<PokemonDetail> {
  const url = `${BASE_URL}/pokemon/${encodeURIComponent(name.toLowerCase())}`;
  return getCached<PokemonDetail>(url);
}

export async function fetchTypes(): Promise<string[]> {
  const url = `${BASE_URL}/type`;
  const data = await getCached<{ results: { name: string }[] }>(url);
  return data.results.map(t => t.name);
}


