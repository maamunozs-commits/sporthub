import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from '../../models/models';
import { AuthService } from '../../services/auth.service';

/**
 * Cabecera del panel de administración: barra superior + sub-navegación
 * con pestañas (Dashboard, Canchas, Usuarios, Reservas, Horarios).
 */
@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  standalone: false,
})
export class AdminHeaderComponent {
  /** Sesión del administrador en curso. */
  sesion$: Observable<Usuario | null>;

  constructor(private auth: AuthService, private router: Router) {
    this.sesion$ = this.auth.sesion$;
  }

  /** Cierra la sesión del administrador. */
  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
