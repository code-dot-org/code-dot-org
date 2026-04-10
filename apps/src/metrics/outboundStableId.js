import cookies from 'js-cookie';

// TODO: should we move these to shared constants?
const STABLE_ID_KEY = 'statsig_stable_id';
const TARGET_HOSTNAME = 'code.org';

// Read the statsig_stable_id cookie. Returns null if not set (i.e., user
// has not given OneTrust C0002 consent).
function getStableIdFromCookie() {
  return cookies.get(STABLE_ID_KEY) || null;
}

// Delegated click handler that appends statsig_stable_id to outbound
// code.org links so the stable ID survives the cross-domain transition.
function handleOutboundClick(event) {
  const anchor = event.target.closest('a');
  if (!anchor) {
    return;
  }

  let url;
  try {
    url = new URL(anchor.href, window.location.origin);
  } catch {
    return;
  }

  if (url.hostname !== TARGET_HOSTNAME) {
    return;
  }

  const stableId = getStableIdFromCookie();
  if (!stableId) {
    return;
  }

  url.searchParams.set(STABLE_ID_KEY, stableId);
  anchor.href = url.toString();
}

// Register a single delegated click listener on document.
export function initOutboundStableId() {
  if (typeof document === 'undefined') {
    return;
  }
  console.log('Initializing outbound stable ID handler');
  document.addEventListener('click', handleOutboundClick);
}
