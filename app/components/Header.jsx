
import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {Image, useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {DiwaliAnnouncement} from '~/components/DiwaliAnnouncement';
import {Search, UserRound, ShoppingBag} from 'lucide-react';
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
          <Image
            src="/orgLogo.png"
            alt="Resin Craft Home"
            className="rch-brand-logo"
            sizes="(max-width: 768px) 100vw, 50vw"
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
        <DiwaliAnnouncement />
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
        className="rch-action-button rch-account-link"
        aria-label="Sign in or view account"
        title="Account"
      >
        <Suspense fallback={<UserRound size={21} />}>
          <Await resolve={isLoggedIn} errorElement={<UserRound size={21} />}>
            {(loggedIn) => (
              <UserRound
                size={21}
                className={loggedIn ? 'rch-icon-account' : 'rch-icon-signin'}
              />
            )}
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
      className="rch-action-button rch-search-button"
      onClick={() => open('search')}
      aria-label="Open search"
      title="Search"
    >
      <Search size={21} />
    </button>
  );
}

function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      type="button"
      className="rch-cart-link"
      aria-label={`Shopping bag, ${count} items`}
      title="Shopping bag"
      onClick={() => {
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
      <ShoppingBag size={22} className="rch-icon-bag" />
      <span className="rch-cart-count">{count}</span>
    </button>
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
