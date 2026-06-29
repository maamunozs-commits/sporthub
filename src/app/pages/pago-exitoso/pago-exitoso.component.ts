import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Reserva } from '../../models/models';
import { ReservaService } from '../../services/reserva.service';
import { tipoEmoji, tipoLabel } from '../../shared/cancha-helpers';

/**
 * Pantalla de confirmación de reserva tras un pago exitoso.
 * Muestra el comprobante de la última reserva creada.
 */
@Component({
  selector: 'app-pago-exitoso',
  templateUrl: './pago-exitoso.component.html',
  standalone: false,
})
export class PagoExitosoComponent implements OnInit {
  reserva: Reserva | null = null;
  label = tipoLabel;
  emoji = tipoEmoji;

  constructor(private reservaService: ReservaService, private router: Router) {}

  ngOnInit(): void {
    this.reserva = this.reservaService.getUltimaReserva();
    if (!this.reserva) this.router.navigate(['/mis-reservas']);
  }

  /** Código de reserva con ceros a la izquierda. */
  get codigo(): string {
    return '#' + String(this.reserva?.id ?? 0).padStart(5, '0');
  }

  /** Fecha y hora de confirmación en formato local. */
  get confirmadoEl(): string {
    return this.reserva ? new Date(this.reserva.fechaCreacion).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '';
  }
}
