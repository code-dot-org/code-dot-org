import json
import sys
import types

import pytest

import kiosk


@pytest.fixture(autouse=True)
def fresh_default_screen():
  """Every test starts with nothing placed.

  The implicit screen is module state, so without this each test would inherit
  whatever the last one placed -- the same reason pythonlab_setup resets it
  between student runs.
  """
  kiosk.reset_default_screen()
  yield
  kiosk.reset_default_screen()


def install_fake_bridge(monkeypatch, events=()):
  """Record published scenes and answer waits with the given events.

  An event is an element id for a press, a dict for one carrying more than that
  -- a slider's new value -- or "" for the empty answer Stop sends. Returns the
  list the scenes land in, each already parsed from JSON. The wait runs out
  after the last event, which is what lets start() return.
  """
  published = []
  remaining = list(events)

  def next_answer():
    if not remaining:
      return None
    event = remaining.pop(0)
    if event == "":
      return ""
    return json.dumps({"id": event} if isinstance(event, str) else event)

  fake_bridge = types.ModuleType("_kiosk_bridge")
  fake_bridge.publish = lambda scene_json: published.append(json.loads(scene_json))
  fake_bridge.waitForEvent = next_answer
  monkeypatch.setitem(sys.modules, "_kiosk_bridge", fake_bridge)
  return published


