export async function generateStaticParams() {
  const locales = ['en-US', 'ja-JP', 'hi-IN'];
  return locales.map(locale => ({
    locale,
  }));
}
export default function NotebookPage() {
  return 'Hello World';
}
