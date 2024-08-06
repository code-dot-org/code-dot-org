require_relative './init_pycall'

module PyCDO
  class << self
    attr_reader :pycdo_scope

    # This is the scope that will be available inside PyCDO.lock_python_gil blocks
    def make_pycdo_scope
      scope = Object.new
      class << scope
        include PyCall::Import
      end
      scope
    end

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

      retval = instance_exec(&block)
      if python_object? retval
        raise "Trying to return a python object from a PyCDO.lock_python_gil block is not thread-safe. Please convert it to a basic Ruby type, like a string, array, number, boolean etc before returning."
      end
      retval
    end
  end
end
