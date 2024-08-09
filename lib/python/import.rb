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
