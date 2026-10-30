from .neighborhood_signal_key import NeighborhoodSignalKey
from .signal_message_type import SignalMessageType
from ..neighborhood_log import NeighborhoodLog
from .painter_tracker import PainterTracker
from ..position import Position

class NeighborhoodTracker:
    _instance = None

    def __new__(cls, world):
        if cls._instance is None:
            cls._instance = super(NeighborhoodTracker, cls).__new__(cls)
            cls._instance.world = world
            cls._instance.painter_trackers = {}
            cls._instance.is_initialized = False
            cls._instance.neighborhood_state = None
        return cls._instance

    def get_neighborhood_log(self) -> NeighborhoodLog | None:
        painter_logs = []
        for painter_tracker in self.painter_trackers.values():
            painter_logs.append(painter_tracker.get_painter_log())
        return NeighborhoodLog(painter_logs, self.neighborhood_state)

    def track_signal(self, signal):
        if signal.type != SignalMessageType.NEIGHBORHOOD:
            return
        painter_id = signal.detail.get("id")
        if painter_id is None:
            return
        signal_key = signal.key
        if signal_key == NeighborhoodSignalKey.INITIALIZE_PAINTER:
            if not self.is_initialized:
                self._initialize_grid()
            x = signal.detail["x"]
            y = signal.detail["y"]
            paint_count = signal.detail["paint"]
            direction = signal.detail["direction"]
            painter_tracker = PainterTracker(painter_id, Position(x, y, direction), paint_count)
            self.painter_trackers[painter_id] = painter_tracker
            return
        if painter_id not in self.painter_trackers or not self.is_initialized:
            return
        painter_tracker = self.painter_trackers[painter_id]
        painter_tracker.track_signal(signal)
        position = painter_tracker.current_position        
        if signal_key == NeighborhoodSignalKey.PAINT:
            self.neighborhood_state[position.y][position.x] = signal.detail["color"]
        elif signal_key == NeighborhoodSignalKey.REMOVE_PAINT:
            self.neighborhood_state[position.y][position.x] = None

    def reset(self):
        self.painter_trackers = {}
        self.is_initialized = False
    
    def _initialize_grid(self):  
        if self.world.grid:    
            grid_size = self.world.grid.get_size()
            self.neighborhood_state = [[None for _ in range(grid_size)] for _ in range(grid_size)]
            self.is_initialized = True 