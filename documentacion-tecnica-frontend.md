## Stack Tecnológico
* **Framework:** React (Vite)
* **Estilos:** Tailwind CSS
* **Cliente HTTP:** Fetch

## Directorio Raiz

* `/src`: Contiene todos los archivos del frontend.
* `/node_modules`: Contiene todas las dependencias del frontend.
* `/public`: Contiene todos los archivos públicos del frontend.
* `/tests`: Contiene todos los archivos de prueba del frontend.
* `/vite.config.ts`: Contiene la configuración de Vite.
* `/tsconfig.json`: Contiene la configuración de TypeScript.


## Organizacion interna
### /src
* `/features`: Contiene todos los elementos visuales y funcionales del sitio web como el checkout y carrito.

* `/admin`:contiene todo lo que conforma el admindashboard

* `/shop`:contiene todo lo que conforma la tienda virtual (productos, etc)

* `/payment`:contiene la pasarela de pago y la pagina de compra existosa.

* `/donation`:contiene la pagina de donaciones.

* `/contact`:contiene la pagina de contacto.

* `/checkout`: contiene el formulario para el pago de los productos.

* `/cart`: contiene el carrito de compra y navbar de la pagina web.

* `/auth`: contiene todo lo relacionado con el inicio de sesion del administrador.

* `/shared`: Contiene componentes reutilizables en la pagina web, en otras palabras elementos que se repiten en varias partes de la web como por ejemplo los aliados y los iconos de redes sociales.

* `/lib`: contiene funciones, tipos y configuraciones reutilizables que apoyan diferentes componentes del frontend. Sus archivos permiten centralizar la gestión de clases de Tailwind CSS, los estilos de los campos de formulario, los estados de error, foco y la configuración de colores.

* `/services`: Contiene los servicios que se utilizan para la comunicacion con el backend.

## Flujo de Datos y Estado.

El Flujo de Datos y Estado se refiere a cómo se mueve y se gestiona la información a lo largo de toda la aplicación. Determina:

- Dónde se guarda la información (estado local vs. estado global).
- Cómo los diferentes componentes comparten y modifican esa información.
- Cómo se obtienen los datos desde la base de datos (API).
- Cómo se manejan las cargas y los posibles errores.

En esencia, describe el ciclo de vida de los datos y cómo la aplicación reacciona a los cambios.

### Estado local de los componentes

El estado local es la información dinámica que un componente administra internamente. Se utiliza para almacenar datos que pueden cambiar durante la interacción del usuario y que, en principio, solo necesita ese componente.

El componente que declara el estado es responsable de leerlo y actualizarlo. Sin embargo, puede compartir su valor o su función de actualización con componentes hijos mediante propiedades (`props`).

Cuando el componente se desmonta, su estado local se elimina. Si el componente vuelve a montarse, el estado se inicializa nuevamente con su valor original, a menos que la información también se haya guardado en otro medio, como `localStorage`, `sessionStorage`, un contexto global o el backend.

**¿Dónde se utiliza en Funavid?**

El estado local se emplea para información que corresponde a una vista o componente específico, por ejemplo:

* Abrir o cerrar un menú, modal o formulario.
* Guardar temporalmente los datos introducidos en un formulario.
* Almacenar el texto de un buscador o filtro.
* Controlar mensajes de error o confirmación.
* Indicar si una petición está cargando.
* Guardar temporalmente un archivo o imagen seleccionada.
* Controlar qué producto se está editando.

**¿Cómo se declara?**

En componentes funcionales de React, normalmente se utiliza el hook `useState()`:

```javascript
const [isOpen, setIsOpen] = useState(false);
```

En este ejemplo:

* `isOpen` contiene el valor actual del estado.
* `setIsOpen` permite actualizarlo.
* `false` es su valor inicial.

Por ejemplo, para abrir un modal:

```javascript
setIsOpen(true);
```

Y para cerrarlo:

```javascript
setIsOpen(false);
```



### Estado compartido

El estado compartido es la información que necesita ser utilizada por varios componentes de la aplicación. En lugar de almacenar copias independientes de los mismos datos en cada componente, el estado se mantiene en un componente común y se distribuye a los componentes que lo necesitan.

Este mecanismo permite que diferentes componentes trabajen con la misma información y que los cambios realizados desde uno de ellos se reflejen en los demás.

**¿Dónde se utiliza en Funavid?**

En Funavid, el estado compartido se utiliza para manejar información que interviene en diferentes vistas o componentes de la tienda, por ejemplo:

