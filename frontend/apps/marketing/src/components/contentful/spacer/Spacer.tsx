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

const spacerHeight: Record<ComponentSize, React.CSSProperties> = {
  xs: {height: 16},
  s: {height: 32},
  m: {height: 48},
  l: {height: 64},
};

const Spacer: React.FC<SpacerProps> = ({size = 'm', className}) => (
  <Box
    height={spacerHeight[size].height}
    className={className}
    sx={spacerStyles.container}
    role="presentation"
  />
);

export default Spacer;
