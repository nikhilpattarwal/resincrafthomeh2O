
// import { useEffect, useState } from "react";

// const REEL_LIMIT = 20;

// export default function InstagramReels() {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [failedImages, setFailedImages] = useState([]);

//   useEffect(() => {
//     const controller = new AbortController();

//     async function loadReels() {
//       try {
//         const response = await fetch("/api/instagram-reels", {
//           signal: controller.signal,
//         });

//         if (!response.ok) {
//           throw new Error("Failed to load Instagram Reels");
//         }

//         const result = await response.json();

//         if (!controller.signal.aborted) {
//           setReels((result.reels || []).slice(0, REEL_LIMIT));
//         }
//       } catch (error) {
//         if (error.name !== "AbortError") {
//           console.error("Instagram Reels:", error);
//         }
//       } finally {
//         if (!controller.signal.aborted) setLoading(false);
//       }
//     }

//     loadReels();
//     return () => controller.abort();
//   }, []);

//   const visibleReels = reels.filter(
//     (reel) => !failedImages.includes(reel.id),
//   );

//   if (loading || !visibleReels.length) return null;

//   // Duplicate the list to create a seamless scrolling loop.
//   const carouselReels = [...visibleReels, ...visibleReels];

//   return (
//     <section
//       className="overflow-hidden bg-white py-12 sm:py-14 md:py-20"
//       aria-labelledby="instagram-reels-heading"
//     >
//       <div className="mx-auto mb-8 max-w-7xl px-5 text-center md:mb-12">
//         <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500 sm:text-xs">
//           From our Instagram
//         </p>

//         <h2
//           id="instagram-reels-heading"
//           className="text-2xl font-light tracking-tight text-neutral-900 sm:text-3xl md:text-5xl"
//         >
//           Made with love, shared with you.
//         </h2>

//         <a
//           href="https://www.instagram.com/resincrafthome/"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="mt-3 inline-block text-sm text-neutral-600 underline underline-offset-4"
//         >
//           @resincrafthome
//         </a>
//       </div>

//       <div className="reels-carousel group">
//         <div className="reels-track">
//           {carouselReels.map((reel, index) => (
//             <a
//               key={`${reel.id}-${index}`}
//               href={reel.permalink}
//               target="_blank"
//               rel="noopener noreferrer"
//               aria-label={`Watch Instagram Reel ${(index % visibleReels.length) + 1}`}
//               tabIndex={index >= visibleReels.length ? -1 : 0}
//               className="reel-card group/card"
//             >
//               <img
//                 src={reel.thumbnail}
//                 alt=""
//                 width="480"
//                 height="600"
//                 loading="lazy"
//                 decoding="async"
//                 onError={() => {
//                   setFailedImages((current) =>
//                     current.includes(reel.id)
//                       ? current
//                       : [...current, reel.id],
//                   );
//                 }}
//                 className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
//               />

//               <span className="reel-play" aria-hidden="true">
//                 ▶
//               </span>
//             </a>
//           ))}
//         </div>
//       </div>

//       <div className="mt-8 px-5 text-center md:mt-10">
//         <a
//           href="https://www.instagram.com/resincrafthome/"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="inline-block border border-neutral-900 px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-neutral-900 hover:text-white sm:text-xs"
//         >
//           Explore our Instagram
//         </a>
//       </div>

// <style>{`
//   .reels-carousel {
//     --reel-width: 160px;
//     --reel-gap: 12px;
//     width: 100%;
//     overflow: hidden;
//   }

//   .reels-track {
//     display: flex;
//     width: max-content;
//     gap: var(--reel-gap);
//     animation: reels-scroll 36s linear infinite;
//     will-change: transform;
//   }

//   .reels-carousel:hover .reels-track,
//   .reels-carousel:focus-within .reels-track {
//     animation-play-state: paused;
//   }

//   .reel-card {
//     position: relative;
//     display: block;
//     flex: 0 0 var(--reel-width);
//     aspect-ratio: 4 / 5;
//     overflow: hidden;
//     background: #f5f3f0;
//     border-radius: 3px;
//     -webkit-tap-highlight-color: transparent;
//   }

//   .reel-card img {
//     display: block;
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//   }

