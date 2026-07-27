# Tienda funavid - Frontend
Frontend de la tienda virtual de Funavid.
## Este es un subtítulo

## Descripcion
Sistema de tienda online donde:
* El administrador puede crear productos, categorías y editar la página de inicio.
* El cliente puede navegar por los productos, agregarlos al carrito, realizar pedidos y pagar con transferencia bancaria.
* El administrador puede ver los pedidos y verificar los pagos.

## Requisitos

* pnpm (o npm)
* React 18.3.1
* React DOM 18.3.1
* React Router DOM 7.15.1
* Vite 7.3.3
* Tailwind CSS 3.4.19
* PostCSS 8.5.14
* Autoprefixer 10.5.0

## instalacion

## Instalación de dependencias

Para instalar las dependencias del proyecto, primero asegúrate de tener instalado **Node.js** y **pnpm** (o **npm**).

Luego, dentro de la carpeta principal del proyecto, ejecuta el siguiente comando:

```bash
pnpm install
```

Puedes verificar si están instalados con los siguientes comandos:

```bash
pnpm list --depth=0
```

## Ejecución

Dentro de la carpeta principal del proyecto, ejecuta el siguiente comando:

```bash
pnpm dev
```
## Estructura del proyecto

```bash
tiendafunavid/
├── public
├── src
│   ├── features
│   │   ├── admin
│   │   │   ├── add
│   │   │   │   └── AddProduct.jsx
│   │   │   ├── dashboard
│   │   │   │   ├── AdminNavbar.jsx
│   │   │   │   └── DashboardBase.jsx
│   │   │   ├── editar
│   │   │   │   ├── ProductManagement.jsx
│   │   │   │   └── useProductManagement.js
│   │   │   ├── review
│   │   │   │   └── PaymentReview.jsx
│   │   │   └── verify
│   │   │       ├── HistoryFilters.jsx
│   │   │       └── VerifiedHistory.jsx
│   │   ├── auth
│   │   │   ├── LoginForm.jsx
│   │   │   ├── login.css
│   │   │   └── useLoginForm.js
│   │   ├── cart
│   │   │   ├── Cart.jsx
│   │   │   └── Header.jsx
│   │   ├── checkout
│   │   │   └── Checkout.jsx
│   │   ├── contact
│   │   │   ├── camara.png
│   │   │   ├── contact.jsx
│   │   │   ├── familia.png
│   │   │   └── organizacion.png
│   │   ├── donation
│   │   │   └── DonationView.jsx
│   │   ├── payment
│   │   │   ├── PaymentGateway.jsx
│   │   │   ├── SuccessPage.jsx
│   │   │   └── qr.png
│   │   ├── shop
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── banner.png
│   │   │   └── useProductList.js
│   │   └── voluntario
│   │       └── VolunteerView.jsx
│   ├── lib
│   │   ├── charUtils.ts
│   │   └── utils.ts
│   ├── shared
│   │   ├── aliados
│   │   │   ├── Escudo_septima_division.png
│   │   │   ├── LOGO-BANQUETES-SAN-PIO-150x150.png
│   │   │   ├── Logo_HUSVP-150x150.png
│   │   │   ├── Logo_Ind_Inc-150x150.png
│   │   │   ├── Pintuco.png
│   │   │   ├── acuario-rodadero.png
│   │   │   ├── escudo-policia_3.png
│   │   │   ├── escudocacom5.png
│   │   │   ├── hello-burguer.png
│   │   │   ├── la-estancia.png
│   │   │   ├── logo-acoplame-web.png
│   │   │   ├── logo-alco.png
│   │   │   ├── logo-calidad-humana.png
│   │   │   ├── logo-construcciones-mundial-02.png
│   │   │   ├── logo-ddi.png
│   │   │   ├── logo-la-mayorista.png
│   │   │   ├── logo-saciar.png
│   │   │   ├── logo-sin-remordimiento.png
│   │   │   ├── logo-streetcars-150x150.png
│   │   │   ├── logo_Fundacion_epm-150x150.png
│   │   │   ├── logo_Luis_Alfonso-150x150.png
│   │   │   ├── logo_alianza.png
│   │   │   ├── poblautos.png
│   │   │   ├── sixt.png
│   │   │   └── webs-inn-logo.png
│   │   ├── AdminPurchaseCard.jsx
│   │   ├── AlliesSection.jsx
│   │   ├── CartIcon.jsx
│   │   ├── ImageModal.jsx
│   │   ├── ProductCard.jsx
│   │   ├── TestimonialCard.jsx
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── data.js
│   ├── app.jsx
│   ├── index.css
│   └── main.jsx
├── tiendafunavid-main
│   └── src
│       ├── features
│       │   ├── admin
│       │   │   ├── add
│       │   │   ├── dashboard
│       │   │   ├── editar
│       │   │   ├── review
│       │   │   └── verify
│       │   ├── auth
│       │   ├── cart
│       │   ├── checkout
│       │   ├── contact
│       │   ├── donation
│       │   ├── payment
│       │   ├── shop
│       │   └── voluntario
│       ├── lib
│       └── shared
│           └── aliados
├── .gitignore
├── README.md
├── db.json
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
## Funcionalidades principales

- Carrito de compras.
- agregar productos al carrito
- eliminar productos del carrito
- ver el detalle del carrito
- ver el total del carrito
- Formulario de checkout
- insertar información de envío
- pasarela de pago
- insertar imagen de factura de pago
- pagina de compra exitosa
- pagina sobre la organizacion
- pagina de donación
- Panel administrativo
- gestionar productos desde el panel administrativo
- crear y agregar nuevos productos.
- editar y eliminar productos.
- eliminar categorias.
- crear categorias.
- editar categorias.
- subir imagenes de los productos.
- eliminar imagenes de los productos.
- ver el historial de pedidos.
- verificar pagos.
- confirmar pagos.
- rechazar pagos.
- marcar pagos como verificados.
- ver el historial de pagos.

## Rutas principales
- / : pagina principal
- /checkout : checkout
- /payment : pasarela de pago
- /success : compra exitosa
- /donation : donación
- /contact : contacto
- /login : login
- /admin : panel administrativo
- /admin/add-product : agregar producto
- /admin/payments : pagos
- /admin/history : historial de pagos

## Conexión con el backend

El frontend está diseñado para conectarse con una API backend encargada de gestionar productos, órdenes de compra, clientes y comprobantes de pago. Algunas vistas, como el listado de productos, el checkout y el panel administrativo, dependen de los datos enviados por el backend.

## Equipo de desarrollo

- Frontend: Alejandro Gaona Trujillo
- Backend: Julio Cesar Rosero Mejia