import json
from .signal_message_type import SignalMessageType

class NeighborhoodSignalMessage:
    """
    All Neighborhood signal messages will use the following format:
        {
            "type": <SignalMessageType>,
            "value": <"message data">,
            "detail": <dict>
        }
    """

    def __init__(self, type: SignalMessageType, value: str, detail: dict = None):
        self.type = type
        self.value = value
        self.detail = detail

    def get_formatted_message(self) -> str:
        """
        @return: A string representing the neighborhood signal message
        """
        formatted_message = f'[{self.type.value}] {self.value}'
        if self.detail:
            formatted_message += f' {json.dumps(self.detail)}'
        return formatted_message
