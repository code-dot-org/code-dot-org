import Button from '@mui/material/Button';
import React, {HTMLAttributes} from 'react';

export interface ButtonProps extends HTMLAttributes<HTMLElement> {
  /** Button variant */
  variant?: 'text' | 'outlined' | 'contained';
  /** Button children */
  label: string;
}

const BasicButton: React.FC<ButtonProps> = ({variant = 'text', label}) => {
  return <Button variant={variant}>{label}</Button>;
};

export default BasicButton;
