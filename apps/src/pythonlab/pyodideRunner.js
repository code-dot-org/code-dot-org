import pyodidePkg from 'pyodide';

export function runPythonAsync(code) {
  // loadPyodide({
  //   indexURL: `${window.location.origin}/pyodide`,
  // }).then(pyodide => {
  //   console.log(
  //     pyodide.runPython(`
  //     import sys
  //     sys.version
  //   `)
  //   );
  // });
  pyodidePkg
    .loadPyodide({indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full'})
    .then(pyodide => {
      // pyodide.runPythonAsync(code).then(result => {
      //   console.log(result);
      // });
      console.log(
        pyodide.runPython(`
        import sys
        sys.version
      `)
      );
    });
}
