import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';
import { AppRoutingModule } from './app-routing-module';

// Componentes compartidos
import { AdminHeaderComponent } from './components/admin-header/admin-header.component';
import { CanchaCardComponent } from './components/cancha-card/cancha-card.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './components/toast/toast.component';

// Directivas y pipes
import { AutofocusDirective } from './directives/autofocus.directive';
import { FechaEsPipe } from './pipes/fecha-es.pipe';
import { PrecioClpPipe } from './pipes/precio-clp.pipe';

// Layouts
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

// Páginas públicas / cliente
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
 * Módulo raíz de SportHub. Declara todos los componentes, directivas y
 * pipes de la aplicación e importa los módulos de Angular necesarios:
 * `BrowserModule`, `AppRoutingModule`, `FormsModule` y `ReactiveFormsModule`.
 */
@NgModule({
  declarations: [
    App,
    // Compartidos
    NavbarComponent,
    FooterComponent,
    AdminHeaderComponent,
    ToastComponent,
    CanchaCardComponent,
    // Directivas y pipes
    AutofocusDirective,
    PrecioClpPipe,
    FechaEsPipe,
    // Layouts
    PublicLayoutComponent,
    AdminLayoutComponent,
    // Páginas públicas / cliente
    HomeComponent,
    LoginComponent,
    RegistroComponent,
    RecuperarComponent,
    CanchasComponent,
    DetalleCanchaComponent,
    CarritoComponent,
    PagoExitosoComponent,
    MisReservasComponent,
    PerfilComponent,
    // Páginas admin
    DashboardComponent,
    AdminCanchasComponent,
    AdminUsuariosComponent,
    AdminReservasComponent,
    AdminHorariosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
