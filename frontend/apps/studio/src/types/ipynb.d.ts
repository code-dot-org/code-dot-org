/** Allows importing Jupyter notebook files as JSON objects. */
declare module '*.ipynb' {
  const content: Record<string, unknown>;
  export default content;
}
