import Link from 'next/link';

import {Button} from '@/components/ui/button';

interface LinkButtonProps extends React.ComponentProps<'button'> {
  href: string;
  text: string;
}

export function LinkAsButton({href, text, ...rest}: LinkButtonProps) {
  return (
    <Button asChild>
      <Link href={href} {...rest}>
        {text}
      </Link>
    </Button>
  );
}
