import {Await, useLoaderData, Link} from 'react-router';

import {Suspense, useCallback, useEffect, useRef, useState} from 'react';

import {Image} from '@shopify/hydrogen';

import {ProductItem} from '~/components/ProductItem';

import {ResinProcess} from '~/components/ResinProcess';
import InstagramReels from "../components/InstagramReels";

export const meta = () => [

  {title: 'Resin Craft Home | Handmade Gifts & Keepsakes'},

  {

    name: 'description',

    content:

      'Discover handcrafted resin keepsakes, botanical gifts, and personalized treasures made to last.',

  },

];

export async function loader({context}) {

  const recommendedProducts = context.storefront

    .query(RECOMMENDED_PRODUCTS_QUERY)

    .catch((error) => {

      console.error('Unable to load recommended products:', error);

      return null;

    });

  return {recommendedProducts};

}

export default function Homepage() {

  const {recommendedProducts} = useLoaderData();
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
 console.log(recommendedProducts);
  
const heroImages = [
  {
    src: '/images/resin-hero-1.jpg',
    alt: 'Handcrafted floral resin art',
  },
  {
    src: '/images/resin-hero-2.jpg',
    alt: 'Personalised resin keepsake',
  },
  {
    src: '/images/resin-hero-3.jpg',
    alt: 'Handmade resin gift',
  },
  {
    src: '/images/resin-hero-4.png',
    alt: 'Botanical resin creation',
  },
  {
    src: '/images/resin-hero-5.jpg',
    alt: 'Botanical resin creation',
  },
   {
    src: '/images/resin-hero-6.jpg',
    alt: 'Botanical resin creation',
  },
   {
    src: '/images/resin-hero-7.jpg',
    alt: 'Botanical resin creation',
  },
   {
    src: '/images/resin-hero-8.png',
    alt: 'Botanical resin creation',
  },
   {
    src: '/images/resin-hero-9.png',
    alt: 'Botanical resin creation',
  },
   {
    src: '/images/resin-hero-10.png',
    alt: 'Botanical resin creation',
  },
];


  const handleHeroPointerMove = useCallback((event) => {
  if (!heroImageRef.current) return;

  // Disable pointer-driven movement on touch devices.
  if (window.matchMedia('(hover: none)').matches) return;

  const rect = event.currentTarget.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

 heroImageRef.current.style.setProperty(
  '--rch-pointer-x',
  `${x * 12}px`,
);

 heroImageRef.current.style.setProperty(
  '--rch-pointer-y',
  `${y * 12}px`,
);
}, []);

const handleHeroPointerLeave = useCallback(() => {
  if (!heroImageRef.current) return;

  heroImageRef.current.style.setProperty('--rch-pointer-x', '0px');
  heroImageRef.current.style.setProperty('--rch-pointer-y', '0px');
}, []);

useEffect(() => {
  const root = document.querySelector('.rch-home');
  if (!root) return;

  const elements = root.querySelectorAll('[data-rch-reveal]');

  const showAll = () => {
    root.classList.remove('rch-motion-ready');
    elements.forEach((element) => element.classList.add('is-visible'));
  };

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    showAll();
    return;
  }

  root.classList.add('rch-motion-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -35px 0px' },
  );

  elements.forEach((element) => observer.observe(element));

  return () => {
    observer.disconnect();
    root.classList.remove('rch-motion-ready');
  };
}, []);

const [activeHeroImage, setActiveHeroImage] = useState(0);

const nextHeroImage = useCallback(() => {
  setActiveHeroImage((current) => (current + 1) % heroImages.length);
}, []);

const previousHeroImage = useCallback(() => {
  setActiveHeroImage(
    (current) => (current - 1 + heroImages.length) % heroImages.length,
  );
}, []);

