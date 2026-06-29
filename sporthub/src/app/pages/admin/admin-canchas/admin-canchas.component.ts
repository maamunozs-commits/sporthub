import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cancha, Reserva } from '../../../models/models';
import { CanchaService } from '../../../services/cancha.service';
import { NotificationService } from '../../../services/notification.service';
import { ReservaService } from '../../../services/reserva.service';
import { tipoEmoji, tipoImagen, tipoLabel } from '../../../shared/cancha-helpers';

/**
 * Mantenedor de canchas (CRUD) para el administrador.
 * Incluye un modal con formulario reactivo para crear o editar canchas.
 */
@Component({
  selector: 'app-admin-canchas',
  templateUrl: './admin-canchas.component.html',
  standalone: false,
})
export class AdminCanchasComponent implements OnInit {
  busqueda = '';
  modalAbierto = false;
  editandoId: number | null = null;
  form!: FormGroup;
  alertaModal: string | null = null;

  label = tipoLabel;
  emoji = tipoEmoji;

  /** Imagen local de una cancha, con fallback por tipo. */
  imagen(c: Cancha): string {
    return c.imagen || tipoImagen(c.tipo);
  }

  constructor(
    private fb: FormBuilder,
    private canchaService: CanchaService,
    private reservaService: ReservaService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(1)]],
      capacidad: [null, [Validators.min(1)]],
      estado: ['', [Validators.required]],
      descripcion: [''],
    });
  }

  /** Canchas filtradas por la búsqueda de texto. */
  get canchasFiltradas(): Cancha[] {
    const q = this.busqueda.toLowerCase().trim();
    const canchas = this.canchaService.getCanchas();
    if (!q) return canchas;
    return canchas.filter((c) => c.nombre.toLowerCase().includes(q) || tipoLabel(c.tipo).toLowerCase().includes(q));
  }

  /** Reservas confirmadas de una cancha. */
  reservasDe(id: number): number {
    return this.reservaService.getReservas().filter((r: Reserva) => r.canchaId === id && r.estado === 'confirmada').length;
  }

  get f() {
    return this.form.controls;
  }

  /** Abre el modal para crear una nueva cancha. */
  nueva(): void {
    this.editandoId = null;
    this.alertaModal = null;
    this.form.reset({ nombre: '', tipo: '', precio: null, capacidad: null, estado: '', descripcion: '' });
    this.modalAbierto = true;
  }

  /** Abre el modal para editar una cancha existente. */
  editar(c: Cancha): void {
    this.editandoId = c.id;
    this.alertaModal = null;
    this.form.patchValue({
      nombre: c.nombre, tipo: c.tipo, precio: c.precio,
      capacidad: c.capacidad, estado: c.estado, descripcion: c.descripcion,
    });
    this.modalAbierto = true;
  }

  /** Cierra el modal sin guardar. */
  cerrar(): void {
    this.modalAbierto = false;
  }

  /** Guarda (crea/actualiza) la cancha del formulario. */
  guardar(): void {
    this.alertaModal = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alertaModal = 'Revisa los campos obligatorios.';
      return;
    }
    const v = this.form.value;
    this.canchaService.guardar({
      id: this.editandoId ?? undefined,
      nombre: v.nombre, tipo: v.tipo, precio: Number(v.precio),
      capacidad: Number(v.capacidad) || 0, estado: v.estado, descripcion: v.descripcion,
    });
    this.notify.mostrar(this.editandoId ? 'Cancha actualizada correctamente.' : 'Cancha creada correctamente.');
    this.modalAbierto = false;
  }

  /** Elimina una cancha previa confirmación. */
  eliminar(c: Cancha): void {
    const n = this.reservasDe(c.id);
    const msg = n > 0
      ? `¿Eliminar "${c.nombre}"? Tiene ${n} reserva(s) activa(s).`
      : `¿Eliminar "${c.nombre}"? Esta acción no se puede deshacer.`;
    if (!confirm(msg)) return;
    this.canchaService.eliminar(c.id);
    this.notify.mostrar('Cancha eliminada.', 'info');
  }
}
