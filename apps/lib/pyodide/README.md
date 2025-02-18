# Python Packages
We use [Pyodide](https://pyodide.org) to run Python on our site. In order to serve up python packages from a code.org endpoint
(to avoid firewall issues), any package outside of the standard library needs to be copied to this folder as a `.whl` file.
Many packages are already built for Pyodide and their `.whl` file can be retrieved from the
[Pyodide release](https://github.com/pyodide/pyodide/releases) that matches our current version.

For pyodide-written packages, once you've added the `.whl` here and re-built, you should be able to import the package
in your python code in Python Lab and it will work without any further configuration.

## Adding a non-pyodide package
For a `whl` not provided by pyodide that was either created by us or by someone else, 
you can upload the wheel to this folder as well (for a package we did not author, ensure 
you have permission to do so from the author). You can then update [pyodideWebWorker](../../src/pythonlab/pyodideWebWorker.js#17)
with the full wheel name, prefixed by `/blockly/js/pyodide/${version}/` (follow the pattern of the pythonlab_setup
package). This will import the package from our server on page load.
