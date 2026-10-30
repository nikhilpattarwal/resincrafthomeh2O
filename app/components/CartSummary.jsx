import {CartForm, Money} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {useToast} from '~/components/Toast';
import {
  LuShoppingCart,
  LuPlus,
  LuMinus,
  LuShieldCheck,
} from 'react-icons/lu';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div aria-labelledby={summaryId} className={className}>
      <h4 id={summaryId}>Totals</h4>
      <dl role="group" className="cart-subtotal">
        <dt>Subtotal </dt>
        <dd>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountsHeadingId={discountsHeadingId}
        discountCodeInputId={discountCodeInputId}
      />
      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
      />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string}}
 */

function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <div className="rch-checkout-actions">
      <p className="rch-checkout-secure">
        <LuShieldCheck />
        Secure checkout
      </p>

      <a href={checkoutUrl} className="rch-checkout-button">
        Continue to Checkout
        <span aria-hidden="true">→</span>
      </a>

      <p className="rch-checkout-note">
        Shipping and taxes calculated at checkout.
      </p>
    </div>
  );
}


/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 *   discountsHeadingId: string;
 *   discountCodeInputId: string;
 * }}
 */
// function CartDiscounts({
//   discountCodes,
//   discountsHeadingId,
//   discountCodeInputId,
// }) {
//   const codes =
//     discountCodes
//       ?.filter((discount) => discount.applicable)
//       ?.map(({code}) => code) || [];

//   return (
//     <section aria-label="Discounts">
//       {/* Have existing discount, display it with a remove option */}
//       <dl hidden={!codes.length}>
//         <div>
//           <dt id={discountsHeadingId}>Discounts</dt>
//           <UpdateDiscountForm>
//             <div
//               className="cart-discount"
//               role="group"
//               aria-labelledby={discountsHeadingId}
//             >
//               <code>{codes?.join(', ')}</code>
//               &nbsp;
//               <button type="submit" aria-label="Remove discount">
//                 Remove
//               </button>
//             </div>
//           </UpdateDiscountForm>
//         </div>
//       </dl>

//       {/* Show an input to apply a discount */}
//       <UpdateDiscountForm discountCodes={codes}>
//         <div>
//           <label htmlFor={discountCodeInputId} className="sr-only">
//             Discount code
//           </label>
//           <input
//             id={discountCodeInputId}
//             type="text"
//             name="discountCode"
//             placeholder="Discount code"
//           />
//           &nbsp;
//           <button type="submit" aria-label="Apply discount code">
//             Apply
//           </button>
//         </div>
//       </UpdateDiscountForm>
//     </section>
//   );
// }



