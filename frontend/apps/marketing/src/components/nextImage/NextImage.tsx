import BaseNextImage, {ImageProps} from 'next/image';

const NextImage = ({fill = true, ...props}: ImageProps) => {
  return <BaseNextImage fill={fill} {...props} />;
};

export default NextImage;
