import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Pantalla de recuperación de contraseña (simulada).
 *
 * Valida el correo y muestra un mensaje de confirmación. No envía correos
 * reales: es una funcionalidad demostrativa según las instrucciones.
 */
@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  standalone: false,
})
export class RecuperarComponent implements OnInit {
  /** Formulario reactivo con el correo a recuperar. */
  form!: FormGroup;

  /** Mensaje de resultado. */
  alerta: { tipo: 'success' | 'danger'; texto: string } | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.form.controls;
  }

  /** Procesa la solicitud de recuperación. */
  enviar(): void {
    this.alerta = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const correo = this.form.value.correo;
    this.alerta = {
      tipo: 'success',
      texto: `Si el correo ${correo} está registrado en SportHub, recibirás un enlace de recuperación en los próximos minutos. (Simulación: no se envía correo real.)`,
    };
    this.form.reset();
  }
}
