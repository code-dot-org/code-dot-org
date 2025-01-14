class NeighborhoodRuntimeException(Exception):
    def __init__(self, key):
        super().__init__(key)
        self.key = key

    def __str__(self):
        return f"NeighborhoodRuntimeException: {self.key.value}"