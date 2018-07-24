const trackedProps = ['x', 'y'];

export default function wrap(p5) {
  const original = p5.createSprite;

  p5.createSprite = function () {
    console.log('called createSprite with', arguments);
    const sprite = original.apply(p5, arguments);

    for (let prop of trackedProps) {
      const descriptor = Object.getOwnPropertyDescriptor(sprite, prop);
      Object.defineProperty(sprite, prop, {
        get: descriptor.get ? descriptor.get : () => descriptor.value,
        set: value => {
          console.log('set ' + prop + ' to ' + value + ' on ' + sprite);
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