* **Información del carrito de compras:** cuando un usuario agrega un producto desde el catálogo, los datos del carrito deben estar disponibles en otros componentes, como el indicador del carrito, la vista del carrito, el checkout y la pasarela de pago.

* **Datos del proceso de compra:** la información de los productos seleccionados, el valor total y algunos datos de la orden deben pasar por diferentes vistas durante el proceso de compra.

* **Estado de autenticación del administrador:** si la información de inicio de sesión se administra desde un componente superior y se entrega a varias vistas administrativas, también corresponde a un estado compartido.

**¿Cómo se maneja en Funavid?**

El estado compartido se maneja principalmente mediante la elevación del estado y el uso de propiedades (`props`).

Un componente padre declara y administra el estado mediante `useState()`. Después, pasa el valor del estado y, cuando es necesario, su función de actualización a los componentes hijos.

```javascript
const [allProducts, setAllProducts] = useState(
  initialCheckoutSession.allProducts
);
```

En este ejemplo:

* El componente padre mantiene el estado `allProducts`.
* El componente `Header` recibe los valores y sus funciones actualizadoras.
* El componente `Productlist` agrega artículos y actualiza la cantidad de productos y el valor total del carrito.
* Ambos componentes utilizan la misma fuente de información.

Cuando las propiedades deben pasar por varios niveles antes de llegar al componente que las necesita, se presenta un patrón conocido como **prop drilling**.

```text
App
└── Shop
    └── ProductList
        └── ProductCard
```

En este caso, un dato o una función puede declararse en `App` y pasar mediante `props` por los componentes intermedios hasta llegar a `ProductCard`.

El proyecto no utiliza Context API para administrar el estado compartido. Por lo tanto, la comunicación entre componentes se realiza principalmente mediante estados declarados en componentes superiores y datos enviados a través de `props`.


### Comunicación entre componentes mediante props

Los **props** —abreviatura de *properties*— son el mecanismo utilizado por React y Preact para enviar datos, funciones y configuraciones desde un componente hacia sus componentes descendientes.

El componente que recibe una prop puede leerla y utilizarla, pero no debe modificar directamente su valor. Cuando un componente hijo necesita producir un cambio, el componente propietario puede entregarle una función mediante props para que el hijo solicite la actualización.

#### Uso de props en Funavid

En el frontend de Funavid, las props se emplean principalmente para:

1. Compartir información del carrito entre diferentes componentes.
2. Entregar funciones que permiten agregar, eliminar o limpiar productos.
3. Configurar acciones de navegación, como continuar al checkout.
4. Comunicar estados visuales entre componentes de una misma sección.

#### Flujo principal del carrito

Los estados principales del carrito se crean en `App.jsx`:

```javascript
const [allProducts, setAllProducts] = useState(
  initialCheckoutSession.allProducts
);

const [total, setTotal] = useState(
  initialCheckoutSession.total
);

const [countProducts, setCountProducts] = useState(
  initialCheckoutSession.countProducts
);
```

El componente `App` es el propietario de estos estados y los distribuye mediante props a componentes como `Header`, `ProducList` y `Checkout`.

Por ejemplo, `App` entrega los datos del carrito a `Header`:

```jsx
<Header
  allProducts={allProducts}
  setAllProducts={setAllProducts}
  total={total}
  setTotal={setTotal}
  countProducts={countProducts}
  setCountProducts={setCountProducts}
  onCheckout={() => navigate("/checkout")}
/>
```

En este fragmento:

* `allProducts`, `total` y `countProducts` contienen los valores actuales.
* `setAllProducts`, `setTotal` y `setCountProducts` permiten solicitar actualizaciones.
* `onCheckout` contiene una acción de navegación.

El componente `Header` recibe estas propiedades en sus parámetros:

```javascript
export const Header = ({
  allProducts,
  setAllProducts,
  total,
  countProducts,
  setCountProducts,
  setTotal,
  onCheckout
}) => {
```

Después, `Header` transmite parte de esta información al componente `Cart`:

```jsx
<Cart
  active={active}
  allProducts={allProducts}
  setAllProducts={setAllProducts}
  total={total}
  setTotal={setTotal}
  countProducts={countProducts}
  setCountProducts={setCountProducts}
  onCheckout={onCheckout}
/>
```

El recorrido de los datos puede representarse así:

```text
App
│
│ Crea y administra el estado del carrito
│
└── Header
    │ Recibe y transmite las props
    │
    └── Cart
        Lee los datos y solicita actualizaciones
```

