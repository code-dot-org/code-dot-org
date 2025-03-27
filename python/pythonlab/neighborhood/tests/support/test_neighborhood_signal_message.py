from neighborhood.support.neighborhood_signal_message import NeighborhoodSignalMessage
from neighborhood.support.signal_message_type import SignalMessageType
from neighborhood.support.neighborhood_signal_key import NeighborhoodSignalKey

def test_initialize_neighborhood_signal_message():
  turn_left_signal_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, NeighborhoodSignalKey.TURN_LEFT, {"id": 1})
  assert turn_left_signal_message._get_formatted_message() == '[NEIGHBORHOOD] TURN_LEFT {"id": 1}'