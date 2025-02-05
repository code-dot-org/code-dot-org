from neighborhood.support.world import World
from neighborhood.support.neighborhood_tracker import NeighborhoodTracker
from neighborhood.support.neighborhood_context_type import NeighborhoodContextType
from neighborhood.support.neighborhood_signal_message import NeighborhoodSignalMessage
from neighborhood.support.signal_message_type import SignalMessageType
from neighborhood.support.neighborhood_signal_key import NeighborhoodSignalKey
from constants import SAMPLE_MAZE

def test_initialize_neighborhood_tracker():
    neighborhood_world = World()
    neighborhood_world.set_grid_from_string(SAMPLE_MAZE)
    neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
    neighborhood_tracker = NeighborhoodTracker(neighborhood_world)
    neighborhood_log = neighborhood_tracker.get_neighborhood_log()
    assert neighborhood_log == 'neighborhood_log'
    initialize_painter_signal_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.INITIALIZE_PAINTER, {"id": 1})
    assert neighborhood_tracker.is_initialized is False
    neighborhood_tracker.track_signal(initialize_painter_signal_message)
    assert neighborhood_tracker.is_initialized is True
    neighborhood_tracker.reset()
    assert neighborhood_tracker.is_initialized is False