import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { adminGuard, authGuard, clienteGuard } from './guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

// Páginas públicas / de cliente
import { CanchasComponent } from './pages/canchas/canchas.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { DetalleCanchaComponent } from './pages/detalle-cancha/detalle-cancha.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MisReservasComponent } from './pages/mis-reservas/mis-reservas.component';
import { PagoExitosoComponent } from './pages/pago-exitoso/pago-exitoso.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { RecuperarComponent } from './pages/recuperar/recuperar.component';
import { RegistroComponent } from './pages/registro/registro.component';

// Páginas admin
import { AdminCanchasComponent } from './pages/admin/admin-canchas/admin-canchas.component';
import { AdminHorariosComponent } from './pages/admin/admin-horarios/admin-horarios.component';
import { AdminReservasComponent } from './pages/admin/admin-reservas/admin-reservas.component';
import { AdminUsuariosComponent } from './pages/admin/admin-usuarios/admin-usuarios.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';

/**
 * Tabla de rutas de la aplicación.
 * - Layout público para home, catálogo, detalle y zona de cliente.
 * - Rutas de autenticación a pantalla completa (sin navbar/footer).
 * - Layout admin protegido por `adminGuard`.
 */
const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'SportHub — Reserva de Canchas' },
      { path: 'canchas', component: CanchasComponent, title: 'Canchas — SportHub' },
      { path: 'detalle/:id', component: DetalleCanchaComponent, title: 'Detalle de cancha — SportHub' },
      { path: 'perfil', component: PerfilComponent, canActivate: [authGuard], title: 'Mi perfil — SportHub' },
      { path: 'carrito', component: CarritoComponent, canActivate: [clienteGuard], title: 'Confirmar reserva — SportHub' },
      { path: 'pago-exitoso', component: PagoExitosoComponent, canActivate: [clienteGuard], title: 'Reserva confirmada — SportHub' },
      { path: 'mis-reservas', component: MisReservasComponent, canActivate: [clienteGuard], title: 'Mis reservas — SportHub' },
    ],
  },

  { path: 'login', component: LoginComponent, title: 'Iniciar sesión — SportHub' },
  { path: 'registro', component: RegistroComponent, title: 'Registro — SportHub' },
  { path: 'recuperar', component: RecuperarComponent, title: 'Recuperar contraseña — SportHub' },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: DashboardComponent, title: 'Dashboard — SportHub Admin' },
      { path: 'canchas', component: AdminCanchasComponent, title: 'Canchas — SportHub Admin' },
      { path: 'usuarios', component: AdminUsuariosComponent, title: 'Usuarios — SportHub Admin' },
      { path: 'reservas', component: AdminReservasComponent, title: 'Reservas — SportHub Admin' },
      { path: 'horarios', component: AdminHorariosComponent, title: 'Horarios — SportHub Admin' },
    ],
  },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
