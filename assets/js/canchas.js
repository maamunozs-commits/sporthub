


function initCanchas() {
  renderCanchas();

  const filtroTipo = document.getElementById('filtro-tipo');
  const busqueda   = document.getElementById('busqueda');
  const filtroDisp = document.getElementById('filtro-disp');

  if (filtroTipo) filtroTipo.addEventListener('change', renderCanchas);
  if (busqueda)   busqueda.addEventListener('input', renderCanchas);
  if (filtroDisp) filtroDisp.addEventListener('change', renderCanchas);

  
  const params = new URLSearchParams(window.location.search);
  const tipo = params.get('tipo');
  if (tipo && filtroTipo) { filtroTipo.value = tipo; renderCanchas(); }
}

function renderCanchas() {
  const container = document.getElementById('canchas-container');
  if (!container) return;

  const canchas  = SH.get(SH.KEYS.CANCHAS) || [];
  const filtroT  = document.getElementById('filtro-tipo')?.value || '';
  const busq     = document.getElementById('busqueda')?.value.toLowerCase() || '';
  const filtroD  = document.getElementById('filtro-disp')?.value || '';

  let lista = [...canchas];
  if (filtroT) lista = lista.filter(c => c.tipo === filtroT);
  if (filtroD) lista = lista.filter(c => c.estado === filtroD);
  else         lista = lista.filter(c => c.estado === 'disponible');
  if (busq)    lista = lista.filter(c => c.nombre.toLowerCase().includes(busq) || SH.tipoLabel(c.tipo).toLowerCase().includes(busq));

  const count = document.getElementById('canchas-count');
  if (count) count.textContent = `${lista.length} cancha${lista.length !== 1 ? 's' : ''} encontrada${lista.length !== 1 ? 's' : ''}`;

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div style="font-size:4rem;opacity:.25">🏟️</div>
        <p class="text-muted mt-3 mb-4">No se encontraron canchas con los filtros aplicados.</p>
        <button class="btn btn-outline-secondary rounded-pill" onclick="clearFiltros()">
          <i class="bi bi-x-circle me-2"></i>Limpiar filtros
        </button>
      </div>`;
    return;
  }

  container.innerHTML = lista.map(c => buildCanchaCard(c)).join('');
}

function buildCanchaCard(c) {
  const emoji  = SH.tipoEmoji(c.tipo);
  const sesion = SH.getSesion();
  const noDisp = c.estado !== 'disponible';

  const btnAction = noDisp
    ? `<span class="badge-sh badge-gray w-100 text-center mt-2 py-2">No disponible</span>`
    : sesion
      ? `<a href="detalle-cancha.html?id=${c.id}" class="btn btn-green-sh w-100 mt-2">Reservar</a>`
      : `<a href="login.html" class="btn btn-outline-sh w-100 mt-2" style="font-size:.82rem">Inicia sesión para reservar</a>`;

  return `
    <div class="col-sm-6 col-xl-4">
      <div class="card-sh card-sh-hover cancha-card d-flex flex-column">
        <div class="cancha-thumb th-${c.tipo} position-relative">
          <span class="sport-emoji">${emoji}</span>
          <span class="cancha-type-badge">${SH.tipoLabel(c.tipo)}</span>
          ${noDisp ? '' : `<span style="position:absolute;top:.75rem;right:.75rem;z-index:2"><span class="status-dot green"></span></span>`}
        </div>
        <div class="p-4 d-flex flex-column flex-grow-1">
          <h5 class="fw-bold mb-1" style="font-size:.95rem;letter-spacing:-.2px">${c.nombre}</h5>
          <p class="flex-grow-1 mb-3" style="font-size:.82rem;color:var(--text-muted);line-height:1.5">
            ${c.descripcion.substring(0, 90)}…
          </p>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="cancha-price">${SH.formatPrecio(c.precio)}</span>
              <span class="cancha-price-label"> / hora</span>
            </div>
            <span style="font-size:.78rem;color:var(--text-muted)">${c.capacidad} personas</span>
          </div>
          <a href="detalle-cancha.html?id=${c.id}" class="btn btn-dark-sh w-100">Ver detalle</a>
          ${btnAction}
        </div>
      </div>
    </div>`;
}

function clearFiltros() {
  const ids = ['filtro-tipo', 'busqueda', 'filtro-disp'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderCanchas();
}


let horaSeleccionada = null;
let canchaActual     = null;

function initDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  if (!id) { window.location.href = 'canchas.html'; return; }

  const canchas = SH.get(SH.KEYS.CANCHAS) || [];
  const cancha  = canchas.find(c => c.id === id);
  if (!cancha)  { window.location.href = 'canchas.html'; return; }

  canchaActual = cancha;
  renderDetalleInfo(cancha);
}

function renderDetalleInfo(cancha) {
  const color = SH.tipoColor(cancha.tipo);
  const emoji = SH.tipoEmoji(cancha.tipo);

  
  const hero = document.getElementById('cancha-hero');
  if (hero) hero.style.background = `linear-gradient(135deg, ${color}dd, ${color}77)`;

  setStat('cancha-emoji',     emoji);
  setStat('cancha-nombre',    cancha.nombre);
  setStat('cancha-descripcion', cancha.descripcion);
  setStat('cancha-precio',    SH.formatPrecio(cancha.precio) + '/hora');
  setStat('cancha-capacidad', cancha.capacidad + ' personas');
  setStat('cancha-tipo-txt',  SH.tipoLabel(cancha.tipo));

  const tipoBadge = document.getElementById('cancha-tipo-badge');
  if (tipoBadge) {
    tipoBadge.textContent = SH.tipoLabel(cancha.tipo);
    tipoBadge.style.background = color;
  }

  const estadoBadge = document.getElementById('cancha-estado-badge');
  if (estadoBadge) {
    estadoBadge.textContent = cancha.estado === 'disponible' ? 'Disponible' : 'No disponible';
    estadoBadge.className = `badge-sh ${cancha.estado === 'disponible' ? 'badge-green' : 'badge-red'}`;
  }

  
  const secReserva = document.getElementById('seccion-reserva');
  if (!secReserva) return;

  if (cancha.estado !== 'disponible') {
    secReserva.innerHTML = `
      <div class="alert alert-warning rounded-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Esta cancha no está disponible actualmente. Revisa otras opciones.
      </div>
      <a href="canchas.html" class="btn btn-primary-sh">
        <i class="bi bi-arrow-left me-2"></i>Ver más canchas
      </a>`;
    return;
  }

  
  const sesion = SH.getSesion();
  if (!sesion) {
    secReserva.innerHTML = `
      <div class="alert alert-info rounded-3">
        <i class="bi bi-info-circle me-2"></i>
        Debes <a href="login.html" class="alert-link">iniciar sesión</a> para hacer una reserva.
      </div>`;
    return;
  }

  
  const dateInput = document.getElementById('fecha-reserva');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    dateInput.addEventListener('change', () => { horaSeleccionada = null; renderHorarios(cancha); limpiarResumen(); });
    renderHorarios(cancha);
  }
}


function isHoraOcupada(canchaId, fecha, hora) {
  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  return reservas.some(r => r.canchaId === canchaId && r.fecha === fecha && r.hora === hora && r.estado !== 'cancelada');
}

function isHoraBloqueada(cancha, fecha, hora) {
  return (cancha.horariosBlockeados || []).some(b => b.fecha === fecha && b.hora === hora);
}

function renderHorarios(cancha) {
  const fecha     = document.getElementById('fecha-reserva')?.value;
  const container = document.getElementById('horarios-container');
  if (!container || !fecha) return;

  const slots = cancha.horariosDisponibles || [];
  if (slots.length === 0) {
    container.innerHTML = '<p class="text-muted small">No hay horarios configurados para esta cancha.</p>';
    return;
  }

  const ahora = new Date();
  const esHoy = fecha === ahora.toISOString().split('T')[0];

  container.innerHTML = `<div class="d-flex flex-wrap gap-1">` + slots.map(hora => {
    const ocupada   = isHoraOcupada(cancha.id, fecha, hora);
    const bloqueada = isHoraBloqueada(cancha, fecha, hora);
    
    const horaNum = parseInt(hora.split(':')[0]);
    const pasada  = esHoy && horaNum <= ahora.getHours();

    if (ocupada || pasada) {
      return `<span class="time-slot ocupado" title="${ocupada ? 'Horario reservado' : 'Hora pasada'}">${hora}</span>`;
    } else if (bloqueada) {
      return `<span class="time-slot bloqueado" title="No disponible por el administrador">${hora} <i class="bi bi-lock-fill" style="font-size:.65rem"></i></span>`;
    } else {
      return `<span class="time-slot" data-hora="${hora}" onclick="seleccionarHora('${hora}', this)">${hora}</span>`;
    }
  }).join('') + `</div>`;
}

function seleccionarHora(hora, el) {
  document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  horaSeleccionada = hora;

  const fechaInput = document.getElementById('fecha-reserva');
  const resumen    = document.getElementById('reserva-resumen');
  if (!resumen || !canchaActual || !fechaInput) return;

  resumen.classList.remove('d-none');
  setStat('res-cancha', canchaActual.nombre);
  setStat('res-tipo',   SH.tipoLabel(canchaActual.tipo));
  setStat('res-fecha',  SH.formatFecha(fechaInput.value));
  setStat('res-hora',   hora);
  setStat('res-precio', SH.formatPrecio(canchaActual.precio));
}

function limpiarResumen() {
  const resumen = document.getElementById('reserva-resumen');
  if (resumen) resumen.classList.add('d-none');
}

function agregarAlCarrito() {
  const sesion = SH.getSesion();
  if (!sesion) { window.location.href = 'login.html'; return; }

  const fecha = document.getElementById('fecha-reserva')?.value;
  SH.clearAlert('alert-reserva');

  if (!fecha) {
    SH.showAlert('alert-reserva', '<i class="bi bi-exclamation-circle me-2"></i>Selecciona una fecha.', 'warning');
    return;
  }
  if (!horaSeleccionada) {
    SH.showAlert('alert-reserva', '<i class="bi bi-exclamation-circle me-2"></i>Selecciona un horario disponible.', 'warning');
    return;
  }
  if (isHoraOcupada(canchaActual.id, fecha, horaSeleccionada)) {
    SH.showAlert('alert-reserva', '<i class="bi bi-x-circle me-2"></i>Ese horario ya fue reservado. Elige otro.', 'danger');
    return;
  }

  const carrito = {
    canchaId:    canchaActual.id,
    canchaNombre:canchaActual.nombre,
    canchaTipo:  canchaActual.tipo,
    fecha,
    hora:        horaSeleccionada,
    precio:      canchaActual.precio
  };

  SH.set(SH.KEYS.CARRITO, carrito);
  window.location.href = 'carrito.html';
}
