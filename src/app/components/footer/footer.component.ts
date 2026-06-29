import { Component, Input } from '@angular/core';

/**
 * Pie de página reutilizable.
 *
 * Recibe por `@Input()` la variante a mostrar: `full` (con enlaces) para
 * páginas públicas o `mini` (una sola línea) para páginas internas/admin.
 * Es un ejemplo de **pasado de datos de padre a hijo**.
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: false,
})
export class FooterComponent {
  /** Variante visual del footer. */
  @Input() variant: 'full' | 'mini' = 'full';

  /** Año actual mostrado en el copyright. */
  readonly anio = new Date().getFullYear();
}
