


function initCarrito() {
  const sesion = SH.requireAuth('cliente');
  if (!sesion) return;

  const carrito    = SH.get(SH.KEYS.CARRITO);
  const cardDetalle = document.getElementById('carrito-detalle');
  const emptyMsg   = document.getElementById('carrito-vacio');
  const btnPagar   = document.getElementById('btn-pagar');
  const btnVaciar  = document.getElementById('btn-vaciar');

  if (!carrito) {
    if (cardDetalle) cardDetalle.classList.add('d-none');
    if (emptyMsg)    emptyMsg.classList.remove('d-none');
    if (btnPagar)    btnPagar.disabled = true;
    if (btnVaciar)   btnVaciar.classList.add('d-none');
    return;
  }

  if (emptyMsg)    emptyMsg.classList.add('d-none');
  if (cardDetalle) cardDetalle.classList.remove('d-none');

  const color = SH.tipoColor(carrito.canchaTipo);
  const emoji = SH.tipoEmoji(carrito.canchaTipo);

  
  const iconEl = document.getElementById('cart-icon');
  if (iconEl) {
    iconEl.textContent = emoji;
    iconEl.style.background = `linear-gradient(135deg, ${color}dd, ${color}88)`;
  }

  setStat('cart-cancha', carrito.canchaNombre);
  setStat('cart-tipo',   SH.tipoLabel(carrito.canchaTipo));
  setStat('cart-fecha',  SH.formatFecha(carrito.fecha));
  setStat('cart-hora',   carrito.hora);
  setStat('cart-precio', SH.formatPrecio(carrito.precio));
  setStat('cart-total',  SH.formatPrecio(carrito.precio));

  
  setStat('cart-cliente', sesion.nombre);
  setStat('cart-correo',  sesion.correo);

  if (btnPagar)  btnPagar.disabled = false;
  if (btnVaciar) btnVaciar.classList.remove('d-none');
}

function vaciarCarrito() {
  if (!confirm('¿Deseas eliminar esta reserva del carrito?')) return;
  SH.remove(SH.KEYS.CARRITO);
  window.location.reload();
}


function procesarPago() {
  const sesion = SH.getSesion();
  if (!sesion) { window.location.href = 'login.html'; return; }

  const carrito = SH.get(SH.KEYS.CARRITO);
  if (!carrito) {
    SH.showAlert('alert-pago', '<i class="bi bi-exclamation-triangle me-2"></i>No hay reserva para procesar.', 'warning');
    return;
  }

  
  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  const conflicto = reservas.some(r =>
    r.canchaId === carrito.canchaId &&
    r.fecha    === carrito.fecha    &&
    r.hora     === carrito.hora     &&
    r.estado   !== 'cancelada'
  );

  if (conflicto) {
    SH.showAlert('alert-pago',
      '<i class="bi bi-x-circle me-2"></i>Lo sentimos, ese horario fue reservado mientras procesabas el pago. Selecciona otro.', 'danger');
    SH.remove(SH.KEYS.CARRITO);
    setTimeout(() => { window.location.href = 'canchas.html'; }, 2500);
    return;
  }

  
  const btnPagar = document.getElementById('btn-pagar');
  if (btnPagar) {
    btnPagar.disabled = true;
    btnPagar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
  }

  setTimeout(() => {
    const nueva = {
      id:             SH.genId(reservas),
      clienteId:      sesion.id,
      clienteNombre:  sesion.nombre,
      clienteCorreo:  sesion.correo,
      canchaId:       carrito.canchaId,
      canchaNombre:   carrito.canchaNombre,
      canchaTipo:     carrito.canchaTipo,
      fecha:          carrito.fecha,
      hora:           carrito.hora,
      precio:         carrito.precio,
      estado:         'confirmada',
      fechaCreacion:  new Date().toISOString()
    };

    reservas.push(nueva);
    SH.set(SH.KEYS.RESERVAS, reservas);
    SH.set(SH.KEYS.ULT_RES, nueva);
    SH.remove(SH.KEYS.CARRITO);

    window.location.href = 'pago-exitoso.html';
  }, 1500);
}


function initPagoExitoso() {
  const sesion = SH.requireAuth('cliente');
  if (!sesion) return;

  const reserva = SH.get(SH.KEYS.ULT_RES);
  if (!reserva) { window.location.href = 'mis-reservas.html'; return; }

  setStat('pe-emoji',  SH.tipoEmoji(reserva.canchaTipo));
  setStat('pe-cancha', reserva.canchaNombre);
  setStat('pe-tipo',   SH.tipoLabel(reserva.canchaTipo));
  setStat('pe-fecha',  SH.formatFecha(reserva.fecha));
  setStat('pe-hora',   reserva.hora);
  setStat('pe-total',  SH.formatPrecio(reserva.precio));
  setStat('pe-id',     '#' + String(reserva.id).padStart(5, '0'));
  setStat('pe-fecha-comp', SH.formatDateTime(reserva.fechaCreacion));
  setStat('pe-cliente', reserva.clienteNombre);
}


