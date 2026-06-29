import { TipoCancha } from '../models/models';

/**
 * Funciones utilitarias puras relacionadas con el tipo de cancha:
 * etiqueta legible, emoji y color representativo.
 */

/** Devuelve la etiqueta legible de un tipo de cancha. */
export function tipoLabel(t: TipoCancha | string): string {
  const map: Record<string, string> = {
    futbol: 'Fútbol', padel: 'Pádel', tenis: 'Tenis', basquetbol: 'Básquetbol',
  };
  return map[t] || t;
}

/** Devuelve el emoji representativo de un tipo de cancha. */
export function tipoEmoji(t: TipoCancha | string): string {
  const map: Record<string, string> = {
    futbol: '⚽', padel: '🎾', tenis: '🎾', basquetbol: '🏀',
  };
  return map[t] || '🏟️';
}

/** Devuelve el color hexadecimal asociado a un tipo de cancha. */
export function tipoColor(t: TipoCancha | string): string {
  const map: Record<string, string> = {
    futbol: '#27ae60', padel: '#2980b9', tenis: '#f39c12', basquetbol: '#e74c3c',
  };
  return map[t] || '#1a3a5c';
}

/** Devuelve la imagen local asociada a un tipo de cancha. */
export function tipoImagen(t: TipoCancha | string): string {
  const map: Record<string, string> = {
    futbol: 'assets/canchas/futbol.jpg',
    padel: 'assets/canchas/padel.jpg',
    tenis: 'assets/canchas/tenis.jpg',
    basquetbol: 'assets/canchas/basquetbol.jpg',
  };
  return map[t] || 'assets/canchas/futbol.jpg';
}
