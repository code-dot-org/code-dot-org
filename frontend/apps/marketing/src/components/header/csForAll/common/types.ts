import Typography from '@mui/material/Typography';
import {AnchorHTMLAttributes} from 'react';

// Define the structure for link items used in the Header
export interface LinkItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link label */
  label: string;
  /** Link href */
  href: string;
  /** Typography variant */
  typography?: React.ComponentProps<typeof Typography>['variant'];
}
