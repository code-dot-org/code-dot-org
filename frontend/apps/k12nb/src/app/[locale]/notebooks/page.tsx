import NotebookIndexPage from './components/NotebookIndex';
export async function generateStaticParams() {
  const locales = ['en-US', 'ja-JP', 'hi-IN'];
  return locales.map(locale => ({
    locale,
  }));
}
function NotebookPage() {
  return <NotebookIndexPage />;
}

export default NotebookPage;
