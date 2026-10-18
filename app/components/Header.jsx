
import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {menu} = header;

  return (
    <header className="rch-header">
      <div className="rch-header-inner">
        <NavLink
          prefetch="intent"
          to="/"
          end
          className="rch-brand"
          aria-label="Resin Craft Home — Home"
        >
          <img
            src="/orgLogo.png"
            alt="Resin Craft Home"
            className="rch-brand-logo"
          />
        </NavLink>

        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />

        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const {close} = useAside();
  const className = `rch-nav rch-nav-${viewport}`;

  return (
    <nav className={className} aria-label="Main navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        let url = item.url;

        if (
          url.includes('myshopify.com') ||
          (publicStoreDomain && url.includes(publicStoreDomain)) ||
          (primaryDomainUrl && url.includes(primaryDomainUrl))
        ) {
          try {
            url = new URL(url).pathname;
          } catch {
            // Keep the original URL if it cannot be parsed.
          }
        }

        return (
          <NavLink
            key={item.id}
            to={url}
            end
            prefetch="intent"
            onClick={close}
            className={({isActive}) =>
              `rch-nav-link${isActive ? ' is-active' : ''}`
            }
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="rch-header-actions" aria-label="Store actions">
      <HeaderMenuMobileToggle />

      <NavLink
        prefetch="intent"
        to="/account"
        className="rch-action-link rch-account-link"
      >
        <Suspense fallback="Account">
          <Await resolve={isLoggedIn} errorElement="Account">
            {(loggedIn) => (loggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>

      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();

  return (
    <button
      type="button"
      className="rch-mobile-toggle"
      onClick={() => open('mobile')}
      aria-label="Open navigation menu"
    >
      <span />
      <span />
      <span />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();

  return (
    <button
      type="button"
      className="rch-action-button"
      onClick={() => open('search')}
      aria-label="Open search"
    >
      Search
    </button>
  );
}

function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      className="rch-cart-link"
      href="/cart"
      aria-label={`Shopping bag, ${count} items`}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        open('cart');

        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url:
            typeof window !== 'undefined'
              ? window.location.href
              : '/cart',
        });
      }}
    >
      <span>Bag</span>
      <span className="rch-cart-count">{count}</span>
    </a>
  );
}

function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);

  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  items: [
    {id: 'home', title: 'Home', url: '/'},
    {id: 'shop', title: 'Shop', url: '/collections'},
    {id: 'story', title: 'Our Story', url: '/pages/about'},
    {id: 'journal', title: 'Journal', url: '/blogs/journal'},
  ],
};
