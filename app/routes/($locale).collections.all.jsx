// import {useLoaderData} from 'react-router';
// import {getPaginationVariables} from '@shopify/hydrogen';
// import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
// import {ProductItem} from '~/components/ProductItem';

// /**
//  * @type {Route.MetaFunction}
//  */
// export const meta = () => {
//   return [{title: `Hydrogen | Products`}];
// };

// /**
//  * @param {Route.LoaderArgs} args
//  */
// export async function loader(args) {
//   // Start fetching non-critical data without blocking time to first byte
//   const deferredData = loadDeferredData(args);

//   // Await the critical data required to render initial state of the page
//   const criticalData = await loadCriticalData(args);

//   return {...deferredData, ...criticalData};
// }

// /**
//  * Load data necessary for rendering content above the fold. This is the critical data
//  * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
//  * @param {Route.LoaderArgs}
//  */
// async function loadCriticalData({context, request}) {
//   const {storefront} = context;
//   const paginationVariables = getPaginationVariables(request, {
//     pageBy: 8,
//   });

//   const [{products}] = await Promise.all([
//     storefront.query(CATALOG_QUERY, {
//       variables: {...paginationVariables},
//     }),
//     // Add other queries here, so that they are loaded in parallel
//   ]);
//   return {products};
// }

// /**
//  * Load data for rendering content below the fold. This data is deferred and will be
//  * fetched after the initial page load. If it's unavailable, the page should still 200.
//  * Make sure to not throw any errors here, as it will cause the page to 500.
//  * @param {Route.LoaderArgs}
//  */
// function loadDeferredData({context}) {
//   return {};
// }

// export default function Collection() {
//   /** @type {LoaderReturnData} */
//   const {products} = useLoaderData();

//   return (
//     <div className="collection">
//       <PaginatedResourceSection
//         connection={products}
//         resourcesClassName="products-grid"
//       >
//         {({node: product, index}) => (
//           <ProductItem
//             key={product.id}
//             product={product}
//             loading={index < 8 ? 'eager' : undefined}
//           />
//         )}
//       </PaginatedResourceSection>
//     </div>
//   );
// }

// const COLLECTION_ITEM_FRAGMENT = `#graphql
//   fragment MoneyCollectionItem on MoneyV2 {
//     amount
//     currencyCode
//   }
//   fragment CollectionItem on Product {
//     id
//     handle
//     title
//     featuredImage {
//       id
//       altText
//       url
//       width
//       height
//     }
//     priceRange {
//       minVariantPrice {
//         ...MoneyCollectionItem
//       }
//       maxVariantPrice {
//         ...MoneyCollectionItem
//       }
//     }
//   }
// `;

// // NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
// const CATALOG_QUERY = `#graphql
//   query Catalog(
//     $country: CountryCode
//     $language: LanguageCode
//     $first: Int
//     $last: Int
//     $startCursor: String
//     $endCursor: String
//   ) @inContext(country: $country, language: $language) {
//     products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
//       nodes {
//         ...CollectionItem
//       }
//       pageInfo {
//         hasPreviousPage
//         hasNextPage
//         startCursor
//         endCursor
//       }
//     }
//   }
//   ${COLLECTION_ITEM_FRAGMENT}
// `;

// /** @typedef {import('./+types/collections.all').Route} Route */
// /** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
// /** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */







import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {Form, useLoaderData, Link} from 'react-router';
import {useEffect, useState} from 'react';

export const meta = () => [
  {title: 'Shop All | Resin Craft Home'},
  {
    name: 'description',
    content:
      'Explore handcrafted resin home decor, personalized gifts, pooja accessories, and more at Resin Craft Home.',
  },
];

