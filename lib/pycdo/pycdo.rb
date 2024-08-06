module PyCDO
  class << self
    def python_object?(obj)
      [
        PyCall::IterableWrapper,
        PyCall::PyObjectWrapper,
        PyCall::PyModuleWrapper,
        PyCall::PyObjectWrapper,
        PyCall::PyTypeObjectWrapper,
        PyCall::PyPtr,
      ].any? {|kind| obj.is_a?(kind)}
    end

    def lock_python_gil(&block)
      (class << self; self; end).class_eval do
        include PyCall::Import
      end

      begin
        gstate = @py_gil_state_ensure.call
        retval = instance_exec(&block)
        if python_object?(retval)
          raise "Trying to return a python object from PyCDO.lock_python_gil block is potentially not thread-safe. Please convert it to a basic Ruby type (like string, array, number, boolean etc) before returning."
        end
      ensure
        @py_gil_state_release.call(gstate)
      end

      retval
    end

    def init
      require_relative './init_pycall'

      ctypes = PyCall.import_module('ctypes')
      @py_gil_state_ensure = ctypes.pythonapi.method(:PyGILState_Ensure)
      @py_gil_state_release = ctypes.pythonapi.method(:PyGILState_Release)
    end
  end
end

PyCDO.init
