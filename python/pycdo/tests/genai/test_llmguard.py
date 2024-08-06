from pycdo.genai.llmguard import is_prompt_toxic


def test_is_prompt_toxic():
    assert is_prompt_toxic("You are a trash human") is True
    assert is_prompt_toxic("I ❤️ those cookies you baked for me.") is False
