
// import { useEffect, useRef, useState } from 'react';
// import { Link } from 'react-router';


// const videos = [
//   {
//     src: '/videos/resin-process.mp4',
//     eyebrow: 'MADE BY HAND',
//     title: 'Every Detail Tells a Story',
//   },
//   {
//     src: '/videos/resin-process2.mp4',
//     eyebrow: 'MADE WITH LOVE',
//     title: 'Little Things, Lasting Memories',
//   },
//   {
//     src: '/videos/resin-process3.mp4',
//     eyebrow: 'MADE JUST FOR YOU',
//     title: 'Keepsakes Made to Treasure',
//   },
// ];


// export function ResinProcess() {
//   const videoRef = useRef(null);
//   const [currentVideo, setCurrentVideo] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [videoFailed, setVideoFailed] = useState(false);
//   const [showVideoCaption, setShowVideoCaption] = useState(false);


// const [activeSlide, setActiveSlide] = useState(0);
// const [isChanging, setIsChanging] = useState(false);

// useEffect(() => {
//   let fadeTimer;

//   const interval = window.setInterval(() => {
//     setIsChanging(true);

//     fadeTimer = window.setTimeout(() => {
//       setActiveSlide((current) => (current + 1) % heroSlides.length);
//       setIsChanging(false);
//     }, 250);
//   }, 4000);

//   return () => {
//     window.clearInterval(interval);
//     window.clearTimeout(fadeTimer);
//   };
// }, []);

// useEffect(() => {
//   setShowVideoCaption(false);

//   if (!isPlaying || videoFailed) return;

//   const showTimer = window.setTimeout(() => {
//     setShowVideoCaption(true);
//   }, 100);

//   const hideTimer = window.setTimeout(() => {
//     setShowVideoCaption(false);
//   }, 4600);

//   return () => {
//     window.clearTimeout(showTimer);
//     window.clearTimeout(hideTimer);
//   };
// }, [currentVideo, isPlaying, videoFailed]);

  
// const heroSlides = [
//   {
//     eyebrow: 'HANDCRAFTED WITH LOVE',
//     title: 'Every product tells a story.',
//     description:
//       'A flower from a special day. A memory worth keeping. Each handmade resin creation transforms meaningful moments into keepsakes you can treasure for years.',
//     button: 'Discover Our Creations',
//   },
//   {
//     eyebrow: 'MADE JUST FOR YOU',
//     title: 'Memories, made tangible.',
//     description:
//       'Turn your favourite flowers and meaningful moments into beautiful resin keepsakes designed to last.',
//     button: 'Explore Handmade Gifts',
//   },
//   {
//     eyebrow: 'THE BEAUTY OF HANDMADE',
//     title: 'Little things, made to last.',
//     description:
//       'Discover handcrafted resin art, thoughtful gifts, and timeless pieces created with care and attention to detail.',
//     button: 'Shop Our Collection',
//   },
//   {
//     eyebrow: 'GIFTS WITH MEANING',
//     title: 'Give something unforgettable.',
//     description:
//       'From personalised keepsakes to elegant home decor, find something special for the people who matter most.',
//     button: 'Find Your Favourite',
//   },
// ];



// const slide = heroSlides[activeSlide];



// useEffect(() => {
//   const video = videoRef.current;
//   if (!video) return;

//   setIsPlaying(false);
//   setVideoFailed(false);

//   video.load();

//   video.play().catch(() => {
//     // Fallback remains visible if autoplay is blocked.
//   });
// }, [currentVideo]);


//   const handleVideoEnded = () => {
//     setIsPlaying(false);
//     setCurrentVideo((previous) => (previous + 1) % videos.length);
//   };

//   const handleVideoError = () => {
//     setIsPlaying(false);
//     setVideoFailed(true);
//   };

//   return (
//     <section className="resin-process">

//     <div className={`rch-hero-copy-content ${isChanging ? 'is-changing' : ''}`}>
//       <span className="rch-eyebrow">{slide.eyebrow}</span>

//       <h1 className="rch-editorial">{slide.title}</h1>

//       <p style={{ color: '#778899' }}>{slide.description}</p>

//       <a href="/collections/all" className="rch-hero-text-link">
//         {slide.button} <span aria-hidden="true">→</span>
//       </a>
//     </div>


//       <div className="resin-process__media">
//         <div
//           className={`resin-process__fallback ${
//             isPlaying && !videoFailed ? 'is-hidden' : ''
//           }`}
//           aria-hidden={isPlaying && !videoFailed}
//         >
//           <img
//             src="/resin-story-fallback.png"
//             alt=""
//             className="resin-process__fallback-image"
//           />

//           <div className="resin-process__fallback-overlay">
//             <span>MADE WITH MEANING</span>
//             <h3>Memories, preserved forever.</h3>
//             <p>
//               Natural beauty, thoughtful hands, and a little
//               resin — creating something uniquely yours.
//             </p>
//           </div>
//         </div>

        
//         <video
//           ref={videoRef}
//           key={videos[currentVideo].src}
//           className={`resin-process__video ${
//             isPlaying && !videoFailed ? 'is-playing' : ''
//           } ${videoFailed ? 'is-hidden' : ''}`}
//           poster="/resin-story-fallback.png"
//           muted
//           autoPlay
//           playsInline
//           preload="none"
//           onPlaying={() => {
//             setVideoFailed(false);
//             setIsPlaying(true);
//           }}
//           onEnded={handleVideoEnded}
//           onError={handleVideoError}
//           aria-label="Behind the scenes of handmade resin art"
//         >
//           <source src={videos[currentVideo].src} type="video/mp4" />
//         </video>

        
//         <div
//           key={currentVideo}
//           className={`resin-process__video-caption ${
//             showVideoCaption ? 'is-visible' : ''
//           }`}
//         >
//           <span>{videos[currentVideo].eyebrow}</span>
//           <h3>{videos[currentVideo].title}</h3>
//         </div>


