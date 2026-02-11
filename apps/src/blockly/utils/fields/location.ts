import {APP_HEIGHT} from '@cdo/apps/p5lab/constants';

export function locationField(icon: SVGElement, onClick: () => void) {
  const transformTextSetField = (value: string) => {
    if (value) {
      try {
        const loc = JSON.parse(value);
        return `(${loc.x}, ${APP_HEIGHT - loc.y})`;
      } catch (e) {
        // Just ignore bad values
      }
    }
    return '';
  };
  return new Blockly.FieldButton({
    onClick,
    transformText: transformTextSetField,
    icon,
  });
}