#### Props de datos y props de funciones

En el proyecto se pueden distinguir dos tipos principales de props.

**Props de datos:**

```jsx
allProducts={allProducts}
total={total}
countProducts={countProducts}
```

Permiten que el componente hijo consulte y muestre información.

**Props de funciones:**

```jsx
setAllProducts={setAllProducts}
setTotal={setTotal}
setCountProducts={setCountProducts}
onCheckout={onCheckout}
```

Permiten que el componente hijo solicite una acción o actualización.

Por ejemplo, `Cart` utiliza las funciones recibidas para vaciar el carrito:

```javascript
const onClearCart = () => {
  setAllProducts([]);
  setTotal(0);
  setCountProducts(0);
};
```

Aunque la función se ejecuta desde `Cart`, los estados siguen perteneciendo a `App`, porque allí fueron creados mediante `useState`.

#### Flujo de comunicación

```text
App crea el estado
        ↓
App pasa valores y funciones mediante props
        ↓
Header recibe y transmite las props
        ↓
Cart utiliza los valores
        ↓
Cart ejecuta una función actualizadora
        ↓
App actualiza el estado
        ↓
Los componentes reciben los nuevos valores
```

Este patrón permite mantener una única fuente de información para el carrito y evita que cada componente mantenga copias independientes de los mismos datos.


### Persistencia mediante `localStorage` y `sessionStorage`

El frontend de Funavid utiliza los mecanismos de almacenamiento del navegador `localStorage` y `sessionStorage` para conservar ciertos datos después de una recarga de la página.

Estos mecanismos no sustituyen el estado administrado con `useState`. Su función es guardar una copia de determinada información para recuperarla cuando la aplicación se inicia nuevamente.

La diferencia principal entre ambos es su duración:

* `localStorage` conserva los datos incluso después de cerrar el navegador.
* `sessionStorage` conserva los datos mientras permanezca abierta la pestaña o sesión actual del navegador.

#### Uso de `localStorage` en Funavid

En Funavid, `localStorage` se utiliza para conservar información relacionada con la autenticación del administrador.

El componente `App` recupera el estado de autenticación mediante la clave `isAuth`:

```javascript
const [isAuth, setIsAuth] = useState(() => {
  return localStorage.getItem('isAuth') === 'true';
});
```

También recupera la información del usuario mediante la clave `user`:

```javascript
const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem('user');
  return savedUser ? JSON.parse(savedUser) : null;
});
```

De esta forma, cuando la aplicación se recarga, puede verificar si existe una sesión administrativa y determinar el rol del usuario.

Cuando el administrador cierra la sesión o abandona el área administrativa, los datos se eliminan:

```javascript
localStorage.removeItem('isAuth');
localStorage.removeItem('user');
```

En `App.jsx` recupera y elimina estos datos. El almacenamiento inicial de las claves de autenticación se realiza en otra parte del flujo, como el componente o servicio encargado del inicio de sesión.

#### Uso de `sessionStorage` en Funavid

En Funavid, `sessionStorage` se utiliza para conservar temporalmente información relacionada con:

1. El proceso de compra.
2. El monto de una donación.
3. El identificador de la última orden creada.

Las claves utilizadas son:

```javascript
const CHECKOUT_SESSION_KEY = 'funavid_checkout_session';
const DONATION_SESSION_KEY = 'funavid_donation_amount';
const ORDER_CONFIRMATION_KEY = 'funavid_last_order_id';
```

#### Persistencia del proceso de compra

La sesión de compra almacena:

* Los productos agregados al carrito.
* El valor total de la compra.
* La cantidad total de productos.
* Los datos del cliente.

La información se recupera mediante:

```javascript
const savedSession = sessionStorage.getItem(
  CHECKOUT_SESSION_KEY
);
```

Como `sessionStorage` guarda los datos como texto, se utiliza `JSON.parse` para convertirlos nuevamente en un objeto:

```javascript
const parsedSession = JSON.parse(savedSession);
```

Estos datos recuperados se utilizan para inicializar los estados del carrito:

```javascript
const [allProducts, setAllProducts] = useState(
  initialCheckoutSession.allProducts
);

const [total, setTotal] = useState(
  initialCheckoutSession.total
);

const [countProducts, setCountProducts] = useState(
  initialCheckoutSession.countProducts
);

const [customerInfo, setCustomerInfo] = useState(
  initialCheckoutSession.customerInfo
);
```

Para guardar la sesión de compra se utiliza la función:

