import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import { useEffect, useRef, useState } from 'react';
import {useToast} from '~/components/Toast';




/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 *   childrenMap: LineItemChildrenMap;
 * }}
 */
export function CartLineItem({layout, line, childrenMap}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;
  const [showPersonalization, setShowPersonalization] = useState(false);

const attributes = line.attributes ?? [];

const personalizationAttributes = attributes.filter(({key}) =>
  [
    'Personalized name or text',
    'Customization instructions',
  ].includes(key) || key.startsWith('Reference image '),
);

  return (
    <li key={id} className="cart-line">
      <div className="cart-line-inner">
        {image && (
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={100}
            loading="lazy"
            width={100}
          />
        )}

        <div>
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
          >
            <p>
              <strong>{product.title}</strong>
            </p>
          </Link>
          <ProductPrice price={line?.cost?.totalAmount} />
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <small>
                  {option.name}: {option.value}
                </small>
              </li>
            ))}
          </ul>
          <CartLineQuantity line={line} />
        </div>
      </div>
      
      {personalizationAttributes.length > 0 && (
        <div className="rch-cart-personalization">
          <button
            type="button"
            className="rch-cart-personalization-toggle"
            aria-expanded={showPersonalization}
            onClick={() => setShowPersonalization((prev) => !prev)}
          >
            <span aria-hidden="true">ⓘ</span>
            <span>Personalization details</span>
            <span className="rch-cart-personalization-arrow">
              {showPersonalization ? '−' : '+'}
            </span>
          </button>

          {showPersonalization && (
            <div className="rch-cart-personalization-content">
              {personalizationAttributes.map(({key, value}) => (
                <div key={key} className="rch-cart-personalization-row">
                  <strong>{key}:</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="cart-line-children">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));
  const {showToast} = useToast();
  

  return (
    <div className="cart-line-quantity">
      <small>Quantity: {quantity} &nbsp;&nbsp;</small>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722; </span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>
      &nbsp;
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      fetcherKey={getRemoveKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled}  className="rch-cart-remove-button" type="submit">
        Remove
      </button>
    </CartForm>
  );
}


function CartLineRemoveSubmit({fetcher, disabled}) {
  const {showToast, removeToast} = useToast();
  const loadingToastId = useRef(null);
  const wasSubmitting = useRef(false);

  useEffect(() => {
    if (fetcher.state !== 'idle') {
      wasSubmitting.current = true;
      return;
    }

    if (!wasSubmitting.current) return;

    wasSubmitting.current = false;

    if (loadingToastId.current) {
      removeToast(loadingToastId.current);
      loadingToastId.current = null;
    }

    const result = fetcher.data;
    const hasErrors = !result?.cart || Boolean(result.errors?.length);

    if (hasErrors) {
      showToast('Unable to remove item. Please try again.', 'error');
    } else {
      showToast('Item removed from your bag.', 'success');
    }
  }, [fetcher.state, fetcher.data, showToast, removeToast]);

  return (
    <button
      disabled={disabled || fetcher.state !== 'idle'}
      type="submit"
      onClick={() => {
        if (!loadingToastId.current) {
          loadingToastId.current = showToast(
            'Removing item from your bag...',
            'loading',
            0,
          );
        }
      }}
    >
      Remove
    </button>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @returns
 * @param {string[]} lineIds - line ids affected by the update
 */
function getUpdateKey(lineIds) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
function getRemoveKey(lineIds) {
  return [CartForm.ACTIONS.LinesRemove, ...lineIds].join('-');
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('~/components/CartMain').LineItemChildrenMap} LineItemChildrenMap */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').CartLineFragment} CartLineFragment */
