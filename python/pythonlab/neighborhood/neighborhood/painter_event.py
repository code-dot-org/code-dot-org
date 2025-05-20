class PainterEvent:
    """User-facing class representing a single action for a single Painter."""
    def __init__(self, neighborhood_action_type: str, details: dict):
        self.neighborhood_action_type = neighborhood_action_type
        self.details = details
