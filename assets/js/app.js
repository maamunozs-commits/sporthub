


const SH = {
  KEYS: {
    USUARIOS: 'sh_usuarios',
    SESION:   'sh_sesion',
    CANCHAS:  'sh_canchas',
    RESERVAS: 'sh_reservas',
    CARRITO:  'sh_carrito',
    ULT_RES:  'sh_ultima_reserva'
  },

  get(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch { return null; }
  },

  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },

  remove(key) { localStorage.removeItem(key); },

  getSesion() { return this.get(this.KEYS.SESION); },

  
  requireAuth(rol = null) {
    const s = this.getSesion();
    if (!s) { window.location.href = 'login.html'; return null; }
    if (rol && s.rol !== rol) {
      window.location.href = s.rol === 'admin' ? 'admin.html' : 'index.html';
      return null;
    }
    return s;
  },

  
  genId(arr) {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(x => x.id)) + 1;
  },

  
  showAlert(containerId, msg, tipo = 'success') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  clearAlert(id) { const el = document.getElementById(id); if (el) el.innerHTML = ''; },

  
  formatPrecio(p) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(p);
  },

  
  formatFecha(f) {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    return `${d}/${m}/${y}`;
  },

  
  formatDateTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  },

  tipoLabel(t) { return { futbol:'Fútbol', padel:'Pádel', tenis:'Tenis', basquetbol:'Básquetbol' }[t] || t; },
  tipoEmoji(t) { return { futbol:'⚽', padel:'🎾', tenis:'🎾', basquetbol:'🏀' }[t] || '🏟️'; },
  tipoColor(t) {
    return { futbol:'#27ae60', padel:'#2980b9', tenis:'#f39c12', basquetbol:'#e74c3c' }[t] || '#1a3a5c';
  }
};




function setStat(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }


function _generarHorarios() {
  const slots = [];
  for (let h = 8; h <= 21; h++) slots.push(`${String(h).padStart(2, '0')}:00`);
  return slots;
}


function initData() {
  if (!SH.get(SH.KEYS.USUARIOS)) {
    SH.set(SH.KEYS.USUARIOS, [
      {
        id: 1, nombre: 'Administrador', correo: 'admin@sporthub.cl',
        password: 'Admin123!', telefono: '912345678',
        rol: 'admin', fechaRegistro: new Date().toISOString()
      },
      {
        id: 2, nombre: 'Carlos López', correo: 'cliente@sporthub.cl',
        password: 'Cliente123!', telefono: '987654321',
        rol: 'cliente', fechaRegistro: new Date().toISOString()
      }
    ]);
  }

  if (!SH.get(SH.KEYS.CANCHAS)) {
    SH.set(SH.KEYS.CANCHAS, [
      {
        id: 1, nombre: 'Cancha Fútbol Premium', tipo: 'futbol',
        precio: 20000, estado: 'disponible', imagen: '', capacidad: 22,
        descripcion: 'Cancha de fútbol 11 con césped sintético de última generación. Iluminación LED, vestuarios y estacionamiento disponible. Ideal para partidos y entrenamientos.',
        horariosDisponibles: _generarHorarios(), horariosBlockeados: []
      },
      {
        id: 2, nombre: 'Cancha Pádel Central', tipo: 'padel',
        precio: 12000, estado: 'disponible', imagen: '', capacidad: 4,
        descripcion: 'Cancha de pádel cristal panorámico con superficie BluGrass profesional. Iluminación LED de alta calidad. Servicio de alquiler de raquetas incluido.',
        horariosDisponibles: _generarHorarios(), horariosBlockeados: []
      },
      {
        id: 3, nombre: 'Cancha Tenis Club', tipo: 'tenis',
        precio: 15000, estado: 'disponible', imagen: '', capacidad: 4,
        descripcion: 'Cancha de tenis superficie dura con marcaciones oficiales ITF. Iluminación nocturna LED y red profesional. Excelente mantenimiento.',
        horariosDisponibles: _generarHorarios(), horariosBlockeados: []
      },
      {
        id: 4, nombre: 'Cancha Básquetbol Arena', tipo: 'basquetbol',
        precio: 10000, estado: 'disponible', imagen: '', capacidad: 10,
        descripcion: 'Cancha de básquetbol techada con parqué profesional Mondo. Tableros regulables con aros oficiales NBA. Marcaciones reglamentarias.',
        horariosDisponibles: _generarHorarios(), horariosBlockeados: []
      }
    ]);
  }

  if (!SH.get(SH.KEYS.RESERVAS)) SH.set(SH.KEYS.RESERVAS, []);
}


