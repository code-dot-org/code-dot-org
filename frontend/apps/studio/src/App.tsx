import '@code-dot-org/component-library-styles/colors.scss';
import {LinkButton} from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';

function App() {
  return (
    <>
      <Typography variant="body1" gutterBottom>
        Anybody can learn!
      </Typography>
      <LinkButton href="https://code.org" text="Go to Code.org" />
    </>
  );
}

export default App;