```javascript
const saveCheckoutSession = (sessionData) => {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(
    CHECKOUT_SESSION_KEY,
    JSON.stringify(sessionData)
  );
};
```

Un efecto observa los cambios en los datos del carrito y guarda una copia actualizada:

```javascript
useEffect(() => {
  const hasCheckoutData =
    allProducts.length > 0 ||
    total > 0 ||
    countProducts > 0 ||
    Boolean(customerInfo);

  if (!hasCheckoutData) {
    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
    return;
  }

  saveCheckoutSession({
    allProducts,
    total,
    countProducts,
    customerInfo
  });
}, [
  allProducts,
  total,
  countProducts,
  customerInfo
]);
```

Este proceso permite conservar la compra cuando el usuario recarga la pestaña durante el flujo de carrito, checkout o pago.

Cuando la compra termina o debe reiniciarse, se eliminan tanto la información almacenada como los estados correspondientes:

```javascript
const clearCheckoutSession = () => {
  sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
  setAllProducts([]);
  setTotal(0);
  setCountProducts(0);
  setCustomerInfo(null);
};
```

#### Persistencia del monto de donación

El monto de una donación también se conserva temporalmente en `sessionStorage`:

```javascript
sessionStorage.setItem(
  DONATION_SESSION_KEY,
  String(donationAmount)
);
```

Cuando el monto deja de ser válido o la donación termina, se elimina:

```javascript
sessionStorage.removeItem(
  DONATION_SESSION_KEY
);
```

Esto permite mantener el valor de la donación durante la navegación entre la vista de donación y la pasarela de pago.

#### Persistencia del identificador de la orden

Después de crear una compra, el identificador real de la orden se guarda temporalmente:

```javascript
sessionStorage.setItem(
  ORDER_CONFIRMATION_KEY,
  String(createdOrderId)
);
```

Este valor se utiliza para mostrar el número de confirmación en la página de compra exitosa:

```jsx
<SuccessPage orderId={lastOrderId} />
```

Cuando el usuario abandona la página de confirmación, el identificador se elimina:

```javascript
sessionStorage.removeItem(
  ORDER_CONFIRMATION_KEY
);
```

#### Flujo de persistencia

```text
Datos guardados en sessionStorage
              ↓
App recupera la información al iniciar
              ↓
useState inicializa el estado
              ↓
El usuario modifica el carrito o la compra
              ↓
React actualiza el estado
              ↓
useEffect guarda una copia actualizada
              ↓
Los datos se conservan durante una recarga
```

### Comunicación con las API

La comunicación con las API es el proceso mediante el cual el frontend de Funavid intercambia información con el backend y con servicios externos. A través de solicitudes HTTP, la aplicación puede consultar productos y categorías, autenticar al administrador, crear o eliminar categorías, actualizar productos y cargar imágenes.

En el frontend de Funavid, estas solicitudes se realizan con la función nativa `fetch`. Las respuestas del servidor generalmente se reciben en formato JSON y posteriormente se almacenan en estados de React o Preact para actualizar la interfaz.

#### Centralización de los endpoints

Las direcciones utilizadas para comunicarse con el backend se encuentran centralizadas en el archivo `api.js`.

```javascript
const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
  },

  PRODUCTS: {
    LISTWIMG: `${API_BASE_URL}/products/with-image`,
    LIST: `${API_BASE_URL}/products`,
    BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  },

  CUSTOMERS: {
    LIST: `${API_BASE_URL}/customers`,
    BY_ID: (id) => `${API_BASE_URL}/customers/${id}`,
  },

  ORDERS: {
    LIST: `${API_BASE_URL}/orders`,
    BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  },

  CATEGORY: {
    LIST: `${API_BASE_URL}/categories`,
    BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,
  },

  STORE_CONFIG: {
    CONFIG: `${API_BASE_URL}/store-config`,
    QR: `${API_BASE_URL}/store-config/qr`,
  },
};
```

Esta organización evita escribir manualmente las direcciones del backend en cada componente. También permite modificar la URL base desde un solo archivo si posteriormente el backend se despliega en otro servidor.

El flujo general puede representarse así:

```text
api.js
  ↓ define los endpoints

Componente o hook
  ↓ ejecuta fetch

Backend o servicio externo
  ↓ procesa la solicitud

Respuesta HTTP
  ↓ se convierte a JSON

Estado del frontend
  ↓ almacena los datos

Interfaz
  ↓ muestra los resultados
```

#### Consulta de productos y categorías

