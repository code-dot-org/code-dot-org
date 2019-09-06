const trackedProps = ['x', 'y', 'tint'];
const log = [];
let original;

export default function wrap(p5) {
  original = original || p5.createSprite;
  log.length = 0;

  p5.createSprite = function() {
    const sprite = original.apply(p5, arguments);

    for (let prop of trackedProps) {
      const descriptor = Object.getOwnPropertyDescriptor(sprite, prop) || {};
      Object.defineProperty(sprite, prop, {
        get: descriptor.get ? descriptor.get : () => descriptor.value,
        set: value => {
          log[p5.frameCount] = log[p5.frameCount] || [];
          log[p5.frameCount].push({sprite, prop, value});
          if (descriptor.set) {
            descriptor.set(value);
          } else {
            descriptor.value = value;
          }
        }
      });
    }
    return sprite;
  };
}

export function replay(gameLabInst) {
  let frame = 1;

  gameLabInst.stopTickTimer();
  gameLabInst.JSInterpreter.seenReturnFromCallbackDuringExecution = true;
  gameLabInst.eventHandlers.draw = () => {
    const entry = log[frame % log.length];
    if (entry) {
      entry.forEach(({sprite, prop, value}) => {
        sprite[prop] = value;
      });
    }
    gameLabInst.p5Wrapper.p5.drawSprites();
    frame++;
  };
}

window.replay = replay;
