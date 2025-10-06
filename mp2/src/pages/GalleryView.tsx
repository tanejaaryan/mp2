import React from 'react';
import { Link } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonByName, fetchTypes } from '../api';
import type { PokemonDetail } from '../types';
import styles from './GalleryView.module.css';
import { usePokemonIndex } from '../context';

export default function GalleryView() {
  const { setOrderedNames } = usePokemonIndex();
  const [types, setTypes] = React.useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(() => {
    // Restore selected types from sessionStorage on component mount
    const saved = sessionStorage.getItem('gallery-selected-types');
    return saved ? JSON.parse(saved) : [];
  });
  const [items, setItems] = React.useState<PokemonDetail[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchTypes().then(types => {
      // Remove dark and stellar types
      const filteredTypes = types.filter(type => type !== 'dark' && type !== 'stellar');
      setTypes(filteredTypes);
    }).catch(() => setTypes([]));
    setLoading(true);
    fetchPokemonList(151) // initial gallery size
      .then(async list => {
        const details = await Promise.all(list.results.map(r => fetchPokemonByName(r.name)));
        setItems(details);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleType = (t: string) => {
    setSelectedTypes(prev => {
      const newTypes = prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t];
      // Save to sessionStorage for persistence
      sessionStorage.setItem('gallery-selected-types', JSON.stringify(newTypes));
      return newTypes;
    });
  };

  const filtered = React.useMemo(() => {
    if (selectedTypes.length === 0) return items;
    const set = new Set(selectedTypes);
    return items.filter(p => p.types.some(te => set.has(te.type.name)));
  }, [items, selectedTypes]);

  React.useEffect(() => {
    setOrderedNames(filtered.map(p => p.name));
  }, [filtered, setOrderedNames]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pokémon Gallery</h1>
        <p className={styles.subtitle}>Browse official artwork and filter by elemental types.</p>
      </div>
      
      <div className={styles.filterCard}>
        <h3 className={styles.filterTitle}>Filter by Type</h3>
        <div className={styles.filters}>
          {types.map(t => (
            <label key={t} className={`${styles.chip} ${selectedTypes.includes(t) ? styles.checked : ''}`}>
              <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} /> {t}
            </label>
          ))}
        </div>
        <div className={styles.filterStatus}>
          <span className={styles.results}>Showing {filtered.length} of {items.length}</span>
          {selectedTypes.length > 0 && (
            <button className={styles.clearButton} onClick={() => {
              setSelectedTypes([]);
              sessionStorage.removeItem('gallery-selected-types');
            }}>
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>Loading…</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p, index) => (
            <Link key={p.name} to={`/pokemon/${p.name}`} className={styles.card}>
              {p.sprites.front_default ? (
                <img alt={p.name} src={p.sprites.front_default} className={styles.img} />
              ) : (
                <div className={styles.placeholder}>No Image</div>
              )}
              <div className={styles.pokemonNumber}>#{index + 1}</div>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.types}>
                {p.types.map(t => (
                  <span key={t.type.name} className={styles.typeChip}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


