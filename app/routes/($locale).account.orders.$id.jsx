import {redirect, useLoaderData} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

function formatTrackingDate(value) {
  if (!value) return '';
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

function getTrackingStage(status = '', statusType = '') {
  const value = `${status} ${statusType}`.toLowerCase();

  if (value.includes('deliver') && !value.includes('out for delivery')) return 4;
  if (value.includes('out for delivery')) return 3;
  if (
    value.includes('transit') ||
    value.includes('picked up') ||
    value.includes('pickup scan') ||
    value.includes('reached')
  ) return 2;
  if (value.includes('manifest') || value.includes('ready to ship')) return 1;

  return 0;
}

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
  (fulfillment) => fulfillment.trackingInformation ?? [],
);

const waybills = [
  ...new Set(
    trackingInfo
      .map((item) => item.number)
      .filter((number) => /^\d{8,22}$/.test(number || '')),
  ),
];

const trackingResults = await Promise.all(
  waybills.map(async (waybill) => {
    try {
      const token =
        context.env?.DELHIVERY_API_TOKEN ||
        process.env.DELHIVERY_API_TOKEN;

      if (!token) return {waybill, error: 'Tracking is temporarily unavailable.'};

      const url = new URL(
        'https://track.delhivery.com/api/v1/packages/json/',
      );
      url.searchParams.set('waybill', waybill);

      const response = await fetch(url, {
        headers: {
          Authorization: `Token ${token}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return {waybill, error: 'Unable to retrieve tracking right now.'};
      }

      const payload = await response.json();
      const shipment = payload?.ShipmentData?.find(
        (item) => item?.Shipment,
      )?.Shipment;

      if (!shipment) return {waybill, error: 'Tracking information not found.'};

      const status = shipment.Status || {};
      const scans = (shipment.Scans || [])
        .map((entry, index) => {
          const scan = entry?.ScanDetail || entry;

          return {
            id: `${scan.ScanDateTime || scan.ScanDate || 'scan'}-${index}`,
            status:
              scan.Instructions ||
              scan.Scan ||
              scan.ScanType ||
              'Shipment update',
            location: scan.ScanLocation || '',
            time: scan.ScanDateTime || scan.ScanDate || '',
          };
        })
        .sort((a, b) => (Date.parse(b.time) || 0) - (Date.parse(a.time) || 0))
        .slice(0, 20);

      return {
        waybill: shipment.AWB || waybill,
        status: status.Status || 'Status unavailable',
        statusType: status.StatusType || '',
        statusLocation: status.StatusLocation || '',
        statusTime: status.StatusDateTime || '',
        expectedDelivery:
          shipment.ExpectedDeliveryDate || shipment.ExpectedDelivery || '',
        scans,
        publicTrackingUrl:
          `https://www.delhivery.com/track/package/${encodeURIComponent(shipment.AWB || waybill)}`,
      };
    } catch {
      return {waybill, error: 'Tracking is temporarily unavailable.'};
    }
  }),
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
    trackingInfo,
    trackingResults,
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
    trackingResults
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

      
<div className="rch-order-summary">
  <div className="rch-order-product">
    <div className="rch-order-product-heading">Product</div>

    {lineItems.map((lineItem) => (
      <div className="rch-order-product-row" key={lineItem.id}>
        {lineItem.image && (
          <Image
            data={lineItem.image}
            width={72}
            height={72}
          />
        )}

        <div className="rch-order-product-info">
          <strong>{lineItem.title}</strong>
          {lineItem.variantTitle &&
            lineItem.variantTitle !== 'Default Title' && (
              <span>{lineItem.variantTitle}</span>
            )}
          <span>Qty: {lineItem.quantity}</span>
        </div>

        <div className="rch-order-product-price">
          <span>
            <Money data={lineItem.price} />
          </span>
          <strong>
            <Money data={lineItem.totalDiscount} />
          </strong>
        </div>
      </div>
    ))}
  </div>

  <div className="rch-order-totals">
    {((discountValue && discountValue.amount) ||
      discountPercentage) && (
      <div className="rch-order-total-row">
        <span>Discount</span>
        <strong>
          {discountPercentage ? (
            `-${discountPercentage}%`
          ) : (
            <Money data={discountValue} />
          )}
        </strong>
      </div>
    )}

    <div className="rch-order-total-row">
      <span>Subtotal</span>
      <strong><Money data={order.subtotal} /></strong>
    </div>

    <div className="rch-order-total-row">
      <span>Tax</span>
      <strong><Money data={order.totalTax} /></strong>
    </div>

    <div className="rch-order-total-row rch-order-total-grand">
      <span>Total paid</span>
      <strong><Money data={order.totalPrice} /></strong>
    </div>
  </div>
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
        
<p>
  <span
    className={`rch-status-badge ${
      /cancel/i.test(order.cancelledAt ? 'cancelled' : '')
        ? 'rch-status-cancelled'
        : /fulfilled|success/i.test(fulfillmentStatus || '')
          ? 'rch-status-fulfilled'
          : /unfulfilled/i.test(fulfillmentStatus || '')
            ? 'rch-status-unfulfilled'
            : 'rch-status-pending'
    }`}
  >
    {order.cancelledAt ? 'Cancelled' : fulfillmentStatus || 'Unfulfilled'}
  </span>
</p>

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
            
            {trackingResults?.map((tracking) => (
              <article
                className="rch-live-tracking"
                key={tracking.waybill}
              >
                <h4>Delhivery shipment updates</h4>

                {tracking.error ? (
                  <p>{tracking.error}</p>
                ) : (
                  <>
                    
                <p>
                  <strong>Shipment status</strong>
                </p>

                <div className="rch-tracking-status">
                  <span className="rch-tracking-status-label">
                    {tracking.status}
                  </span>
                </div>

                {!tracking.error && (
                  <div
                    className="rch-delivery-progress"
                    aria-label={`Shipment status: ${tracking.status}`}
                  >
                    {[
                      'Order placed',
                      'Ready to ship',
                      'In transit',
                      'Out for delivery',
                      'Delivered',
                    ].map((label, index) => {
                      const stage = getTrackingStage(
                        tracking.status,
                        tracking.statusType,
                      );

                      return (
                        <div
                          key={label}
                          className={`rch-delivery-stage ${
                            index <= stage ? 'is-complete' : ''
                          }`}
                        >
                          <span className="rch-delivery-dot" />
                          <span>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}


                    {tracking.statusLocation && (
                      <p>
                        <strong>Latest location:</strong> {tracking.statusLocation}
                      </p>
                    )}

                    {tracking.statusTime && (
                      <p>
                        <strong>Last updated:</strong>{' '}
                        {formatTrackingDate(tracking.statusTime)}
                      </p>
                    )}

                    {tracking.expectedDelivery && (
                      <p>
                        <strong>Estimated delivery:</strong>{' '}
                        {formatTrackingDate(tracking.expectedDelivery)}
                      </p>
                    )}

                    <h5>Shipment history</h5>

                    {tracking.scans.length > 0 ? (
                      <ol>
                        {tracking.scans.map((scan) => (
                          <li key={scan.id}>
                            <strong>{scan.status}</strong>
                            {scan.location && <p>{scan.location}</p>}
                            {scan.time && (
                              <time>{formatTrackingDate(scan.time)}</time>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p>No shipment scans are available yet.</p>
                    )}

                    <a
                      href={tracking.publicTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Delhivery tracking →
                    </a>
                  </>
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
