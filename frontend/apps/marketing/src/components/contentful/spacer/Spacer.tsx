import Box from '@mui/material/Box';

import type {ComponentSize} from '@/components/common/types';

export interface SpacerProps {
  /** Spacer size */
  size?: ComponentSize;
  /** Custom classname */
  className?: string;
}

const spacerStyles = {
  container: {
    width: '100%',
    display: 'block',
  },
};

const spacerHeight: Record<ComponentSize, number> = {
  l: 64,
  m: 48,
  s: 32,
  xs: 16,
};

const Spacer: React.FC<SpacerProps> = ({size = 'm', className}) => (
  <Box
    height={spacerHeight[size]}
    className={className}
    sx={spacerStyles.container}
    role="presentation"
  />
);

export default Spacer;
