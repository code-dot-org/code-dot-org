// Ensure critical fonts are loaded very early.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/colors.scss';

import {ThemeProvider, Typography} from '@mui/material';

import {LinkButton} from '@code-dot-org/component-library/button';
import Header from '@code-dot-org/component-library/header';
import {CdoTheme} from '@code-dot-org/component-library/themes';

import CdoLogo from '@/config/brand/assets/cdo-logo-inverse.webp';
import Bootstrap from '@/modules/bootstrap';

const SIGNED_OUT_MENU_ITEMS = [
  {label: 'Learn', href: '/students'},
  {label: 'Teach', href: '/teach'},
  {label: 'Districts', href: '/administrators'},
  {label: 'Stats', href: '/promote'},
  {label: 'Donate', href: '/donate'},
  {label: 'Incubator', href: '/incubator'},
  {label: 'About', href: '/about'},
];

function App() {
  return (
    <ThemeProvider theme={CdoTheme}>
      <Bootstrap locale="en-US" />
      <Header
        logoImageUrl={CdoLogo}
        brandName="Code.org"
        menuItems={SIGNED_OUT_MENU_ITEMS}
      />
      <Typography variant="body1" gutterBottom>
        Anybody can learn!
      </Typography>
      <LinkButton href="https://code.org" text="Go to Code.org" />
    </ThemeProvider>
  );
}

export default App;
