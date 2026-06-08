# SportHub Reservas

**Plataforma web para reserva de canchas deportivas**  
Proyecto académico — DSY2202 Semana 3

---

## Descripción

SportHub Reservas es una aplicación web front-end que permite a usuarios reservar canchas deportivas (fútbol, pádel, tenis y básquetbol) de forma simulada. No utiliza backend real; todos los datos se gestionan con arrays de JavaScript y `localStorage`.

---

## Credenciales de prueba

| Rol            | Correo                  | Contraseña     |
|----------------|-------------------------|----------------|
| Administrador  | admin@sporthub.cl       | Admin123!      |
| Cliente        | cliente@sporthub.cl     | Cliente123!    |

---

## Funcionalidades implementadas

### Autenticación
- Inicio de sesión con validación de credenciales
- Registro de nuevos usuarios con validaciones completas
- Recuperar contraseña (simulada)
- Modificación de perfil con cambio de contraseña opcional
- Cierre de sesión
- Protección de rutas según rol

### Cliente
- Visualizar catálogo de canchas con filtros (tipo, búsqueda, disponibilidad)
- Ver detalle completo de cada cancha
- Seleccionar fecha y horario disponible
- Agregar reserva al carrito
- Confirmar reserva con pago simulado
- Ver comprobante de reserva exitosa
- Historial de reservas con estadísticas
- Cancelar reservas activas

### Administrador
- Dashboard con estadísticas en tiempo real
- Crear, editar y eliminar canchas
- Ver lista de clientes registrados con eliminación
- Ver y filtrar todas las reservas del sistema
- Cancelar reservas desde el panel
- Gestionar disponibilidad de horarios por cancha y fecha (bloquear/desbloquear)

---

## Tecnologías utilizadas

| Tecnología        | Versión  | Uso                          |
|-------------------|----------|------------------------------|
| HTML5             | —        | Estructura semántica         |
| CSS3              | —        | Estilos personalizados       |
| Bootstrap         | 5.3.2    | Grid, componentes, responsive|
| Bootstrap Icons   | 1.11.3   | Iconografía                  |
| JavaScript (ES6+) | —        | Lógica de negocio completa   |
| localStorage      | —        | Persistencia de datos        |

---

## Estructura del proyecto

```
frontend/
├── index.html              — Página principal (Home)
├── login.html              — Inicio de sesión
├── registro.html           — Registro de usuarios
├── recuperar.html          — Recuperar contraseña
├── perfil.html             — Modificar perfil
├── canchas.html            — Catálogo de canchas
├── detalle-cancha.html     — Detalle + reserva de cancha
├── carrito.html            — Resumen de reserva y pago
├── pago-exitoso.html       — Confirmación de pago
├── mis-reservas.html       — Historial del cliente
├── admin.html              — Dashboard administrador
├── admin-canchas.html      — Mantenedor de canchas
├── admin-usuarios.html     — Mantenedor de usuarios
├── admin-horarios.html     — Mantenedor de horarios
├── admin-reservas.html     — Listado de reservas
├── assets/
│   ├── css/
│   │   └── styles.css      — Estilos personalizados
│   └── js/
│       ├── app.js          — Núcleo: localStorage, navbar, utils
│       ├── auth.js         — Autenticación y perfil
│       ├── canchas.js      — Catálogo y detalle
│       ├── reservas.js     — Carrito, pago e historial
│       └── admin.js        — Panel administrador
├── README.md
└── .gitignore
```

---

## Instrucciones para ejecutar

1. Descarga o descomprime el proyecto.
2. Abre el archivo `index.html` directamente en tu navegador (Chrome, Edge, Firefox).
3. No requiere servidor, instalación de dependencias ni conexión a internet (Bootstrap carga desde CDN).
4. Los datos se guardan automáticamente en `localStorage` del navegador.
5. Para resetear todos los datos, abre la consola del navegador y ejecuta:
   ```js
   localStorage.clear(); location.reload();
   ```

---

## Validaciones implementadas

### Registro
- Nombre obligatorio
- Correo obligatorio con formato válido
- Teléfono obligatorio (8-12 dígitos)
- Contraseña mínimo 8 caracteres
- Contraseña con al menos una mayúscula
- Contraseña con al menos un número
- Contraseña con al menos un carácter especial
- Confirmación de contraseña debe coincidir
- Correo no puede estar duplicado

### Login
- Correo obligatorio y con formato válido
- Contraseña obligatoria
- Validación contra usuarios en localStorage
- Redirección automática si ya hay sesión activa

### Perfil
- Validación de nombre, correo y teléfono
- Verificación de contraseña actual al cambiar contraseña
- Nueva contraseña cumple requisitos de seguridad

### Canchas (admin)
- Nombre obligatorio
- Tipo de cancha obligatorio
- Precio mayor a 0
- Estado obligatorio

### Reservas
- Fecha obligatoria
- Hora obligatoria
- No permite reservar horarios ya ocupados
- No permite reservar horarios bloqueados por admin
- No permite confirmar pago sin reserva en carrito

---

## Checklist de cumplimiento

- [x] HTML, CSS, Bootstrap 5 y JavaScript puro
- [x] Responsive en móvil, tablet y escritorio
- [x] Grid Bootstrap de 12 columnas
- [x] Login con validaciones
- [x] Registro con validaciones completas
- [x] Recuperar contraseña (simulada)
- [x] Modificar perfil con cambio de contraseña
- [x] Dos roles: cliente y administrador
- [x] Menú diferente según el rol (navbar dinámica)
- [x] Protección de rutas (requireAuth)
- [x] Formularios con validaciones JS
- [x] Catálogo de canchas con filtros
- [x] Detalle de cancha con selección de horario
- [x] Carrito con resumen de reserva
- [x] Pago simulado (sin WebPay ni pago real)
- [x] Página de confirmación de pago
- [x] Historial de reservas del cliente
- [x] Cancelación de reservas
- [x] Panel administrador con dashboard
- [x] Mantenedor de canchas (CRUD)
- [x] Mantenedor de usuarios (lectura + eliminación)
- [x] Mantenedor de horarios/disponibilidad (bloqueo por fecha/hora)
- [x] Listado de reservas con filtros
- [x] Cancelación de reservas desde admin
- [x] Uso de localStorage para todos los datos
- [x] Datos iniciales simulados al cargar
- [x] Diseño moderno deportivo (azul/verde/blanco)
- [x] Bootstrap alerts y toast notifications
- [x] README completo
- [x] Proyecto listo para comprimir en ZIP

---

## Datos iniciales

Al abrir el proyecto por primera vez, se crean automáticamente:

**Usuarios:**
- Administrador: `admin@sporthub.cl` / `Admin123!`
- Cliente demo: `cliente@sporthub.cl` / `Cliente123!`

**Canchas:**
- Cancha Fútbol Premium (⚽) — $20.000/hr — 22 personas
- Cancha Pádel Central (🎾) — $12.000/hr — 4 personas
- Cancha Tenis Club (🎾) — $15.000/hr — 4 personas
- Cancha Básquetbol Arena (🏀) — $10.000/hr — 10 personas

**Horarios disponibles:** 08:00 a 21:00 (cada hora, 14 slots por día)

---

© 2026 SportHub Reservas — DSY2202 Semana 3
