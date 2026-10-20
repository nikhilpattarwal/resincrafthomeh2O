import {redirect, useLoaderData} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  // const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';
  const fulfillments = order.fulfillments?.nodes ?? [];

  const fulfillmentStatus =
    fulfillments[0]?.status ?? order.fulfillmentStatus ?? 'N/A';

  const trackingInfo = fulfillments.flatMap(
    (fulfillment) => fulfillment.trackingInfo ?? [],
  );

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}


export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
    trackingInfo,
  } = useLoaderData();

  return (
    <div className="account-order">
      <h2>Order {order.name}</h2>
      <p>
        Placed on {new Date(order.processedAt).toDateString()}
      </p>

      {order.confirmationNumber && (
        <p>Confirmation: {order.confirmationNumber}</p>
      )}

      <div className="rch-order-items">
        <table>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Price</th>
              <th scope="col">Quantity</th>
              <th scope="col">Total</th>
            </tr>
          </thead>

          <tbody>
            {lineItems.map((lineItem) => (
              <OrderLineRow
                key={lineItem.id}
                lineItem={lineItem}
              />
            ))}
          </tbody>

          <tfoot>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th scope="row" colSpan={3}>
                  Discounts
                </th>
                <td>
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    <Money data={discountValue} />
                  )}
                </td>
              </tr>
            )}

            <tr>
              <th scope="row" colSpan={3}>Subtotal</th>
              <td><Money data={order.subtotal} /></td>
            </tr>

            <tr>
              <th scope="row" colSpan={3}>Tax</th>
              <td><Money data={order.totalTax} /></td>
            </tr>

            <tr>
              <th scope="row" colSpan={3}>Total</th>
              <td><Money data={order.totalPrice} /></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <section className="rch-order-address">
        <h3>Shipping address</h3>

        {order.shippingAddress ? (
          <address>
            {order.shippingAddress.name && (
              <p>{order.shippingAddress.name}</p>
            )}

            {order.shippingAddress.formatted && (
              <p>{order.shippingAddress.formatted}</p>
            )}

            {order.shippingAddress.formattedArea && (
              <p>{order.shippingAddress.formattedArea}</p>
            )}
          </address>
        ) : (
          <p>No shipping address defined.</p>
        )}

        <h3>Order status</h3>
        <p>{fulfillmentStatus || 'Unfulfilled'}</p>
      </section>

      <section className="rch-order-tracking">
        <h3>Shipment tracking</h3>

        {trackingInfo?.length > 0 ? (
          <div className="rch-order-tracking-list">
            {trackingInfo.map((tracking, index) => (
              <article
                className="rch-order-tracking-item"
                key={`${tracking.number || 'shipment'}-${index}`}
              >
                <div>
                  <p className="rch-order-tracking-company">
                    {tracking.company || 'Shipping carrier'}
                  </p>

                  <p>
                    AWB: {tracking.number || 'Not available'}
                  </p>
                </div>

                {tracking.number && (
                  <a
                    className="rch-order-track-button"
                    href={`/track-order?awb=${encodeURIComponent(
                      tracking.number,
                    )}`}
                  >
                    Track shipment →
                  </a>
                )}

                {tracking.url && (
                  <a
                    className="rch-order-external-tracking"
                    href={tracking.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open carrier tracking ↗
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rch-order-tracking-pending">
            <p>Tracking information is not available yet.</p>
            <p>
              Once your shipment has a tracking number, it will
              appear here automatically.
            </p>
          </div>
        )}
      </section>

      {order.statusPageUrl && (
        <p className="rch-order-status-link">
          <a
            href={order.statusPageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Shopify order status →
          </a>
        </p>
      )}
    </div>
  );
}


/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  return (
    <tr key={lineItem.id}>
      <td>
        <div>
          {lineItem?.image && (
            <div>
              <Image data={lineItem.image} width={96} height={96} />
            </div>
          )}
          <div>
            <p>{lineItem.title}</p>
            <small>{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td>
        <Money data={lineItem.price} />
      </td>
      <td>{lineItem.quantity}</td>
      <td>
        <Money data={lineItem.totalDiscount} />
      </td>
    </tr>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
