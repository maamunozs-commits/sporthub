import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PrecioClpPipe } from './pipes/precio-clp.pipe';
import { AuthService } from './services/auth.service';
import { ReservaService } from './services/reserva.service';
import { passwordSeguroValidator } from './shared/validators';

/**
 * Cuatro pruebas unitarias solicitadas por la pauta Semana 6.
 *
 * Estas pruebas cubren funcionalidades centrales del FrontEnd:
 * autenticación, validación de contraseña, creación de reserva con pago
 * simulado y formateo de precios en pesos chilenos.
 */
describe('Pauta Semana 6 - 4 pruebas unitarias obligatorias', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => localStorage.clear());

  it('1. AuthService debería iniciar sesión como cliente demo', () => {
    const auth = TestBed.inject(AuthService);

    const resultado = auth.login('cliente@sporthub.cl', 'Cliente123!');

    expect(resultado.ok).toBeTrue();
    expect(resultado.usuario?.rol).toBe('cliente');
    expect(auth.estaAutenticado()).toBeTrue();
  });

  it('2. passwordSeguroValidator debería rechazar una contraseña sin las 4 reglas', () => {
    const validar = passwordSeguroValidator();

    const resultado = validar(new FormControl('abc'));

    expect(resultado).not.toBeNull();
    expect(resultado!['passwordSeguro'].errores).toContain('mínimo 8 caracteres');
    expect(resultado!['passwordSeguro'].errores).toContain('una mayúscula');
    expect(resultado!['passwordSeguro'].errores).toContain('un número');
    expect(resultado!['passwordSeguro'].errores).toContain('un carácter especial');
  });

  it('3. ReservaService debería confirmar el pago simulado y crear una reserva', () => {
    const auth = TestBed.inject(AuthService);
    const reservaService = TestBed.inject(ReservaService);
    const login = auth.login('cliente@sporthub.cl', 'Cliente123!');

    reservaService.setCarrito({
      canchaId: 1,
      canchaNombre: 'Cancha Fútbol Premium',
      canchaTipo: 'futbol',
      fecha: '2030-01-10',
      hora: '18:00',
      precio: 20000,
    });

    const reserva = reservaService.confirmarPago(login.usuario!);

    expect(reserva).not.toBeNull();
    expect(reserva?.clienteCorreo).toBe('cliente@sporthub.cl');
    expect(reserva?.estado).toBe('confirmada');
    expect(reservaService.getCarrito()).toBeNull();
  });

  it('4. PrecioClpPipe debería formatear montos como moneda chilena', () => {
    const pipe = new PrecioClpPipe();

    const resultado = pipe.transform(20000);

    expect(resultado).toContain('$');
    expect(resultado).toContain('20.000');
  });
});
