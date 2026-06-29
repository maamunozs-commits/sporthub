import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Pantalla de inicio de sesión. Usa un **formulario reactivo** con
 * validación de correo y contraseña, y delega la autenticación en
 * `AuthService`.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
})
export class LoginComponent implements OnInit {
  /** Formulario reactivo de login. */
  form!: FormGroup;

  /** Mensaje de alerta a mostrar. */
  alerta: { tipo: 'success' | 'danger'; texto: string } | null = null;

  /** Controla si la contraseña se muestra en texto plano. */
  verPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Si ya hay sesión, redirige según el rol.
    const s = this.auth.sesionActual;
    if (s) {
      this.router.navigate([s.rol === 'admin' ? '/admin' : '/']);
      return;
    }

    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  /** Acceso rápido a los controles desde la plantilla. */
  get f() {
    return this.form.controls;
  }

  /** Procesa el envío del formulario de login. */
  enviar(): void {
    this.alerta = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { correo, password } = this.form.value;
    const res = this.auth.login(correo, password);

    if (!res.ok) {
      this.alerta = { tipo: 'danger', texto: res.mensaje };
      return;
    }

    this.alerta = { tipo: 'success', texto: `${res.mensaje} Redirigiendo...` };
    setTimeout(() => {
      this.router.navigate([res.usuario!.rol === 'admin' ? '/admin' : '/']);
    }, 700);
  }
}
