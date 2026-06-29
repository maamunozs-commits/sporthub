import { Component, OnInit } from '@angular/core';
import { Cancha } from '../../../models/models';
import { CanchaService } from '../../../services/cancha.service';
import { NotificationService } from '../../../services/notification.service';
import { ReservaService } from '../../../services/reserva.service';
import { tipoEmoji } from '../../../shared/cancha-helpers';

/** Slot de horario en la vista de gestión. */
interface SlotAdmin {
  hora: string;
  estado: 'libre' | 'ocupado' | 'bloqueado';
}

/**
 * Gestión de disponibilidad horaria: el administrador bloquea o libera
 * horarios de una cancha en una fecha concreta.
 */
@Component({
  selector: 'app-admin-horarios',
  templateUrl: './admin-horarios.component.html',
  standalone: false,
})
export class AdminHorariosComponent implements OnInit {
  canchas: Cancha[] = [];
  canchaId: number | null = null;
  fecha = '';
  fechaMin = '';
  slots: SlotAdmin[] = [];

  emoji = tipoEmoji;

  constructor(
    private canchaService: CanchaService,
    private reservaService: ReservaService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.canchas = this.canchaService.getCanchas();
    this.fechaMin = new Date().toISOString().split('T')[0];
    this.fecha = this.fechaMin;
  }

  /** Cancha seleccionada actualmente. */
  get cancha(): Cancha | undefined {
    return this.canchas.find((c) => c.id === Number(this.canchaId));
  }

  /** Horarios libres / total para el encabezado. */
  get resumen(): { libres: number; total: number } {
    const libres = this.slots.filter((s) => s.estado === 'libre').length;
    return { libres, total: this.slots.length };
  }

  /** Recalcula la grilla de horarios. */
  recalcular(): void {
    const cancha = this.cancha;
    if (!cancha || !this.fecha) {
      this.slots = [];
      return;
    }
    const ocupadas = this.reservaService
      .getReservas()
      .filter((r) => r.canchaId === cancha.id && r.fecha === this.fecha && r.estado !== 'cancelada')
      .map((r) => r.hora);
    const bloqueadas = (cancha.horariosBlockeados || []).filter((b) => b.fecha === this.fecha).map((b) => b.hora);

    this.slots = (cancha.horariosDisponibles || []).map((hora) => {
      let estado: SlotAdmin['estado'] = 'libre';
      if (ocupadas.includes(hora)) estado = 'ocupado';
      else if (bloqueadas.includes(hora)) estado = 'bloqueado';
      return { hora, estado };
    });
  }

  /** Bloquea o libera un horario al hacer clic. */
  toggle(slot: SlotAdmin): void {
    if (slot.estado === 'ocupado' || !this.cancha) return;
    const bloquear = slot.estado === 'libre';
    this.canchaService.toggleHorario(this.cancha.id, this.fecha, slot.hora, bloquear);
    this.canchas = this.canchaService.getCanchas();
    this.recalcular();
    this.notify.mostrar(bloquear ? `Horario ${slot.hora} bloqueado.` : `Horario ${slot.hora} liberado.`, bloquear ? 'warning' : 'success');
  }

  /** Bloquea todos los horarios libres del día. */
  bloquearTodo(): void {
    if (!this.cancha) { this.notify.mostrar('Selecciona una cancha y fecha.', 'warning'); return; }
    if (!confirm('¿Bloquear todos los horarios libres del día?')) return;
    this.slots.filter((s) => s.estado === 'libre').forEach((s) => {
      this.canchaService.toggleHorario(this.cancha!.id, this.fecha, s.hora, true);
    });
    this.canchas = this.canchaService.getCanchas();
    this.recalcular();
    this.notify.mostrar('Todos los horarios libres fueron bloqueados.', 'warning');
  }

  /** Libera todos los horarios bloqueados del día. */
  desbloquearTodo(): void {
    if (!this.cancha) { this.notify.mostrar('Selecciona una cancha y fecha.', 'warning'); return; }
    if (!confirm('¿Desbloquear todos los horarios bloqueados del día?')) return;
    this.slots.filter((s) => s.estado === 'bloqueado').forEach((s) => {
      this.canchaService.toggleHorario(this.cancha!.id, this.fecha, s.hora, false);
    });
    this.canchas = this.canchaService.getCanchas();
    this.recalcular();
    this.notify.mostrar('Todos los horarios desbloqueados.', 'success');
  }
}
