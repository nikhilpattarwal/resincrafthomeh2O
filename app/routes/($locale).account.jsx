
import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;

  const {data, errors} = await customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
    {
      variables: {
        language: customerAccount.i18n.language,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const heading = customer?.firstName
    ? `Welcome, ${customer.firstName}`
    : 'Welcome to your account';

  return (
    <main className="rch-account-shell">
      <header className="rch-account-welcome">
        <h1>{heading}</h1>
        <p>Manage your orders, personal details, and delivery addresses.</p>
      </header>

      <AccountMenu />

      <div className="rch-account-content">
        <Outlet context={{customer}} />
      </div>
    </main>
  );
}



function AccountMenu() {
  const links = [
    {to: '/account/orders', label: 'Orders'},
    {to: '/account/profile', label: 'Profile'},
    {to: '/account/addresses', label: 'Addresses'},
  ];

  return (
    <nav className="rch-account-nav" aria-label="Account navigation">
      <div className="rch-account-nav-links">
        {links.map(({to, label}) => (
          <NavLink
            key={to}
            to={to}
            end
            prefetch="intent"
            className={({isActive, isPending}) =>
              `rch-account-nav-link${isActive ? ' is-active' : ''}${
                isPending ? ' is-pending' : ''
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <Logout />
    </nav>
  );
}


function Logout() {
  return (
    <Form
      className="rch-account-logout"
      method="POST"
      action="/account/logout"
    >
      <button type="submit">Sign out</button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
