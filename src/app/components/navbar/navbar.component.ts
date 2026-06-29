import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/models';
import { AuthService } from '../../services/auth.service';

/**
 * Barra de navegación pública.
 *
 * Se suscribe a `AuthService.sesion$` para mostrar dinámicamente el menú
 * según haya o no sesión, y según el rol (cliente / admin).
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: false,
})
export class NavbarComponent {
  /** Sesión actual como observable (se consume con el pipe `async`). */
  sesion$: Observable<Usuario | null>;

  constructor(private auth: AuthService, private router: Router) {
    this.sesion$ = this.auth.sesion$;
  }

  /** Cierra la sesión y vuelve al login. */
  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
