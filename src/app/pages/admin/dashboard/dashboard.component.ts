import { Component, OnInit } from '@angular/core';
import { Cancha, Reserva } from '../../../models/models';
import { AuthService } from '../../../services/auth.service';
import { CanchaService } from '../../../services/cancha.service';
import { ReservaService } from '../../../services/reserva.service';
import { tipoColor, tipoEmoji } from '../../../shared/cancha-helpers';

/** Fila de popularidad de una cancha (para la barra de progreso). */
interface Popularidad {
  cancha: Cancha;
  count: number;
  pct: number;
}

/**
 * Panel principal del administrador: KPIs del sistema, últimas reservas
 * y ranking de canchas más reservadas.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: false,
})
export class DashboardComponent implements OnInit {
  kpis = { canchas: 0, clientes: 0, reservas: 0, hoy: 0, ingresos: 0 };
  ultimas: Reserva[] = [];
  popularidad: Popularidad[] = [];

  emoji = tipoEmoji;
  color = tipoColor;

  constructor(
    private canchaService: CanchaService,
    private reservaService: ReservaService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const canchas = this.canchaService.getCanchas();
    const reservas = this.reservaService.getReservas();
    const hoy = new Date().toISOString().split('T')[0];
    const confirmadas = reservas.filter((r) => r.estado === 'confirmada');

    this.kpis = {
      canchas: canchas.length,
      clientes: this.auth.getClientes().length,
      reservas: reservas.length,
      hoy: reservas.filter((r) => r.fecha === hoy && r.estado !== 'cancelada').length,
      ingresos: confirmadas.reduce((s, r) => s + r.precio, 0),
    };

    this.ultimas = [...reservas]
      .sort((a, b) => +new Date(b.fechaCreacion) - +new Date(a.fechaCreacion))
      .slice(0, 7);

    const max = Math.max(1, ...canchas.map((c) => confirmadas.filter((r) => r.canchaId === c.id).length));
    this.popularidad = canchas.map((c) => {
      const count = confirmadas.filter((r) => r.canchaId === c.id).length;
      return { cancha: c, count, pct: Math.round((count / max) * 100) };
    });
  }

  /** Código formateado de una reserva. */
  codigo(r: Reserva): string {
    return '#' + String(r.id).padStart(5, '0');
  }
}
