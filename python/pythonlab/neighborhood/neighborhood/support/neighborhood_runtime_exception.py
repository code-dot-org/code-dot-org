class NeighborhoodRuntimeException(Exception):
    def __init__(self, message, key):
        super().__init__(message)
        self.key = key
