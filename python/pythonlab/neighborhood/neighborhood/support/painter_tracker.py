from .position import Position
from .neighborhood_signal_message import NeighborhoodSignalMessage
from .neighborhood_signal_key import NeighborhoodSignalKey

NORTH = 'north'
EAST = 'east'
SOUTH = 'south'
WEST = 'west'

class PainterTracker:
    def __init__(self, painter_id: int, position: Position, direction: str, paint_count: int):
        self.painter_id = painter_id
        self.starting_position = position
        self.current_position = position
        self.starting_paint_count = paint_count
        self.current_paint_count = paint_count
        self.starting_direction = direction
        self.current_direction = direction
        self.signals: list[NeighborhoodSignalMessage] = []
    
    # Record the given signal, updating position and paint count if necessary.
    def track_signal(self, signal: NeighborhoodSignalMessage):
        self.signals.append(signal)
        if signal.key == NeighborhoodSignalKey.MOVE:
            direction = signal.detail["direction"]
            self.current_direction = direction
            current_position = self.current_position
            if direction == NORTH:                
                self.current_position = Position(current_position.x, current_position.y - 1)
            elif direction == SOUTH:
                self.current_position = Position(current_position.x, current_position.y + 1)
            elif direction  == EAST:
                self.current_position = Position(current_position.x + 1, current_position.y)
            elif direction == WEST:
                self.current_position = Position(current_position.x - 1, current_position.y)
        elif signal.key == NeighborhoodSignalKey.PAINT:
            self.current_paint_count -= 1
        elif signal.key == NeighborhoodSignalKey.TAKE_PAINT:
            self.current_paint_count += 1

    def get_painter_log(self):
        return None