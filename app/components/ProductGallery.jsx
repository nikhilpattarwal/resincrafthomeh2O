
// import {useState} from 'react';
// import {Image} from '@shopify/hydrogen';

// export function ProductGallery({images, title, selectedImage}) {
//   const galleryImages = images?.nodes ?? [];
//   const [activeIndex, setActiveIndex] = useState(0);

//   // Prefer the selected variant image when it matches a gallery image.
//   const selectedIndex = galleryImages.findIndex(
//     (image) => image.id && image.id === selectedImage?.id,
//   );

//   const currentIndex =
//     selectedIndex >= 0 && activeIndex === 0
//       ? selectedIndex
//       : activeIndex;

//   if (!galleryImages.length) {
//     return selectedImage ? (
//       <Image data={selectedImage} alt={title} />
//     ) : null;
//   }

//   const activeImage = galleryImages[currentIndex] ?? galleryImages[0];

//   function showImage(index) {
//     setActiveIndex(
//       (index + galleryImages.length) % galleryImages.length,
//     );
//   }

//   return (
//     <div className="rch-gallery">
//       <div className="rch-gallery__main">
//         <Image
//           data={activeImage}
//           alt={activeImage.altText || title}
//           sizes="(min-width: 900px) 50vw, 100vw"
//           className="rch-gallery__main-image"
//         />

//         {galleryImages.length > 1 && (
//           <>
//             <button
//               type="button"
//               className="rch-gallery__arrow rch-gallery__prev"
//               aria-label="Previous product image"
//               onClick={() => showImage(currentIndex - 1)}
//             >
//               ‹
//             </button>

//             <button
//               type="button"
//               className="rch-gallery__arrow rch-gallery__next"
//               aria-label="Next product image"
//               onClick={() => showImage(currentIndex + 1)}
//             >
//               ›
//             </button>
//           </>
//         )}
//       </div>

//       {galleryImages.length > 1 && (
//         <div className="rch-gallery__thumbnails">
//           {galleryImages.map((image, index) => (
//             <button
//               key={image.id || image.url || index}
//               type="button"
//               className={`rch-gallery__thumbnail ${
//                 index === currentIndex ? 'is-active' : ''
//               }`}
//               aria-label={`View product image ${index + 1}`}
//               aria-pressed={index === currentIndex}
//               onClick={() => showImage(index)}
//             >
//               <Image
//                 data={image}
//                 alt={image.altText || `${title} image ${index + 1}`}
//                 sizes="90px"
//               />
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }




import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

