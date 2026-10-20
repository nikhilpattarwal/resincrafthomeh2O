import {data} from 'react-router';

const DELHIVERY_TRACK_URL =
  'https://track.delhivery.com/api/v1/packages/json/';

export async function loader({request, context}) {
  const url = new URL(request.url);
  const waybill = (url.searchParams.get('waybill') || '').trim();

  // Delhivery AWBs are numeric. Reject malformed input before calling the API.
  if (!/^\d{8,22}$/.test(waybill)) {
    return data({error: 'Enter a valid numeric Delhivery AWB number.'}, {status: 400});
  }

  const token =
    context?.env?.DELHIVERY_API_TOKEN ||
    (typeof process !== 'undefined' ? process.env?.DELHIVERY_API_TOKEN : '');

  if (!token) {
    console.error('[Delhivery tracking] DELHIVERY_API_TOKEN is not configured.');
    return data(
      {error: 'Live tracking is not configured yet. Please try again later.'},
      {status: 503},
    );
  }

  const trackingUrl = new URL(DELHIVERY_TRACK_URL);
  trackingUrl.searchParams.set('waybill', waybill);

  try {
    const response = await fetch(trackingUrl, {
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('[Delhivery tracking] API returned HTTP', response.status);
      return data(
        {error: 'We could not retrieve tracking right now. Please try again shortly.'},
        {status: 502},
      );
    }

    const payload = await response.json();
    const shipmentData = Array.isArray(payload?.ShipmentData)
      ? payload.ShipmentData
      : [];
    const shipment = shipmentData.find((item) => item?.Shipment)?.Shipment;

    if (!shipment) {
      return data(
        {error: 'No tracking information was found for this AWB. Check the number and try again.'},
        {status: 404},
      );
    }

    const status = shipment.Status || {};
    const scans = Array.isArray(shipment.Scans)
      ? shipment.Scans
          .map((entry) => entry?.ScanDetail || entry)
          .filter(Boolean)
          .map((scan, index) => ({
            id: `${scan.ScanDateTime || scan.ScanDate || 'scan'}-${index}`,
            status: scan.Instructions || scan.Scan || scan.ScanType || 'Shipment update',
            location: scan.ScanLocation || '',
            time: scan.ScanDateTime || scan.ScanDate || '',
          }))
          .sort((a, b) => {
            const aTime = Date.parse(a.time) || 0;
            const bTime = Date.parse(b.time) || 0;
            return bTime - aTime;
          })
      : [];

    return data({
      tracking: {
        waybill: shipment.AWB || waybill,
        orderId: shipment.ReferenceNo || shipment.OrderID || '',
        courier: 'Delhivery',
        status: status.Status || 'Status unavailable',
        statusType: status.StatusType || '',
        statusLocation: status.StatusLocation || '',
        statusTime: status.StatusDateTime || '',
        expectedDelivery: shipment.ExpectedDeliveryDate || shipment.ExpectedDelivery || '',
        scans: scans.slice(0, 20),
        publicTrackingUrl: `https://www.delhivery.com/track/package/${encodeURIComponent(shipment.AWB || waybill)}`,
      },
    });
  } catch (error) {
    console.error('[Delhivery tracking] Request failed:', error instanceof Error ? error.message : 'Unknown error');
    return data(
      {error: 'Tracking is temporarily unavailable. Please try again shortly.'},
      {status: 502},
    );
  }
}
