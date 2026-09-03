import cookies from 'js-cookie';

const STABLE_ID_KEY = 'statsig_stable_id';
const TARGET_HOSTNAME = 'code.org';
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!stableId || !UUID_RE.test(stableId)) {
    return;
  }

  url.searchParams.set(STABLE_ID_KEY, stableId);
  anchor.href = url.toString();
}

let initialized = false;

// Register a single delegated click listener on document.
export function initOutboundStableId() {
  if (typeof document === 'undefined' || initialized) {
    return;
  }
  initialized = true;
  document.addEventListener('click', handleOutboundClick);
}