//       </div>
//     </section>
//   );
// }






import { Image } from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';

const videos = [
  {
    src: '/videos/resin-process.mp4',
    eyebrow: 'MADE BY HAND',
    title: 'Every Detail Tells a Story',
  },
  {
    src: '/videos/resin-process2.mp4',
    eyebrow: 'MADE WITH LOVE',
    title: 'Little Things, Lasting Memories',
  },
  {
    src: '/videos/resin-process3.mp4',
    eyebrow: 'MADE JUST FOR YOU',
    title: 'Keepsakes Made to Treasure',
  },
];

const heroSlides = [
  {
    eyebrow: 'HANDCRAFTED WITH LOVE',
    title: 'Every product tells a story.',
    description:
      'A flower from a special day. A memory worth keeping. Each handmade resin creation transforms meaningful moments into keepsakes you can treasure for years.',
    button: 'Discover Our Creations',
  },
  {
    eyebrow: 'MADE JUST FOR YOU',
    title: 'Memories, made tangible.',
    description:
      'Turn your favourite flowers and meaningful moments into beautiful resin keepsakes designed to last.',
    button: 'Explore Handmade Gifts',
  },
  {
    eyebrow: 'THE BEAUTY OF HANDMADE',
    title: 'Little things, made to last.',
    description:
      'Discover handcrafted resin art, thoughtful gifts, and timeless pieces created with care and attention to detail.',
    button: 'Shop Our Collection',
  },
  {
    eyebrow: 'GIFTS WITH MEANING',
    title: 'Give something unforgettable.',
    description:
      'From personalised keepsakes to elegant home decor, find something special for the people who matter most.',
    button: 'Find Your Favourite',
  },
];

export function ResinProcess() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showVideoCaption, setShowVideoCaption] = useState(false);

  // Load videos only when the section approaches the viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      {rootMargin: '300px 0px'},
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Rotate the hero copy only while the section is near the viewport.
  useEffect(() => {
    if (!isNearViewport) return;

    let fadeTimer;

    const interval = window.setInterval(() => {
      setIsChanging(true);

      fadeTimer = window.setTimeout(() => {
        setActiveSlide((current) => (current + 1) % heroSlides.length);
        setIsChanging(false);
      }, 250);
    }, 4000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
    };
  }, [isNearViewport]);

  // Display the video caption briefly after playback begins.
  useEffect(() => {
    setShowVideoCaption(false);

    if (!isPlaying || videoFailed) return;

    const showTimer = window.setTimeout(() => {
      setShowVideoCaption(true);
    }, 100);

    const hideTimer = window.setTimeout(() => {
      setShowVideoCaption(false);
    }, 4600);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [currentVideo, isPlaying, videoFailed]);

  // Attempt playback when a video source is available.
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isNearViewport || videoFailed) return;

    video.play().catch(() => {
      // Keep the poster visible if playback is unavailable.
    });
  }, [isNearViewport, currentVideo, videoFailed]);

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowVideoCaption(false);
    setCurrentVideo((current) => (current + 1) % videos.length);
  };

  const handleVideoError = () => {
    setIsPlaying(false);
    setVideoFailed(true);
  };

  const slide = heroSlides[activeSlide];

  return (
    <section className="resin-process" ref={sectionRef}>
      <div
        className={`rch-hero-copy-content ${
          isChanging ? 'is-changing' : ''
        }`}
      >
        <span className="rch-eyebrow">{slide.eyebrow}</span>

        <h1 className="rch-editorial">{slide.title}</h1>

        <p style={{color: '#778899'}}>{slide.description}</p>

        <a href="/collections/all" className="rch-hero-text-link">
          {slide.button} <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="resin-process__media">
        <div
          className={`resin-process__fallback ${
            isPlaying && !videoFailed ? 'is-hidden' : ''
          }`}
          aria-hidden={isPlaying && !videoFailed}
        >
          <Image
            src="/resin-story-fallback.webp"
            alt=""
            className="resin-process__fallback-image"
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 50vw"

          />

          <div className="resin-process__fallback-overlay">
            <span>MADE WITH MEANING</span>
            <h3>Memories, preserved forever.</h3>
            <p>
              Natural beauty, thoughtful hands, and a little
              resin — creating something uniquely yours.
            </p>
          </div>
        </div>

        {isNearViewport && (
          <video
            ref={videoRef}
            key={videos[currentVideo].src}
            className={`resin-process__video ${
              isPlaying && !videoFailed ? 'is-playing' : ''
            } ${videoFailed ? 'is-hidden' : ''}`}
            src={videos[currentVideo].src}
            poster="/resin-story-fallback.webp"
            muted
            autoPlay
            playsInline
            preload="none"
            onPlaying={() => {
              setVideoFailed(false);
              setIsPlaying(true);
            }}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            aria-label="Behind the scenes of handmade resin art"
          />
        )}

        <div
          className={`resin-process__video-caption ${
            showVideoCaption ? 'is-visible' : ''
          }`}
        >
          <span>{videos[currentVideo].eyebrow}</span>
          <h3>{videos[currentVideo].title}</h3>
        </div>
      </div>
    </section>
  );
}
