require_relative './import'
require_relative './init_pycall'

# This is a placeholder for the Python module, letting us use the future API
# in today's code. Python.run() of the future will run a block of python without
# having to worry about threads.
module Python
  extend self

  def run(&block)
    on_same_thread!
    dont_return_python_objects! _run(&block)
  end

  # Are we inside a Python.run block?
  def in_py_block?
    (@py_block_depth || 0) > 0
  end

  def in_py_block!
    caller_name = caller_locations(1, 1)[0].label
    raise "For thread-safety reasons, #{caller_name}() can only be used from within a Python.run(&block)" unless in_py_block?
  end

  def python_object?(obj)
    [
      PyCall::IterableWrapper,
      PyCall::PyObjectWrapper,
      PyCall::PyModuleWrapper,
      PyCall::PyObjectWrapper,
      PyCall::PyTypeObjectWrapper,
      PyCall::PyPtr
    ].any? {|kind| obj.is_a?(kind)}
  end

  @thread_id = Thread.current.object_id
  private def on_same_thread!
    if @thread_id != Thread.current.object_id
      raise "TODO: Python.run() of the future will be thread-safe, but Python.run()" \
            "of today can only be run from the main thread 😿"
    end
  end

  # Run block, keep track if we're in a Python.run block.
  private def _run(&block)
    @py_block_depth ||= 0
    @py_block_depth += 1
    yield
  ensure
    @py_block_depth -= 1
  end

  private def dont_return_python_objects!(obj)
    if python_object?(obj)
      raise "Trying to return a python object from a Python.run(&block) is not thread-safe." \
            "Convert #{obj.inspect} to a basic Ruby type (like string, array, number, " \
            "boolean etc) before returning."
    end
    obj
  end
end
