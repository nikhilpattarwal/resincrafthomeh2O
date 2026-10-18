
import {useLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta = ({data}) => {
  const product = data?.product;
  return [
    {title: product ? `${product.title} | Resin Craft Home` : 'Shop | Resin Craft Home'},
    {
      name: 'description',
      content:
        product?.seo?.description ||
        product?.description ||
        'Thoughtfully handcrafted resin keepsakes from Resin Craft Home.',
    },
    {
      rel: 'canonical',
      href: product ? `/products/${product.handle}` : '/',
    },
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

function loadDeferredData() {
  return {};
}

export default function Product() {
  const {product} = useLoaderData();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {
    title,
    description,
    descriptionHtml,
    vendor,
  } = product;

  const isAvailable = selectedVariant?.availableForSale;

  return (
    <main className="rch-product-page">
      <nav className="rch-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/collections/all">Shop</a>
        <span aria-hidden="true">/</span>
        <span>{title}</span>
      </nav>

      <section className="rch-product-layout">
        <div className="rch-product-visual">
          <div className="rch-product-main-image">
            <ProductImage image={selectedVariant?.image} />
          </div>
          <p className="rch-image-caption">
            Thoughtfully handmade. Made to be treasured.
          </p>
        </div>

        <div className="rch-product-information">
          <p className="rch-eyebrow">RESIN CRAFT HOME · HANDMADE WITH CARE</p>

          {vendor && vendor !== 'Resin Craft Home' && (
            <p className="rch-product-vendor">{vendor}</p>
          )}

          <h1>{title}</h1>

          <div className="rch-product-price">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          <p className="rch-product-intro">
            A thoughtful keepsake, crafted to celebrate the people,
            places, and moments that matter.
          </p>

          <div className="rch-product-availability">
            <span
              className={
                isAvailable
                  ? 'rch-stock-dot'
                  : 'rch-stock-dot rch-stock-dot--unavailable'
              }
            />
            {isAvailable ? 'Available to order' : 'Currently unavailable'}
          </div>

          <div className="rch-product-form">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>

          <div className="rch-product-promises">
            <div>
              <span className="rch-promise-icon">✳</span>
              <div>
                <strong>Made by hand</strong>
                <p>Care in every detail</p>
              </div>
            </div>
            <div>
              <span className="rch-promise-icon">♡</span>
              <div>
                <strong>Made personal</strong>
                <p>Meaningful gifting</p>
              </div>
            </div>
            <div>
              <span className="rch-promise-icon">◇</span>
              <div>
                <strong>Made to treasure</strong>
                <p>Keepsakes for special moments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rch-product-description">
        <div className="rch-description-heading">
          <p className="rch-eyebrow">THE DETAILS</p>
          <h2>A little piece of meaning.</h2>
        </div>
        <div className="rch-description-content">
          {descriptionHtml ? (
            <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          ) : (
            <p>
              Every Resin Craft Home piece is thoughtfully made to
              turn meaningful moments into lasting keepsakes.
              Add the product-specific details here when you are
              ready to publish this item.
            </p>
          )}
        </div>
      </section>

      <section className="rch-product-note">
        <p className="rch-eyebrow">A GIFT WITH A STORY</p>
        <h2>Little things, made to last.</h2>
        <p>
          Discover handmade pieces created to make everyday moments
          and thoughtful gifts feel special.
        </p>
        <a className="rch-secondary-button" href="/collections/all">
          Explore the collection <span aria-hidden="true">↗</span>
        </a>
      </section>

      <style>{`
        .rch-product-page {
          --rch-ink: #332b26;
          --rch-muted: #796b60;
          --rch-cream: #f6f1eb;
          --rch-paper: #fffdf9;
          --rch-line: #e8ded3;
          color: var(--rch-ink);
          background: var(--rch-paper);
          padding: 0 4.5% 64px;
        }

        .rch-product-page * {
          box-sizing: border-box;
        }

        .rch-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 24px 0 30px;
          color: var(--rch-muted);
          font-size: 12px;
          letter-spacing: .025em;
        }

        .rch-breadcrumb a {
          color: inherit;
          text-decoration: none;
        }

        .rch-breadcrumb a:hover {
          color: var(--rch-ink);
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .rch-product-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(320px, .82fr);
          gap: clamp(36px, 7vw, 100px);
          align-items: start;
          max-width: 1440px;
          margin: 0 auto;
        }

        .rch-product-visual {
          min-width: 0;
        }

        .rch-product-main-image {
          overflow: hidden;
          background: var(--rch-cream);
        }

        .rch-product-main-image img,
        .rch-product-main-image picture {
          display: block;
          width: 100%;
          height: auto;
        }

        .rch-product-main-image img {
          object-fit: contain;
        }

        .rch-image-caption {
          margin: 13px 0 0;
          color: var(--rch-muted);
          font-size: 11px;
          letter-spacing: .04em;
        }

        .rch-product-information {
          position: sticky;
          top: 32px;
          padding: clamp(12px, 2vw, 30px) 0;
        }

        .rch-eyebrow {
          margin: 0 0 20px;
          color: #94745f;
          font-size: 10px;
          line-height: 1.6;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .rch-product-vendor {
          margin: 0 0 8px;
          color: var(--rch-muted);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .rch-product-information h1,
        .rch-description-heading h2,
        .rch-product-note h2 {
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 400;
          letter-spacing: -.045em;
        }

        .rch-product-information h1 {
          margin: 0 0 20px;
          font-size: clamp(36px, 4.2vw, 60px);
          line-height: 1.08;
        }

        .rch-product-price {
          margin: 0 0 22px;
          font-size: 18px;
          color: var(--rch-ink);
        }

        .rch-product-price p {
          margin: 0;
        }

        .rch-product-intro {
          max-width: 440px;
          margin: 0 0 22px;
          color: var(--rch-muted);
          font-size: 14px;
          line-height: 1.9;
        }

        .rch-product-availability {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 24px;
          font-size: 12px;
          color: var(--rch-muted);
        }

        .rch-stock-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          border-radius: 50%;
          background: #728565;
        }

        .rch-stock-dot--unavailable {
          background: #ad6a59;
        }

        .rch-product-form {
          padding: 24px 0;
          border-top: 1px solid var(--rch-line);
          border-bottom: 1px solid var(--rch-line);
        }

        .rch-product-form button {
          min-height: 52px;
        }

        .rch-product-promises {
          display: grid;
          gap: 19px;
          padding-top: 26px;
        }

        .rch-product-promises > div {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rch-promise-icon {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          flex: 0 0 34px;
          border: 1px solid var(--rch-line);
          border-radius: 50%;
          font-size: 17px;
          color: #94745f;
        }

        .rch-product-promises strong {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .rch-product-promises p {
          margin: 0;
          color: var(--rch-muted);
          font-size: 11px;
        }

        .rch-product-description {
          display: grid;
          grid-template-columns: .8fr 1fr;
          gap: 48px;
          max-width: 1050px;
          margin: 100px auto 0;
          padding: 58px 0;
          border-top: 1px solid var(--rch-line);
          border-bottom: 1px solid var(--rch-line);
        }

        .rch-description-heading .rch-eyebrow {
          margin-bottom: 14px;
        }

        .rch-description-heading h2 {
          max-width: 400px;
          margin: 0;
          font-size: clamp(30px, 3.5vw, 44px);
          line-height: 1.15;
        }

        .rch-description-content {
          color: var(--rch-muted);
          font-size: 14px;
          line-height: 1.9;
          overflow-wrap: anywhere;
        }

        .rch-description-content > :first-child {
          margin-top: 0;
        }

        .rch-description-content > :last-child {
          margin-bottom: 0;
        }

        .rch-description-content img {
          max-width: 100%;
          height: auto;
        }

        .rch-product-note {
          margin: 70px auto 0;
          padding: 58px 24px;
          background: var(--rch-cream);
          text-align: center;
        }

        .rch-product-note .rch-eyebrow {
          margin-bottom: 15px;
        }

        .rch-product-note h2 {
          margin: 0 0 14px;
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.15;
        }

        .rch-product-note > p:not(.rch-eyebrow) {
          max-width: 460px;
          margin: 0 auto 24px;
          color: var(--rch-muted);
          font-size: 13px;
          line-height: 1.8;
        }

        .rch-secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 48px;
          padding: 0 22px;
          border: 1px solid var(--rch-ink);
          color: var(--rch-ink);
          text-decoration: none;
          font-size: 10px;
          letter-spacing: .1em;
          text-transform: uppercase;
          transition: background 180ms ease, color 180ms ease;
        }

        .rch-secondary-button:hover {
          background: var(--rch-ink);
          color: white;
        }

        @media (max-width: 800px) {
          .rch-product-page {
            padding: 0 20px 40px;
          }

          .rch-breadcrumb {
            padding: 18px 0 22px;
            font-size: 11px;
          }

          .rch-product-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 25px;
          }

          .rch-product-information {
            position: static;
            padding: 8px 0 0;
          }

          .rch-product-information h1 {
            font-size: clamp(34px, 9vw, 48px);
          }

          .rch-product-description {
            grid-template-columns: 1fr;
            gap: 22px;
            margin-top: 60px;
            padding: 36px 0;
          }

          .rch-product-note {
            margin-top: 42px;
            padding: 42px 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rch-secondary-button {
            transition: none;
          }
        }
      `}</style>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </main>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
