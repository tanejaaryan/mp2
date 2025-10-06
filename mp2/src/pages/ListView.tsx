import React from 'react';
import { Link } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonByName } from '../api';
import type { NamedAPIResource, PokemonDetail } from '../types';
import { usePokemonIndex } from '../context';
import styles from './ListView.module.css';

type SortKey = 'pokedex' | 'name' | 'experience' | 'weight' | 'height';

export default function ListView() {
  const [all, setAll] = React.useState<NamedAPIResource[]>([]);
  const [pokemonDetails, setPokemonDetails] = React.useState<Map<string, PokemonDetail>>(new Map());
  const [query, setQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('pokedex');
  const [ascending, setAscending] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { setOrderedNames } = usePokemonIndex();
  const orderIndexRef = React.useRef<Map<string, number>>(new Map());

  React.useEffect(() => {
    setLoading(true);
    fetchPokemonList(151).then(async data => {
      setAll(data.results);
      setOrderedNames(data.results.map(r => r.name));
      // Build original order index map to support Pokédex ID sorting
      const idxMap = new Map<string, number>();
      data.results.forEach((r, i) => idxMap.set(r.name, i));
      orderIndexRef.current = idxMap;
      
      // Fetch details for the first 151 Pokémon
      const details = await Promise.all(
        data.results.map(async (p) => {
          try {
            const detail = await fetchPokemonByName(p.name);
            return { name: p.name, detail };
          } catch {
            return { name: p.name, detail: null };
          }
        })
      );
      
      const detailsMap = new Map();
      details.forEach(({ name, detail }) => {
        if (detail) detailsMap.set(name, detail);
      });
      setPokemonDetails(detailsMap);
    }).catch(() => {
      setAll([]);
    }).finally(() => {
      setLoading(false);
    });
  }, [setOrderedNames]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = all.filter(p => p.name.includes(q));
    arr = arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'pokedex') {
        const ai = orderIndexRef.current.get(a.name) ?? 0;
        const bi = orderIndexRef.current.get(b.name) ?? 0;
        cmp = ai - bi;
      } else if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === 'experience') {
        const aExp = pokemonDetails.get(a.name)?.base_experience || 0;
        const bExp = pokemonDetails.get(b.name)?.base_experience || 0;
        cmp = aExp - bExp;
      } else if (sortKey === 'weight') {
        const aWeight = pokemonDetails.get(a.name)?.weight || 0;
        const bWeight = pokemonDetails.get(b.name)?.weight || 0;
        cmp = aWeight - bWeight;
      } else if (sortKey === 'height') {
        const aHeight = pokemonDetails.get(a.name)?.height || 0;
        const bHeight = pokemonDetails.get(b.name)?.height || 0;
        cmp = aHeight - bHeight;
      }
      return ascending ? cmp : -cmp;
    });
    return arr;
  }, [all, query, sortKey, ascending]);

  React.useEffect(() => {
    // Keep detail prev/next in sync with currently visible list
    setOrderedNames(filtered.map(r => r.name));
  }, [filtered, setOrderedNames]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Kanto Pokédex</h1>
          <p className={styles.subtitle}>Loading Pokémon data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pokémon Roster</h1>
        <p className={styles.subtitle}>Search, sort, and explore the original 151 Pokémon.</p>
      </div>
      
      <div className={styles.controls}>
        <div className={styles.searchGroup}>
          <label className={styles.searchLabel}>Search</label>
          <input
            className={styles.input}
            placeholder="Type a name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.sortGroup}>
          <label className={styles.sortLabel}>Sort by</label>
          <select className={styles.select} value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
            <option value="pokedex">Pokédex ID</option>
            <option value="name">Name (A–Z)</option>
            <option value="experience">Experience</option>
            <option value="weight">Weight</option>
            <option value="height">Height</option>
          </select>
          <button className={styles.button} onClick={() => setAscending(a => !a)}>
            {ascending ? 'Ascending ↑' : 'Descending ↓'}
          </button>
        </div>
      </div>
      
      <div className={styles.results}>
        Showing {filtered.length} of {all.length} Pokémon
      </div>
      
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div>#</div>
          <div>Name</div>
          <div>Types</div>
          <div>Height</div>
          <div>Weight</div>
          <div>Experience</div>
          <div></div>
        </div>
        {filtered.map((p, index) => {
          const detail = pokemonDetails.get(p.name);
          return (
            <div key={p.name} className={styles.tableRow}>
              <div className={styles.pokemonNumber}>#{index + 1}</div>
              <div className={styles.pokemonName}>{p.name}</div>
              <div className={styles.types}>
                {detail?.types.map(type => (
                  <span key={type.type.name} className={styles.typeChip}>
                    {type.type.name}
                  </span>
                )) || '-'}
              </div>
              <div className={styles.height}>{detail?.height || '-'}</div>
              <div className={styles.weight}>{detail?.weight || '-'}</div>
              <div className={styles.experience}>{detail?.base_experience || '-'}</div>
              <div>
                <Link to={`/pokemon/${p.name}`} className={styles.detailsLink}>
                  Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


