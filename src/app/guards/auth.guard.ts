import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas que requieren sesión iniciada.
 * Si no hay sesión, redirige a `/login`.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) return true;
  router.navigate(['/login']);
  return false;
};

/**
 * Guard que protege rutas exclusivas del rol administrador.
 * Redirige a `/login` si no hay sesión, o a `/` si el rol no es admin.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    router.navigate(['/login']);
    return false;
  }
  if (!auth.esAdmin()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

/**
 * Guard que protege rutas exclusivas del rol cliente
 * (carrito, pago, mis reservas). Un admin es redirigido a su panel.
 */
export const clienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    router.navigate(['/login']);
    return false;
  }
  if (auth.esAdmin()) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};
