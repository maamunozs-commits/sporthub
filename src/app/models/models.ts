/**
 * Modelos de dominio de SportHub.
 *
 * Estas interfaces describen la forma de los datos que la aplicación
 * persiste en `localStorage` y comparte entre componentes y servicios.
 */

/** Roles soportados por la aplicación. Definen los privilegios del usuario. */
export type Rol = 'admin' | 'cliente';

/** Tipos de deporte / cancha disponibles en el catálogo. */
export type TipoCancha = 'futbol' | 'padel' | 'tenis' | 'basquetbol';

/** Estado de publicación de una cancha. */
export type EstadoCancha = 'disponible' | 'no disponible';

/** Estado de una reserva realizada por un cliente. */
export type EstadoReserva = 'confirmada' | 'cancelada';

/**
 * Usuario registrado en la plataforma.
 * La contraseña se guarda en texto plano SOLO con fines educativos
 * (no usar este enfoque en producción).
 */
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  rol: Rol;
  fechaRegistro: string;
}

/** Horario bloqueado por el administrador para una fecha puntual. */
export interface HorarioBloqueado {
  fecha: string;
  hora: string;
}

/** Cancha deportiva publicada en el catálogo. */
export interface Cancha {
  id: number;
  nombre: string;
  tipo: TipoCancha;
  precio: number;
  estado: EstadoCancha;
  capacidad: number;
  descripcion: string;
  imagen?: string;
  horariosDisponibles: string[];
  horariosBlockeados: HorarioBloqueado[];
}

/** Reserva confirmada (o cancelada) de una cancha por parte de un cliente. */
export interface Reserva {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteCorreo: string;
  canchaId: number;
  canchaNombre: string;
  canchaTipo: TipoCancha;
  fecha: string;
  hora: string;
  precio: number;
  estado: EstadoReserva;
  fechaCreacion: string;
}

/** Ítem temporal del carrito antes de confirmar el pago. */
export interface ItemCarrito {
  canchaId: number;
  canchaNombre: string;
  canchaTipo: TipoCancha;
  fecha: string;
  hora: string;
  precio: number;
}
