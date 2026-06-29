import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cancha } from '../../models/models';
import { tipoEmoji, tipoImagen, tipoLabel } from '../../shared/cancha-helpers';

/**
 * Tarjeta de cancha (componente *presentacional*).
 *
 * Recibe una `Cancha` por `@Input()` y emite eventos por `@Output()` cuando
 * el usuario quiere ver el detalle o reservar. Es el ejemplo principal de
 * **pasado de datos entre componentes** (padre → hijo con `@Input`,
 * hijo → padre con `@Output`).
 */
@Component({
  selector: 'app-cancha-card',
  templateUrl: './cancha-card.component.html',
  standalone: false,
})
export class CanchaCardComponent {
  /** Cancha a representar en la tarjeta. */
  @Input() cancha!: Cancha;

  /** Indica si hay un usuario con sesión iniciada (afecta el botón de acción). */
  @Input() autenticado = false;

  /** Se emite cuando el usuario solicita ver el detalle de la cancha. */
  @Output() verDetalle = new EventEmitter<number>();

  /** Se emite cuando el usuario quiere reservar la cancha. */
  @Output() reservar = new EventEmitter<number>();

  /** Etiqueta legible del tipo de cancha. */
  get label(): string {
    return tipoLabel(this.cancha.tipo);
  }

  /** Emoji del tipo de cancha. */
  get emoji(): string {
    return tipoEmoji(this.cancha.tipo);
  }

  /** Imagen local de la cancha, con fallback por tipo de deporte. */
  get imagen(): string {
    return this.cancha.imagen || tipoImagen(this.cancha.tipo);
  }

  /** Descripción recortada para la tarjeta. */
  get resumen(): string {
    return (this.cancha.descripcion || '').substring(0, 90) + '…';
  }
}
