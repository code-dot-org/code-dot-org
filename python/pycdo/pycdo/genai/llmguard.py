from llm_guard.input_scanners import Toxicity
from llm_guard import scan_prompt

def is_prompt_toxic(prompt):
    _sanitized_prompt, results_valid, _results_score = scan_prompt([Toxicity()], prompt)
    return any(results_valid.values()) is False
