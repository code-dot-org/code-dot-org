import Button from '@mui/material/Button';

type ButtonProps = {
  /** Button text */
  text?: string;
  /** Button link href */
  href?: string;
  /** Button variant */
  variant?: 'text' | 'outlined' | 'contained';
  /** Button color */
  backgroundColor: string;
  /** Button text color */
  textColor?: string;
  /** Button border */
  border?: string;
};

const ButtonMUI: React.FunctionComponent<ButtonProps> = ({
  text,
  href,
  backgroundColor,
  textColor = 'inherit',
  border,
}) => {
  return (
    <Button
      {...(href ? {href} : {})}
      variant="contained"
      sx={{
        ...(backgroundColor ? {backgroundColor} : {}),
        ...(textColor ? {color: textColor} : {}),
        ...(border ? {border: border} : {}),
      }}
    >
      {text}
    </Button>
  );
};

export default ButtonMUI;
