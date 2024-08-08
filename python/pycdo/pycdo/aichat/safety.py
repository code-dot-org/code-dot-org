from llm_guard import scan_prompt as _scan_prompt
from llm_guard.input_scanners import BanTopics
from llm_guard.input_scanners import Toxicity
from llm_guard.input_scanners import toxicity
from llm_guard.input_scanners import Sentiment
from llm_guard.input_scanners import PromptInjection
from llm_guard.input_scanners import prompt_injection

# Initialize Suite of Scanners
banned_topics_scanner = BanTopics(topics=["Profanity", "Violence", "Sexuality", "Racism", "Drugs"], threshold=0.4)
toxicity_scanner = Toxicity(threshold=0.4, match_type=toxicity.MatchType.SENTENCE)
sentiment_scanner = Sentiment(threshold=-0.05)
attack_scanner = PromptInjection(threshold=0.4, match_type=prompt_injection.MatchType.FULL)

deployed_scanners = [banned_topics_scanner, toxicity_scanner, sentiment_scanner, attack_scanner]

def is_prompt_safe(prompt):
    sanitized_prompt, results_valid, results_score = _scan_prompt(deployed_scanners, prompt)
    return {
        "safe": all(results_valid.values()),
        "results_valid": results_valid,
        "results_score": results_score,
        "sanitized_prompt": sanitized_prompt,
    }
