
import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';

export function ProductItem({product, loading = 'lazy'}) {
  if (!product) return null;

  const image = product.featuredImage;
  const price = product.priceRange?.minVariantPrice;

  return (
    <article className="rch-product-card">
      <div className="rch-product-card__image">
        <Link 
          to={`/products/${product.handle}`}
          className="rch-product-card__image-link"
          aria-label={`View ${product.title}`}
        >
          {image?.url ? (
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
          )}
        </Link>
      </div>

      <div className="rch-product-card__details">
        <Link
          to={`/products/${product.handle}`}
          className="rch-product-card__title-link"
        >
          <h3 className="rch-product-card__title">
            {product.title}
          </h3>
        </Link>

        {price && (
          <div className="rch-product-card__price">
            <Money data={price} />
          </div>
        )}

        <Link
          to={`/products/${product.handle}`}
          className="rch-product-card__buy"
        >
          Choose Options
        </Link>
      </div>
    </article>
  );
}
