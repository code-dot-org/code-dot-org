import {Capacitor} from '@capacitor/core';

import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {startLauncher} from './launcher';

import styles from './launcher.module.scss';

const button = document.querySelector<HTMLButtonElement>('#open-studio')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
document.querySelector('main')!.className = styles.launcher;

if (Capacitor.getPlatform() !== 'android') {
  status.textContent =
    'Install the Android app to open Studio. This browser preview shows only the launcher.';
} else {
  const launcher = startLauncher(state => {
    button.disabled = state === 'opening' || state === 'active';
    button.textContent = state === 'failed' ? 'Try again' : 'Open Studio';
    status.textContent = {
      opening: 'Opening Studio…',
      active: 'Studio is open in the app.',
      failed: 'Studio could not be opened. Try again.',
      closed: 'Open Studio to continue.',
    }[state];
    if (state === 'closed' || state === 'failed') button.focus();
  });
  button.addEventListener('click', launcher.open);
  if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
      button.removeEventListener('click', launcher.open);
      await launcher.dispose();
    });
  }
}
