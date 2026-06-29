import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que convierte una fecha ISO `yyyy-mm-dd` al formato local
 * `dd/mm/yyyy`. Pensado para las fechas de reserva.
 *
 * Uso: `{{ reserva.fecha | fechaEs }}`  →  `28/06/2026`
 */
@Pipe({ name: 'fechaEs', standalone: false })
export class FechaEsPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    const partes = valor.split('-');
    if (partes.length !== 3) return valor;
    const [y, m, d] = partes;
    return `${d}/${m}/${y}`;
  }
}
