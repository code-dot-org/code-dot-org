// A scene run in a real browser: images drawn on a canvas, the real
// NativeSpriteLab helper library, and a program that exercises keys,
// touching, behaviors, timed events and speech. `window.spriteLabEngine`
// is the engine, for driving it from Playwright.
import nativeSpriteLab from '../../../../../../dashboard/config/libraries/NativeSpriteLab.interpreted.js?raw';
import {SpriteLabEngine} from '../engine/Engine';
import type {RuntimeAnimationList, RuntimeAnimationProps} from '../types';

function drawImage(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d') as CanvasRenderingContext2D);
  return canvas.toDataURL('image/png');
}

function circle(color: string) {
  return (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(50, 50, 40, 0, Math.PI * 2);
    ctx.fill();
  };
}

function props(
  name: string,
  dataURI: string,
  extra: Partial<RuntimeAnimationProps> = {},
): RuntimeAnimationProps {
  return {
    name,
    frameSize: {x: 100, y: 100},
    frameCount: 1,
    looping: true,
    frameDelay: 4,
    dataURI,
    ...extra,
  };
}

const images: RuntimeAnimationList = {
  orderedKeys: ['sky', 'cat', 'fish', 'block'],
  propsByKey: {
    sky: props(
      'sky',
      drawImage(400, 400, ctx => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#9fd8ff');
        gradient.addColorStop(1, '#2d6aa0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);
      }),
      {frameSize: {x: 400, y: 400}, categories: ['backgrounds']},
    ),
    cat: props('cat', drawImage(100, 100, circle('#f28c28'))),
    fish: props('fish', drawImage(100, 100, circle('#7a4ec2'))),
    block: props(
      'block',
      drawImage(100, 100, ctx => {
        ctx.fillStyle = '#6b8e23';
        ctx.fillRect(0, 0, 100, 100);
      }),
    ),
  },
};

const PROGRAM = `
setBackgroundImageAs("sky");
var cat = makeNewSpriteAnon("cat", locationAt(100, 200));
var fish = makeNewSpriteAnon("fish", locationAt(300, 200));
keyPressed("while", "right", function () { moveInDirection({id: cat}, 5, "East"); });
keyPressed("while", "left", function () { moveInDirection({id: cat}, 5, "West"); });
checkTouching("when", {id: cat}, {id: fish}, function () {
  spriteSay({id: fish}, "Hi!");
  setTint({id: fish}, "red");
});
everyInterval(1, "seconds", function () { turn({id: fish}, 15, "right"); });
addBehaviorSimple({id: fish}, draggable());
`;

// ?scene=platform: a player falls onto a row of blocks, under a 2x zoom.
const PLATFORM_PROGRAM = `
for (var i = 0; i < 8; i++) {
  makeNewGroupSprite("block", "walls", locationAt(25 + i * 50, 25));
}
var player = makeNewGroupSprite("cat", "players", locationAt(200, 300));
setCameraZoom(2);
`;
const platform =
  new URLSearchParams(location.search).get('scene') === 'platform';

const status = document.getElementById('status') as HTMLElement;
const engine = new SpriteLabEngine({
  container: document.getElementById('playspace') as HTMLElement,
  images: () => images,
  loadLibrary: async () => nativeSpriteLab,
  host: {
    displayWorkspaceAlert: (type, message) =>
      (status.textContent = `${type}: ${message}`),
    addTextPrompt: () => {},
    addMultipleChoicePrompt: () => {},
    addConsoleMessage: ({text}) => console.log(text),
    playSpeech: () => {},
    getVariableNames: () => [],
  },
});
engine.onExecutionError = error => {
  status.textContent = `Error on line ${error.line}: ${error.message}`;
};
(window as unknown as {spriteLabEngine: SpriteLabEngine}).spriteLabEngine =
  engine;

await engine.initForLevel(
  platform ? {helperLibraries: ['NativeSpriteLab', 'zGameDev']} : {},
);
await engine.runProgram(
  platform ? PLATFORM_PROGRAM : PROGRAM,
  null,
  platform ? 'platform' : 'story',
);
status.textContent = 'Running';