El componente `ProductList.jsx` consulta los productos y las categorías cuando se carga la tienda principal.

Para ello, utiliza `Promise.all`, que permite ejecutar ambas solicitudes al mismo tiempo:

```javascript
const [productsResponse, categoriesResponse] =
  await Promise.all([
    fetch(API_ENDPOINTS.PRODUCTS.LIST),
    fetch(API_ENDPOINTS.CATEGORY.LIST)
  ]);
```

En los archivos que no especifican un método HTTP como  `ProductList.jsx`, `fetch` utiliza `GET` de manera predeterminada.

Después, las respuestas se convierten a JSON:

```javascript
const productsData = await productsResponse
  .json()
  .catch(() => []);

const categoriesData = await categoriesResponse
  .json()
  .catch(() => []);
```

Finalmente, la información se guarda en los estados del componente:

```javascript
setProducts(productList);
setCategories(categoryList);
```

De esta manera, los productos obtenidos desde el backend pueden mostrarse en el catálogo y las categorías pueden utilizarse para filtrar la lista.

El proceso es:

```text
ProductList
  ↓ GET /products
  ↓ GET /categories

Backend
  ↓ responde con JSON

setProducts
setCategories
  ↓

La tienda muestra el catálogo
y los filtros por categoría
```

#### Autenticación del administrador

La comunicación para iniciar sesión se encuentra en el hook `useLoginForm.js`.

Cuando el administrador envía el formulario, el hook realiza una solicitud `POST` al endpoint de autenticación:

```javascript
const response = await fetch(
  API_ENDPOINTS.AUTH.LOGIN,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password
    }),
  }
);
```

El método `POST` se utiliza porque el frontend envía al backend las credenciales ingresadas.

La función `JSON.stringify` convierte el objeto JavaScript en texto JSON antes de enviarlo:

```javascript
{
  email,
  password
}
```

Si la autenticación es correcta, la respuesta se convierte a JSON:

```javascript
const data = await response.json();
```

Luego se almacenan el token y los datos del administrador:

```javascript
auth.setToken(data.access_token);
auth.setAdmin(data.admin);

setIsAuth(true);
setUser({
  ...data.admin,
  role: "admin"
});
```

También se conservan los datos básicos de autenticación en `localStorage`.

El flujo es:

```text
Formulario de inicio de sesión
  ↓ correo y contraseña

POST /auth/login
  ↓

Backend valida las credenciales
  ↓

Token y datos del administrador
  ↓

Estado de autenticación
y almacenamiento local
```

#### Gestión de categorías

El hook `useCategory.js` contiene las principales operaciones relacionadas con las categorías.

##### Consultar categorías

Para obtener la lista se realiza una solicitud `GET`:

```javascript
const response = await fetch(
  API_ENDPOINTS.CATEGORY.LIST,
  {
    headers: {
      ...auth.getAuthHeader()
    }
  }
);
```

La información recibida se normaliza y posteriormente se guarda en el estado:

```javascript
setCategories(categoryList);
```

##### Crear una categoría

Para crear una nueva categoría se utiliza `POST`:

```javascript
const response = await fetch(
  API_ENDPOINTS.CATEGORY.LIST,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...auth.getAuthHeader()
    },
    body: JSON.stringify({
      name: trimmedName
    })
  }
);
```

En este caso, el frontend envía al backend el nombre de la nueva categoría. Si la operación es exitosa, la categoría creada se agrega al estado o se vuelve a consultar la lista.

##### Eliminar una categoría

Para eliminar una categoría se construye una dirección que incluye su identificador:

```javascript
const categoryDeleteUrl =
  `${baseCategoryUrl}/${categoryId}`;
```

Luego se realiza una solicitud `DELETE`:

```javascript
const response = await fetch(
  categoryDeleteUrl,
  {
    method: 'DELETE',
    headers: {
      ...auth.getAuthHeader()
    }
  }
);
```

Cuando el backend confirma la eliminación, la categoría también se retira del estado del frontend mediante `filter`.

Por tanto, este hook utiliza:

```text
GET     → consultar categorías
POST    → crear categorías
DELETE  → eliminar categorías
```

#### Gestión de productos

El hook `useProductManagement.js` se encarga de consultar, modificar y eliminar productos.

##### Consultar productos

La lista de productos se obtiene mediante:

```javascript
const response = await fetch(
  API_ENDPOINTS.PRODUCTS.LIST
);
```

Después de procesar la respuesta, los productos se guardan en el estado:

```javascript
setProducts(
  Array.isArray(data)
    ? data
    : data?.products || []
);
```

##### Eliminar un producto

Para eliminar un producto se utiliza el endpoint dinámico `BY_ID`:

```javascript
API_ENDPOINTS.PRODUCTS.BY_ID(id)
```

Este genera una dirección similar a:

```text
http://localhost:3000/products/5
```

La solicitud utiliza el método `DELETE` e incluye el encabezado de autenticación:

```javascript
const response = await fetch(
  API_ENDPOINTS.PRODUCTS.BY_ID(id),
  {
    method: 'DELETE',
    headers: {
      ...auth.getAuthHeader()
    }
  }
);
```

Si la eliminación es exitosa, el producto también se retira del estado del frontend.

##### Actualizar un producto

La actualización se realiza con el método `PUT`:

```javascript
const response = await fetch(
  API_ENDPOINTS.PRODUCTS.BY_ID(editingId),
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...auth.getAuthHeader()
    },
    body: JSON.stringify(payload)
  }
);
```

El objeto `payload` contiene los datos actualizados:

```javascript
const payload = {
  name: editFormData.name?.trim(),
  description:
    editFormData.description?.trim() || '',
  price: Number(editFormData.price),
  stock: Number(editFormData.stock),
  imageUrl,
  categoryId
};
```

Cuando el backend devuelve el producto actualizado, el estado se modifica mediante `map`, reemplazando únicamente el elemento editado.

Por tanto, la gestión de productos utiliza:

```text
GET     → consultar productos
PUT     → actualizar productos
DELETE  → eliminar productos
```

#### Uso de la API externa de Cloudinary

Además del backend de Funavid, el frontend se comunica con Cloudinary para almacenar imágenes.

La imagen se agrega a un objeto `FormData`:

```javascript
const data = new FormData();

data.append('file', file);
data.append(
  'upload_preset',
  CLOUDINARY_UPLOAD_PRESET
);
```

Después se realiza una solicitud `POST` directamente a la API de Cloudinary:

```javascript
const response = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: 'POST',
    body: data
  }
);
```

En este caso no se utiliza `JSON.stringify`, porque se está enviando un archivo.

Cloudinary devuelve información sobre la imagen cargada y el frontend obtiene su URL segura:

```javascript
const result = await response.json();

return result.secure_url;
```

Esta dirección se incluye posteriormente en los datos del producto enviado al backend.

#### Encabezados de autenticación

Algunas operaciones administrativas del frontend incluyen:

```javascript
...auth.getAuthHeader()
```

La función `getAuthHeader` se encuentra definida en el archivo `shared/auth.js`. Su propósito es recuperar el token de autenticación almacenado en `localStorage` y construir el encabezado HTTP que se envía al backend.

```javascript
getAuthHeader: () => {
  const token = auth.getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}
```

La función primero obtiene el token mediante:

```javascript
auth.getToken()
```

Internamente, `getToken` consulta la clave `auth_token` almacenada en `localStorage`:

```javascript
getToken: () =>
  localStorage.getItem('auth_token')
```

Cuando existe un token, `getAuthHeader` devuelve un objeto con la siguiente estructura:

```javascript
{
  Authorization: `Bearer ${token}`
}
```

Por ejemplo:

```javascript
{
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

Este encabezado se incorpora a las solicitudes administrativas mediante el operador de propagación:

```javascript
headers: {
  'Content-Type': 'application/json',
  ...auth.getAuthHeader()
}
```

El resultado equivale a enviar encabezados como:

```javascript
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
}
```

El esquema `Bearer` indica que la solicitud contiene un token de acceso. El backend puede validar este token antes de permitir acciones protegidas, como crear o eliminar categorías, actualizar productos o eliminar productos.

Cuando no existe un token almacenado, la función devuelve un objeto vacío:

```javascript
{}
```

En ese caso, no se agrega el encabezado `Authorization` a la solicitud.

El flujo puede representarse así:

```text
Inicio de sesión exitoso
        ↓
El backend devuelve un token
        ↓
auth.setToken guarda el token
en localStorage
        ↓
Una operación administrativa
ejecuta auth.getAuthHeader()
        ↓
Se construye:
Authorization: Bearer <token>
        ↓