export async function loader({context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const params = url.searchParams;

  const productType = params.get('type') || '';
  const color = params.get('color') || '';
  const availability = params.get('availability') || 'all';
  const minInput = params.get('minPrice') ?? '';
  const maxInput = params.get('maxPrice') ?? '';
  const sort = params.get('sort') || 'featured';

  const minPrice =
    minInput.trim() !== '' && Number.isFinite(Number(minInput))
      ? Math.max(0, Number(minInput))
      : null;

  const maxPrice =
    maxInput.trim() !== '' && Number.isFinite(Number(maxInput))
      ? Math.max(0, Number(maxInput))
      : null;

  const filters = [];

  const collectionHandle = productType || 'all-products';

  if (color) {
    filters.push({
      variantOption: {
        name: 'Color',
        value: color,
      },
    });
  }

  if (availability === 'in-stock') {
    filters.push({available: true});
  } else if (availability === 'out-of-stock') {
    filters.push({available: false});
  }

  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice <= maxPrice
  ) {
    filters.push({
      price: {
        min: minPrice,
        max: maxPrice,
      },
    });
  } else if (minPrice !== null && maxPrice === null) {
    filters.push({price: {min: minPrice}});
  } else if (maxPrice !== null && minPrice === null) {
    filters.push({price: {max: maxPrice}});
  }



const sortOptions = {
  featured: {sortKey: 'BEST_SELLING', reverse: false},
  'price-ascending': {sortKey: 'PRICE', reverse: false},
  'price-descending': {sortKey: 'PRICE', reverse: true},
  newest: {sortKey: 'CREATED', reverse: true},
  title: {sortKey: 'TITLE', reverse: false},
};

const selectedSort = sortOptions[sort] || sortOptions.featured;


  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });
  



// const collectionHandle = productType || 'all-products';

const result = await storefront.query(CATALOG_QUERY, {
  variables: {
    ...paginationVariables,
    handle: collectionHandle,
    filters,
    sortKey: selectedSort.sortKey,
    reverse: selectedSort.reverse,
    country: storefront.i18n.country,
    language: storefront.i18n.language,
  },
});

// const result = await storefront.query(CATALOG_QUERY, {
//   variables: {
//     ...paginationVariables,
//     handle: 'collectionHandle',
//     filters,
//     sortKey: selectedSort.sortKey,
//     reverse: selectedSort.reverse,
//     country: storefront.i18n.country,
//     language: storefront.i18n.language,
//   },
// });

const products = result?.collection?.products;

if (!products?.pageInfo || !Array.isArray(products.nodes)) {
  console.error(
    '[Shop All] Collection query returned no products connection:',
    JSON.stringify(result),
  );

  throw new Response(
    'Unable to load products from the All Products collection.',
    {status: 502},
  );
}



  return {
    products,
    selected: {
      productType,
      color,
      availability,
      minPrice: minInput,
      maxPrice: maxInput,
      sort,
    },
  };
}


