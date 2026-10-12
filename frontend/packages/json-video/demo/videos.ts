/**
 * Videos the demo can load by name (`?video=<name>`). The e2e suite depends
 * on their exact timing and text, so change them together with e2e/.
 */

function dataUri(video: unknown): string {
  return `data:application/json,${encodeURIComponent(JSON.stringify(video))}`;
}

function scene(title: string, speech?: string) {
  return {
    duration: '2s',
    html: `<h1 style="font-family: sans-serif">${title}</h1>`,
    ...(speech ? {speech} : {}),
  };
}

export const VIDEOS: Record<string, string> = {
  // 6 s; the middle scene has no speech, so it shows no caption.
  threeScenes: dataUri({
    scenes: [
      scene('Scene 1', 'First caption'),
      scene('Scene 2'),
      scene('Scene 3', 'Third caption'),
    ],
  }),
  broken: 'data:application/json,{not json',
};
