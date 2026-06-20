import { useState, useEffect } from 'preact/hooks'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProducList } from './features/shop/ProductList'
import { Header } from './features/cart/Header'
import { Footer } from './features/shop/Footer'
import Login from './features/auth/LoginForm'
import { Checkout } from './features/checkout/Checkout'
import { PaymentGateway } from './features/payment/PaymentGateway'
import { SuccessPage } from './features/payment/SuccessPage'
import { ContactPage } from './features/contact/contact'
import { DonationView } from './features/donation/DonationView'
import { VolunteerView } from './features/voluntario/VolunteerView'
import { AdminNavbar } from './features/admin/dashboard/AdminNavbar'
import { AddProduct } from './features/admin/add/AddProduct'
import { ProductManagement } from './features/admin/editar/ProductManagement'
import { PaymentReview } from './features/admin/review/PaymentReview'
import { VerifiedHistory } from './features/admin/verify/VerifiedHistory'
import { API_ENDPOINTS } from './shared/api'
import { auth } from './shared/auth'


const CHECKOUT_SESSION_KEY = 'funavid_checkout_session';
const DONATION_SESSION_KEY = 'funavid_donation_amount';

const EMPTY_CHECKOUT_SESSION = {
  allProducts: [],
  total: 0,
  countProducts: 0,
  customerInfo: null,
};

const readCheckoutSession = () => {
  if (typeof window === 'undefined') {
    return EMPTY_CHECKOUT_SESSION;
  }

  try {
    const savedSession = sessionStorage.getItem(CHECKOUT_SESSION_KEY);

    if (!savedSession) {
      return EMPTY_CHECKOUT_SESSION;
    }

    const parsedSession = JSON.parse(savedSession);

    return {
      allProducts: Array.isArray(parsedSession?.allProducts)
        ? parsedSession.allProducts
        : [],
      total: Number(parsedSession?.total) || 0,
      countProducts: Number(parsedSession?.countProducts) || 0,
      customerInfo:
        parsedSession?.customerInfo &&
        typeof parsedSession.customerInfo === 'object'
          ? parsedSession.customerInfo
          : null,
    };
  } catch (error) {
    console.error('No se pudo recuperar la compra de la sesión:', error);
    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
    return EMPTY_CHECKOUT_SESSION;
  }
};

const saveCheckoutSession = (sessionData) => {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(
    CHECKOUT_SESSION_KEY,
    JSON.stringify(sessionData)
  );
};

const readDonationAmount = () => {
  if (typeof window === 'undefined') return 0;

  const savedAmount = Number(
    sessionStorage.getItem(DONATION_SESSION_KEY)
  );

  return Number.isFinite(savedAmount) && savedAmount > 0
    ? savedAmount
    : 0;
};


//guardar el estado global

