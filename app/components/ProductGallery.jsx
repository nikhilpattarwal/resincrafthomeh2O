
import {useState} from 'react';
import {Image} from '@shopify/hydrogen';

export function ProductGallery({images, title, selectedImage}) {
  const galleryImages = images?.nodes ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  // Prefer the selected variant image when it matches a gallery image.
  const selectedIndex = galleryImages.findIndex(
    (image) => image.id && image.id === selectedImage?.id,
  );

  const currentIndex =
    selectedIndex >= 0 && activeIndex === 0
      ? selectedIndex
      : activeIndex;

  if (!galleryImages.length) {
    return selectedImage ? (
      <Image data={selectedImage} alt={title} />
    ) : null;
  }

  const activeImage = galleryImages[currentIndex] ?? galleryImages[0];

  function showImage(index) {
    setActiveIndex(
      (index + galleryImages.length) % galleryImages.length,
    );
  }

  return (
    <div className="rch-gallery">
      <div className="rch-gallery__main">
        <Image
          data={activeImage}
          alt={activeImage.altText || title}
          sizes="(min-width: 900px) 50vw, 100vw"
          className="rch-gallery__main-image"
        />

        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              className="rch-gallery__arrow rch-gallery__prev"
              aria-label="Previous product image"
              onClick={() => showImage(currentIndex - 1)}
            >
              ‹
            </button>

            <button
              type="button"
              className="rch-gallery__arrow rch-gallery__next"
              aria-label="Next product image"
              onClick={() => showImage(currentIndex + 1)}
            >
              ›
            </button>
          </>
        )}
      </div>

      {galleryImages.length > 1 && (
        <div className="rch-gallery__thumbnails">
          {galleryImages.map((image, index) => (
            <button
              key={image.id || image.url || index}
              type="button"
              className={`rch-gallery__thumbnail ${
                index === currentIndex ? 'is-active' : ''
              }`}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={index === currentIndex}
              onClick={() => showImage(index)}
            >
              <Image
                data={image}
                alt={image.altText || `${title} image ${index + 1}`}
                sizes="90px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
