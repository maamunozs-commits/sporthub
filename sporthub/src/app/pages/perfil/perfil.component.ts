import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { ReservaService } from '../../services/reserva.service';
import { camposIgualesValidator, passwordSeguroValidator, telefonoValidator } from '../../shared/validators';

/**
 * Modificación de perfil del usuario en sesión: datos personales y
 * cambio opcional de contraseña (con las 4 reglas de seguridad).
 */
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  standalone: false,
})
export class PerfilComponent implements OnInit {
  usuario!: Usuario;
  form!: FormGroup;
  alerta: { tipo: 'success' | 'danger'; texto: string } | null = null;

  stats = { reservas: 0, confirmadas: 0, gasto: 0 };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.sesionActual!;

    this.form = this.fb.group(
      {
        nombre: [this.usuario.nombre, [Validators.required, Validators.minLength(3)]],
        correo: [this.usuario.correo, [Validators.required, Validators.email]],
        telefono: [this.usuario.telefono, [Validators.required, telefonoValidator()]],
        pwActual: [''],
        pwNueva: ['', [passwordSeguroValidator()]],
        pwConfirmar: [''],
      },
      { validators: camposIgualesValidator('pwNueva', 'pwConfirmar') }
    );

    if (this.usuario.rol === 'cliente') {
      const mis = this.reservaService.getReservasDeCliente(this.usuario.id);
      const conf = mis.filter((r) => r.estado === 'confirmada');
      this.stats = {
        reservas: mis.length,
        confirmadas: conf.length,
        gasto: conf.reduce((s, r) => s + r.precio, 0),
      };
    }
  }

  get f() {
    return this.form.controls;
  }

  /** `true` si el usuario es administrador. */
  get esAdmin(): boolean {
    return this.usuario.rol === 'admin';
  }

  /** Guarda los cambios del perfil. */
  guardar(): void {
    this.alerta = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const cambiaPassword = !!(v.pwNueva || v.pwActual);

    const res = this.auth.actualizarPerfil(
      { nombre: v.nombre, correo: v.correo, telefono: v.telefono },
      cambiaPassword ? { actual: v.pwActual, nueva: v.pwNueva } : undefined
    );

    if (!res.ok) {
      this.alerta = { tipo: 'danger', texto: res.mensaje };
      return;
    }

    this.usuario = res.usuario!;
    this.alerta = { tipo: 'success', texto: res.mensaje };
    this.form.patchValue({ pwActual: '', pwNueva: '', pwConfirmar: '' });
  }
}
