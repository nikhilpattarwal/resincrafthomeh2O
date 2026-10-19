
import {useEffect, useState} from 'react';
import './DiwaliAnnouncement.css';

export function DiwaliAnnouncement() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <aside
      className="rch-diwali-bar"
      aria-label="Diwali special offer"
    >
      <div className="rch-diwali-content">
        <span className="rch-diwali-sparkle" aria-hidden="true">
          ✦
        </span>

        <p className="rch-diwali-message">
          <strong>DIWALI SPECIAL</strong>
          <span className="rch-diwali-separator">|</span>
          Get <strong>20% OFF</strong> on every product
          <span className="rch-diwali-code">
            Code: <strong>DIWALI20</strong>
          </span>
        </p>

        <button
          type="button"
          className="rch-diwali-copy"
          onClick={() => {
            navigator.clipboard
              ?.writeText('DIWALI20')
              .catch(() => {});
          }}
          aria-label="Copy Diwali discount code"
        >
          Copy code
        </button>
      </div>

      <button
        type="button"
        className="rch-diwali-close"
        onClick={() => setVisible(false)}
        aria-label="Close Diwali announcement"
      >
        &times;
      </button>
    </aside>
  );
}
