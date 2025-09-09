import json
from .signal_message_type import SignalMessageType
from .neighborhood_context_type import NeighborhoodContextType
from .neighborhood_signal_key import NeighborhoodSignalKey

class NeighborhoodSignalMessage:
    """
    All Neighborhood signal messages will use the following format:
        {
            "type": <SignalMessageType>,
            "key": <NeighborhoodSignalKey>,
            "detail": <dict>
        }
    """

    def __init__(self, type: SignalMessageType, key: NeighborhoodSignalKey, detail: dict):
        self.type = type
        self.key = key
        self.detail = detail

    def _get_formatted_message(self) -> str:
        """
        @return: A string representing the neighborhood signal message
        """
        formatted_message = f'[{self.type.value}] {self.key.value}'
        if self.detail:
            formatted_message += f' {json.dumps(self.detail)}'
        return formatted_message

    def send(self, world_context_type, neighborhood_tracker, is_boolean_message):
        # Passing neighborhood_tracker here because importing NeighborhoodTracker results
        # in a circular reference error.
        if world_context_type == NeighborhoodContextType.RUN and not is_boolean_message:
            print (self._get_formatted_message())
        elif world_context_type == NeighborhoodContextType.VALIDATE:
            if neighborhood_tracker:
                neighborhood_tracker.track_signal(self)
