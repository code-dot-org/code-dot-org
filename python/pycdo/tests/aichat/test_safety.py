from pycdo.aichat.safety import is_prompt_safe

def test_scan_prompt_safe():
    assert is_prompt_safe(prompt="You are a trash human")['safe'] is False
    assert is_prompt_safe(prompt="I ❤️ those cookies you baked for me.")['safe'] is True
