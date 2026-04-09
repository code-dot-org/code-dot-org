import json

from .kmeans_signal_key import KMeansSignalKey
from .signal_message_type import SignalMessageType


class KMeansSignalMessage:
    """
    All KMeans signal messages use the following format:
        [KMEANS] <KEY> <json_detail>

    Examples:
        [KMEANS] ADD_POINT {"x": 1.0, "y": 2.0, "id": 0}
        [KMEANS] READY {"k": 3}
    """

    def __init__(self, key: KMeansSignalKey, detail: dict):
        self.type = SignalMessageType.KMEANS
        self.key = key
        self.detail = detail

    def _get_formatted_message(self) -> str:
        msg = f'[{self.type.value}] {self.key.value}'
        if self.detail:
            msg += f' {json.dumps(self.detail)}'
        return msg

    def send(self):
        print(self._get_formatted_message())
