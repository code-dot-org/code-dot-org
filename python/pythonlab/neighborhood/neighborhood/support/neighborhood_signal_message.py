import json
from typing import Dict, Optional
from .signal_message_type import SignalMessageType

class NeighborhoodSignalMessage:
    """
    All Neighborhood signal messages will use the following format:
        {
            "type": <SignalMessageType>,
            "value": <"message data">,
            "detail": <"message details">
        }
    """

    def __init__(self, type: SignalMessageType, value: str, detail: Optional[str] = None):
        self.type = type
        self.value = value
        self.detail = detail

    def get_type(self) -> SignalMessageType:
        return self.type

    def get_value(self) -> str:
        return self.value

    def get_detail(self) -> Optional[str]:
        return self.detail

    def get_formatted_message(self) -> str:
        """
        @return: A string representing the neighborhood signal message
        """
        formatted_message = f'[{self.type.value}] {self.value}{": " + self.detail if self.detail else ""}'
        return formatted_message

    def to_json(self) -> str:
        """
        Returns the NeighborhoodSignalMessage as a JSON string.
        """
        return json.dumps(self.as_dict())

    def as_dict(self) -> Dict[str, Optional[str]]:
        """
        Returns the NeighborhoodSignalMessage as a dictionary.
        """
        return {
            "type": self.type.value,
            "value": self.value,
            "detail": self.detail
        }