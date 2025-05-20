from ..position import Position
from .neighborhood_signal_message import NeighborhoodSignalMessage
from .neighborhood_signal_key import NeighborhoodSignalKey
from ..painter_log import PainterLog
from .constants import NORTH, SOUTH, EAST, WEST

class PainterTracker:
    def __init__(self, painter_id: str, position: Position, paint_count: int | None):
        self.painter_id = painter_id
        self.starting_position = position
        self.current_position = position
        self.starting_paint_count = paint_count or 0
        self.current_paint_count = paint_count or 0
        self.signals: list[NeighborhoodSignalMessage] = []
    
    # Record the given signal, updating position and paint count if necessary.
    def track_signal(self, signal: NeighborhoodSignalMessage):
        self.signals.append(signal)
        if signal.key == NeighborhoodSignalKey.MOVE:
            direction = signal.detail["direction"].lower()
            current_position = self.current_position
            if direction == NORTH:                
                self.current_position = Position(current_position.x, current_position.y - 1, NORTH)
            elif direction == SOUTH:
                self.current_position = Position(current_position.x, current_position.y + 1, SOUTH)
            elif direction  == EAST:
                self.current_position = Position(current_position.x + 1, current_position.y, EAST)
            elif direction == WEST:
                self.current_position = Position(current_position.x - 1, current_position.y, WEST)
        elif signal.key == NeighborhoodSignalKey.TURN_LEFT:
            new_direction = signal.detail["direction"].lower()
            self.current_position = Position(self.current_position.x, self.current_position.y, new_direction)
        elif signal.key == NeighborhoodSignalKey.PAINT:
            self.current_paint_count -= 1
        elif signal.key == NeighborhoodSignalKey.TAKE_PAINT:
            self.current_paint_count += 1

    def get_painter_log(self):
        return PainterLog(
            self.painter_id,
            self.starting_position,
            self.current_position,
            self.starting_paint_count,
            self.current_paint_count,
            self.signals
        )
