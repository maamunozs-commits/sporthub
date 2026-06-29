import { Component } from '@angular/core';
import { Usuario } from '../../../models/models';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ReservaService } from '../../../services/reserva.service';

/**
 * Mantenedor de usuarios clientes. Permite buscar y eliminar clientes
 * (la cuenta admin no aparece y no puede eliminarse desde aquí).
 */
@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  standalone: false,
})
export class AdminUsuariosComponent {
  busqueda = '';

  constructor(
    private auth: AuthService,
    private reservaService: ReservaService,
    private notify: NotificationService
  ) {}

  /** Clientes filtrados y ordenados por fecha de registro descendente. */
  get clientes(): Usuario[] {
    const q = this.busqueda.toLowerCase().trim();
    let lista = this.auth.getClientes();
    if (q) lista = lista.filter((u) => u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q));
    return lista.sort((a, b) => +new Date(b.fechaRegistro) - +new Date(a.fechaRegistro));
  }

  /** Inicial del nombre para el avatar. */
  inicial(u: Usuario): string {
    return u.nombre.charAt(0).toUpperCase();
  }

  /** Reservas (total y confirmadas) de un cliente. */
  reservas(u: Usuario): { total: number; conf: number } {
    const r = this.reservaService.getReservasDeCliente(u.id);
    return { total: r.length, conf: r.filter((x) => x.estado === 'confirmada').length };
  }

  /** Fecha de registro en formato local. */
  fecha(u: Usuario): string {
    return new Date(u.fechaRegistro).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  }

  /** Elimina un cliente y sus reservas. */
  eliminar(u: Usuario): void {
    if (!confirm(`¿Eliminar al usuario "${u.nombre}"? Se eliminarán también sus reservas.`)) return;
    this.auth.eliminarUsuario(u.id);
    this.notify.mostrar('Usuario eliminado.', 'info');
  }
}
