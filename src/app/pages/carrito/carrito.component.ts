import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemCarrito } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ReservaService } from '../../services/reserva.service';
import { tipoColor, tipoEmoji, tipoLabel } from '../../shared/cancha-helpers';

/**
 * Resumen de la reserva en proceso y **pago simulado**.
 *
 * No integra pasarelas reales: al confirmar, genera la reserva y redirige
 * a la pantalla de éxito (según indican las instrucciones de la actividad).
 */
@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  standalone: false,
})
export class CarritoComponent implements OnInit {
  carrito: ItemCarrito | null = null;
  clienteNombre = '';
  clienteCorreo = '';

  /** Formulario reactivo de datos de tarjeta (simulado). */
  pagoForm!: FormGroup;
  procesando = false;
  alerta: { tipo: string; texto: string } | null = null;

  label = tipoLabel;
  emoji = tipoEmoji;
  color = tipoColor;

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carrito = this.reservaService.getCarrito();
    const s = this.auth.sesionActual;
    this.clienteNombre = s?.nombre || '';
    this.clienteCorreo = s?.correo || '';

    this.pagoForm = this.fb.group({
      numero: ['', [Validators.required, Validators.pattern(/^[0-9 ]{16,19}$/)]],
      vencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]],
      titular: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  get f() {
    return this.pagoForm.controls;
  }

  /** Formatea el número de tarjeta en grupos de 4 dígitos. */
  formatearTarjeta(): void {
    const limpio = (this.f['numero'].value || '').replace(/\D/g, '').slice(0, 16);
    const agrupado = limpio.replace(/(.{4})/g, '$1 ').trim();
    this.f['numero'].setValue(agrupado, { emitEvent: false });
  }

  /** Quita el ítem del carrito. */
  cancelar(): void {
    this.reservaService.vaciarCarrito();
    this.carrito = null;
  }

  /** Confirma el pago simulado y crea la reserva. */
  pagar(): void {
    this.alerta = null;
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      this.alerta = { tipo: 'warning', texto: 'Completa correctamente los datos de pago.' };
      return;
    }

    const cliente = this.auth.sesionActual;
    if (!cliente) {
      this.router.navigate(['/login']);
      return;
    }

    this.procesando = true;
    setTimeout(() => {
      const reserva = this.reservaService.confirmarPago(cliente);
      this.procesando = false;
      if (!reserva) {
        this.alerta = { tipo: 'danger', texto: 'Ese horario fue reservado mientras procesabas el pago. Selecciona otro.' };
        this.carrito = null;
        setTimeout(() => this.router.navigate(['/canchas']), 2200);
        return;
      }
      this.notify.mostrar('¡Pago confirmado! Reserva creada.', 'success');
      this.router.navigate(['/pago-exitoso']);
    }, 1200);
  }
}
