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
  """Record published scenes and answer waits with the given element ids.

  Returns the list the scenes land in, each already parsed from JSON. The wait
  runs out after the last event, which is what lets start() return.
  """
  published = []
  remaining = list(events)

  fake_bridge = types.ModuleType("_kiosk_bridge")
  fake_bridge.publish = lambda scene_json: published.append(json.loads(scene_json))
  fake_bridge.waitForEvent = lambda: remaining.pop(0) if remaining else None
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
