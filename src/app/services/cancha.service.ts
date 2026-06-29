import { Injectable } from '@angular/core';
import { Cancha, Reserva } from '../models/models';
import { tipoImagen } from '../shared/cancha-helpers';
import { StorageService } from './storage.service';

/**
 * Servicio de gestión de canchas y de su disponibilidad horaria.
 *
 * Provee el CRUD usado por el panel de administración y las consultas
 * de disponibilidad usadas por la reserva del cliente.
 */
@Injectable({ providedIn: 'root' })
export class CanchaService {
  constructor(private storage: StorageService) {}

  /** Devuelve todas las canchas registradas. */
  getCanchas(): Cancha[] {
    return this.storage.get<Cancha[]>(this.storage.KEYS.CANCHAS) || [];
  }

  /** Devuelve solo las canchas con estado `disponible`. */
  getDisponibles(): Cancha[] {
    return this.getCanchas().filter((c) => c.estado === 'disponible');
  }

  /** Busca una cancha por id. */
  getCancha(id: number): Cancha | undefined {
    return this.getCanchas().find((c) => c.id === id);
  }

  /** Crea o actualiza una cancha. Si trae `id`, edita; si no, crea una nueva. */
  guardar(cancha: Partial<Cancha> & { id?: number }): Cancha {
    const canchas = this.getCanchas();

    if (cancha.id) {
      const idx = canchas.findIndex((c) => c.id === cancha.id);
      const tipo = cancha.tipo || canchas[idx].tipo;
      canchas[idx] = {
        ...canchas[idx],
        ...cancha,
        imagen: cancha.imagen || tipoImagen(tipo),
      } as Cancha;
      this.storage.set(this.storage.KEYS.CANCHAS, canchas);
      return canchas[idx];
    }

    const nueva: Cancha = {
      id: this.storage.genId(canchas),
      nombre: cancha.nombre || '',
      tipo: cancha.tipo || 'futbol',
      precio: cancha.precio || 0,
      estado: cancha.estado || 'disponible',
      capacidad: cancha.capacidad || 0,
      descripcion: cancha.descripcion || '',
      imagen: tipoImagen(cancha.tipo || 'futbol'),
      horariosDisponibles: this.storage.generarHorarios(),
      horariosBlockeados: [],
    };
    canchas.push(nueva);
    this.storage.set(this.storage.KEYS.CANCHAS, canchas);
    return nueva;
  }

  /** Elimina una cancha por id. */
  eliminar(id: number): void {
    this.storage.set(this.storage.KEYS.CANCHAS, this.getCanchas().filter((c) => c.id !== id));
  }

  /** Indica si una hora ya está reservada (reserva no cancelada). */
  horaOcupada(canchaId: number, fecha: string, hora: string): boolean {
    const reservas = this.storage.get<Reserva[]>(this.storage.KEYS.RESERVAS) || [];
    return reservas.some(
      (r) => r.canchaId === canchaId && r.fecha === fecha && r.hora === hora && r.estado !== 'cancelada'
    );
  }

  /** Indica si una hora fue bloqueada por el administrador. */
  horaBloqueada(cancha: Cancha, fecha: string, hora: string): boolean {
    return (cancha.horariosBlockeados || []).some((b) => b.fecha === fecha && b.hora === hora);
  }

  /** Bloquea o desbloquea una hora puntual de una cancha. */
  toggleHorario(canchaId: number, fecha: string, hora: string, bloquear: boolean): void {
    const canchas = this.getCanchas();
    const idx = canchas.findIndex((c) => c.id === canchaId);
    if (idx === -1) return;
    if (!canchas[idx].horariosBlockeados) canchas[idx].horariosBlockeados = [];

    if (bloquear) {
      canchas[idx].horariosBlockeados.push({ fecha, hora });
    } else {
      canchas[idx].horariosBlockeados = canchas[idx].horariosBlockeados.filter(
        (b) => !(b.fecha === fecha && b.hora === hora)
      );
    }
    this.storage.set(this.storage.KEYS.CANCHAS, canchas);
  }
}