export default function Collection() {
  const {products, selected} = useLoaderData();
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') setFiltersOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filtersOpen]);

  return (
    <main className="rch-shop">
      <div className="rch-shop-heading">
        <p className="rch-shop-eyebrow">THE COLLECTION</p>
<p className="shimmer-text">
  Thoughtfully handcrafted. Made to be treasured.
</p>
      </div>

      <button
        type="button"
        className="rch-mobile-filter-trigger"
        aria-expanded={filtersOpen}
        aria-controls="rch-collection-filters"
        onClick={() => setFiltersOpen(true)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M7 12h10m-7 5h4" />
          <path d="M6 4v6m12-6v6m-6 5v5" />
        </svg>
        Filters &amp; sort
      </button>

      <div
        className={`rch-filter-backdrop ${filtersOpen ? 'is-open' : ''}`}
        aria-hidden="true"
        onClick={() => setFiltersOpen(false)}
      />

      <Form
        id="rch-collection-filters"
        className={`rch-filters ${filtersOpen ? 'is-open' : ''}`}
        method="get"
        action="/collections/all"
      >
        <div className="rch-filter-close">
          <span>Filters &amp; sort</span>
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Keep your existing category, color, price,
            availability and sort fields here unchanged. */}

        
<div className="rch-filter-field">
  <label htmlFor="filter-type">Category</label>
  <select
    id="filter-type"
    name="type"
    defaultValue={selected.productType}
  >
    <option value="">All categories</option>
    <option value="clocks">Clocks</option>
    <option value="resin-home-decor">Resin Home Decor</option>
    <option value="personalized-gifts">Personalized Gifts</option>
    <option value="handmade-accessories">Handmade Accessories</option>
    <option value="pooja-festive-decor">Pooja &amp; Festive Decor</option>
    <option value="gifts-under-999">Gifts Under ₹999</option>
  </select>
</div>


        <div className="rch-filter-field">
          <label htmlFor="filter-color">Color</label>
          <select
            id="filter-color"
            name="color"
            defaultValue={selected.color}
          >
            <option value="">All colors</option>
            <option value="Red">Red</option>
            <option value="Pink">Pink</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
            <option value="White">White</option>
            <option value="Black">Black</option>
            <option value="Gold">Gold</option>
          </select>
        </div>

        <div className="rch-filter-field rch-price-fields">
          <label>Price range (₹)</label>
          <div>
            <input
              type="number"
              name="minPrice"
              min="0"
              placeholder="Min"
              aria-label="Minimum price"
              defaultValue={selected.minPrice}
            />
            <input
              type="number"
              name="maxPrice"
              min="0"
              placeholder="Max"
              aria-label="Maximum price"
              defaultValue={selected.maxPrice}
            />
          </div>
        </div>

        <div className="rch-filter-field">
          <label htmlFor="filter-availability">Availability</label>
          <select
            id="filter-availability"
            name="availability"
            defaultValue={selected.availability}
          >
            <option value="all">All products</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </div>

        <div className="rch-filter-field">
          <label htmlFor="filter-sort">Sort by</label>
          <select
            id="filter-sort"
            name="sort"
            defaultValue={selected.sort}
          >
            <option value="featured">Featured</option>
            <option value="price-ascending">Price: Low to high</option>
            <option value="price-descending">Price: High to low</option>
            <option value="newest">Newest</option>
            <option value="title">Alphabetically</option>
          </select>
        </div>

        <div className="rch-filter-actions">
          <button type="submit"  onClick={() => setFiltersOpen(false)}>Apply filters</button>
          <Link to="/collections/all" className="rch-clear-filters">
            Clear all
          </Link>
        </div>
      </Form>

      <div className="rch-shop-results">
        <p>Explore our handcrafted collection</p>

        
<PaginatedResourceSection
  connection={products}
  resourcesClassName="products-grid"
>
  {({node: product, index}) => (
    <ProductItem
      key={product.id}
      product={product}
      loading={index < 8 ? 'eager' : undefined}
    />
  )}
</PaginatedResourceSection>

      </div>
    </main>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }

  fragment CollectionItem on Product {
    id
    handle
    title
    productType
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
`;



// const CATALOG_QUERY = `#graphql
//   query Catalog(
//     $country: CountryCode
//     $language: LanguageCode
//     $first: Int
//     $last: Int
//     $startCursor: String
//     $endCursor: String
//     $filters: [ProductFilter!]
//     $sortKey: ProductSortKeys
//     $reverse: Boolean
//   ) @inContext(country: $country, language: $language) {
//     products(
//       first: $first
//       last: $last
//       before: $startCursor
//       after: $endCursor
//       filters: $filters
//       sortKey: $sortKey
//       reverse: $reverse
//     ) {
//       nodes {
//         ...CollectionItem
//       }
//       pageInfo {
//         hasPreviousPage
//         hasNextPage
//         startCursor
//         endCursor
//       }
//     }
//   }

//   ${COLLECTION_ITEM_FRAGMENT}
// `;




const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          ...CollectionItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }

  ${COLLECTION_ITEM_FRAGMENT}
`;






/** @typedef {import('./+types/collections.all').Route} Route */
