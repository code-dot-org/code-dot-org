# Python Packages
We use [Pyodide](https://pyodide.org) to run Python on our site. In order to serve up python packages from a code.org endpoint
(to avoid firewall issues), any package outside of the standard library needs to be copied to this folder as a `.whl` file.
Many packages are already built for Pyodide and their `.whl` file can be retrieved from the
[Pyodide release](https://github.com/pyodide/pyodide/releases) that matches our current version. Otherwise you will need to download
or create a _wheel_ and add it here (this path has not been tested yet, please document that process here if you do).

For pyodide-written packages, once you've added the `.whl` here and re-built, you should be able to import the package
in your python code in Python Lab and it will work without any further configuration.