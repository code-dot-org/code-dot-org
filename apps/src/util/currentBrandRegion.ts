const currentBrandRegion: () => string = () => window.document.querySelector("script[data-brand-region]")?.getAttribute("data-brand-region") || "global";
export default currentBrandRegion;
