import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { camposIgualesValidator, passwordSeguroValidator, telefonoValidator } from '../../shared/validators';

/**
 * Pantalla de registro de nuevos clientes.
 *
 * Formulario reactivo con validaciones avanzadas: nombre, email, teléfono,
 * **contraseña segura (4 reglas)** y confirmación que debe coincidir.
 */
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  standalone: false,
})
export class RegistroComponent implements OnInit {
  /** Formulario reactivo de registro. */
  form!: FormGroup;

  /** Mensaje de alerta. */
  alerta: { tipo: 'success' | 'danger'; texto: string } | null = null;

  verPassword = false;
  verConfirmar = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const s = this.auth.sesionActual;
    if (s) {
      this.router.navigate([s.rol === 'admin' ? '/admin' : '/']);
      return;
    }

    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        correo: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required, telefonoValidator()]],
        password: ['', [Validators.required, passwordSeguroValidator()]],
        confirmar: ['', [Validators.required]],
      },
      { validators: camposIgualesValidator('password', 'confirmar') }
    );
  }

  get f() {
    return this.form.controls;
  }

  /** Errores de seguridad pendientes de la contraseña (para mostrarlos). */
  get erroresPassword(): string[] {
    return (this.f['password'].errors?.['passwordSeguro']?.errores as string[]) || [];
  }

  /** Envía el registro. */
  enviar(): void {
    this.alerta = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, correo, telefono, password } = this.form.value;
    const res = this.auth.registrar({ nombre, correo, telefono, password });

    if (!res.ok) {
      this.alerta = { tipo: 'danger', texto: res.mensaje };
      return;
    }

    this.alerta = { tipo: 'success', texto: `${res.mensaje} Redirigiendo...` };
    setTimeout(() => this.router.navigate(['/']), 1000);
  }
}
