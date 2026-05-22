import NotebookLab from './lab-root';

/** Dev harness: mounts the lab with a default channelId for local preview. */
function App() {
  return <NotebookLab channelId="default" />;
}

export default App;
