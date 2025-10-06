import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPokemonByName } from '../api';
import type { PokemonDetail } from '../types';
import { usePokemonIndex } from '../context';
import styles from './DetailView.module.css';

export default function DetailView() {
  const { name = '' } = useParams();
  const navigate = useNavigate();
  const { orderedNames } = usePokemonIndex();
  const [data, setData] = React.useState<PokemonDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!name) return;
    setError(null);
    fetchPokemonByName(name)
      .then(setData)
      .catch(() => setError('Failed to load Pokémon'));
  }, [name]);

  const goRelative = (delta: number) => {
    if (!name || orderedNames.length === 0) return;
    const idx = orderedNames.indexOf(name);
    if (idx === -1) return;
    const nextIdx = (idx + delta + orderedNames.length) % orderedNames.length;
    navigate(`/pokemon/${orderedNames[nextIdx]}`);
  };

  if (error) return <div className={styles.wrapper}><div className={styles.error}>{error}</div></div>;
  if (!data) return <div className={styles.wrapper}><div className={styles.loading}>Loading…</div></div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button 
          className={styles.navBtn} 
          onClick={() => goRelative(-1)} 
          aria-label="Previous"
          disabled={orderedNames.length <= 1}
        >
          ◀
        </button>
        <h1 className={styles.title}>{data.name}</h1>
        <button 
          className={styles.navBtn} 
          onClick={() => goRelative(1)} 
          aria-label="Next"
          disabled={orderedNames.length <= 1}
        >
          ▶
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.media}>
          {data.sprites.front_default ? (
            <img src={data.sprites.front_default} alt={data.name} />
          ) : (
            <div className={styles.placeholder}>No Image Available</div>
          )}
        </div>
        
        <div className={styles.info}>
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Basic Info</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>ID</span>
              <span className={styles.infoValue}>#{data.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Height</span>
              <span className={styles.infoValue}>{data.height} dm</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Weight</span>
              <span className={styles.infoValue}>{data.weight} hg</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Types</span>
              <div className={styles.types}>
                {data.types.map(t => (
                  <span key={t.type.name} className={styles.typeChip}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Base Stats</h3>
            <div className={styles.stats}>
              {data.stats.map(s => (
                <div key={s.stat.name} className={styles.statCard}>
                  <div className={styles.statName}>{s.stat.name.replace('-', ' ')}</div>
                  <div className={styles.statValue}>{s.base_stat}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        <Link to="/list">Back to List</Link>
        <Link to="/gallery">Back to Gallery</Link>
      </div>
    </div>
  );
}


