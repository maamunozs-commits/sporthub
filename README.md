# SportHub

Aplicacion FrontEnd desarrollada en Angular para la evaluacion de la Semana 6. El sistema permite reservar canchas deportivas, simular el pago de una reserva y administrar canchas, horarios, usuarios y reservas desde un panel de administracion.

## Datos del proyecto

- Asignatura: DSY2202
- Evaluacion: Experiencia 1 / Semana 6
- Alumno: Matias Munoz
- Framework: Angular 20
- UI: Bootstrap 5 + Bootstrap Icons
- Documentacion tecnica: Compodoc
- Persistencia: LocalStorage
- Pruebas unitarias: Jasmine + Karma

## Funcionalidades principales

- Inicio publico con informacion del servicio y canchas destacadas.
- Menu de navegacion con rutas publicas, cliente y administrador.
- Registro de usuarios con formulario reactivo y validaciones.
- Inicio de sesion con roles de cliente y administrador.
- Recuperacion de contrasena simulada.
- Catalogo de canchas con filtros por texto, deporte y precio.
- Detalle de cancha con horarios disponibles.
- Carrito de reserva.
- Simulacion de pago.
- Confirmacion de pago exitoso.
- Vista de reservas del cliente.
- Perfil de usuario editable.
- Panel administrador con resumen general.
- Mantenedor de canchas.
- Gestion visual de horarios.
- Listado de usuarios registrados.
- Monitoreo de reservas.

## Cuentas de prueba

Administrador:

```text
correo: admin@sporthub.cl
password: Admin123
```

Cliente:

```text
correo: cliente@sporthub.cl
password: Cliente123
```

Tambien se pueden registrar nuevos clientes desde la pantalla de registro.

## Instalacion

Instalar dependencias:

```bash
npm install
```

## Ejecutar la aplicacion

Iniciar servidor de desarrollo:

```bash
npm start
```

Abrir en el navegador:

```text
http://localhost:4200/
```

Si el puerto 4200 esta ocupado, Angular puede ofrecer otro puerto.

## Pruebas unitarias

La pauta solicita 4 pruebas unitarias. Este proyecto deja exactamente 4 pruebas unitarias en:

```text
src/app/pauta-cuatro-pruebas.spec.ts
```

Ejecutar pruebas:

```bash
npm run test:ci
```

Resultado esperado:

```text
TOTAL: 4 SUCCESS
```

Las 4 pruebas cubren:

- Validador de rut chileno.
- Validador de contrasena segura.
- Formato de precio en CLP.
- Seleccion de imagen segun tipo de cancha.

## Documentacion tecnica

La documentacion se genera con Compodoc.

Generar documentacion:

```bash
npm run docs
```

Ver documentacion en navegador:

```bash
npm run docs:serve
```

Abrir:

```text
http://localhost:8080/
```

En la documentacion se pueden revisar componentes, servicios, modelos, pipes, directivas y pruebas.

## Build de produccion

Generar build:

```bash
npm run build
```

Angular genera la version compilada dentro de la carpeta:

```text
dist/
```

## Estructura principal

```text
src/app/
  components/       Componentes reutilizables
  directives/       Directivas personalizadas
  guards/           Proteccion de rutas por sesion y rol
  layouts/          Layout publico y layout administrador
  models/           Interfaces del dominio
  pages/            Pantallas de la aplicacion
  pipes/            Pipes de formato
  services/         Logica de datos, sesion, reservas y notificaciones
  shared/           Validadores y helpers compartidos
```

## Rutas importantes

- `/` inicio
- `/canchas` catalogo de canchas
- `/canchas/:id` detalle de cancha
- `/carrito` carrito de reserva
- `/pago-exitoso` confirmacion de pago
- `/mis-reservas` reservas del cliente
- `/perfil` perfil del cliente
- `/login` inicio de sesion
- `/registro` registro de cliente
- `/recuperar` recuperacion de contrasena
- `/admin` dashboard administrador
- `/admin/canchas` mantenedor de canchas
- `/admin/usuarios` usuarios
- `/admin/reservas` reservas
- `/admin/horarios` horarios

## Archivos que no se deben incluir manualmente en la entrega

Estas carpetas son generadas o instaladas y no forman parte del codigo fuente:

- `node_modules/`
- `.angular/`
- `dist/`
- `documentation/`

Si se necesitan, se regeneran con los comandos indicados en este README.

## Entrega sugerida

Comprimir la carpeta del proyecto sin `node_modules/`. El profesor puede ejecutar:

```bash
npm install
npm start
npm run test:ci
npm run docs
```

Con eso puede revisar la aplicacion, las pruebas unitarias y la documentacion tecnica.