export function App() {

  const [initialCheckoutSession] = useState(
    readCheckoutSession
  );

  // allProducts: Guarda la lista de productos del carrito.
  const [allProducts, setAllProducts] = useState(
    initialCheckoutSession.allProducts
  );

  // total: Guarda cuánto dinero suma el carrito.
  const [total, setTotal] = useState(
    initialCheckoutSession.total
  );

  // countProducts: Guarda cuántos ítems hay en total.
  const [countProducts, setCountProducts] = useState(
    initialCheckoutSession.countProducts
  );

  // isAuth: verifica si el usuario ingresÃ³ exitosamente. Se inicializa desde localStorage para persistencia.
  const [isAuth, setIsAuth] = useState(() => {
    return localStorage.getItem('isAuth') === 'true';
  });

  // user: diferencia si el que inicio sesion es admin o usuario. Se inicializa desde localStorage.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // donationAmount: Guarda temporalmente el monto de donación.
  const [donationAmount, setDonationAmount] = useState(
    readDonationAmount
  );

  // customerInfo: Guarda los datos de envío del cliente.
  const [customerInfo, setCustomerInfo] = useState(
    initialCheckoutSession.customerInfo
  );

  const navigate = useNavigate();

  const location = useLocation();
  useEffect(() => {
    if (user?.role === "admin" && !location.pathname.startsWith('/admin')) {
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem('isAuth');
      localStorage.removeItem('user');
      auth.clear();
      navigate('/login');
    }
  }, [location.pathname]);


  // Conserva el proceso de compra durante recargas de la pestaña.
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
      customerInfo,
    });
  }, [
    allProducts,
    total,
    countProducts,
    customerInfo,
  ]);

  useEffect(() => {
    if (donationAmount > 0) {
      sessionStorage.setItem(
        DONATION_SESSION_KEY,
        String(donationAmount)
      );
    } else {
      sessionStorage.removeItem(DONATION_SESSION_KEY);
    }
  }, [donationAmount]);

  const proceedToPayment = (data) => {
    const nextSession = {
      allProducts,
      total,
      countProducts,
      customerInfo: data,
    };

    // Se guarda inmediatamente antes de navegar para evitar
    // que una recarga pierda los datos de la compra.
    saveCheckoutSession(nextSession);
    setCustomerInfo(data);
    navigate('/payment');
  };

  const clearCheckoutSession = () => {
    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
    setAllProducts([]);
    setTotal(0);
    setCountProducts(0);
    setCustomerInfo(null);
  };

  // Crea un pedido y devuelve la orden creada.
  const recordPurchase = async (paymentProof) => {
    if (!customerInfo) {
      throw new Error(
        'No se encontraron los datos del cliente. Regresa al checkout e inténtalo nuevamente.'
      );
    }

    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      throw new Error(
        'El carrito está vacío. Regresa a la tienda y agrega productos.'
      );
    }

    if (!paymentProof) {
      throw new Error(
        'No se recibió el comprobante de pago.'
      );
    }

    const orderData = {
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      shippingAddress: customerInfo.address,
      shippingCity: customerInfo.city,
      shippingPostalCode: customerInfo.postalCode,
      paymentProof,
      items: allProducts.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    const response = await fetch(API_ENDPOINTS.ORDERS.LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const responseData = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      const message = Array.isArray(responseData?.message)
        ? responseData.message.join(', ')
        : responseData?.message;

      throw new Error(
        message ||
        `No se pudo crear el pedido. Código: ${response.status}`
      );
    }

    return responseData;
  };

  return (
    <Routes>
      {/* Rutas de Administrador */}
      {isAuth && user?.role === "admin" && (
        <Route path="/admin/*" element={
          <div className="flex flex-col min-h-screen">
            <AdminNavbar logout={() => {
              setIsAuth(false);
              setUser(null);
              localStorage.removeItem('isAuth');
              localStorage.removeItem('user');
              auth.clear();
              navigate('/login');
            }} />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<ProductManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="payments" element={<PaymentReview />} />
                <Route path="history" element={<VerifiedHistory />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </div>
          </div>
        } />
      )}

      {/* Ruta de Login */}
      <Route path="/login" element={
        isAuth && user?.role === "admin"
          ? <Navigate to="/admin" replace />
          : <Login setIsAuth={setIsAuth} setUser={setUser} />
      } />

      {/* Rutas PÃºblicas (Tienda) */}
      <Route path="*" element={
        <div className="flex flex-col min-h-screen">
          <Header
            allProducts={allProducts}
            setAllProducts={setAllProducts}
            total={total}
            setTotal={setTotal}
            countProducts={countProducts}
            setCountProducts={setCountProducts}
            onCheckout={() => navigate("/checkout")}
          />

          <div className="flex-grow">
            <Routes>
              <Route path="/" element={
                <ProducList
                  allProducts={allProducts}
                  setAllProducts={setAllProducts}
                  total={total}
                  setTotal={setTotal}
                  countProducts={countProducts}
                  setCountProducts={setCountProducts}
                />
              } />
              <Route path="/checkout" element={
                <Checkout
                  allProducts={allProducts}
                  total={total}
                  onProceedToPayment={proceedToPayment}
                  onBack={() => navigate("/")}
                />
              } />
              <Route path="/payment" element={
                allProducts.length > 0 && customerInfo ? (
                  <PaymentGateway
                    total={total}
                    onBack={() => navigate("/checkout")}
                    onSuccess={async (paymentProof) => {
                      await recordPurchase(paymentProof);
                      clearCheckoutSession();
                      navigate("/success", { replace: true });
                    }}
                  />
                ) : (
                  <Navigate to="/checkout" replace />
                )
              } />
              <Route path="/success" element={
                <SuccessPage
                  onContinue={() => {
                    clearCheckoutSession();
                    navigate("/");
                  }}
                />
              } />
              <Route path="/about" element={
                <ContactPage
                  onContinue={() => navigate("/")}
                />
              } />
              <Route path="/voluntario" element={
                <VolunteerView />
              } />
              <Route path="/donar" element={
                <DonationView
                  onProceed={(amount) => {
                    sessionStorage.setItem(
                      DONATION_SESSION_KEY,
                      String(amount)
                    );
                    setDonationAmount(amount);
                    navigate("/payment-donation");
                  }}
                />
              } />
              <Route path="/payment-donation" element={
                donationAmount > 0 ? (
                  <PaymentGateway
                    total={donationAmount}
                    onBack={() => navigate("/donar")}
                    onSuccess={async () => {
                      setDonationAmount(0);
                      sessionStorage.removeItem(
                        DONATION_SESSION_KEY
                      );
                      navigate(
                        "/success-donation",
                        { replace: true }
                      );
                    }}
                  />
                ) : (
                  <Navigate to="/donar" replace />
                )
              } />
              <Route path="/success-donation" element={
                <SuccessPage
                  title="¡Gracias por tu donación!"
                  message="Tu aporte ha sido procesado exitosamente y nos ayudará a seguir brindando servicios y productos médicos de calidad."
                  onContinue={() => {
                    setDonationAmount(0);
                    navigate("/");
                  }}
                />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />
        </div>
      } />
    </Routes>
  );
}
