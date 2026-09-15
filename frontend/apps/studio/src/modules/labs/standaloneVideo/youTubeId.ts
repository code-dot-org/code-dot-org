// Mirrors Video::EMBED_URL_REGEX in dashboard/app/models/video.rb. Keep
// this pattern in sync with that regex if either one changes.
const EMBED_URL_REGEX =
  /(?:https?:)?\/\/(?:www\.)?youtube(?:education|-nocookie)?\.com\/embed\/([^!*"&?/ ]{11})/;

export function youTubeIdFromEmbedUrl(
  src: string | undefined,
): string | undefined {
  return src?.match(EMBED_URL_REGEX)?.[1];
}
