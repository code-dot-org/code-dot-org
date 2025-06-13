import FontLoader from '@code-dot-org/fonts/FontLoader';

interface BootstrapProps {
  locale: string;
}
const Bootstrap = ({locale}: BootstrapProps) => {
  return (
    <>
      <FontLoader locale={locale} />
    </>
  );
};

export default Bootstrap;