function renderNavbar() {
  const el = document.getElementById('nav-user-area');
  if (!el) return;
  const s = SH.getSesion();

  if (!s) {
    el.innerHTML = `
      <li class="nav-item me-1">
        <a class="nav-link" href="login.html"><i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión</a>
      </li>
      <li class="nav-item">
        <a class="btn btn-success rounded-pill px-3 py-1 fw-semibold" href="registro.html">
          <i class="bi bi-person-plus me-1"></i>Registrarse
        </a>
      </li>`;
    return;
  }

  const adminMenuItems = s.rol === 'admin' ? `
    <li><a class="dropdown-item" href="admin.html"><i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard</a></li>
    <li><a class="dropdown-item" href="admin-canchas.html"><i class="bi bi-building me-2 text-success"></i>Canchas</a></li>
    <li><a class="dropdown-item" href="admin-usuarios.html"><i class="bi bi-people me-2 text-info"></i>Usuarios</a></li>
    <li><a class="dropdown-item" href="admin-reservas.html"><i class="bi bi-calendar3 me-2 text-warning"></i>Reservas</a></li>
    <li><a class="dropdown-item" href="admin-horarios.html"><i class="bi bi-clock me-2 text-secondary"></i>Horarios</a></li>
    <li><hr class="dropdown-divider">` : `
    <li><a class="dropdown-item" href="canchas.html"><i class="bi bi-grid me-2 text-success"></i>Ver Canchas</a></li>
    <li><a class="dropdown-item" href="mis-reservas.html"><i class="bi bi-calendar-check me-2 text-primary"></i>Mis Reservas</a></li>
    <li><hr class="dropdown-divider">`;

  const adminBadge = s.rol === 'admin'
    ? '<span class="badge bg-warning text-dark ms-1" style="font-size:.65rem;vertical-align:middle">ADMIN</span>'
    : '';

  el.innerHTML = `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle fw-semibold d-flex align-items-center gap-1"
         href="#" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-person-circle"></i>
        <span class="d-none d-sm-inline">${s.nombre}</span>
        ${adminBadge}
      </a>
      <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="min-width:220px">
        <li class="px-3 py-2">
          <div class="fw-semibold small text-sh-blue">${s.nombre}</div>
          <div class="text-muted" style="font-size:.78rem">${s.correo}</div>
        </li>
        <li><hr class="dropdown-divider my-1"></li>
        ${adminMenuItems}
        <li><a class="dropdown-item" href="perfil.html"><i class="bi bi-person-gear me-2"></i>Mi Perfil</a></li>
        <li><hr class="dropdown-divider my-1">
        <li>
          <a class="dropdown-item text-danger" href="#" onclick="cerrarSesion(); return false;">
            <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
          </a>
        </li>
      </ul>
    </li>`;
}

function cerrarSesion() {
  SH.remove(SH.KEYS.SESION);
  SH.remove(SH.KEYS.CARRITO);
  window.location.href = 'login.html';
}


function showToast(msg, tipo = 'success') {
  let container = document.getElementById('sh-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'sh-toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const id = 'toast-' + Date.now();
  const colors = { success: '#27ae60', danger: '#e74c3c', info: '#2980b9', warning: '#f39c12' };
  const icons  = { success: 'check-circle-fill', danger: 'x-circle-fill', info: 'info-circle-fill', warning: 'exclamation-triangle-fill' };

  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-white border-0 rounded-3"
         style="background:${colors[tipo] || colors.success}" role="alert">
      <div class="d-flex">
        <div class="toast-body fw-semibold">
          <i class="bi bi-${icons[tipo] || icons.success} me-2"></i>${msg}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);

  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}


document.addEventListener('DOMContentLoaded', () => {
  initData();
  renderNavbar();
});
