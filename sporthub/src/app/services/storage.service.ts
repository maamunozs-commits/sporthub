import { Injectable } from '@angular/core';
import { Cancha, Reserva, Usuario } from '../models/models';
import { tipoImagen } from '../shared/cancha-helpers';

/**
 * Servicio de persistencia de bajo nivel.
 *
 * Encapsula el acceso a `localStorage` (lectura/escritura en JSON) y se
 * encarga de **sembrar** los datos iniciales (usuarios demo y canchas)
 * la primera vez que se ejecuta la aplicación.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** Claves usadas en `localStorage`. */
  readonly KEYS = {
    USUARIOS: 'sh_usuarios',
    SESION: 'sh_sesion',
    CANCHAS: 'sh_canchas',
    RESERVAS: 'sh_reservas',
    CARRITO: 'sh_carrito',
    ULT_RES: 'sh_ultima_reserva',
  } as const;

  constructor() {
    this.initData();
  }

  /** Lee y deserializa un valor; devuelve `null` si no existe o falla. */
  get<T>(key: string): T | null {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      return null;
    }
  }

  /** Serializa y guarda un valor en `localStorage`. */
  set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /** Elimina una clave de `localStorage`. */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Genera el siguiente id incremental para una colección.
   * @param arr colección sobre la que calcular el id máximo
   */
  genId(arr: { id: number }[] | null): number {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map((x) => x.id)) + 1;
  }

  /** Genera la lista de horarios (08:00 a 21:00) por defecto de una cancha. */
  generarHorarios(): string[] {
    const slots: string[] = [];
    for (let h = 8; h <= 21; h++) slots.push(`${String(h).padStart(2, '0')}:00`);
    return slots;
  }

  /**
   * Siembra los datos iniciales si aún no existen: un usuario admin,
   * un usuario cliente de demostración y cuatro canchas.
   */
  private initData(): void {
    if (!this.get<Usuario[]>(this.KEYS.USUARIOS)) {
      const usuarios: Usuario[] = [
        {
          id: 1, nombre: 'Administrador', correo: 'admin@sporthub.cl',
          password: 'Admin123!', telefono: '912345678', rol: 'admin',
          fechaRegistro: new Date().toISOString(),
        },
        {
          id: 2, nombre: 'Carlos López', correo: 'cliente@sporthub.cl',
          password: 'Cliente123!', telefono: '987654321', rol: 'cliente',
          fechaRegistro: new Date().toISOString(),
        },
      ];
      this.set(this.KEYS.USUARIOS, usuarios);
    }

    if (!this.get<Cancha[]>(this.KEYS.CANCHAS)) {
      const canchas: Cancha[] = [
        {
          id: 1, nombre: 'Cancha Fútbol Premium', tipo: 'futbol', precio: 20000,
          estado: 'disponible', capacidad: 22, imagen: tipoImagen('futbol'),
          descripcion: 'Cancha de fútbol 11 con césped sintético de última generación. Iluminación LED, vestuarios y estacionamiento disponible. Ideal para partidos y entrenamientos.',
          horariosDisponibles: this.generarHorarios(), horariosBlockeados: [],
        },
        {
          id: 2, nombre: 'Cancha Pádel Central', tipo: 'padel', precio: 12000,
          estado: 'disponible', capacidad: 4, imagen: tipoImagen('padel'),
          descripcion: 'Cancha de pádel cristal panorámico con superficie BluGrass profesional. Iluminación LED de alta calidad. Servicio de alquiler de raquetas incluido.',
          horariosDisponibles: this.generarHorarios(), horariosBlockeados: [],
        },
        {
          id: 3, nombre: 'Cancha Tenis Club', tipo: 'tenis', precio: 15000,
          estado: 'disponible', capacidad: 4, imagen: tipoImagen('tenis'),
          descripcion: 'Cancha de tenis superficie dura con marcaciones oficiales ITF. Iluminación nocturna LED y red profesional. Excelente mantenimiento.',
          horariosDisponibles: this.generarHorarios(), horariosBlockeados: [],
        },
        {
          id: 4, nombre: 'Cancha Básquetbol Arena', tipo: 'basquetbol', precio: 10000,
          estado: 'disponible', capacidad: 10, imagen: tipoImagen('basquetbol'),
          descripcion: 'Cancha de básquetbol techada con parqué profesional Mondo. Tableros regulables con aros oficiales NBA. Marcaciones reglamentarias.',
          horariosDisponibles: this.generarHorarios(), horariosBlockeados: [],
        },
      ];
      this.set(this.KEYS.CANCHAS, canchas);
    } else {
      const canchas = this.get<Cancha[]>(this.KEYS.CANCHAS) || [];
      const migradas = canchas.map((c) => ({ ...c, imagen: c.imagen || tipoImagen(c.tipo) }));
      this.set(this.KEYS.CANCHAS, migradas);
    }

    if (!this.get<Reserva[]>(this.KEYS.RESERVAS)) {
      this.set(this.KEYS.RESERVAS, []);
    }
  }
}
