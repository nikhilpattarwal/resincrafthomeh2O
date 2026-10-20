import {useState} from 'react';
import {useFetcher} from 'react-router';

export const meta = () => [
  {title: 'Track Your Order | Resin Craft Home'},
  {
    name: 'description',
    content: 'Track your Resin Craft Home order with Delhivery shipment updates.',
  },
];

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

function statusStage(status = '', statusType = '') {
  const value = `${status} ${statusType}`.toLowerCase();
  if (value.includes('deliver') && !value.includes('out for delivery')) return 4;
  if (value.includes('out for delivery')) return 3;
  if (
    value.includes('transit') ||
    value.includes('picked up') ||
    value.includes('pickup scan') ||
    value.includes('reached')
  ) return 2;
  if (value.includes('manifest') || value.includes('ready to ship')) return 1;
  return 0;
}

const STAGES = ['Order placed', 'Ready to ship', 'In transit', 'Out for delivery', 'Delivered'];

export default function TrackOrder() {
  const fetcher = useFetcher();
  const [waybill, setWaybill] = useState('');
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data?.tracking;
  const error = fetcher.data?.error;
  const stage = result ? statusStage(result.status, result.statusType) : 0;

  function submit(event) {
    event.preventDefault();
    const value = waybill.trim();
    if (!/^\d{8,22}$/.test(value)) return;
    fetcher.load(`/api/delhivery-tracking?waybill=${encodeURIComponent(value)}`);
  }

  return (
    <main className="rch-track-page">
      <section className="rch-track-hero">
        <span className="rch-track-eyebrow">RESIN CRAFT HOME · ORDER CARE</span>
        <h1>Track your order</h1>
        <p>Enter your Delhivery tracking number to see the latest shipment updates.</p>
        <form className="rch-track-form" onSubmit={submit}>
          <label htmlFor="rch-waybill">AWB / tracking number</label>
          <div className="rch-track-input-row">
            <input
              id="rch-waybill"
              name="waybill"
              inputMode="numeric"
              autoComplete="off"
              maxLength={22}
              placeholder="e.g. 71129010000022"
              value={waybill}
              onChange={(event) => setWaybill(event.target.value.replace(/\D/g, ''))}
              required
              aria-describedby="rch-track-help"
            />
            <button type="submit" disabled={busy || !/^\d{8,22}$/.test(waybill)}>
              {busy ? 'Checking…' : 'Track order'}
            </button>
          </div>
          <small id="rch-track-help">You can find this number in your shipping confirmation email.</small>
        </form>
      </section>

      {error && (
        <div className="rch-track-message rch-track-error" role="alert">
          {error}
        </div>
      )}

      {result && (
        <section className="rch-track-result" aria-live="polite">
          <div className="rch-track-result-head">
            <div>
              <span className="rch-track-eyebrow">SHIPMENT STATUS</span>
              <h2>{result.status}</h2>
              <p>{result.courier} · AWB {result.waybill}</p>
            </div>
            <a href={result.publicTrackingUrl} target="_blank" rel="noreferrer">
              Open Delhivery tracking ↗
            </a>
          </div>

          <div className="rch-track-progress" aria-label={`Current stage: ${result.status}`}>
            {STAGES.map((label, index) => (
              <div className={`rch-track-stage ${index <= stage ? 'is-complete' : ''}`} key={label}>
                <span className="rch-track-stage-dot" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="rch-track-meta">
            {result.statusLocation && (
              <div><span>Latest location</span><strong>{result.statusLocation}</strong></div>
            )}
            {result.statusTime && (
              <div><span>Last updated</span><strong>{formatDate(result.statusTime)}</strong></div>
            )}
            {result.expectedDelivery && (
              <div><span>Estimated delivery</span><strong>{formatDate(result.expectedDelivery)}</strong></div>
            )}
          </div>

          <div className="rch-track-scans">
            <h3>Shipment history</h3>
            {result.scans.length ? (
              <ol>
                {result.scans.map((scan) => (
                  <li key={scan.id}>
                    <span className="rch-track-scan-dot" />
                    <div>
                      <strong>{scan.status}</strong>
                      {scan.location && <p>{scan.location}</p>}
                      {scan.time && <time>{formatDate(scan.time)}</time>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>Delhivery has not provided scan history for this shipment yet.</p>
            )}
          </div>
        </section>
      )}

      {!result && !error && (
        <p className="rch-track-note">
          Tracking updates appear after Delhivery records shipment scans. A newly created AWB may initially show only the manifest or pickup status.
        </p>
      )}
    </main>
  );
}
