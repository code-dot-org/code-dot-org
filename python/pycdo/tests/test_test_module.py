# renamed or pytest will think test_func is a test itself:
from pycdo.test_module import test_func as _test_func 

def test_test_func():
    assert _test_func() == "Ruby can call Python!"