def test_add_publishes_the_element(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  kiosk.add_label("greeting", "Hello", 5, 10)

  assert published == [
    {"elements": [
      {"type": "label", "id": "greeting", "text": "Hello", "x": 5, "y": 10}
    ]}
  ]


def test_elements_are_published_in_the_order_they_were_added(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  kiosk.add_label("greeting", "Hello", 5, 10)
  kiosk.add_button("go", "Press me", 5, 25)

  assert [element["id"] for element in published[-1]["elements"]] == [
    "greeting", "go"
  ]


def test_a_program_without_a_bridge_still_runs():
  # No _kiosk_bridge is installed here, so publishing must be a silent no-op.
  kiosk.add_button("go", "Press me", 0, 0)
  kiosk.on_click("go", lambda: None)
  kiosk.start()


def test_start_runs_the_handler_for_each_press(monkeypatch):
  published = install_fake_bridge(monkeypatch, events=["go", "go"])
  presses = []

  kiosk.add_button("go", "Press me", 5, 25)
  kiosk.on_click("go", lambda: presses.append(1))
  kiosk.start()

  assert presses == [1, 1]
  # A handler that changes nothing leaves the page nothing to redraw, so only
  # the add published.
  assert len(published) == 1


def test_a_screen_is_published_once_per_state(monkeypatch):
  published = install_fake_bridge(monkeypatch, events=["go"])

  kiosk.add_label("greeting", "Hello", 5, 10)
  kiosk.add_button("go", "Press me", 5, 25)
  kiosk.on_click("go", lambda: kiosk.set_text("greeting", "Pressed"))
  kiosk.start()

  # One scene per element added, and one for the press. start() and the publish
  # after the handler have nothing new to send.
  assert len(published) == 3


def test_a_handler_can_change_a_label(monkeypatch):
  published = install_fake_bridge(monkeypatch, events=["go"])

  kiosk.add_label("greeting", "Hello", 5, 10)
  kiosk.add_button("go", "Press me", 5, 25)
  kiosk.on_click("go", lambda: kiosk.set_text("greeting", "You pressed it!"))
  kiosk.start()

  greeting = published[-1]["elements"][0]
  assert greeting["text"] == "You pressed it!"


def test_a_handler_can_count_its_own_presses(monkeypatch):
  # The shape the README leads with: a handler carrying state from one press to
  # the next, rather than setting the same text every time.
  published = install_fake_bridge(monkeypatch, events=["go", "go", "go"])
  presses = 0

  def count_press():
    nonlocal presses
    presses += 1
    kiosk.set_text("counter", f"Presses: {presses}")

  kiosk.add_label("counter", "Presses: 0", 5, 10)
  kiosk.add_button("go", "Press me", 5, 25)
  kiosk.on_click("go", count_press)
  kiosk.start()

  counts = [scene["elements"][0]["text"] for scene in published]
  assert counts == [
    "Presses: 0",  # the label, before the button was added
    "Presses: 0",  # the button joining it
    "Presses: 1",
    "Presses: 2",
    "Presses: 3",
  ]


def test_an_empty_answer_ends_start(monkeypatch):
  # Stop answers a waiting program with an empty id rather than terminating the
  # interpreter, so start() has to return on it like any other "no event".
  install_fake_bridge(monkeypatch, events=["go", ""])
  presses = []

  kiosk.add_button("go", "Press me", 5, 25)
  kiosk.on_click("go", lambda: presses.append(1))
  kiosk.start()

  assert presses == [1]


def test_a_slider_is_published_with_its_range(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  kiosk.add_slider("volume", "Volume", 5, 40, minimum=0, maximum=11, value=3)

  assert published[-1]["elements"] == [
    {
      "type": "slider", "id": "volume", "text": "Volume", "x": 5, "y": 40,
      "min": 0, "max": 11, "value": 3,
    }
  ]


def test_a_slider_reaches_the_page_complete(monkeypatch):
  # The range must ride along with the first publish; a slider drawn without
  # one would have nowhere to put its handle.
  published = install_fake_bridge(monkeypatch)

  kiosk.add_slider("volume", "Volume", 0, 0)

  assert all("min" in scene["elements"][0] for scene in published)


def test_moving_a_slider_runs_its_handler_with_the_new_value(monkeypatch):
  install_fake_bridge(monkeypatch, events=[{"id": "volume", "value": 7}])
  seen = []

  kiosk.add_slider("volume", "Volume", 0, 0)
  kiosk.on_change("volume", seen.append)
  kiosk.start()

  assert seen == [7]


def test_a_moved_slider_remembers_where_it_was_left(monkeypatch):
  # A button's handler asking get_value() must see what the page is showing.
  install_fake_bridge(monkeypatch, events=[{"id": "volume", "value": 7}])

  kiosk.add_slider("volume", "Volume", 0, 0)
  kiosk.start()

  assert kiosk.get_value("volume") == 7


def test_set_value_moves_the_handle(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  kiosk.add_slider("volume", "Volume", 0, 0)
  kiosk.set_value("volume", 55)

  assert published[-1]["elements"][0]["value"] == 55
  assert kiosk.get_value("volume") == 55


def test_a_slider_move_with_no_handler_still_records_the_value(monkeypatch):
  install_fake_bridge(monkeypatch, events=[{"id": "volume", "value": 7}])

  kiosk.add_slider("volume", "Volume", 0, 0)
  kiosk.start()

  assert kiosk.get_value("volume") == 7


def test_a_slider_needs_a_minimum_below_its_maximum():
  with pytest.raises(ValueError, match="minimum must be below"):
    kiosk.add_slider("volume", "Volume", 0, 0, minimum=10, maximum=10)


def test_a_slider_starts_inside_its_range():
  with pytest.raises(ValueError, match="value must be between"):
    kiosk.add_slider("volume", "Volume", 0, 0, minimum=0, maximum=10, value=11)


def test_set_value_stays_inside_the_range():
  kiosk.add_slider("volume", "Volume", 0, 0, minimum=0, maximum=10)
  with pytest.raises(ValueError, match="value must be between"):
    kiosk.set_value("volume", 11)


def test_on_change_needs_a_slider():
  kiosk.add_button("go", "Press me", 0, 0)
  with pytest.raises(ValueError, match="no slider"):
    kiosk.on_change("go", lambda value: None)


def test_get_value_needs_a_slider():
  with pytest.raises(ValueError, match="no slider"):
    kiosk.get_value("volume")


def test_a_press_with_no_handler_is_ignored(monkeypatch):
  install_fake_bridge(monkeypatch, events=["go"])

  kiosk.add_button("go", "Press me", 5, 25)
  kiosk.start()


def test_start_publishes_even_with_an_empty_screen(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  kiosk.start()

  assert published == [{"elements": []}]


def test_reset_drops_what_was_placed(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  kiosk.add_label("greeting", "Hello", 5, 10)
  kiosk.reset_default_screen()
  kiosk.add_label("greeting", "Fresh", 0, 0)

  assert published[-1]["elements"] == [
    {"type": "label", "id": "greeting", "text": "Fresh", "x": 0, "y": 0}
  ]


def test_ids_must_be_unique():
  kiosk.add_label("greeting", "Hello", 5, 10)
  with pytest.raises(ValueError, match="already an element"):
    kiosk.add_button("greeting", "Press me", 5, 25)


@pytest.mark.parametrize("element_id", ["", None, 7])
def test_an_id_must_be_text_that_is_not_empty(element_id):
  with pytest.raises(ValueError, match="id must be"):
    kiosk.add_label(element_id, "Hello", 0, 0)


def test_text_must_be_text():
  with pytest.raises(ValueError, match="text must be"):
    kiosk.add_label("greeting", 7, 0, 0)


@pytest.mark.parametrize("x", [-1, 101, float("nan")])
def test_coordinates_stay_on_the_screen(x):
  with pytest.raises(ValueError, match="x must be"):
    kiosk.add_label("greeting", "Hello", x, 0)


def test_coordinates_must_be_numbers():
  with pytest.raises(ValueError, match="y must be"):
    kiosk.add_label("greeting", "Hello", 0, "10")


def test_set_text_needs_an_element_that_exists():
  with pytest.raises(ValueError, match="no element"):
    kiosk.set_text("greeting", "Hello")


def test_on_click_needs_a_button():
  kiosk.add_label("greeting", "Hello", 0, 0)
  with pytest.raises(ValueError, match="no button"):
    kiosk.on_click("greeting", lambda: None)


def test_on_click_needs_a_function():
  kiosk.add_button("go", "Press me", 0, 0)
  with pytest.raises(ValueError, match="needs a function"):
    kiosk.on_click("go", "not a function")
