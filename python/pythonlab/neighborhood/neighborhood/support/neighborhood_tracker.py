from .neighborhood_signal_key import NeighborhoodSignalKey
from .signal_message_type import SignalMessageType

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

    def get_neighborhood_log(self):
        # TODO: Actually return neighborhood log.
        return 'neighborhood_log'

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
        # TODO: Finish implementation when PainterLog is added.

    def reset(self):
        self.painter_trackers = {}
        self.is_initialized = False
    
    def _initialize_grid(self):  
        if self.world.grid:    
            grid_size = self.world.grid.get_size()
            self.neighborhood_state = [[None for _ in range(grid_size)] for _ in range(grid_size)]
            self.is_initialized = True 