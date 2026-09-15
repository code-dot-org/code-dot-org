import sys
import types

from kiosk.support import bridge


def test_publishing_without_the_host_module_does_nothing():
  # No _kiosk_bridge is installed, which is every interpreter but Pyodide's.
  bridge.publish('{"elements": []}')


def test_waiting_without_the_host_module_reports_no_event():
  assert bridge.wait_for_event() is None


def test_publish_hands_the_scene_to_the_host(monkeypatch):
  published = []
  fake_bridge = types.ModuleType("_kiosk_bridge")
  fake_bridge.publish = published.append
  monkeypatch.setitem(sys.modules, "_kiosk_bridge", fake_bridge)

  bridge.publish('{"elements": []}')

  assert published == ['{"elements": []}']


def test_wait_for_event_returns_what_the_host_sent(monkeypatch):
  fake_bridge = types.ModuleType("_kiosk_bridge")
  fake_bridge.waitForEvent = lambda: "go"
  monkeypatch.setitem(sys.modules, "_kiosk_bridge", fake_bridge)

  assert bridge.wait_for_event() == "go"


def test_an_empty_answer_reports_no_event(monkeypatch):
  # How Stop ends a program it caught waiting, without restarting Pyodide.
  fake_bridge = types.ModuleType("_kiosk_bridge")
  fake_bridge.waitForEvent = lambda: ""
  monkeypatch.setitem(sys.modules, "_kiosk_bridge", fake_bridge)

  assert bridge.wait_for_event() is None
