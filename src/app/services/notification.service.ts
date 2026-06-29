import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Tipos de notificación visual (toast). */
export type TipoToast = 'success' | 'danger' | 'info' | 'warning';

/** Estructura de un toast en pantalla. */
export interface Toast {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}

/**
 * Servicio de notificaciones tipo *toast*.
 *
 * Expone un observable de la lista de toasts visibles, que el
 * `ToastComponent` renderiza. Los toasts se auto-descartan a los 3.5s.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);

  /** Lista reactiva de toasts visibles. */
  toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private contador = 0;

  /** Muestra un nuevo toast y programa su desaparición. */
  mostrar(mensaje: string, tipo: TipoToast = 'success'): void {
    const toast: Toast = { id: ++this.contador, mensaje, tipo };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.descartar(toast.id), 3500);
  }

  /** Elimina un toast por id. */
  descartar(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
