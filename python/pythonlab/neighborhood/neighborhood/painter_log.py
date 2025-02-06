from .position import Position
from .support.neighborhood_signal_message import NeighborhoodSignalMessage
from .painter_event import PainterEvent

class PainterLog:
    """
    User-facing class representing all the actions a single painter took during a run of the 
    neighborhood. Includes helpers for anlayzing which actions the painter did.
    """
    def __init__(
        self,
        painter_id: str,
        starting_position: Position,
        ending_position: Position,
        starting_paint_count: int,
        ending_paint_count: int,
        signals: list[NeighborhoodSignalMessage]
    ):
        self.painter_id = painter_id
        self.starting_position = starting_position
        self.ending_position = ending_position
        self.starting_paint_count = starting_paint_count
        self.ending_paint_count = ending_paint_count
        self.signals = signals
        self.signal_counts = self._get_signal_counts(signals)

    def did_action_once(self, neighborhood_signal_message_value: str) -> bool:
        """Returns True if the painter did the action exactly once."""
        return self.did_action_exactly(neighborhood_signal_message_value, 1)

    def did_action_exactly(self, neighborhood_signal_message_value: str, times: int) -> bool:
        """Returns True if the painter did the action exactly 'times' times."""
        return self.signal_counts.get(neighborhood_signal_message_value, 0) == times

    def did_action_at_least(self, neighborhood_signal_message_value: str, times: int) -> bool:
        """Returns True if the painter did the action at least 'times' times."""
        return self.signal_counts.get(neighborhood_signal_message_value, 0) >= times

    def action_count(self, neighborhood_signal_message_value: str) -> int:
        """Returns the number of times the painter did the given action."""
        return self.signal_counts.get(neighborhood_signal_message_value, 0)

    def get_events(self) -> list[PainterEvent]:
        """Returns a list of PainterEvents."""
        return [PainterEvent(signal.key.value, signal.detail) for signal in self.signals]

    def _get_signal_counts(self, signals: list[NeighborhoodSignalMessage]) -> dict[str, int]:
        """Creates a dictionary mapping of signal message keys to their occurrence counts."""
        signal_count_map: dict[str, int] = {}
        for signal in signals:
            neighborhood_signal_message_key = signal.key.value
            signal_count_map[neighborhood_signal_message_key] = signal_count_map.get(neighborhood_signal_message_key, 0) + 1
        return signal_count_map
