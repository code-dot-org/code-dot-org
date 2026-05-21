/**
 * Rasterize an inline SVG element into an HTMLCanvasElement.
 *
 * The `MiniApp.captureThumbnail()` contract returns a canvas; this
 * helper is the standard way to produce one from an SVG visualization.
 *
 * `canvg` is declared as an *optional* peer dependency of
 * `@code-dot-org/mini-app-base`. Any mini-app that imports this
 * entrypoint must list `canvg` in its own dependencies so the dynamic
 * import resolves at runtime. Mini-apps that don't need SVG
 * rasterization (or that render to canvas natively) pay nothing.
 *
 * Returns null when the SVG has no measurable dimensions — e.g. it was
 * detached from the DOM before capture, or no `width`/`viewBox` is
 * declared.
 */
export async function svgToCanvas(
  svg: SVGSVGElement,
): Promise<HTMLCanvasElement | null> {
  const width = svg.width.baseVal.value || svg.viewBox.baseVal.width;
  const height = svg.height.baseVal.value || svg.viewBox.baseVal.height;
  if (!width || !height) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Dynamic import keeps canvg out of any bundle that doesn't reach
  // this code path.
  const {Canvg} = await import('canvg');
  const svgString = new XMLSerializer().serializeToString(svg);
  const v = await Canvg.from(ctx, svgString);
  await v.render();

  return canvas;
}