function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}) {
  const fetcher = useFetcher({key: 'discount-code-update'});
  const removeFetcher = useFetcher({key: 'discount-code-remove'});
  const [discountCode, setDiscountCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [status, setStatus] = useState('');
  const wasSubmitting = useRef(false);
  const {showToast} = useToast();

  const codes = discountCodes || [];
  const appliedCodes = codes.filter((discount) => discount.applicable);
  const wasRemovingDiscount = useRef(false);


useEffect(() => {
  if (fetcher.state !== 'idle') {
    wasSubmitting.current = true;
    return;
  }

  if (!wasSubmitting.current) return;

  wasSubmitting.current = false;
  if (wasRemovingDiscount.current) {
  wasRemovingDiscount.current = false;

  if (codes.every((discount) => !discount.applicable)) {
    setStatus('');
    showToast('Discount coupon removed successfully!', 'success');
  } else {
    showToast('Unable to remove discount coupon.', 'error');
  }

  return;
}

  const result = codes.find(
    (discount) =>
      discount.code.toLowerCase() === submittedCode.toLowerCase(),
  );

  if (result?.applicable) {
    setStatus('success');
    setDiscountCode('');
    showToast('Coupon applied successfully!', 'success');
  } else if (result) {
    setStatus('invalid');
    showToast('This coupon is not valid for your cart.', 'error');
  } else {
    setStatus('error');
    showToast('Unable to verify coupon. Please try again.', 'error');
  }
}, [fetcher.state, discountCodes, submittedCode, showToast]);


  const isApplying = fetcher.state !== 'idle';

  return (
    <section className="rch-cart-code-section" aria-label="Discounts">
      <h4 id={discountsHeadingId}>Discount code</h4>

      {appliedCodes.length > 0 && (
        <div className="rch-applied-code">
          <div>
            <strong>{appliedCodes.map(({code}) => code).join(', ')}</strong>
            <span>Discount applied</span>
          </div>

         <UpdateDiscountForm
              discountCodes={[]}
              fetcherKey="discount-code-remove"
            >
              <button
                type="submit"
                className="rch-code-remove"
                disabled={removeFetcher.state !== 'idle'}
                onClick={() => {
                  wasRemovingDiscount.current = true;
                }}
              >
                {removeFetcher.state !== 'idle' ? 'Removing...' : 'Remove'}
              </button>
            </UpdateDiscountForm>
        </div>
      )}

      <UpdateDiscountForm
        discountCodes={[...appliedCodes.map(({code}) => code), discountCode.trim()]
          .filter(Boolean)}
        fetcherKey="discount-code-update"
      >
        <div className="rch-code-input-row">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>

          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Enter discount code"
            value={discountCode}
            onChange={(event) => {
              setDiscountCode(event.target.value.toUpperCase());
              setStatus('');
            }}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={!discountCode.trim() || isApplying}
            onClick={() => {
              setSubmittedCode(discountCode.trim());
              setStatus('applying');
            }}
          >
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </UpdateDiscountForm>

      {status === 'applying' && (
        <p className="rch-code-status is-loading" role="status">
          Verifying your discount code...
        </p>
      )}

      {status === 'success' && (
        <p className="rch-code-status is-success" role="status">
          Discount code applied successfully.
        </p>
      )}

      {status === 'invalid' && (
        <p className="rch-code-status is-error" role="alert">
          This discount code is not valid for your cart.
        </p>
      )}

      {status === 'error' && (
        <p className="rch-code-status is-error" role="alert">
          We couldn't verify this code. Please try again.
        </p>
      )}
    </section>
  );
}



/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */

function UpdateDiscountForm({discountCodes, children, fetcherKey}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}


/**
 * @param {{
 *   giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 *   giftCardHeadingId: string;
 *   giftCardInputId: string;
 * }}
 */
function CartGiftCard({giftCardCodes, giftCardHeadingId, giftCardInputId}) {
  const giftCardCodeInput = useRef(null);
  const removeButtonRefs = useRef(new Map());
  const previousCardIdsRef = useRef([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState(null);
  const isApplyingGiftCard = giftCardAddFetcher.state !== 'idle';

  const {showToast} = useToast();
  const previousGiftCardIds = useRef(
    giftCardCodes?.map((card) => card.id) || [],
  );

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);


  useEffect(() => {
  const currentIds = giftCardCodes?.map((card) => card.id) || [];
  const previousIds = previousGiftCardIds.current;

  const newlyApplied = currentIds.filter(
    (id) => !previousIds.includes(id),
  );

  if (newlyApplied.length > 0) {
    showToast('Gift card applied successfully!', 'success');
  }

  previousGiftCardIds.current = currentIds;
}, [giftCardCodes, showToast]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
      showToast('Removing gift card...', 'info');

    }
  };

  return (
    <section aria-label="Gift cards">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId}>Applied Gift Card(s)</dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="cart-discount">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div>
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button
            type="submit"
            className="rch-gift-card-apply"
            disabled={isApplyingGiftCard}
            aria-label="Apply gift card code"
          >
            {isApplyingGiftCard ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </AddGiftCardForm>
      {isApplyingGiftCard && (
        <p className="rch-code-status is-loading" role="status">
          Verifying your gift card...
        </p>
      )}
    </section>
  );
}

/**
 * @param {{
 *   fetcherKey?: string;
 *   children: React.ReactNode;
 * }}
 */
function AddGiftCardForm({fetcherKey, children}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardId: string;
 *   lastCharacters: string;
 *   children: React.ReactNode;
 *   onRemoveClick?: () => void;
 *   buttonRef?: (el: HTMLButtonElement | null) => void;
 * }}
 */
function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      &nbsp;
      <button
        type="submit"
        aria-label={`Remove gift card ending in ${lastCharacters}`}
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
