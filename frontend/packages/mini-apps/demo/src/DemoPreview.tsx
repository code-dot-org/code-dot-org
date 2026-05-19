// Pull the design-system MUI augmentation into the package's types
// to pick up our custom MUI properties.
import type {} from '@code-dot-org/component-library/themes';
import {Button, Typography} from '@mui/material';
import {useState} from 'react';

/**
 * Visualization for the demo mini-app. Renders a static placeholder so
 * codebridge has something to mount and the abstraction can be exercised
 * end-to-end.
 */
const DemoPreview = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        padding: 16,
        border: '1px dashed #888',
        borderRadius: 4,
      }}
    >
      <Typography variant="h6" component="h2">
        Demo mini-app loaded.
      </Typography>
      <Typography variant="body2" component="p">
        Stub used to validate the MiniApp abstraction across packages.
      </Typography>
      <Typography variant="body3" component="p">
        Simulated signals: {count}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="extraSmall"
        onClick={() => setCount(n => n + 1)}
      >
        Simulate signal
      </Button>
    </div>
  );
};

export default DemoPreview;