export function ProductGallery({images, title, selectedImage}) {
  const galleryImages = images?.nodes ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({x: 0, y: 0});

  const imageRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const lastTap = useRef(0);

  const selectedIndex = galleryImages.findIndex(
    (image) => image.id && image.id === selectedImage?.id,
  );

  const currentIndex =
    selectedIndex >= 0 && activeIndex === 0
      ? selectedIndex
      : activeIndex;

  const activeImage = galleryImages[currentIndex] ?? galleryImages[0];

  function showImage(index) {
    setActiveIndex((index + galleryImages.length) % galleryImages.length);
  }

  function resetZoom() {
    setScale(1);
    setPosition({x: 0, y: 0});
    pointers.current.clear();
    gesture.current = null;
  }

  function closeZoom() {
    setZoomOpen(false);
    resetZoom();
  }

  useEffect(() => {
    if (!zoomOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event) {
      if (event.key === 'Escape') closeZoom();

      if (event.key === 'ArrowLeft' && galleryImages.length > 1) {
        showImage(currentIndex - 1);
        resetZoom();
      }

      if (event.key === 'ArrowRight' && galleryImages.length > 1) {
        showImage(currentIndex + 1);
        resetZoom();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [zoomOpen, currentIndex, galleryImages.length]);

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const pts = [...pointers.current.values()];

    if (pts.length === 2) {
      gesture.current = {
        type: 'pinch',
        distance: Math.hypot(
          pts[0].x - pts[1].x,
          pts[0].y - pts[1].y,
        ),
        scale,
      };
    } else if (pts.length === 1 && scale > 1) {
      gesture.current = {
        type: 'pan',
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
      };
    }
  }

  function handlePointerMove(event) {
    if (!pointers.current.has(event.pointerId)) return;

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const pts = [...pointers.current.values()];
    const currentGesture = gesture.current;

    if (pts.length === 2 && currentGesture?.type === 'pinch') {
      const distance = Math.hypot(
        pts[0].x - pts[1].x,
        pts[0].y - pts[1].y,
      );

      setScale(
        Math.min(
          4,
          Math.max(
            1,
            currentGesture.scale *
              (distance / Math.max(currentGesture.distance, 1)),
          ),
        ),
      );
    } else if (pts.length === 1 && currentGesture?.type === 'pan') {
      setPosition({
        x: currentGesture.originX + event.clientX - currentGesture.startX,
        y: currentGesture.originY + event.clientY - currentGesture.startY,
      });
    }
  }

  function handlePointerUp(event) {
    pointers.current.delete(event.pointerId);

    if (pointers.current.size === 1) {
      const remaining = [...pointers.current.values()][0];
      gesture.current = scale > 1
        ? {
            type: 'pan',
            startX: remaining.x,
            startY: remaining.y,
            originX: position.x,
            originY: position.y,
          }
        : null;
    } else {
      gesture.current = null;
    }
  }

  function handleImageClick() {
    const now = Date.now();

    if (now - lastTap.current < 300) {
      setScale((value) => {
        if (value > 1) {
          setPosition({x: 0, y: 0});
          return 1;
        }
        return 2;
      });
    }

    lastTap.current = now;
  }

  if (!galleryImages.length && selectedImage) {
    return <Image data={selectedImage} alt={title} />;
  }

  if (!activeImage) return null;

  return (
    <div className="rch-gallery">
      <div className="rch-gallery__main">
        <button
          type="button"
          className="rch-gallery__zoom-trigger"
          onClick={() => {
            resetZoom();
            setZoomOpen(true);
          }}
          aria-label={`Zoom ${activeImage.altText || title}`}
        >
          <Image
            data={activeImage}
            alt={activeImage.altText || title}
            sizes="(min-width: 900px) 50vw, 100vw"
            className="rch-gallery__main-image"
          />
          <span className="rch-gallery__zoom-hint">＋ Zoom</span>
        </button>

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

      {zoomOpen && (
        <div
          className="rch-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Product image viewer"
          onClick={closeZoom}
        >
          <button
            type="button"
            className="rch-gallery__lightbox-close"
            onClick={closeZoom}
            aria-label="Close image viewer"
          >
            ×
          </button>

          <div className="rch-gallery__zoom-controls">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setScale((value) => Math.max(1, value - 0.5));
                if (scale <= 1.5) setPosition({x: 0, y: 0});
              }}
              aria-label="Zoom out"
            >
              −
            </button>
            <span>{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setScale((value) => Math.min(4, value + 0.5));
              }}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                resetZoom();
              }}
            >
              Reset
            </button>
          </div>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                className="rch-gallery__lightbox-arrow is-prev"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  showImage(currentIndex - 1);
                  resetZoom();
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="rch-gallery__lightbox-arrow is-next"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  showImage(currentIndex + 1);
                  resetZoom();
                }}
              >
                ›
              </button>
            </>
          )}

          <div
            className="rch-gallery__lightbox-stage"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              ref={imageRef}
              className="rch-gallery__zoom-surface"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onDoubleClick={() =>
                setScale((value) => (value > 1 ? 1 : 2))
              }
              onClick={handleImageClick}
              style={{
                touchAction: 'none',
                cursor: scale > 1 ? 'grab' : 'zoom-in',
              }}
            >
              <img
                src={activeImage.url}
                alt={activeImage.altText || title}
                draggable="false"
                className="rch-gallery__zoom-image"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
              />
            </div>
          </div>

          <p className="rch-gallery__zoom-caption">
            {activeImage.altText || title} · Pinch or use + to zoom
          </p>
        </div>
      )}
    </div>
  );
}
