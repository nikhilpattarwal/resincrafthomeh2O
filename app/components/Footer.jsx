
import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';

export function Footer({footer: footerPromise, header, publicStoreDomain}) {
const groups = [
  {
    title: 'EXPLORE',
    links: [
      {label: 'Home', to: '/'},
      {label: 'Shop all products', to: '/collections/all'},
      {label: 'Search', to: '/search'},
    ],
  },
  {
    title: 'HELP',
    links: [
      {label: 'Contact us', to: '/pages/contact-us'},
      {label: 'Shipping', to: '/pages/shipping'},
      {label: 'Returns & refunds', to: '/pages/returns-refund'},
    ],
  },
  {
    title: 'INFORMATION',
    links: [
      {label: 'Our story', to: '/pages/our-story'},
      {label: 'Privacy policy', to: '/pages/privacy-policy'},
      {label: 'Terms of service', to: '/pages/terms-of-service'},
    ],
  },
];

  return (
    <footer className="footer rch-footer">
      <div className="rch-footer-brand">
        <NavLink to="/" className="rch-footer-logo">
          Resin Craft Home
        </NavLink>
        <p>
          Handcrafted resin keepsakes for the people,
          <br />
          places, and moments you want to hold onto.
        </p>
      </div>

      {groups.map((group) => (
        <nav
          className="rch-footer-column"
          aria-label={group.title}
          key={group.title}
        >
          <h2>{group.title}</h2>
          <ul>
            {group.links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ))}

      <Suspense fallback={null}>
        <Await resolve={footerPromise}>
          {(footer) =>
            footer?.menu ? (
              <div className="rch-footer-shopify-menu">
                <ShopifyFooterMenu
                  menu={footer.menu}
                  header={header}
                  publicStoreDomain={publicStoreDomain}
                />
              </div>
            ) : null
          }
        </Await>
      </Suspense>
    </footer>
  );
}

function ShopifyFooterMenu({menu, header, publicStoreDomain}) {
  const primaryDomainUrl = header?.shop?.primaryDomain?.url;

  return (
    <nav aria-label="Additional store links">
      {menu.items.map((item) => {
        if (!item.url) return null;

        let url = item.url;

        try {
          const parsed = new URL(item.url);
          if (
            parsed.hostname.endsWith('myshopify.com') ||
            (publicStoreDomain && parsed.hostname === publicStoreDomain) ||
            (primaryDomainUrl &&
              parsed.hostname === new URL(primaryDomainUrl).hostname)
          ) {
            url = parsed.pathname + parsed.search + parsed.hash;
          }
        } catch {
          // Keep relative links unchanged.
        }

        return url.startsWith('/') ? (
          <NavLink to={url} key={item.id}>
            {item.title}
          </NavLink>
        ) : (
          <a href={url} key={item.id} rel="noopener noreferrer">
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}
