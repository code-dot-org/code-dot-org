## DO NOT REQUIRE THIS FILE FROM OUTSIDE THIS MODULE: NOT THREAD-SAFE ##

require 'pycall/import'
include PyCall::Import

# Python::Import aliases PyCall::Import to ensure that pyimport and pyfrom
# are only called from within a Python.run(&block). This is because they
# are not thread-safe to invoke directly.
module Python
  module Import
    include PyCall::Import

    alias_method :_pyimport, :pyimport
    alias_method :_pyfrom, :pyfrom

    def pyimport(*args, **kwargs)
      Python.in_py_block!
      _pyimport(*args, **kwargs)
    end

    def pyfrom(*args, **kwargs)
      Python.in_py_block!
      _pyfrom(*args, **kwargs)
    end
  end
end