useEffect(() => {
  const timer = window.setInterval(nextHeroImage, 3000);
  return () => window.clearInterval(timer);
}, [nextHeroImage]);


  return (

    <main className="rch-home">

      <ResinProcess />

      <section className="rch-hero" ref={heroRef}>

        <div className="rch-hero-copy" data-rch-reveal data-rch-delay="1">

          <span className="rch-eyebrow">Handcrafted with intention</span>

          <h1 className="rch-editorial">Little things,<br />made to last.</h1>

          <p>

            Thoughtfully handcrafted resin keepsakes for the people, places,

            and moments you want to hold onto.

          </p>

          <Link to="/collections/all" className="rch-button">

            Discover the collection

          </Link>

        </div>

        
{/* <img
  src="/images/resin-hero.jpg"
  alt="Handcrafted resin art with preserved flowers"
  loading="eager"
  fetchPriority="high"
/> */}

<div className="rch-hero-carousel">
  {heroImages.map((image, index) => (
    <img
      key={image.src}
      src={image.src}
      alt={image.alt}
      className={`rch-hero-carousel__image ${
        activeHeroImage === index ? 'is-active' : ''
      }`}
      loading={index === 0 ? 'eager' : 'lazy'}
      fetchpriority={index === 0 ? 'high' : 'auto'}
    />
  ))}

  <button
    type="button"
    className="rch-hero-carousel__arrow rch-hero-carousel__arrow--prev"
    onClick={previousHeroImage}
    aria-label="Previous image"
  >
    &#8249;
  </button>

  <button
    type="button"
    className="rch-hero-carousel__arrow rch-hero-carousel__arrow--next"
    onClick={nextHeroImage}
    aria-label="Next image"
  >
    &#8250;
  </button>

  <div className="rch-hero-carousel__dots" aria-label="Choose an image">
    {heroImages.map((image, index) => (
      <button
        key={image.src}
        type="button"
        className={`rch-hero-carousel__dot ${
          activeHeroImage === index ? 'is-active' : ''
        }`}
        onClick={() => setActiveHeroImage(index)}
        aria-label={`Show image ${index + 1}`}
        aria-pressed={activeHeroImage === index}
      />
    ))}
  </div>
</div>


      </section>
      <section className="rch-benefits" aria-label="Our promises" data-rch-reveal>

        <div className="rch-benefit">Made by hand<span>Thoughtful details in every piece</span></div>

        <div className="rch-benefit">Made personal<span>Keepsakes with your story in mind</span></div>

        <div className="rch-benefit">Made to treasure<span>Gifts for moments worth remembering</span></div>

      </section>

      {/* <section className="rch-section" id="rch-collections">

        <div className="rch-section-heading" data-rch-reveal>

          <span className="rch-eyebrow">Made for meaningful moments</span>

          <h2 className="rch-editorial">Find your kind of keepsake</h2>

          <p>Thoughtful handmade pieces for gifting, remembering, and making everyday moments special.</p>

        </div>

        <Suspense fallback={<p className="rch-empty">Discovering our collection…</p>}>

          <Await resolve={recommendedProducts}>

            {(response) => {

              const products = response?.products?.nodes ?? [];

              return products.length ? (

                <div className="rch-collections" data-rch-reveal>

                  {products.slice(0, 3).map((product) => (

                    <Link className="rch-collection-card" key={product.id} to={`/products/${product.handle}`}>

                      <div className="rch-collection-image">

                        {product.featuredImage ? (

                         
<Image
  data={product.featuredImage}
  alt={product.featuredImage.altText || product.title}
  sizes="(max-width: 640px) 92vw, (max-width: 1200px) 45vw, 680px"
  widths={[320, 480, 640, 800, 1000, 1200]}
  loading="eager"
/>


                        ) : (

                          <div className="rch-image-placeholder">Resin Craft Home</div>

                        )}

                      </div>

                      <h3 className="rch-collection-title">{product.title}</h3>

                      <span className="rch-collection-link">Discover this piece ↗</span>

                    </Link>

                  ))}

                </div>

              ) : (

                <p className="rch-empty">Add products with images in Shopify to display them here.</p>

              );

            }}

          </Await>

        </Suspense>

      </section> */}

      <section className="rch-section rch-products" id="featured-products">

        <div className="rch-section-heading" data-rch-reveal>

          <span className="rch-eyebrow">A few favourites</span>

          <h2 className="rch-editorial">Made to be remembered</h2>

          <p>Explore the latest pieces from our collection.</p>

        </div>

        <Suspense fallback={<p className="rch-empty">Loading our collection…</p>}>

          <Await resolve={recommendedProducts}>

            {(response) => {

              const products = response?.products?.nodes ?? [];
              

              return products.length ? (

                <>

                  <div className="rch-product-grid" data-rch-reveal>

                    {products.map((product, index) => (

                      <ProductItem key={product.id} product={product} loading={index < 2 ? 'eager' : 'lazy'} />

                    ))}

                  </div>

                  <div className="rch-products-cta">

                    <Link className="rch-button" to="/collections/all">Shop all products</Link>

                  </div>

                </>

              ) : (

                <p className="rch-empty">Products will appear here once they are available in your Shopify storefront.</p>

              );

            }}

          </Await>

        </Suspense>

      </section>

           <InstagramReels />


      <section className="rch-story" data-rch-reveal>

        <div className="rch-story-image">

          <Suspense fallback={<div className="rch-image-placeholder">Made with care</div>}>

            <Await resolve={recommendedProducts}>

              {(response) => {

                const product = response?.products?.nodes?.find((item) => item.featuredImage);

               
                return product?.featuredImage ? (
                  
                  <Link
                    className="rch-story-product-link"
                    to={`/products/${product.handle}`}
                    aria-label={`Discover ${product.title}`}
                  >
                    <Image
                      data={product.featuredImage}
                      alt={product.featuredImage.altText || product.title}
                      sizes="(max-width: 640px) 85vw, 40vw"
                      className="rch-story-product-image"
                    />

                    <span className="rch-story-hover">
                      Discover This Piece <span aria-hidden="true">→</span>
                    </span>
                  </Link>

                ) : (
                  <div className="rch-image-placeholder">Made with care</div>
                );


              }}

            </Await>

          </Suspense>

        </div>

        <div className="rch-story-copy">

          <span className="rch-eyebrow">The RCH philosophy</span>

          <h2 className="rch-editorial">Made with care. Kept forever.</h2>

          <p>

            We believe the smallest details can hold the biggest meaning. Every

            keepsake is an opportunity to celebrate a connection, preserve a

            memory, or make an ordinary day feel special.

          </p>

          <Link className="rch-button" to="/pages/our-story">Our story</Link>

        </div>

      </section>

      <section className="rch-newsletter" data-rch-reveal>

        <span className="rch-eyebrow">A little note from us</span>

        <h2 className="rch-editorial">Thoughtful things, delivered.</h2>

        <p>Discover new pieces, thoughtful gift ideas, and little moments of inspiration.</p>

        <Link className="rch-button" to="/pages/contact-us">Get in touch</Link>

      </section>

      <footer className="rch-footer">

        <div>

          <div className="rch-footer-brand">Resin Craft Home</div>

          <p>Handcrafted resin keepsakes for the people, places, and moments you want to hold onto.</p>

        </div>

        <div>

          <h3>Explore</h3>

          <Link to="/">Home</Link>

          <Link to="/collections/all">Shop all products</Link>

          <Link to="/search">Search</Link>

        </div>

        <div>

          <h3>Help</h3>

        <Link to="/pages/contact-us">Contact us</Link>
<Link to="/pages/shipping">Shipping</Link>
<Link to="/track-order">Track my order</Link>

<Link to="/pages/returns-refund">Returns & refunds</Link>

        </div>

        <div>

          <h3>Information</h3>

          <Link to="/pages/our-story">Our story</Link>
<Link to="/pages/privacy-policy">Privacy policy</Link>
<Link to="/pages/terms-of-service">Terms of service</Link>

        </div>

        <div className="rch-footer-bottom">

          <span>© {new Date().getFullYear()} Resin Craft Home</span>

          <span>Made with care, in every detail.</span>

        </div>

      </footer>

    </main>

  );

}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql

  query RecommendedProducts($country: CountryCode, $language: LanguageCode)

    @inContext(country: $country, language: $language) {

    products(first: 4, sortKey: UPDATED_AT, reverse: true) {

      nodes {

        id

        title

        handle

         variants(first: 1) {
          nodes {
            id
            availableForSale
          }
        }

        priceRange {

          minVariantPrice {

            amount

            currencyCode

          }

        }

        featuredImage {

          id

          url

          altText

          width

          height

        }

      }

    }

  }

`;
