import {Await} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {Suspense} from 'react';
import {useAside} from './Aside';

export function FloatingCart({cart}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={cart}>
        {(resolvedCart) => (
          <FloatingCartContent cart={resolvedCart} />
        )}
      </Await>
    </Suspense>
  );
}

function FloatingCartContent({cart}) {
  const optimisticCart = useOptimisticCart(cart);
  const {open, type} = useAside();
  const itemCount = optimisticCart?.totalQuantity ?? 0;
  
  if (type === 'cart') return null;
  if (itemCount < 1) return null;

  return (
    <button
      type="button"
      className="rch-floating-cart"
      onClick={() => open('cart')}
      aria-label={`Open cart with ${itemCount} items`}
    >
      <span className="rch-floating-cart-icon">
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H6" />
          <circle cx="10" cy="21" r="1" />
          <circle cx="18" cy="21" r="1" />
        </svg>
      </span>

      <span className="rch-floating-cart-text">View Cart</span>

      <span className="rch-floating-cart-count">
        {itemCount}
      </span>
    </button>
  );
}