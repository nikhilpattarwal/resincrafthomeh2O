
// import {Image, Money} from '@shopify/hydrogen';
// import {Link} from 'react-router';

// export function ProductItem({product, loading = 'lazy'}) {
//   if (!product) return null;

//   const image = product.featuredImage;
//   const price = product.priceRange?.minVariantPrice;

//   return (
//     <Link
//       to={`/products/${product.handle}`}
//       className="rch-product-card"
//       aria-label={`View ${product.title}`}
//     >
//       <div className="rch-product-card__image">
//         {image?.url ? (
//           <Image
//             data={image}
//             alt={image.altText || product.title}
//             sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
//             loading={loading}
//             className="rch-product-card__photo"
//           />
//         ) : (
//           <div className="rch-product-card__no-image">
//             <span>Resin Craft Home</span>
//             <span className="rch-product-card__no-image-caption">
//               Handmade with care
//             </span>
//           </div>
//         )}

//         <span className="rch-product-card__view" aria-hidden="true">
//           View details <span>↗</span>
//         </span>
//       </div>

//       <div className="rch-product-card__details">
//         <h3 className="rch-product-card__title">{product.title}</h3>

//         {price && (
//           <p className="rch-product-card__price">
//             <Money data={price} />
//           </p>
//         )}
//       </div>
//     </Link>
//   );
// }





import {useState, useEffect} from 'react';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {Link, useFetcher} from 'react-router';

export function ProductItem({product, loading = 'lazy'}) {
  const [quantity, setQuantity] = useState(1);
  const [buyNow, setBuyNow] = useState(false);
  const fetcher = useFetcher();

  if (!product) return null;

  const image = product.featuredImage;
  const price = product.priceRange?.minVariantPrice;
  const variant = product.variants?.nodes?.[0];

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && buyNow) {
      const checkoutUrl =
        fetcher.data?.cart?.checkoutUrl ||
        fetcher.data?.checkoutUrl;

      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
      } else {
        window.location.assign('/cart');
      }

      setBuyNow(false);
    }
  }, [fetcher.state, fetcher.data, buyNow]);

  const addLines = variant?.id
    ? [{merchandiseId: variant.id, quantity}]
    : [];

  const productImage = image?.url ? (
    <Image
      data={image}
      alt={image.altText || product.title}
      sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
      loading={loading}
      className="rch-product-card__photo"
    />
  ) : (
    <div className="rch-product-card__no-image">
      <span>Resin Craft Home</span>
      <span className="rch-product-card__no-image-caption">
        Handmade with care
      </span>
    </div>
  );

  return (
    <article className="rch-product-card">
      <div className="rch-product-card__image">
        <Link
          to={`/products/${product.handle}`}
          className="rch-product-card__image-link"
          aria-label={`View ${product.title}`}
        >
          {productImage}
        </Link>

        <div className="rch-product-card__purchase">
          {variant ? (
            <>
              <div className="rch-product-card__quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                >
                  −
                </button>

                <span aria-live="polite">{quantity}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  +
                </button>
              </div>

              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesAdd}
                inputs={{lines: addLines}}
              >
                {(cartFetcher) => (
                  <button
                    type="submit"
                    className="rch-product-card__add"
                    disabled={
                      !variant.availableForSale ||
                      cartFetcher.state !== 'idle'
                    }
                  >
                    {!variant.availableForSale
                      ? 'Sold Out'
                      : cartFetcher.state !== 'idle'
                        ? 'Adding...'
                        : 'Add to Cart'}
                  </button>
                )}
              </CartForm>

              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesAdd}
                inputs={{lines: addLines}}
              >
                {(cartFetcher) => (
                  <button
                    type="submit"
                    className="rch-product-card__buy"
                    disabled={
                      !variant.availableForSale ||
                      cartFetcher.state !== 'idle'
                    }
                    onClick={() => setBuyNow(true)}
                  >
                    {!variant.availableForSale ? 'Sold Out' : 'Buy Now'}
                  </button>
                )}
              </CartForm>
            </>
          ) : (
            <Link
              to={`/products/${product.handle}`}
              className="rch-product-card__buy"
            >
              Choose Options
            </Link>
          )}
        </div>
      </div>

      <div className="rch-product-card__details">
        <Link
          to={`/products/${product.handle}`}
          className="rch-product-card__title-link"
        >
          <h3 className="rch-product-card__title">{product.title}</h3>
        </Link>

        {price && (
          <p className="rch-product-card__price">
            <Money data={price} />
          </p>
        )}
      </div>
    </article>
  );
}
