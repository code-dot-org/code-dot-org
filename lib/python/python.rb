require_relative './_load_pycall'

# This is a placeholder for the Python module, letting us use the future API
# in today's code. Python.run() of the future will run a block of python without
# having to worry about threads.
module Python
  extend self

  def init(use_pycall_thread: false)
    @use_pycall_thread = use_pycall_thread

    if @use_pycall_thread
      require_relative './pycall_thread'
      PyCallThread.init do
        LoadPyCall.load_pycall
      end
    else
      @thread_id = Thread.current.object_id
      LoadPyCall.load_pycall
    end

    # Safe to load now that PyCall has been initialized in the correct thread:
    require_relative './_import'
  end

  def run(&block)
    on_same_thread! if @use_pycall_thread
    dont_return_python_objects! _run(&block)
  end

  # Are we inside a Python.run block?
  def in_py_block?
    (@py_block_depth || 0) > 0
  end

  class ThreadSafetyError < StandardError; end

  def in_py_block!
    caller_name = caller_locations(1, 1)[0].label
    raise ThreadSafetyError, "For thread-safety reasons, #{caller_name}() can only be used from within a Python.run(&block)" unless in_py_block?
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

  private def on_same_thread!
    if @thread_id != Thread.current.object_id
      raise ThreadSafetyError, "TODO: Python.run() of the future will be thread-safe, but Python.run() " \
                                "of today can only be run from the main thread 😿"
    end
  end

  # Run block, keep track if we're in a Python.run block.
  private def _run(&block)
    @py_block_depth ||= 0
    @py_block_depth += 1
    if @use_pycall_thread
      PyCallThread.run(&block)
    else
      yield
    end
  ensure
    @py_block_depth -= 1
  end

  private def dont_return_python_objects!(obj)
    if python_object?(obj)
      raise ThreadSafetyError, "Trying to return a python object from a Python.run(&block) is not thread-safe. " \
                                "Convert #{obj.inspect} to a basic Ruby type (like string, array, number, " \
                                "boolean etc) before returning."
    end
    obj
  end
end

Python.init(use_pycall_thread: false)
