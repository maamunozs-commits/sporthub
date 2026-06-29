import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que formatea un número como precio en pesos chilenos (CLP).
 *
 * Uso en plantilla: `{{ cancha.precio | precioClp }}`  →  `$15.000`
 */
@Pipe({ name: 'precioClp', standalone: false })
export class PrecioClpPipe implements PipeTransform {
  /**
   * @param valor monto numérico a formatear
   * @returns el monto formateado como moneda CLP
   */
  transform(valor: number | null | undefined): string {
    const monto = valor ?? 0;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  }
}
