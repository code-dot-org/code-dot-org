import Button, {ButtonProps} from '@/components/contentful/button';

export interface CallToActionProps extends ButtonProps {
  /** Custom class */
  className?: string;
}

const CallToAction = ({
  type = 'emphasized',
  size = 'small',
  text,
  href,
  className,
}: CallToActionProps) => {
  return (
    <Button
      className={className}
      type={type}
      size={size}
      text={text}
      href={href}
    />
  );
};

export default CallToAction;