El backend valida la autorización
```

El archivo `auth.js` también administra otros datos relacionados con la autenticación:

```javascript
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_ADMIN_KEY = 'auth_admin';
```

El token se guarda mediante:

```javascript
setToken: (token) => {
  localStorage.setItem(
    AUTH_TOKEN_KEY,
    token
  );
}
```

Los datos del administrador se almacenan mediante:

```javascript
setAdmin: (admin) => {
  localStorage.setItem(
    AUTH_ADMIN_KEY,
    JSON.stringify(admin)
  );
}
```

Para cerrar la sesión, el método `clear` elimina ambos valores:

```javascript
clear: () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ADMIN_KEY);
}
```

Además, la función `isAuthenticated` comprueba si existe un token:

```javascript
isAuthenticated: () =>
  !!localStorage.getItem(AUTH_TOKEN_KEY)
```

#### Manejo de respuestas y errores

Después de ejecutar `fetch`, el código comprueba la propiedad:

```javascript
response.ok
```

Cuando su valor es `false`, se genera un error:

```javascript
if (!response.ok) {
  throw new Error(
    'No se pudieron cargar los productos.'
  );
}
```

También se utiliza:

```javascript
try {
  // Solicitud
} catch (error) {
  // Manejo del error
} finally {
  // Finalización del estado de carga
}
```

Este patrón permite:

* Detectar errores del servidor.
* Mostrar mensajes al administrador.
* Evitar que la aplicación se detenga.
* Controlar indicadores de carga.
* Mantener el estado del frontend sincronizado con la respuesta del backend.

#### Resumen de operaciones

| Recurso       | Operación       | Método HTTP | Endpoint o servicio |
| ------------- | --------------- | ----------: | ------------------- |
| Productos     | Consultar lista |       `GET` | `/products`         |
| Productos     | Actualizar      |       `PUT` | `/products/:id`     |
| Productos     | Eliminar        |    `DELETE` | `/products/:id`     |
| Categorías    | Consultar lista |       `GET` | `/categories`       |
| Categorías    | Crear           |      `POST` | `/categories`       |
| Categorías    | Eliminar        |    `DELETE` | `/categories/:id`   |
| Autenticación | Iniciar sesión  |      `POST` | `/auth/login`       |
| Imágenes      | Subir archivo   |      `POST` | API de Cloudinary   |


### Flujo de productos

El flujo de productos en Funavid describe cómo se obtienen, se muestran y se gestionan los productos a lo largo de toda la aplicación. Este flujo involucra varios componentes y procesos que trabajan juntos para ofrecer una experiencia de compra fluida al usuario.

**¿Cómo funciona en Funavid?**

En Funavid, el flujo de productos comienza cuando un componente (como la página de la tienda) solicita la lista de productos desde la API. Una vez obtenidos los datos, estos se pasan a través de una serie de componentes que se encargan de mostrarlos en diferentes formatos, como tarjetas de productos, listas desplegables o resultados de búsqueda. Además, cada producto puede tener diferentes estados, como "en stock" o "agotado", que afectan a su presentación y disponibilidad para el usuario.

**¿Cómo se ve?**

```javascript
// Componente que obtiene la lista de productos desde la API
import { useState, useEffect } from 'react';


