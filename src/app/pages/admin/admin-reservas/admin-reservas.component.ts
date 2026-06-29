import { Component } from '@angular/core';
import { Reserva } from '../../../models/models';
import { NotificationService } from '../../../services/notification.service';
import { ReservaService } from '../../../services/reserva.service';
import { tipoEmoji } from '../../../shared/cancha-helpers';

/**
 * Listado global de reservas para el administrador, con filtros por
 * cliente, estado y deporte, y opción de cancelar reservas confirmadas.
 */
@Component({
  selector: 'app-admin-reservas',
  templateUrl: './admin-reservas.component.html',
  standalone: false,
})
export class AdminReservasComponent {
  busquedaCliente = '';
  filtroEstado = '';
  filtroTipo = '';

  emoji = tipoEmoji;

  constructor(private reservaService: ReservaService, private notify: NotificationService) {}

  /** Reservas filtradas y ordenadas por fecha de creación descendente. */
  get reservas(): Reserva[] {
    let lista = this.reservaService.getReservas();
    if (this.filtroEstado) lista = lista.filter((r) => r.estado === this.filtroEstado);
    if (this.filtroTipo) lista = lista.filter((r) => r.canchaTipo === this.filtroTipo);
    const q = this.busquedaCliente.toLowerCase().trim();
    if (q) lista = lista.filter((r) => r.clienteNombre.toLowerCase().includes(q) || r.clienteCorreo.toLowerCase().includes(q));
    return lista.sort((a, b) => +new Date(b.fechaCreacion) - +new Date(a.fechaCreacion));
  }

  /** Ingresos totales (reservas no canceladas). */
  get ingresos(): number {
    return this.reservaService.getReservas().filter((r) => r.estado !== 'cancelada').reduce((s, r) => s + r.precio, 0);
  }

  codigo(r: Reserva): string {
    return '#' + String(r.id).padStart(5, '0');
  }

  /** Limpia los filtros. */
  limpiar(): void {
    this.busquedaCliente = '';
    this.filtroEstado = '';
    this.filtroTipo = '';
  }

  /** Cancela una reserva. */
  cancelar(r: Reserva): void {
    if (!confirm('¿Cancelar esta reserva?')) return;
    this.reservaService.cancelar(r.id);
    this.notify.mostrar('Reserva cancelada.', 'info');
  }
}
