class Position:
    """User-facing class representing the position including direction for a single Painter."""
    def __init__(self, x: int, y: int, direction: str):
        self.x = x
        self.y = y
        self.direction = direction