function ProductsList() {
    const [products, setProducts] = useState([]);
    
    useEffect(() => {
        // Obtenemos los productos desde la API
        fetch('/api/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error('Error al obtener los productos:', error);
            });
    }, []);
    
    return (
        <div>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
```

### Flujo del carrito y checkout

El flujo del carrito y checkout en Funavid describe el proceso completo que sigue un usuario desde que agrega productos al carrito hasta que completa el proceso de pago. Este flujo involucra varios componentes y estados que trabajan juntos para ofrecer una experiencia de compra fluida y segura.

**¿Cómo funciona en Funavid?**

En Funavid, el flujo del carrito comienza cuando un usuario hace clic en el botón "Agregar al carrito" de un producto. El producto se agrega al estado del carrito, que se muestra en un componente de carrito flotante. El usuario puede continuar navegando y agregando más productos, y el carrito se actualiza automáticamente con los nuevos productos. Una vez que el usuario está listo para pagar, hace clic en el botón "Checkout", que lo lleva a una página de pago donde puede revisar su pedido, ingresar su información de envío y método de pago, y finalmente confirmar la compra.

**¿Cómo se ve?**

```javascript
// Componente del carrito
function Cart({ cart, addToCart, removeFromCart }) {
    return (
        <div>
            <h2>Carrito de compras</h2>
            {cart.length === 0 ? (
                <p>El carrito está vacío</p>
            ) : (
                <ul>
                    {cart.map(product => (
                        <li key={product.id}>
                            {product.name} - ${product.price}
                            <button onClick={() => removeFromCart(product.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```


### Flujo de comprobantes de pago

El flujo de comprobantes de pago en Funavid describe el proceso que sigue un usuario para gestionar y visualizar sus comprobantes de pago. Este flujo involucra componentes de carrito, checkout y visualización de comprobantes, así como la interacción con la API para obtener esta información.

**¿Cómo funciona en Funavid?**

En Funavid, el flujo de comprobantes de pago comienza cuando un usuario completa un pedido y procede al checkout. Una vez que el pago se ha procesado exitosamente, se genera un comprobante de pago que el usuario puede ver en una página dedicada o dentro de su perfil. Este comprobante contiene información detallada del pedido, como los productos comprados, el monto pagado, la fecha y hora, y los datos del cliente. El usuario puede descargar o imprimir este comprobante para sus registros.

**¿Cómo se ve?**

```javascript
// Componente que muestra los comprobantes de pago del usuario
import { useState, useEffect } from 'react';


function PaymentReceipts() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Obtenemos los comprobantes de pago del usuario desde la API
        fetch('/api/user/receipts')
            .then(response => {
                setReceipts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al obtener los comprobantes de pago:', error);
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return <div>Cargando comprobantes...</div>;
    }
    
    return (
        <div>
            <h2>Mis comprobantes de pago</h2>
            {receipts.length === 0 ? (
                <p>No tienes comprobantes de pago</p>
            ) : (
                <ul>
                    {receipts.map(receipt => (
                        <li key={receipt.id}>
                            <h3>Comprobante #{receipt.id}</h3>
                            <p>Fecha: {receipt.date}</p>
                            <p>Monto total: ${receipt.total}</p>
                            <a href={receipt.downloadUrl} target="_blank" rel="noopener noreferrer">
                                Descargar comprobante
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```


### Flujo del panel administrativo

El flujo del panel administrativo en Funavid describe el proceso que sigue un administrador para gestionar los productos, usuarios, pedidos y otros aspectos de la tienda. Este flujo involucra componentes del panel administrativo, manejo de roles, y operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para gestionar los datos de la tienda.

**¿Cómo funciona en Funavid?**

En Funavid, el flujo del panel administrativo comienza cuando un administrador inicia sesión y accede al panel de control. Desde allí, el administrador puede realizar diversas operaciones, como agregar nuevos productos, editar información de productos existentes, gestionar usuarios, ver y procesar pedidos, y generar reportes. Cada una de estas operaciones involucra componentes específicos, validaciones de permisos y comunicación con la API para realizar los cambios correspondientes.

**¿Cómo se ve?**

```javascript
// Componente del panel administrativo para gestionar productos
import { useState, useEffect } from 'react';


function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Obtenemos los productos desde la API
        fetch('/api/products')
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al obtener los productos:', error);
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return <div>Cargando productos...</div>;
    }
    
    return (
        <div>
            <h2>Gestión de productos</h2>
            <button onClick={() => openAddProductModal()}>Agregar producto</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>{product.stock}</td>
                            <td>
                                <button onClick={() => editProduct(product.id)}>Editar</button>
                                <button onClick={() => deleteProduct(product.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```


### Manejo de carga y errores

El manejo de carga y errores es un aspecto fundamental en cualquier aplicación web, ya que permite ofrecer una experiencia de usuario fluida y manejar situaciones inesperadas de manera elegante. En Funavid, esta técnica se utiliza para indicar al usuario cuando los datos se están cargando, mostrar mensajes de error cuando algo sale mal, y manejar diferentes estados de la aplicación de manera controlada.

**¿Cómo funciona en Funavid?**

En Funavid, el manejo de carga y errores se implementa en varios componentes de la aplicación. Por ejemplo, cuando el usuario navega a una página que requiere datos de la API, se muestra un indicador de carga mientras se obtienen los datos. Si ocurre un error durante la solicitud, se muestra un mensaje de error apropiado al usuario. Además, los componentes del carrito manejan diferentes estados, como el carrito vacío o con productos, y muestran mensajes informativos en cada caso.

**¿Cómo se ve?**

```javascript
// Componente que muestra un mensaje de carga o error
import { useState, useEffect } from 'react';


function DataDisplay() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        // Obtenemos datos desde la API
        fetch('/api/data')
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('Error al obtener los datos');
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return <div>Cargando...</div>;
    }
    
    if (error) {
        return <div>Error: {error}</div>;
    }
    
    return (
        <div>
            <h2>Datos cargados exitosamente</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
```
