import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cancha } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CanchaService } from '../../services/cancha.service';
import { ReservaService } from '../../services/reserva.service';

/**
 * Página de inicio (landing). Muestra el hero con estadísticas en vivo,
 * un listado de canchas destacadas y la explicación del proceso de reserva.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false,
})
export class HomeComponent implements OnInit {
  /** Canchas destacadas (primeras 3 disponibles). */
  destacadas: Cancha[] = [];

  /** Estadísticas mostradas en el hero. */
  stats = { canchas: 0, reservas: 0, clientes: 0 };

  /** `true` si hay sesión iniciada (oculta los CTA de registro). */
  autenticado = false;

  constructor(
    private canchaService: CanchaService,
    private reservaService: ReservaService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const canchas = this.canchaService.getCanchas();
    this.destacadas = canchas.filter((c) => c.estado === 'disponible').slice(0, 3);
    this.stats = {
      canchas: canchas.filter((c) => c.estado === 'disponible').length,
      reservas: this.reservaService.getReservas().length,
      clientes: this.auth.getClientes().length,
    };
    this.autenticado = this.auth.estaAutenticado();
  }

  /** Navega al detalle de una cancha. */
  verDetalle(id: number): void {
    this.router.navigate(['/detalle', id]);
  }
}