function initHistorial() {
  const sesion = SH.requireAuth('cliente');
  if (!sesion) return;

  actualizarEstadisticas(sesion);
  renderHistorial(sesion);

  const filtroEstado = document.getElementById('filtro-estado');
  const filtroTipo   = document.getElementById('filtro-tipo-res');
  if (filtroEstado) filtroEstado.addEventListener('change', () => renderHistorial(sesion));
  if (filtroTipo)   filtroTipo.addEventListener('change', () => renderHistorial(sesion));
}

function actualizarEstadisticas(sesion) {
  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  const mis = reservas.filter(r => r.clienteId === sesion.id);

  setStat('hist-stat-total',      mis.length);
  setStat('hist-stat-confirmadas', mis.filter(r => r.estado === 'confirmada').length);
  setStat('hist-stat-canceladas',  mis.filter(r => r.estado === 'cancelada').length);

  const gasto = mis.filter(r => r.estado === 'confirmada').reduce((s, r) => s + r.precio, 0);
  setStat('hist-stat-gasto', SH.formatPrecio(gasto));
}

function renderHistorial(sesion) {
  const container = document.getElementById('historial-container');
  const emptyMsg  = document.getElementById('historial-vacio');
  if (!container) return;

  const reservas     = SH.get(SH.KEYS.RESERVAS) || [];
  const filtroEstado = document.getElementById('filtro-estado')?.value || '';
  const filtroTipo   = document.getElementById('filtro-tipo-res')?.value || '';

  let mis = reservas.filter(r => r.clienteId === sesion.id);
  if (filtroEstado) mis = mis.filter(r => r.estado === filtroEstado);
  if (filtroTipo)   mis = mis.filter(r => r.canchaTipo === filtroTipo);
  mis.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

  if (mis.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.classList.remove('d-none');
    return;
  }
  if (emptyMsg) emptyMsg.classList.add('d-none');

  container.innerHTML = mis.map(r => buildReservaCard(r)).join('');
}

function buildReservaCard(r) {
  const color      = SH.tipoColor(r.canchaTipo);
  const emoji      = SH.tipoEmoji(r.canchaTipo);
  const esConf     = r.estado === 'confirmada';
  const statusBadge = esConf
    ? '<span class="badge-sh badge-green">Confirmada</span>'
    : '<span class="badge-sh badge-red">Cancelada</span>';

  const btnCancelar = esConf
    ? `<button class="btn btn-outline-sh btn-sm" style="font-size:.78rem;color:var(--red);border-color:#FECACA" onclick="cancelarReserva(${r.id})">
         Cancelar
       </button>`
    : '';

  return `
    <div class="reserva-card mb-3 ${esConf ? '' : 'cancelada'}">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="sport-badge" style="background:${color}18;font-size:1.4rem;border:1px solid ${color}30">
            ${emoji}
          </div>
          <div>
            <div class="fw-bold mb-1" style="font-size:.9rem">${r.canchaNombre}</div>
            <div style="font-size:.8rem;color:var(--text-muted)">
              ${SH.formatFecha(r.fecha)} · ${r.hora} · ${SH.tipoLabel(r.canchaTipo)}
            </div>
            <div style="font-size:.75rem;color:var(--text-light);margin-top:.15rem">
              #${String(r.id).padStart(5,'0')} · ${SH.formatDateTime(r.fechaCreacion)}
            </div>
          </div>
        </div>
        <div class="d-flex flex-column align-items-end gap-2">
          ${statusBadge}
          <span class="fw-bold" style="font-size:1rem">${SH.formatPrecio(r.precio)}</span>
          ${btnCancelar}
        </div>
      </div>
    </div>`;
}

function cancelarReserva(id) {
  if (!confirm('¿Seguro que deseas cancelar esta reserva? Esta acción no se puede deshacer.')) return;

  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  const idx = reservas.findIndex(r => r.id === id);
  if (idx === -1) return;

  reservas[idx].estado = 'cancelada';
  SH.set(SH.KEYS.RESERVAS, reservas);

  const sesion = SH.getSesion();
  actualizarEstadisticas(sesion);
  renderHistorial(sesion);
  showToast('Reserva cancelada correctamente.', 'info');
}
