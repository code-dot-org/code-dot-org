// Interpreted helper libraries the lab carries, so a run needs no fetch for
// them. They are files in dashboard/config/libraries, read at build time;
// any other library a level names is fetched from /libraries.
import nativeSpriteLab from '../../../../../../dashboard/config/libraries/NativeSpriteLab.interpreted.js?raw';

const BUNDLED: Record<string, string> = {
  NativeSpriteLab: nativeSpriteLab,
};

export async function loadHelperLibrary(name: string): Promise<string> {
  if (name in BUNDLED) {
    return BUNDLED[name];
  }
  const response = await fetch(`/libraries/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error(`Unable to load library ${name}: HTTP ${response.status}`);
  }
  return response.text();
}
