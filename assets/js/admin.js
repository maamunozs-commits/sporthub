


function initAdmin() {
  const sesion = SH.requireAuth('admin');
  if (!sesion) return;

  const canchas  = SH.get(SH.KEYS.CANCHAS)  || [];
  const usuarios = (SH.get(SH.KEYS.USUARIOS) || []).filter(u => u.rol === 'cliente');
  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  const hoy      = new Date().toISOString().split('T')[0];

  setStat('dash-canchas',  canchas.length);
  setStat('dash-usuarios', usuarios.length);
  setStat('dash-reservas', reservas.length);
  setStat('dash-hoy',      reservas.filter(r => r.fecha === hoy && r.estado !== 'cancelada').length);

  const ingresos = reservas
    .filter(r => r.estado === 'confirmada')
    .reduce((s, r) => s + r.precio, 0);
  setStat('dash-ingresos', SH.formatPrecio(ingresos));

  renderUltimasReservasDash(reservas);
  renderPopularidadCanchas(canchas, reservas);
}

function renderUltimasReservasDash(reservas) {
  const tbody = document.getElementById('dash-reservas-tbody');
  if (!tbody) return;

  const ultimas = [...reservas]
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 7);

  if (ultimas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Sin reservas aún</td></tr>';
    return;
  }

  tbody.innerHTML = ultimas.map(r => `
    <tr>
      <td style="color:var(--text-muted);font-size:.8rem">#${String(r.id).padStart(5,'0')}</td>
      <td class="fw-semibold">${r.clienteNombre}</td>
      <td>${r.canchaNombre}</td>
      <td>${SH.formatFecha(r.fecha)} <span class="badge-sh badge-gray" style="font-size:.73rem">${r.hora}</span></td>
      <td><span class="badge-sh ${r.estado === 'confirmada' ? 'badge-green' : 'badge-red'}">${r.estado}</span></td>
    </tr>`).join('');
}