//   .reel-play {
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     display: flex;
//     width: 40px;
//     height: 40px;
//     align-items: center;
//     justify-content: center;
//     border: 1px solid rgb(255 255 255 / 85%);
//     border-radius: 50%;
//     background: rgb(0 0 0 / 22%);
//     color: white;
//     transform: translate(-50%, -50%);
//     transition:
//       background 200ms ease,
//       transform 200ms ease;
//     pointer-events: none;
//   }

//   .reel-card:hover .reel-play {
//     background: rgb(0 0 0 / 50%);
//     transform: translate(-50%, -50%) scale(1.08);
//   }

//   @keyframes reels-scroll {
//     from {
//       transform: translateX(0);
//     }
//     to {
//       transform: translateX(calc(-50% - var(--reel-gap) / 2));
//     }
//   }

//   @media (min-width: 480px) {
//     .reels-carousel {
//       --reel-width: 175px;
//       --reel-gap: 14px;
//     }
//   }

//   @media (min-width: 768px) {
//     .reels-carousel {
//       --reel-width: 195px;
//       --reel-gap: 16px;
//     }
//   }

//   @media (min-width: 1280px) {
//     .reels-carousel {
//       --reel-width: 215px;
//       --reel-gap: 18px;
//     }
//   }

//   @media (prefers-reduced-motion: reduce) {
//     .reels-track {
//       animation: none;
//       will-change: auto;
//     }
//   }
// `}</style>

//     </section>
//   );
// }




import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const REEL_LIMIT = 8;

export default function InstagramReels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState([]);
  const [selectedReel, setSelectedReel] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [portalReady, setPortalReady] = useState(false);

