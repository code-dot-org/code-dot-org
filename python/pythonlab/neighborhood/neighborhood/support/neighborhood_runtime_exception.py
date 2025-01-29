from .exception_key import ExceptionKey


class NeighborhoodRuntimeException(Exception):
    def __init__(self, key: ExceptionKey, message: str | None = None):
        super().__init__(message if message else key.value)
        self.key = key
        self.message = message

    def __str__(self):
        message_str = f": {self.message}" if self.message else ""
        return f"NeighborhoodRuntimeException: {self.key.value}{message_str}"
