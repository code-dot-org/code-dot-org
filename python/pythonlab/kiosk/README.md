# kiosk

The `kiosk` package gives Python Lab student code a screen to put buttons,
labels and sliders on, and a loop that runs a Python function when one of them
is used. Unlike `neighborhood` and `theater`, which draw and finish, a kiosk
program keeps running: what the student sees can send something back.

```python
import kiosk

presses = 0

kiosk.add_label("counter", "Presses: 0", 5, 10)
kiosk.add_button("go", "Press me", 5, 25)

def count_press():
    global presses
    presses += 1
    kiosk.set_text("counter", f"Presses: {presses}")

kiosk.on_click("go", count_press)
kiosk.start()
```

Everything under `kiosk.support` — the link to the page, the coordinate
bounds — is machinery these functions are built from, not something student
code calls.

## Functions

| Function | Behavior |
| --- | --- |
| `add_label(label_id, text, x, y)` | Place a label. |
| `add_button(button_id, text, x, y)` | Place a button. |
| `add_slider(slider_id, text, x, y, minimum=0, maximum=100, value=0)` | Place a slider, labelled `text`, with its handle at `value`. |
| `set_text(element_id, text)` | Change what a button, label or slider says. |
| `set_value(slider_id, value)` | Move a slider's handle. |
| `get_value(slider_id)` | Where a slider's handle is now. |
| `on_click(button_id, handler)` | Run `handler`, which takes no arguments, when the button is pressed. |
| `on_change(slider_id, handler)` | Run `handler` with the slider's new value each time it moves. |
| `start()` | Show the screen and react to it until the program is stopped. |

A press carries nothing, so `on_click` handlers take no arguments; a slider
move carries where the handle was left, so `on_change` handlers take that
value. Any handler can read a slider with `get_value`, which is how a button
handler sees where a slider was left.

`x` and `y` are percentages of the screen's width and height, measured from
its top left corner, so a layout looks the same whatever size the preview
panel is. Ids are text, and must be unique across every element on the screen.

An argument that does not fit raises `ValueError` before anything is placed,
so the traceback points at the student's own call rather than at the renderer.

Elements are drawn in the order they were added, which is also the order the
keyboard tabs through them.

## The default screen

There is one screen per run, built the first time something is placed on it.
It holds everything placed so far, so Python Lab drops it between runs —
Pyodide keeps one interpreter for the life of the tab, and without the reset
the next run would start on the previous run's screen. `reset_default_screen()`
is exported for `pythonlab_setup`'s teardown to call; student code has no
reason to.

## start()

`start()` publishes the screen and then blocks. Each time a button is pressed
it runs that button's handler and publishes whatever the handler changed. It
does not return on its own: the student ends the program with the Stop button.

Stop does not terminate the interpreter. A program waiting for a press is
parked on a request the host is holding open, so Stop answers that request with
an empty id, `wait_for_event()` reports no event, and `start()` returns like any
other function. The interpreter stays loaded, which is what keeps the next Run
from reloading Pyodide and its packages. A handler that loops forever never
reaches the next wait, and the host falls back to terminating the worker.

An exception raised inside a handler propagates out of `start()` and ends the
program, the same as an exception anywhere else.

## Talking to the page

`kiosk/support/bridge.py` is the only route in or out of the interpreter.
Under Pyodide's `jsglobals: {}` nothing else reaches the browser.

- `publish(scene_json)` calls `_kiosk_bridge.publish`, a JS module the Pyodide
  web worker registers. The host posts the scene to the page, which draws it.
- `wait_for_event()` calls `_kiosk_bridge.waitForEvent`, which blocks on a
  synchronous request that a service worker answers when someone uses the
  screen. The answer is `{"id": "go"}` for a press, with a `"value"` alongside
  it when a slider moved, or nothing at all when Stop is asking the program to
  end. This is the same round trip that makes `input()` work; see
  `apps/src/pythonlab/inputServiceWorker.js`.

  A slider moves continuously while it is dragged, but this channel carries one
  event at a time and the program is blocked until it handles each one. The page
  therefore sends only where a handle comes to rest, not every step on the way.

In any other interpreter the module is absent: publishing does nothing and
`wait_for_event()` returns `None`, which is what lets `start()` return and the
tests run without a browser.

Presses and `input()` share that one channel, so a program that waits on both
at once cannot tell them apart: a press would answer whichever is waiting. A
kiosk program should use one or the other.

### Scene format

One message per screen state:

```json
{
  "elements": [
    {"type": "label",  "id": "greeting", "text": "Hello",    "x": 5, "y": 10},
    {"type": "button", "id": "go",       "text": "Press me", "x": 5, "y": 25},
    {"type": "slider", "id": "volume",   "text": "Volume",   "x": 5, "y": 40,
     "min": 0, "max": 11, "value": 3}
  ]
}
```

The page redraws from this whole description each time, so it carries the
screen's current state rather than a change to it. Every element has the four
common fields; a slider adds the ends of its range and where its handle sits.

## Tests

From this directory, `uv run pytest`.
