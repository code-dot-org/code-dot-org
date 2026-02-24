# renamed or pytest will think test_func is a test itself:
from pycdo.test_module import example_func

def test_example_func():
    assert example_func() == "Ruby can call Python!"
