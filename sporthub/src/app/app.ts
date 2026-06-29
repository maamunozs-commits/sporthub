import { Component } from '@angular/core';

/**
 * Componente raíz de la aplicación. Aloja el `router-outlet` principal
 * y el contenedor global de notificaciones (`app-toast`).
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
})
export class App {
  /** Título de la aplicación. */
  protected readonly title = 'SportHub';
}
