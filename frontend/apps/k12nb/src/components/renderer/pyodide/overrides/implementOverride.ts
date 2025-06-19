export const overrides = ["matplotlib"]

export const implementOverride = async (pyodide: any, module: string) => {
  const response = await fetch(new URL(`./${module}.py`, import.meta.url));
  const code = await response.text();
  await pyodide.runPythonAsync(code);
}