function renderPopularidadCanchas(canchas, reservas) {
  const container = document.getElementById('dash-popularidad');
  if (!container) return;

  const confirmadas = reservas.filter(r => r.estado === 'confirmada');
  const maxCount    = Math.max(1, ...canchas.map(c => confirmadas.filter(r => r.canchaId === c.id).length));

  container.innerHTML = canchas.map(c => {
    const count = confirmadas.filter(r => r.canchaId === c.id).length;
    const pct   = Math.round((count / maxCount) * 100);
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="small fw-semibold">${SH.tipoEmoji(c.tipo)} ${c.nombre}</span>
          <span class="small text-muted">${count} reserva${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="progress" style="height:8px;border-radius:4px">
          <div class="progress-bar" style="width:${pct}%;background:${SH.tipoColor(c.tipo)};border-radius:4px"></div>
        </div>
      </div>`;
  }).join('');
}


function initAdminCanchas() {
  SH.requireAuth('admin');
  renderTablaCanchas();
  initFormCancha();
}

function renderTablaCanchas() {
  const tbody = document.getElementById('canchas-tbody');
  if (!tbody) return;

  const q = document.getElementById('busq-cancha')?.value.toLowerCase() || '';
  let canchas = SH.get(SH.KEYS.CANCHAS) || [];
  if (q) canchas = canchas.filter(c => c.nombre.toLowerCase().includes(q) || SH.tipoLabel(c.tipo).toLowerCase().includes(q));

  setStat('canchas-count', canchas.length + ' canchas');

  if (canchas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay canchas registradas</td></tr>';
    return;
  }

  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  tbody.innerHTML = canchas.map(c => {
    const nRes = reservas.filter(r => r.canchaId === c.id && r.estado === 'confirmada').length;
    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span style="font-size:1.15rem">${SH.tipoEmoji(c.tipo)}</span>
            <span class="fw-semibold">${c.nombre}</span>
          </div>
        </td>
        <td><span class="badge-sh badge-navy" style="font-size:.73rem">${SH.tipoLabel(c.tipo)}</span></td>
        <td class="fw-semibold">${SH.formatPrecio(c.precio)}</td>
        <td>${c.capacidad}</td>
        <td><span class="badge-sh badge-blue" style="font-size:.73rem">${nRes}</span></td>
        <td><span class="badge-sh ${c.estado === 'disponible' ? 'badge-green' : 'badge-gray'}" style="font-size:.73rem">${c.estado}</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-outline-sh btn-sm" onclick="abrirEditarCancha(${c.id})" title="Editar" style="padding:.3rem .6rem;font-size:.8rem">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-sh btn-sm" onclick="eliminarCancha(${c.id})" title="Eliminar" style="padding:.3rem .6rem;font-size:.8rem;color:var(--red);border-color:#FECACA">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function initFormCancha() {
  const form = document.getElementById('form-cancha');
  if (!form) return;

  const busq = document.getElementById('busq-cancha');
  if (busq) busq.addEventListener('input', renderTablaCanchas);

  form.addEventListener('submit', e => { e.preventDefault(); guardarCancha(); });
}

function abrirNuevaCancha() {
  limpiarFormCancha();
  setStat('modal-cancha-titulo', 'Nueva Cancha');
  const modal = new bootstrap.Modal(document.getElementById('modalCancha'));
  modal.show();
}

function abrirEditarCancha(id) {
  const canchas = SH.get(SH.KEYS.CANCHAS) || [];
  const c = canchas.find(x => x.id === id);
  if (!c) return;

  setStat('modal-cancha-titulo', 'Editar Cancha');
  document.getElementById('cancha-id').value          = c.id;
  document.getElementById('cancha-nombre').value      = c.nombre;
  document.getElementById('cancha-tipo').value        = c.tipo;
  document.getElementById('cancha-precio').value      = c.precio;
  document.getElementById('cancha-capacidad').value   = c.capacidad;
  document.getElementById('cancha-estado').value      = c.estado;
  document.getElementById('cancha-descripcion').value = c.descripcion;

  const modal = new bootstrap.Modal(document.getElementById('modalCancha'));
  modal.show();
}

function limpiarFormCancha() {
  const form = document.getElementById('form-cancha');
  if (form) form.reset();
  document.getElementById('cancha-id').value = '';
  SH.clearAlert('alert-cancha');
}

function guardarCancha() {
  SH.clearAlert('alert-cancha');

  const id          = document.getElementById('cancha-id').value;
  const nombre      = document.getElementById('cancha-nombre').value.trim();
  const tipo        = document.getElementById('cancha-tipo').value;
  const precioStr   = document.getElementById('cancha-precio').value;
  const capacidadSt = document.getElementById('cancha-capacidad').value;
  const estado      = document.getElementById('cancha-estado').value;
  const descripcion = document.getElementById('cancha-descripcion').value.trim();

  
  if (!nombre)                  { SH.showAlert('alert-cancha', 'El nombre es obligatorio.', 'danger'); return; }
  if (!tipo)                    { SH.showAlert('alert-cancha', 'El tipo de cancha es obligatorio.', 'danger'); return; }
  if (!precioStr || Number(precioStr) <= 0) { SH.showAlert('alert-cancha', 'El precio debe ser mayor a 0.', 'danger'); return; }
  if (!estado)                  { SH.showAlert('alert-cancha', 'El estado es obligatorio.', 'danger'); return; }

  const canchas = SH.get(SH.KEYS.CANCHAS) || [];

  if (id) {
    
    const idx = canchas.findIndex(c => c.id === parseInt(id));
    if (idx !== -1) {
      canchas[idx] = {
        ...canchas[idx],
        nombre, tipo, estado, descripcion,
        precio:    Number(precioStr),
        capacidad: Number(capacidadSt) || 0
      };
      SH.set(SH.KEYS.CANCHAS, canchas);
      bootstrap.Modal.getInstance(document.getElementById('modalCancha'))?.hide();
      renderTablaCanchas();
      showToast('Cancha actualizada correctamente.');
    }
  } else {
    
    const nueva = {
      id: SH.genId(canchas), nombre, tipo, estado, descripcion,
      precio:               Number(precioStr),
      capacidad:            Number(capacidadSt) || 0,
      imagen:               '',
      horariosDisponibles:  _generarHorarios(),
      horariosBlockeados:   []
    };
    canchas.push(nueva);
    SH.set(SH.KEYS.CANCHAS, canchas);
    bootstrap.Modal.getInstance(document.getElementById('modalCancha'))?.hide();
    renderTablaCanchas();
    showToast('Cancha creada correctamente.');
  }
}

function eliminarCancha(id) {
  const canchas  = SH.get(SH.KEYS.CANCHAS)  || [];
  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  const c = canchas.find(x => x.id === id);
  if (!c) return;

  const nRes = reservas.filter(r => r.canchaId === id && r.estado === 'confirmada').length;
  const msg  = nRes > 0
    ? `¿Eliminar "${c.nombre}"? Tiene ${nRes} reserva(s) activa(s) que también serán afectadas.`
    : `¿Eliminar "${c.nombre}"? Esta acción no se puede deshacer.`;

  if (!confirm(msg)) return;

  SH.set(SH.KEYS.CANCHAS, canchas.filter(x => x.id !== id));
  renderTablaCanchas();
  showToast('Cancha eliminada.', 'info');
}


function initAdminUsuarios() {
  SH.requireAuth('admin');
  renderTablaUsuarios();

  const busq = document.getElementById('busq-usuario');
  if (busq) busq.addEventListener('input', renderTablaUsuarios);
}

function renderTablaUsuarios() {
  const tbody = document.getElementById('usuarios-tbody');
  if (!tbody) return;

  const q = document.getElementById('busq-usuario')?.value.toLowerCase() || '';
  let usuarios = (SH.get(SH.KEYS.USUARIOS) || []).filter(u => u.rol === 'cliente');
  if (q) usuarios = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
  );
  usuarios.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));

  setStat('usuarios-count', usuarios.length + ' cliente' + (usuarios.length !== 1 ? 's' : ''));

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay clientes registrados</td></tr>';
    return;
  }

  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  tbody.innerHTML = usuarios.map(u => {
    const nRes  = reservas.filter(r => r.clienteId === u.id).length;
    const nConf = reservas.filter(r => r.clienteId === u.id && r.estado === 'confirmada').length;
    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="d-flex align-items-center justify-content-center rounded-2 fw-bold text-white"
                 style="width:32px;height:32px;background:var(--navy);font-size:.8rem;flex-shrink:0">
              ${u.nombre.charAt(0).toUpperCase()}
            </div>
            <span class="fw-semibold">${u.nombre}</span>
          </div>
        </td>
        <td style="color:var(--text-muted);font-size:.875rem">${u.correo}</td>
        <td style="font-size:.875rem">${u.telefono || '—'}</td>
        <td style="font-size:.82rem;color:var(--text-muted)">${SH.formatDateTime(u.fechaRegistro)}</td>
        <td>
          <span class="badge-sh badge-green" style="font-size:.73rem">${nConf} conf.</span>
          ${nRes !== nConf ? `<span class="badge-sh badge-red ms-1" style="font-size:.73rem">${nRes - nConf} canc.</span>` : ''}
        </td>
        <td>
          <button class="btn btn-outline-sh btn-sm" onclick="eliminarUsuario(${u.id})" title="Eliminar" style="padding:.3rem .6rem;font-size:.8rem;color:var(--red);border-color:#FECACA">
            <i class="bi bi-person-x"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

function eliminarUsuario(id) {
  const usuarios = SH.get(SH.KEYS.USUARIOS) || [];
  const u = usuarios.find(x => x.id === id);
  if (!u) return;

  if (!confirm(`¿Eliminar al usuario "${u.nombre}"? Se eliminarán también sus reservas.`)) return;

  SH.set(SH.KEYS.USUARIOS, usuarios.filter(x => x.id !== id));
  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  SH.set(SH.KEYS.RESERVAS, reservas.filter(r => r.clienteId !== id));

  renderTablaUsuarios();
  showToast('Usuario eliminado.', 'info');
}

function initAdminReservas() {
  SH.requireAuth('admin');
  renderTablaReservas();

  const filtroE = document.getElementById('filtro-estado');
  const filtroT = document.getElementById('filtro-tipo-ar');
  const busqC   = document.getElementById('busq-cliente');
  if (filtroE) filtroE.addEventListener('change', renderTablaReservas);
  if (filtroT) filtroT.addEventListener('change', renderTablaReservas);
  if (busqC)   busqC.addEventListener('input', renderTablaReservas);
}

function renderTablaReservas() {
  const tbody = document.getElementById('reservas-tbody');
  if (!tbody) return;

  const filtroE = document.getElementById('filtro-estado')?.value   || '';
  const filtroT = document.getElementById('filtro-tipo-ar')?.value  || '';
  const busqC   = document.getElementById('busq-cliente')?.value.toLowerCase() || '';

  let reservas = SH.get(SH.KEYS.RESERVAS) || [];
  if (filtroE) reservas = reservas.filter(r => r.estado    === filtroE);
  if (filtroT) reservas = reservas.filter(r => r.canchaTipo === filtroT);
  if (busqC)   reservas = reservas.filter(r =>
    r.clienteNombre.toLowerCase().includes(busqC) || r.clienteCorreo.toLowerCase().includes(busqC)
  );
  reservas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

  const total = (SH.get(SH.KEYS.RESERVAS) || []).filter(r => r.estado !== 'cancelada');
  const ingr  = total.reduce((s, r) => s + r.precio, 0);
  setStat('ar-count',    reservas.length + ' resultado' + (reservas.length !== 1 ? 's' : ''));
  setStat('ar-ingresos', SH.formatPrecio(ingr));

  if (reservas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No se encontraron reservas</td></tr>';
    return;
  }

  tbody.innerHTML = reservas.map(r => `
    <tr>
      <td style="color:var(--text-muted);font-size:.8rem">#${String(r.id).padStart(5,'0')}</td>
      <td>
        <div class="fw-semibold" style="font-size:.875rem">${r.clienteNombre}</div>
        <div style="font-size:.78rem;color:var(--text-muted)">${r.clienteCorreo}</div>
      </td>
      <td style="font-size:.875rem">${SH.tipoEmoji(r.canchaTipo)} ${r.canchaNombre}</td>
      <td style="font-size:.875rem">${SH.formatFecha(r.fecha)}</td>
      <td><span class="badge-sh badge-gray" style="font-size:.73rem">${r.hora}</span></td>
      <td class="fw-semibold" style="font-size:.875rem">${SH.formatPrecio(r.precio)}</td>
      <td>
        <div class="d-flex align-items-center gap-1">
          <span class="badge-sh ${r.estado === 'confirmada' ? 'badge-green' : 'badge-red'}" style="font-size:.73rem">${r.estado}</span>
          ${r.estado === 'confirmada'
            ? `<button class="btn btn-outline-sh btn-sm" onclick="adminCancelarReserva(${r.id})" title="Cancelar" style="padding:.25rem .5rem;font-size:.78rem;color:var(--red);border-color:#FECACA">
                 <i class="bi bi-x-lg"></i>
               </button>`
            : ''}
        </div>
      </td>
    </tr>`).join('');
}

function adminCancelarReserva(id) {
  if (!confirm('¿Cancelar esta reserva?')) return;
  const reservas = SH.get(SH.KEYS.RESERVAS) || [];
  const idx = reservas.findIndex(r => r.id === id);
  if (idx !== -1) {
    reservas[idx].estado = 'cancelada';
    SH.set(SH.KEYS.RESERVAS, reservas);
    renderTablaReservas();
    showToast('Reserva cancelada.', 'info');
  }
}

function initAdminHorarios() {
  SH.requireAuth('admin');
  llenarSelectCanchasHorarios();

  const hoy       = new Date().toISOString().split('T')[0];
  const fechaInp  = document.getElementById('fecha-horario');
  if (fechaInp) { fechaInp.min = hoy; fechaInp.value = hoy; }

  const selCancha = document.getElementById('select-cancha');
  if (selCancha) selCancha.addEventListener('change', renderHorariosAdmin);
  if (fechaInp)  fechaInp.addEventListener('change', renderHorariosAdmin);

  renderHorariosAdmin();
}

function llenarSelectCanchasHorarios() {
  const sel = document.getElementById('select-cancha');
  if (!sel) return;
  const canchas = SH.get(SH.KEYS.CANCHAS) || [];
  sel.innerHTML = '<option value="">-- Selecciona una cancha --</option>' +
    canchas.map(c => `<option value="${c.id}">${SH.tipoEmoji(c.tipo)} ${c.nombre}</option>`).join('');
}

function renderHorariosAdmin() {
  const canchaId = parseInt(document.getElementById('select-cancha')?.value);
  const fecha    = document.getElementById('fecha-horario')?.value;
  const container = document.getElementById('horarios-admin-container');
  if (!container) return;

  if (!canchaId || !fecha) {
    container.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-calendar-event" style="font-size:2.5rem;opacity:.3"></i>
        <p class="mt-3">Selecciona una cancha y fecha para gestionar la disponibilidad.</p>
      </div>`;
    return;
  }

  const canchas = SH.get(SH.KEYS.CANCHAS) || [];
  const cancha  = canchas.find(c => c.id === canchaId);
  if (!cancha) return;

  const reservas  = SH.get(SH.KEYS.RESERVAS) || [];
  const ocupadas  = reservas.filter(r => r.canchaId === canchaId && r.fecha === fecha && r.estado !== 'cancelada').map(r => r.hora);
  const bloqueadas = (cancha.horariosBlockeados || []).filter(b => b.fecha === fecha).map(b => b.hora);

  const slots = cancha.horariosDisponibles || [];
  const libre  = slots.filter(h => !ocupadas.includes(h) && !bloqueadas.includes(h)).length;
  const total  = slots.length;

  container.innerHTML = `
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <div>
        <h6 class="fw-bold mb-0 text-sh-blue">${cancha.nombre}</h6>
        <small class="text-muted">${SH.formatFecha(fecha)} · ${libre}/${total} horarios libres</small>
      </div>
      <div class="d-flex gap-2 flex-wrap" style="font-size:.8rem">
        <span><span class="time-slot py-1 px-2 d-inline-block" style="pointer-events:none;font-size:.75rem">08:00</span> Libre</span>
        <span><span class="time-slot bloqueado py-1 px-2 d-inline-block" style="pointer-events:none;font-size:.75rem">09:00</span> Bloqueado</span>
        <span><span class="time-slot ocupado py-1 px-2 d-inline-block" style="pointer-events:none;font-size:.75rem">10:00</span> Reservado</span>
      </div>
    </div>
    <div class="d-flex flex-wrap gap-1">
      ${slots.map(hora => {
        const ocupada   = ocupadas.includes(hora);
        const bloqueada = bloqueadas.includes(hora);
        if (ocupada) {
          return `<span class="time-slot ocupado" title="Reservado por un cliente">${hora}</span>`;
        } else if (bloqueada) {
          return `<span class="time-slot bloqueado" title="Clic para desbloquear" onclick="toggleHorario(${canchaId},'${fecha}','${hora}',false)" style="cursor:pointer">
                    ${hora} <i class="bi bi-lock-fill" style="font-size:.65rem"></i>
                  </span>`;
        } else {
          return `<span class="time-slot" title="Clic para bloquear" onclick="toggleHorario(${canchaId},'${fecha}','${hora}',true)">
                    ${hora}
                  </span>`;
        }
      }).join('')}
    </div>
    <p class="text-muted small mt-3 mb-0">
      <i class="bi bi-info-circle me-1"></i>
      Haz clic en un horario libre para bloquearlo, o en uno bloqueado para desbloquearlo.
    </p>`;
}

function toggleHorario(canchaId, fecha, hora, bloquear) {
  const canchas = SH.get(SH.KEYS.CANCHAS) || [];
  const idx     = canchas.findIndex(c => c.id === canchaId);
  if (idx === -1) return;

  if (!canchas[idx].horariosBlockeados) canchas[idx].horariosBlockeados = [];

  if (bloquear) {
    canchas[idx].horariosBlockeados.push({ fecha, hora });
    showToast(`Horario ${hora} bloqueado.`, 'warning');
  } else {
    canchas[idx].horariosBlockeados = canchas[idx].horariosBlockeados
      .filter(b => !(b.fecha === fecha && b.hora === hora));
    showToast(`Horario ${hora} desbloqueado.`, 'success');
  }

  SH.set(SH.KEYS.CANCHAS, canchas);
  renderHorariosAdmin();
}

function bloquearTodo() {
  const canchaId = parseInt(document.getElementById('select-cancha')?.value);
  const fecha    = document.getElementById('fecha-horario')?.value;
  if (!canchaId || !fecha) { showToast('Selecciona una cancha y fecha.', 'warning'); return; }

  if (!confirm(`¿Bloquear todos los horarios libres del ${SH.formatFecha(fecha)}?`)) return;

  const canchas   = SH.get(SH.KEYS.CANCHAS) || [];
  const reservas  = SH.get(SH.KEYS.RESERVAS) || [];
  const idx       = canchas.findIndex(c => c.id === canchaId);
  if (idx === -1) return;

  const ocupadas  = reservas.filter(r => r.canchaId === canchaId && r.fecha === fecha && r.estado !== 'cancelada').map(r => r.hora);
  const yaBloqued = (canchas[idx].horariosBlockeados || []).filter(b => b.fecha === fecha).map(b => b.hora);

  canchas[idx].horariosDisponibles.forEach(hora => {
    if (!ocupadas.includes(hora) && !yaBloqued.includes(hora)) {
      canchas[idx].horariosBlockeados.push({ fecha, hora });
    }
  });

  SH.set(SH.KEYS.CANCHAS, canchas);
  renderHorariosAdmin();
  showToast('Todos los horarios libres fueron bloqueados.', 'warning');
}

function desbloquearTodo() {
  const canchaId = parseInt(document.getElementById('select-cancha')?.value);
  const fecha    = document.getElementById('fecha-horario')?.value;
  if (!canchaId || !fecha) { showToast('Selecciona una cancha y fecha.', 'warning'); return; }

  if (!confirm(`¿Desbloquear todos los horarios bloqueados del ${SH.formatFecha(fecha)}?`)) return;

  const canchas = SH.get(SH.KEYS.CANCHAS) || [];
  const idx     = canchas.findIndex(c => c.id === canchaId);
  if (idx === -1) return;

  canchas[idx].horariosBlockeados = (canchas[idx].horariosBlockeados || []).filter(b => b.fecha !== fecha);
  SH.set(SH.KEYS.CANCHAS, canchas);
  renderHorariosAdmin();
  showToast('Todos los horarios desbloqueados.', 'success');
}