useEffect(() => {
  setPortalReady(true);
}, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReels() {
      try {
        const response = await fetch("/api/instagram-reels", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load Instagram Reels");
        }

        const result = await response.json();

        if (!controller.signal.aborted) {
          setReels((result.reels || []).slice(0, REEL_LIMIT));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Instagram Reels:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadReels();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedReel) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") setSelectedReel(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedReel]);

  function openReel(reel) {
    setVideoError(!reel.mediaUrl);
    setVideoLoading(Boolean(reel.mediaUrl));
    setSelectedReel(reel);
  }

  const visibleReels = reels.filter(
    (reel) => !failedImages.includes(reel.id),
  );

  if (loading || !visibleReels.length) return null;

  // Duplicate cards for a continuous scrolling loop.
  const carouselReels = [...visibleReels, ...visibleReels];

  return (
    <section
      className="overflow-hidden bg-white py-12 sm:py-14 md:py-20"
      aria-labelledby="instagram-reels-heading"
    >
      <div className="mx-auto mb-8 max-w-7xl px-5 text-center md:mb-12">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-neutral-500 sm:text-xs">
          From our Instagram
        </p>

        <h2
          id="instagram-reels-heading"
          className="text-2xl  font-light tracking-tight text-[#FFDEAD] sm:text-3xl md:text-5xl"
        >
          Made with love, shared with you.
        </h2>

        
<a
  href="https://www.instagram.com/resincrafthome/"
  target="_blank"
  rel="noopener noreferrer"
  className="group mt-4 inline-flex items-center gap-2 rounded-full border border-[#E8D5C0] bg-[#FFFAF4] px-5 py-2.5 text-sm font-medium tracking-wide text-[#8B5E3C] transition-all duration-300 hover:border-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
  </svg>

  <span>@resincrafthome</span>

  <span
    aria-hidden="true"
    className="ml-0.5 transition-transform duration-300 group-hover:translate-x-1"
  >
    ↗
  </span>
</a>

      </div>

      <div className="reels-carousel group">
        <div className="reels-track">
          {carouselReels.map((reel, index) => (
            <button
              key={`${reel.id}-${index}`}
              type="button"
              onClick={() => openReel(reel)}
              aria-label={`Play Instagram Reel ${
                (index % visibleReels.length) + 1
              }`}
              tabIndex={index >= visibleReels.length ? -1 : 0}
              className="reel-card group/card"
            >
              {reel.thumbnail && (
                <img
                  src={reel.thumbnail}
                  alt=""
                  width="480"
                  height="600"
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    setFailedImages((current) =>
                      current.includes(reel.id)
                        ? current
                        : [...current, reel.id],
                    );
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
              )}

              <span className="reel-play" aria-hidden="true">
                ▶
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 px-5 text-center md:mt-10">
        <a
          href="https://www.instagram.com/resincrafthome/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-neutral-900 px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-neutral-900 hover:text-white sm:text-xs"
        >
          Explore our Instagram
        </a>
      </div>

     
{portalReady && selectedReel &&
  createPortal(
    <div
      className="reel-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedReel(null);
        }
      }}
    >
      <div
        className="reel-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Instagram Reel video player"
      >
        <button
          type="button"
          className="reel-modal-close"
          onClick={() => setSelectedReel(null)}
          aria-label="Close video"
        >
          ×
        </button>

        <div className="reel-video-container">
          {selectedReel.mediaUrl && !videoError ? (
            <>
              {videoLoading && (
                <div className="reel-video-status" role="status">
                  Loading video…
                </div>
              )}

              <video
                key={selectedReel.id}
                src={selectedReel.mediaUrl}
                poster={selectedReel.thumbnail || undefined}
                controls
                autoPlay
                playsInline
                preload="metadata"
                onLoadedData={() => setVideoLoading(false)}
                onCanPlay={() => setVideoLoading(false)}
                onError={() => {
                  setVideoLoading(false);
                  setVideoError(true);
                }}
                className="reel-video"
              />
            </>
          ) : (
            <div className="reel-video-fallback">
              <p>This video cannot be played directly right now.</p>
              <a
                href={selectedReel.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on Instagram
              </a>
            </div>
          )}
        </div>

        {selectedReel.caption && (
          <p className="reel-modal-caption">
            {selectedReel.caption}
          </p>
        )}
      </div>
    </div>,
    document.body,
  )}

      <style>{`
        .reels-carousel {
          --reel-width: 160px;
          --reel-gap: 12px;
          width: 100%;
          overflow: hidden;
        }

        .reels-track {
          display: flex;
          width: max-content;
          gap: var(--reel-gap);
          animation: reels-scroll 36s linear infinite;
          will-change: transform;
        }

        .reels-carousel:hover .reels-track,
        .reels-carousel:focus-within .reels-track {
          animation-play-state: paused;
        }

        .reel-card {
          position: relative;
          display: block;
          flex: 0 0 var(--reel-width);
          aspect-ratio: 4 / 5;
          overflow: hidden;
          padding: 0;
          border: 0;
          border-radius: 3px;
          background: #f5f3f0;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        .reel-card img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reel-play {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgb(255 255 255 / 85%);
          border-radius: 50%;
          background: rgb(0 0 0 / 22%);
          color: white;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        @keyframes reels-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - var(--reel-gap) / 2)); }
        }

      .reel-modal {
  position: fixed;
  z-index: 2147483647;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(0 0 0 / 78%);
  isolation: isolate;
}

.reel-modal-panel {
  position: relative;
  z-index: 1;
  width: min(100%, 400px);
  max-height: 88dvh;
  overflow: hidden;
  border-radius: 10px;
  background: #111;
}
.reel-video-container {
  position: relative;
  display: flex;
  width: 100%;
  max-height: 70dvh;
  aspect-ratio: 9 / 16;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.reel-video {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 70dvh;
  object-fit: contain;
}
  .reel-modal-caption {
  max-height: 18dvh;
  overflow-y: auto;
  padding: 12px 16px;
  color: white;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-line;
}


        .reel-modal-close {
          position: absolute;
          z-index: 2;
          top: 10px;
          right: 10px;
          display: flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgb(255 255 255 / 45%);
          border-radius: 50%;
          background: rgb(0 0 0 / 55%);
          color: white;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
        }

      

      

        .reel-video-status {
          position: absolute;
          z-index: 1;
          color: white;
          font-size: 14px;
          pointer-events: none;
        }

        .reel-video-fallback {
          padding: 40px 24px;
          color: white;
          text-align: center;
        }

        .reel-video-fallback a {
          display: inline-block;
          margin-top: 14px;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .reel-modal-caption {
          overflow-y: auto;
          padding: 14px 16px;
          color: white;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-line;
        }

        @media (min-width: 480px) {
          .reels-carousel {
            --reel-width: 175px;
            --reel-gap: 14px;
          }
        }

        @media (min-width: 768px) {
          .reels-carousel {
            --reel-width: 195px;
            --reel-gap: 16px;
          }
        }

        @media (min-width: 1280px) {
          .reels-carousel {
            --reel-width: 215px;
            --reel-gap: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reels-track {
            animation: none;
            will-change: auto;
          }
        }
      `}</style>
    </section>
  );
}
