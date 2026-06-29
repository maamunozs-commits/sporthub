import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService, Toast } from '../../services/notification.service';

/**
 * Contenedor de notificaciones *toast*. Se coloca una sola vez en la raíz
 * de la app y renderiza los toasts emitidos por `NotificationService`.
 */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  standalone: false,
})
export class ToastComponent {
  /** Lista reactiva de toasts visibles. */
  toasts$: Observable<Toast[]>;

  constructor(private notify: NotificationService) {
    this.toasts$ = this.notify.toasts$;
  }

  /** Devuelve el icono de Bootstrap según el tipo de toast. */
  icono(tipo: string): string {
    const map: Record<string, string> = {
      success: 'check-circle-fill',
      danger: 'x-circle-fill',
      info: 'info-circle-fill',
      warning: 'exclamation-triangle-fill',
    };
    return map[tipo] || 'check-circle-fill';
  }

  /** Descarta un toast manualmente. */
  cerrar(id: number): void {
    this.notify.descartar(id);
  }
}
