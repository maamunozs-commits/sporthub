import { Injectable } from '@angular/core';
import { ItemCarrito, Reserva, Usuario } from '../models/models';
import { StorageService } from './storage.service';

/**
 * Servicio de reservas y carrito.
 *
 * Gestiona el ítem temporal del carrito, la confirmación del pago
 * (simulado) que genera una reserva, y las consultas/cancelaciones.
 */
@Injectable({ providedIn: 'root' })
export class ReservaService {
  constructor(private storage: StorageService) {}

  /** Devuelve todas las reservas. */
  getReservas(): Reserva[] {
    return this.storage.get<Reserva[]>(this.storage.KEYS.RESERVAS) || [];
  }

  /** Devuelve las reservas de un cliente concreto. */
  getReservasDeCliente(clienteId: number): Reserva[] {
    return this.getReservas().filter((r) => r.clienteId === clienteId);
  }

  /** Guarda el ítem del carrito (una reserva en proceso). */
  setCarrito(item: ItemCarrito): void {
    this.storage.set(this.storage.KEYS.CARRITO, item);
  }

  /** Devuelve el ítem del carrito actual (o `null`). */
  getCarrito(): ItemCarrito | null {
    return this.storage.get<ItemCarrito>(this.storage.KEYS.CARRITO);
  }

  /** Vacía el carrito. */
  vaciarCarrito(): void {
    this.storage.remove(this.storage.KEYS.CARRITO);
  }

  /** Devuelve la última reserva confirmada (para la pantalla de éxito). */
  getUltimaReserva(): Reserva | null {
    return this.storage.get<Reserva>(this.storage.KEYS.ULT_RES);
  }

  /**
   * Confirma el pago (simulado) del carrito y crea la reserva.
   * Verifica que el horario no haya sido tomado mientras tanto.
   *
   * @returns la reserva creada, o `null` si hubo conflicto de horario.
   */
  confirmarPago(cliente: Usuario): Reserva | null {
    const carrito = this.getCarrito();
    if (!carrito) return null;

    const reservas = this.getReservas();
    const conflicto = reservas.some(
      (r) =>
        r.canchaId === carrito.canchaId &&
        r.fecha === carrito.fecha &&
        r.hora === carrito.hora &&
        r.estado !== 'cancelada'
    );
    if (conflicto) {
      this.vaciarCarrito();
      return null;
    }

    const nueva: Reserva = {
      id: this.storage.genId(reservas),
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      clienteCorreo: cliente.correo,
      canchaId: carrito.canchaId,
      canchaNombre: carrito.canchaNombre,
      canchaTipo: carrito.canchaTipo,
      fecha: carrito.fecha,
      hora: carrito.hora,
      precio: carrito.precio,
      estado: 'confirmada',
      fechaCreacion: new Date().toISOString(),
    };

    reservas.push(nueva);
    this.storage.set(this.storage.KEYS.RESERVAS, reservas);
    this.storage.set(this.storage.KEYS.ULT_RES, nueva);
    this.vaciarCarrito();
    return nueva;
  }

  /** Marca una reserva como cancelada. */
  cancelar(id: number): void {
    const reservas = this.getReservas();
    const idx = reservas.findIndex((r) => r.id === id);
    if (idx !== -1) {
      reservas[idx].estado = 'cancelada';
      this.storage.set(this.storage.KEYS.RESERVAS, reservas);
    }
  }
}
