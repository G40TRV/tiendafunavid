import { useState } from 'preact/hooks'
import { Navbar } from './../shop/Navbar'
import { CartIcon } from '../../shared/CartIcon'
import { Cart } from './Cart'

//Header: Componente integrador que reune el Navbar compartido y las funcionalidades del carrito.
export const Header = ({
    allProducts,
    setAllProducts,
    total,
    countProducts,
    setCountProducts,
    setTotal,
    onCheckout
}) => {
    // active: Nos dice si la ventanilla flotante del carrito estÃ¡ abierta o cerrada.
    const [active, setActive] = useState(false);

    // boton para abrir y cerrar el carrito
    return (
        <Navbar>
            {/* icono del carrito que abre el carrito*/}
            <CartIcon active={active} setActive={setActive} countProducts={countProducts} />
            {/* carrito */}
            <Cart
                active={active}
                allProducts={allProducts}
                setAllProducts={setAllProducts}
                total={total}
                setTotal={setTotal}
                countProducts={countProducts}
                setCountProducts={setCountProducts}
                onCheckout={() => {
                    setActive(false);
                    onCheckout();
                }}
            />
        </Navbar>
    )
};
