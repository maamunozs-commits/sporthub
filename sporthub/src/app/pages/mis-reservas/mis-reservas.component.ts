import { Component, OnInit } from '@angular/core';
import { Reserva } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ReservaService } from '../../services/reserva.service';
import { tipoColor, tipoEmoji, tipoLabel } from '../../shared/cancha-helpers';

/**
 * Historial de reservas del cliente en sesión, con estadísticas y filtros
 * por estado y por deporte, y opción de cancelar reservas confirmadas.
 */
@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  standalone: false,
})
export class MisReservasComponent implements OnInit {
  private clienteId = 0;

  filtroEstado = '';
  filtroTipo = '';

  label = tipoLabel;
  emoji = tipoEmoji;
  color = tipoColor;

  constructor(
    private reservaService: ReservaService,
    private auth: AuthService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.clienteId = this.auth.sesionActual?.id ?? 0;
  }

  /** Todas las reservas del cliente (sin filtrar), para las estadísticas. */
  private get misReservas(): Reserva[] {
    return this.reservaService.getReservasDeCliente(this.clienteId);
  }

  /** Reservas filtradas y ordenadas por fecha de creación descendente. */
  get reservasFiltradas(): Reserva[] {
    let lista = this.misReservas;
    if (this.filtroEstado) lista = lista.filter((r) => r.estado === this.filtroEstado);
    if (this.filtroTipo) lista = lista.filter((r) => r.canchaTipo === this.filtroTipo);
    return lista.sort((a, b) => +new Date(b.fechaCreacion) - +new Date(a.fechaCreacion));
  }

  /** KPIs del encabezado. */
  get stats() {
    const mis = this.misReservas;
    const confirmadas = mis.filter((r) => r.estado === 'confirmada');
    return {
      total: mis.length,
      confirmadas: confirmadas.length,
      canceladas: mis.filter((r) => r.estado === 'cancelada').length,
      gasto: confirmadas.reduce((s, r) => s + r.precio, 0),
    };
  }

  /** Código formateado de una reserva. */
  codigo(r: Reserva): string {
    return '#' + String(r.id).padStart(5, '0');
  }

  /** Cancela una reserva confirmada (con confirmación del usuario). */
  cancelar(r: Reserva): void {
    if (!confirm('¿Seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.')) return;
    this.reservaService.cancelar(r.id);
    this.notify.mostrar('Reserva cancelada correctamente.', 'info');
  }
}
