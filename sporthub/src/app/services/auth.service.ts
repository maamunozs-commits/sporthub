import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Reserva, Usuario } from '../models/models';
import { StorageService } from './storage.service';

/** Resultado estándar de una operación de autenticación. */
export interface AuthResult {
  ok: boolean;
  mensaje: string;
  usuario?: Usuario;
}

/**
 * Servicio central de autenticación y gestión de usuarios.
 *
 * Mantiene la sesión activa en un `BehaviorSubject` para comunicar el
 * estado de login al `NavbarComponent` y a cualquier otro componente
 * de forma reactiva (patrón visto en clases).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Fuente reactiva con la sesión actual (o `null` si no hay sesión). */
  private sesionSubject: BehaviorSubject<Usuario | null>;

  /** Observable público de la sesión, consumido con `async` en las vistas. */
  sesion$: Observable<Usuario | null>;

  constructor(private storage: StorageService) {
    this.sesionSubject = new BehaviorSubject<Usuario | null>(
      this.storage.get<Usuario>(this.storage.KEYS.SESION)
    );
    this.sesion$ = this.sesionSubject.asObservable();
  }

  /** Devuelve el valor actual (síncrono) de la sesión. */
  get sesionActual(): Usuario | null {
    return this.sesionSubject.value;
  }

  /** `true` si existe una sesión activa. */
  estaAutenticado(): boolean {
    return this.sesionSubject.value !== null;
  }

  /** `true` si el usuario actual tiene rol de administrador. */
  esAdmin(): boolean {
    return this.sesionSubject.value?.rol === 'admin';
  }

  /** Valida el formato de un correo electrónico. */
  validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  /**
   * Intenta iniciar sesión con correo y contraseña.
   * @returns `AuthResult` con el usuario si las credenciales son correctas.
   */
  login(correo: string, password: string): AuthResult {
    const usuarios = this.storage.get<Usuario[]>(this.storage.KEYS.USUARIOS) || [];
    const limpio = (correo || '').trim().toLowerCase();
    const usuario = usuarios.find((u) => u.correo === limpio && u.password === password);

    if (!usuario) {
      return { ok: false, mensaje: 'Correo o contraseña incorrectos.' };
    }

    this.guardarSesion(usuario);
    return { ok: true, mensaje: `¡Bienvenido/a, ${usuario.nombre}!`, usuario };
  }

  /**
   * Registra un nuevo usuario cliente (con email único) e inicia su sesión.
   */
  registrar(datos: { nombre: string; correo: string; telefono: string; password: string }): AuthResult {
    const usuarios = this.storage.get<Usuario[]>(this.storage.KEYS.USUARIOS) || [];
    const correo = datos.correo.trim().toLowerCase();

    if (usuarios.some((u) => u.correo === correo)) {
      return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
    }

    const nuevo: Usuario = {
      id: this.storage.genId(usuarios),
      nombre: datos.nombre.trim(),
      correo,
      telefono: datos.telefono.trim(),
      password: datos.password,
      rol: 'cliente',
      fechaRegistro: new Date().toISOString(),
    };

    usuarios.push(nuevo);
    this.storage.set(this.storage.KEYS.USUARIOS, usuarios);
    this.guardarSesion(nuevo);
    return { ok: true, mensaje: '¡Cuenta creada exitosamente!', usuario: nuevo };
  }

  /**
   * Actualiza el perfil del usuario en sesión (datos y/o contraseña).
   */
  actualizarPerfil(
    cambios: { nombre: string; correo: string; telefono: string },
    passwords?: { actual: string; nueva: string }
  ): AuthResult {
    const actual = this.sesionActual;
    if (!actual) return { ok: false, mensaje: 'No hay sesión activa.' };

    const usuarios = this.storage.get<Usuario[]>(this.storage.KEYS.USUARIOS) || [];
    const idx = usuarios.findIndex((u) => u.id === actual.id);
    if (idx === -1) return { ok: false, mensaje: 'Usuario no encontrado.' };

    const correo = cambios.correo.trim().toLowerCase();
    if (correo !== actual.correo && usuarios.some((u) => u.correo === correo && u.id !== actual.id)) {
      return { ok: false, mensaje: 'Ese correo ya está registrado por otro usuario.' };
    }

    if (passwords && (passwords.nueva || passwords.actual)) {
      if (passwords.actual !== actual.password) {
        return { ok: false, mensaje: 'La contraseña actual es incorrecta.' };
      }
      usuarios[idx].password = passwords.nueva;
    }

    usuarios[idx].nombre = cambios.nombre.trim();
    usuarios[idx].correo = correo;
    usuarios[idx].telefono = cambios.telefono.trim();

    this.storage.set(this.storage.KEYS.USUARIOS, usuarios);
    this.guardarSesion(usuarios[idx]);
    return { ok: true, mensaje: 'Perfil actualizado correctamente.', usuario: usuarios[idx] };
  }

  /** Cierra la sesión y limpia el carrito. */
  logout(): void {
    this.storage.remove(this.storage.KEYS.SESION);
    this.storage.remove(this.storage.KEYS.CARRITO);
    this.sesionSubject.next(null);
  }

  /** Devuelve todos los usuarios con rol cliente. */
  getClientes(): Usuario[] {
    return (this.storage.get<Usuario[]>(this.storage.KEYS.USUARIOS) || []).filter((u) => u.rol === 'cliente');
  }

  /** Elimina un usuario y sus reservas asociadas. */
  eliminarUsuario(id: number): void {
    const usuarios = this.storage.get<Usuario[]>(this.storage.KEYS.USUARIOS) || [];
    this.storage.set(this.storage.KEYS.USUARIOS, usuarios.filter((u) => u.id !== id));
    const reservas = this.storage.get<Reserva[]>(this.storage.KEYS.RESERVAS) || [];
    this.storage.set(this.storage.KEYS.RESERVAS, reservas.filter((r) => r.clienteId !== id));
  }

  /** Persiste la sesión y notifica a los suscriptores. */
  private guardarSesion(usuario: Usuario): void {
    this.storage.set(this.storage.KEYS.SESION, usuario);
    this.sesionSubject.next(usuario);
  }
}
