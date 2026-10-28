
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

export function RecommendedProducts({products = []}) {
  if (!products.length) return null;

  return (
    <section className="rch-recommended">
      <div className="rch-recommended__heading">
        <p>DISCOVER MORE</p>
        <h2>You May Also Like</h2>
        <span>
          More handcrafted pieces, made to be treasured.
        </span>
      </div>

      <div className="rch-recommended__grid">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.handle}`}
            className="rch-recommended__card"
          >
            <div className="rch-recommended__image">
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  sizes="(min-width: 1000px) 25vw, (min-width: 600px) 50vw, 80vw"
                  loading="lazy"
                />
              )}
            </div>

            <div className="rch-recommended__details">
            <h3 style={{maxHeight:'42px', overflow:'hidden'}}>
             {product.title.length > 30
             ? `${product.title.slice(0, 30)}...`
             : product.title}
            </h3>

              <div className="rch-recommended__price">
                <Money data={product.priceRange.minVariantPrice} />
              </div>

              <span className="rch-recommended__view">
                View product →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
