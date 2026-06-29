import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cancha } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CanchaService } from '../../services/cancha.service';
import { tipoLabel } from '../../shared/cancha-helpers';

/**
 * Catálogo de canchas con filtros por deporte, estado y búsqueda de texto.
 * Lee el parámetro de consulta `tipo` para pre-filtrar (enlaces del home).
 */
@Component({
  selector: 'app-canchas',
  templateUrl: './canchas.component.html',
  standalone: false,
})
export class CanchasComponent implements OnInit {
  private todas: Cancha[] = [];

  /** Filtros enlazados con `ngModel`. */
  filtroTipo = '';
  filtroEstado = '';
  busqueda = '';

  autenticado = false;

  constructor(
    private canchaService: CanchaService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.todas = this.canchaService.getCanchas();
    this.autenticado = this.auth.estaAutenticado();
    const tipo = this.route.snapshot.queryParamMap.get('tipo');
    if (tipo) this.filtroTipo = tipo;
  }

  /** Lista filtrada según los criterios actuales. */
  get canchasFiltradas(): Cancha[] {
    let lista = [...this.todas];
    if (this.filtroTipo) lista = lista.filter((c) => c.tipo === this.filtroTipo);
    if (this.filtroEstado) lista = lista.filter((c) => c.estado === this.filtroEstado);
    else lista = lista.filter((c) => c.estado === 'disponible');

    const q = this.busqueda.toLowerCase().trim();
    if (q) {
      lista = lista.filter(
        (c) => c.nombre.toLowerCase().includes(q) || tipoLabel(c.tipo).toLowerCase().includes(q)
      );
    }
    return lista;
  }

  /** Limpia todos los filtros. */
  limpiar(): void {
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.busqueda = '';
  }

  /** Navega al detalle de la cancha. */
  verDetalle(id: number): void {
    this.router.navigate(['/detalle', id]);
  }
}
