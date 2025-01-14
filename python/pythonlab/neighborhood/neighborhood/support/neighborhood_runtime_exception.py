from .neighborhood_signal_key import NeighborhoodSignalKey


class NeighborhoodRuntimeException(Exception):
    def __init__(self, key: NeighborhoodSignalKey):
        super().__init__(key.value)
        self.key = key

    def __str__(self):
        return f"NeighborhoodRuntimeException: {self.key.value}"
