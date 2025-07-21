import {IframeHTMLAttributes} from 'react';

export interface IframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  /** URL of the embedded content */
  src: string;
  /** Title */
  title: string;
  /** Class of the embed container */
  className?: string;
  /** Height */
  height?: number | string;
  /** Width */
  width?: number | string;
}

const Iframe: React.FC<IframeProps> = ({
  src,
  title,
  className,
  height = '100%',
  width = '100%',
  ...HTMLAttributes
}: IframeProps) => (
  <iframe
    src={src}
    title={title}
    height={height}
    width={width}
    className={className}
    style={{border: 'none'}}
    {...HTMLAttributes}
  />
);

export default Iframe;
