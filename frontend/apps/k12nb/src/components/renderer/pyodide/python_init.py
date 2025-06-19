# type:ignore
import builtins
import sys

def _override_input_wrapper(prompt=''):
    return _override_input(prompt)

sys.stdout = _override_stdout 
builtins.input = _override_input_wrapper
