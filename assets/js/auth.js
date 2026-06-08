


function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarPassword(pw) {
  const errs = [];
  if (pw.length < 8)                              errs.push('mínimo 8 caracteres');
  if (!/[A-Z]/.test(pw))                          errs.push('al menos una mayúscula');
  if (!/[0-9]/.test(pw))                          errs.push('al menos un número');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errs.push('al menos un carácter especial');
  return errs;
}

function validarTelefono(tel) {
  return /^[0-9]{8,12}$/.test(tel.replace(/[\s\-+]/g, ''));
}


function setupPasswordStrength(inputId, indicatorId) {
  const input = document.getElementById(inputId);
  const ind   = document.getElementById(indicatorId);
  if (!input || !ind) return;

  input.addEventListener('input', () => {
    const pw = input.value;
    if (!pw) { ind.innerHTML = ''; return; }

    const errs = validarPassword(pw);
    if (errs.length === 0) {
      ind.innerHTML = '<small class="text-success"><i class="bi bi-shield-check me-1"></i>Contraseña segura ✓</small>';
    } else {
      ind.innerHTML = `<small class="text-warning"><i class="bi bi-exclamation-circle me-1"></i>Faltan: ${errs.join(' · ')}</small>`;
    }
  });
}


function initLogin() {
  const form = document.getElementById('form-login');
  if (!form) return;

  
  const s = SH.getSesion();
  if (s) { window.location.href = s.rol === 'admin' ? 'admin.html' : 'index.html'; return; }

  form.addEventListener('submit', e => {
    e.preventDefault();
    SH.clearAlert('alert-box');

    const correo   = document.getElementById('correo').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!correo)              { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>El correo es obligatorio.', 'danger'); return; }
    if (!validarEmail(correo)){ SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>Ingresa un correo con formato válido.', 'danger'); return; }
    if (!password)            { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>La contraseña es obligatoria.', 'danger'); return; }

    const usuarios = SH.get(SH.KEYS.USUARIOS) || [];
    const usuario  = usuarios.find(u => u.correo === correo && u.password === password);

    if (!usuario) {
      SH.showAlert('alert-box', '<i class="bi bi-x-circle me-2"></i>Correo o contraseña incorrectos.', 'danger');
      return;
    }

    SH.set(SH.KEYS.SESION, usuario);
    SH.showAlert('alert-box', `<i class="bi bi-check-circle me-2"></i>¡Bienvenido/a, <strong>${usuario.nombre}</strong>! Redirigiendo...`, 'success');

    setTimeout(() => {
      window.location.href = usuario.rol === 'admin' ? 'admin.html' : 'index.html';
    }, 900);
  });
}


function initRegistro() {
  const form = document.getElementById('form-registro');
  if (!form) return;

  
  const s = SH.getSesion();
  if (s) { window.location.href = s.rol === 'admin' ? 'admin.html' : 'index.html'; return; }

  setupPasswordStrength('password', 'pw-strength');

  form.addEventListener('submit', e => {
    e.preventDefault();
    SH.clearAlert('alert-box');

    const nombre    = document.getElementById('nombre').value.trim();
    const correo    = document.getElementById('correo').value.trim().toLowerCase();
    const telefono  = document.getElementById('telefono').value.trim();
    const password  = document.getElementById('password').value;
    const confirmar = document.getElementById('confirmar-password').value;

    
    if (!nombre)                    { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>El nombre es obligatorio.', 'danger'); return; }
    if (!correo || !validarEmail(correo)) { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>Ingresa un correo válido.', 'danger'); return; }
    if (!telefono || !validarTelefono(telefono)) { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>El teléfono debe tener entre 8 y 12 dígitos (solo números).', 'danger'); return; }

    const pwErrs = validarPassword(password);
    if (pwErrs.length > 0) { SH.showAlert('alert-box', `<i class="bi bi-exclamation-circle me-2"></i>La contraseña debe tener: ${pwErrs.join(', ')}.`, 'danger'); return; }
    if (password !== confirmar) { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>Las contraseñas no coinciden.', 'danger'); return; }

    const usuarios = SH.get(SH.KEYS.USUARIOS) || [];
    if (usuarios.find(u => u.correo === correo)) {
      SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>Ya existe una cuenta con ese correo.', 'danger');
      return;
    }

    const nuevo = {
      id: SH.genId(usuarios), nombre, correo, telefono,
      password, rol: 'cliente', fechaRegistro: new Date().toISOString()
    };
    usuarios.push(nuevo);
    SH.set(SH.KEYS.USUARIOS, usuarios);
    SH.set(SH.KEYS.SESION, nuevo);

    SH.showAlert('alert-box', '<i class="bi bi-check-circle me-2"></i>¡Cuenta creada exitosamente! Redirigiendo...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  });
}


function initRecuperar() {
  const form = document.getElementById('form-recuperar');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    SH.clearAlert('alert-box');

    const correo = document.getElementById('correo').value.trim().toLowerCase();

    if (!correo)               { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>El correo es obligatorio.', 'danger'); return; }
    if (!validarEmail(correo)) { SH.showAlert('alert-box', '<i class="bi bi-exclamation-circle me-2"></i>Ingresa un correo con formato válido.', 'danger'); return; }

    
    SH.showAlert('alert-box', `
      <i class="bi bi-envelope-check-fill me-2"></i>
      Si el correo <strong>${correo}</strong> está registrado en SportHub, recibirás un enlace de recuperación en los próximos minutos.
      <br><small class="mt-1 d-block opacity-75">⚠️ Simulación: no se envía correo real. Esta funcionalidad es demostrativa.</small>
    `, 'success');
    form.reset();
  });
}


function initPerfil() {
  const s = SH.requireAuth();
  if (!s) return;

  
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  setVal('nombre', s.nombre);
  setVal('correo', s.correo);
  setVal('telefono', s.telefono);

  
  setStat('perfil-nombre-display', s.nombre);
  setStat('perfil-correo-display', s.correo);
  const rolBadge = document.getElementById('perfil-rol-badge');
  if (rolBadge) {
    rolBadge.textContent = s.rol === 'admin' ? 'Administrador' : 'Cliente';
    rolBadge.className = `badge ${s.rol === 'admin' ? 'bg-warning text-dark' : 'bg-success'}`;
  }

  
  if (s.rol === 'cliente') {
    const reservas = SH.get(SH.KEYS.RESERVAS) || [];
    const misRes = reservas.filter(r => r.clienteId === s.id);
    setStat('perfil-stat-res', misRes.length);
    setStat('perfil-stat-conf', misRes.filter(r => r.estado === 'confirmada').length);
    const gasto = misRes.filter(r => r.estado === 'confirmada').reduce((sum, r) => sum + r.precio, 0);
    setStat('perfil-stat-gasto', SH.formatPrecio(gasto));
  }

  setupPasswordStrength('pw-nueva', 'pw-nueva-strength');

  const form = document.getElementById('form-perfil');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    SH.clearAlert('alert-box');

    const nombre   = document.getElementById('nombre').value.trim();
    const correo   = document.getElementById('correo').value.trim().toLowerCase();
    const telefono = document.getElementById('telefono').value.trim();
    const pwActual = document.getElementById('pw-actual')?.value || '';
    const pwNueva  = document.getElementById('pw-nueva')?.value || '';
    const pwConfirm= document.getElementById('pw-confirmar')?.value || '';

    if (!nombre)                    { SH.showAlert('alert-box', 'El nombre es obligatorio.', 'danger'); return; }
    if (!correo || !validarEmail(correo)) { SH.showAlert('alert-box', 'Correo inválido.', 'danger'); return; }
    if (!telefono || !validarTelefono(telefono)) { SH.showAlert('alert-box', 'Teléfono inválido (8-12 dígitos).', 'danger'); return; }

    const usuarios = SH.get(SH.KEYS.USUARIOS) || [];
    const idx = usuarios.findIndex(u => u.id === s.id);
    if (idx === -1) { SH.showAlert('alert-box', 'Usuario no encontrado.', 'danger'); return; }

    
    if (correo !== s.correo && usuarios.find(u => u.correo === correo && u.id !== s.id)) {
      SH.showAlert('alert-box', 'Ese correo ya está registrado por otro usuario.', 'danger'); return;
    }

    
    if (pwNueva || pwActual) {
      if (pwActual !== s.password) { SH.showAlert('alert-box', 'La contraseña actual es incorrecta.', 'danger'); return; }
      const pwErrs = validarPassword(pwNueva);
      if (pwErrs.length > 0) { SH.showAlert('alert-box', 'Nueva contraseña: ' + pwErrs.join(', ') + '.', 'danger'); return; }
      if (pwNueva !== pwConfirm) { SH.showAlert('alert-box', 'Las contraseñas nuevas no coinciden.', 'danger'); return; }
      usuarios[idx].password = pwNueva;
    }

    usuarios[idx].nombre   = nombre;
    usuarios[idx].correo   = correo;
    usuarios[idx].telefono = telefono;

    SH.set(SH.KEYS.USUARIOS, usuarios);
    SH.set(SH.KEYS.SESION, usuarios[idx]);

    
    setStat('perfil-nombre-display', nombre);
    setStat('perfil-correo-display', correo);
    renderNavbar();

    SH.showAlert('alert-box', '<i class="bi bi-check-circle-fill me-2"></i>Perfil actualizado correctamente.', 'success');

    
    ['pw-actual','pw-nueva','pw-confirmar'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  });
}
