
// import {CartForm} from '@shopify/hydrogen';

// /**
//  * @param {{
//  *   analytics?: unknown;
//  *   children: React.ReactNode;
//  *   disabled?: boolean;
//  *   lines: Array<OptimisticCartLineInput>;
//  *   onClick?: () => void;
//  *   className?: string;
//  *   style?: React.CSSProperties;
//  * }}
//  */
// export function AddToCartButton({
//   analytics,
//   children,
//   disabled,
//   lines,
//   onClick,
//   className,
//   style,
// }) {
//   return (
//     <CartForm
//       route="/cart"
//       inputs={{lines}}
//       action={CartForm.ACTIONS.LinesAdd}
//     >
//       {(fetcher) => (
//         <>
//           <input
//             name="analytics"
//             type="hidden"
//             value={JSON.stringify(analytics)}
//           />

//           <button
//             type="submit"
//             className={className}
//             style={style}
//             onClick={onClick}
//             disabled={disabled ?? fetcher.state !== 'idle'}
//           >
//             {children}
//           </button>
//         </>
//       )}
//     </CartForm>
//   );
// }

// /** @typedef {import('react-router').FetcherWithComponents} FetcherWithComponents */
// /** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */



import {useEffect, useRef} from 'react';
import {CartForm} from '@shopify/hydrogen';
import {useToast} from '~/components/Toast';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 *   className?: string;
 *   style?: React.CSSProperties;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
  style,
}) {
  return (
    <CartForm
      route="/cart"
      inputs={{lines}}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => (
        <AddToCartSubmitButton
          fetcher={fetcher}
          analytics={analytics}
          disabled={disabled}
          onClick={onClick}
          className={className}
          style={style}
        >
          {children}
        </AddToCartSubmitButton>
      )}
    </CartForm>
  );
}

function AddToCartSubmitButton({
  fetcher,
  analytics,
  disabled,
  onClick,
  className,
  style,
  children,
}) {
  const {showToast} = useToast();
  const previousState = useRef(fetcher.state);

  useEffect(() => {
    const wasSubmitting = previousState.current !== 'idle';
    const isFinished = fetcher.state === 'idle';

    if (wasSubmitting && isFinished && fetcher.data) {
      const result = fetcher.data;

      if (
        result.errors ||
        result.error ||
        result.userErrors?.length
      ) {
        showToast(
          'Unable to add this product. Please try again.',
          'error',
        );
      } else {
        showToast('Product added to your bag!', 'success');
      }
    }

    previousState.current = fetcher.state;
  }, [fetcher.state, fetcher.data, showToast]);

  return (
    <>
      <input
        name="analytics"
        type="hidden"
        value={JSON.stringify(analytics)}
      />

      <button
        type="submit"
        className={className}
        style={style}
        onClick={onClick}
        disabled={Boolean(disabled) || fetcher.state !== 'idle'}
      >
        {children}
      </button>
    </>
  );
}

/** @typedef {import('react-router').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
