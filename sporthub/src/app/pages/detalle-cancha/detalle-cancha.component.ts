import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cancha } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CanchaService } from '../../services/cancha.service';
import { ReservaService } from '../../services/reserva.service';
import { tipoColor, tipoEmoji, tipoImagen, tipoLabel } from '../../shared/cancha-helpers';

/** Estado visual de un slot de horario. */
interface Slot {
  hora: string;
  estado: 'libre' | 'ocupado' | 'bloqueado';
}

/**
 * Detalle de una cancha con el flujo de reserva: selección de fecha,
 * grilla de horarios disponibles y resumen antes de continuar al carrito.
 */
@Component({
  selector: 'app-detalle-cancha',
  templateUrl: './detalle-cancha.component.html',
  standalone: false,
})
export class DetalleCanchaComponent implements OnInit {
  cancha?: Cancha;
  autenticado = false;

  fecha = '';
  fechaMin = '';
  slots: Slot[] = [];
  horaSeleccionada: string | null = null;

  alerta: { tipo: string; texto: string } | null = null;

  // Helpers de presentación
  label = tipoLabel;
  emoji = tipoEmoji;
  color = tipoColor;

  /** Imagen local de una cancha, con fallback por tipo de deporte. */
  imagen(cancha: Cancha): string {
    return cancha.imagen || tipoImagen(cancha.tipo);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private canchaService: CanchaService,
    private reservaService: ReservaService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cancha = this.canchaService.getCancha(id);
    if (!this.cancha) {
      this.router.navigate(['/canchas']);
      return;
    }

    this.autenticado = this.auth.estaAutenticado();
    const hoy = new Date().toISOString().split('T')[0];
    this.fechaMin = hoy;
    this.fecha = hoy;
    this.generarSlots();
  }

  /** Construye la grilla de horarios para la fecha seleccionada. */
  generarSlots(): void {
    if (!this.cancha) return;
    this.horaSeleccionada = null;
    this.alerta = null;

    const ahora = new Date();
    const esHoy = this.fecha === ahora.toISOString().split('T')[0];

    this.slots = (this.cancha.horariosDisponibles || []).map((hora) => {
      const ocupada = this.canchaService.horaOcupada(this.cancha!.id, this.fecha, hora);
      const bloqueada = this.canchaService.horaBloqueada(this.cancha!, this.fecha, hora);
      const pasada = esHoy && parseInt(hora.split(':')[0], 10) <= ahora.getHours();
      let estado: Slot['estado'] = 'libre';
      if (ocupada || pasada) estado = 'ocupado';
      else if (bloqueada) estado = 'bloqueado';
      return { hora, estado };
    });
  }

  /** Selecciona una hora libre. */
  seleccionar(slot: Slot): void {
    if (slot.estado !== 'libre') return;
    this.horaSeleccionada = slot.hora;
  }

  /** Pasa la reserva al carrito y navega a la confirmación. */
  continuar(): void {
    if (!this.autenticado) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.cancha) return;
    if (!this.horaSeleccionada) {
      this.alerta = { tipo: 'warning', texto: 'Selecciona un horario disponible.' };
      return;
    }
    if (this.canchaService.horaOcupada(this.cancha.id, this.fecha, this.horaSeleccionada)) {
      this.alerta = { tipo: 'danger', texto: 'Ese horario ya fue reservado. Elige otro.' };
      this.generarSlots();
      return;
    }

    this.reservaService.setCarrito({
      canchaId: this.cancha.id,
      canchaNombre: this.cancha.nombre,
      canchaTipo: this.cancha.tipo,
      fecha: this.fecha,
      hora: this.horaSeleccionada,
      precio: this.cancha.precio,
    });
    this.router.navigate(['/carrito']);
  }
}
