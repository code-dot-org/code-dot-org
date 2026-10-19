import CodeAILogo from '@/config/brand/assets/logo-codeai-inverse.svg';

import styles from './launcher.module.scss';

/** The app's purple bar. The logo is the page heading unless the page has its own. */
export default function AppHeader({logoIsHeading}: {logoIsHeading: boolean}) {
  const logo = <img className={styles.logo} src={CodeAILogo} alt="CodeAI" />;
  return (
    <header className={styles.header}>
      {logoIsHeading ? <h1 className={styles.logoHeading}>{logo}</h1> : logo}
    </header>
  );
}
