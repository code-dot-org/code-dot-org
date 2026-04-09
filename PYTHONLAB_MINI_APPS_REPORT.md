# PythonLab Mini-Apps: Architecture Report & Developer Guide

> Generated: 2026-04-09
> Based on: `apps/src/miniApps/neighborhood`, `apps/src/pythonlab/`, `python/pythonlab/neighborhood/`, `dashboard/app/models/levels/pythonlab.rb`, and related files.

---

## Table of Contents

1. [What Is a Mini-App?](#1-what-is-a-mini-app)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Signal Messaging Protocol](#3-signal-messaging-protocol)
4. [How Mini-Apps Are Registered](#4-how-mini-apps-are-registered)
5. [Full Lifecycle: Initialization → Execution → Teardown](#5-full-lifecycle)
6. [Existing Mini-App: Neighborhood Deep Dive](#6-neighborhood-deep-dive)
7. [Guide: Creating a New Mini-App](#7-guide-creating-a-new-mini-app)
8. [Key Files Reference](#8-key-files-reference)

---

## 1. What Is a Mini-App?

A **mini-app** is an interactive visualization panel rendered in PythonLab's output area that responds in real-time to Python code execution. Instead of (or in addition to) text output, a mini-app provides a graphical view that students can manipulate via Python APIs.

Currently, only one mini-app exists: **Neighborhood** — a grid-based world where a "Painter" character can move, turn, and paint cells, similar to a classic Karel/Turtle environment.

### Core Concept

Mini-apps work by having Python code **emit structured signal messages to stdout**. These signals are intercepted before reaching the console and dispatched to the JavaScript visualization layer.

```
Python code → stdout signal → Worker postMessage → JS signal handler → SVG animation
```

### Three-Part Composition

Every mini-app is composed of three parts:

| Layer | Location | Purpose |
|---|---|---|
| **Python Package** | `python/pythonlab/<name>/` | Student-facing API (e.g., `Painter`) |
| **TypeScript Controller** | `apps/src/miniApps/<name>/` | Receives signals, manages animation state |
| **React Visualization** | `apps/src/miniApps/<name>/` | Renders the visual output panel |

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DASHBOARD (Rails)                                                       │
│  pythonlab.rb defines: mini_app, serialized_maze, start_sources          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │  Level props passed to frontend
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  REACT (PythonlabView.tsx)                                               │
│  Reads labConfig.miniApp, renders MiniAppPreview with correct sub-app   │
│                                                                           │
│  ┌─────────────────────┐    ┌──────────────────────────────────────┐    │
│  │  Code Editor Panel  │    │  Output Panel (MiniAppPreview)        │    │
│  │  (Monaco Editor)    │    │  └─ NeighborhoodVisualization.tsx     │    │
│  └─────────────────────┘    └──────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │  asyncRun() via postMessage
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PYODIDE WEB WORKER (pyodideWebWorker.ts)                                │
│  Loads Python packages including the mini-app's .whl                    │
│  Executes user code; captures stdout                                     │
│                                                                           │
│  User code: painter.move()                                               │
│  Python prints: "[NEIGHBORHOOD] MOVE {"direction": "south", "id": "..."}"│
│  Worker posts: {type: 'sysout', message: "[NEIGHBORHOOD] MOVE {...}"}    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │  worker.onmessage
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PYODIDE WORKER MANAGER (pyodideWorkerManager.ts)                        │
│  Intercepts [NEIGHBORHOOD] prefixed messages                             │
│  Parses → NeighborhoodSignal via messageHelpers.ts                      │
│  Calls neighborhood.handleSignal(signal)                                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │  signal queue
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NEIGHBORHOOD CONTROLLER (Neighborhood.ts)                               │
│  Queues signals; processSignals() animates them with timing              │
│  Delegates to MazeController for SVG DOM updates                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Signal Messaging Protocol

This is the central mechanism. Mini-apps communicate between Python and JavaScript through **formatted stdout strings**.

### Wire Format

```
[{TYPE}] {KEY} {JSON_DETAIL}
```

Where:
- `{TYPE}` = the mini-app's message type identifier (e.g., `NEIGHBORHOOD`)
- `{KEY}` = the signal action (e.g., `MOVE`, `PAINT`, `DONE`)
- `{JSON_DETAIL}` = optional JSON object with parameters

### Examples

```
[NEIGHBORHOOD] INITIALIZE_PAINTER {"direction": "east", "x": "0", "y": "0", "paint": null, "id": "painter-1"}
[NEIGHBORHOOD] MOVE {"direction": "south", "id": "painter-1"}
[NEIGHBORHOOD] PAINT {"color": "Blue", "id": "painter-1"}
[NEIGHBORHOOD] TURN_LEFT {"id": "painter-1"}
[NEIGHBORHOOD] DONE
```

### Why Stdout?

Pyodide runs Python in a Web Worker with no direct JS bridge for arbitrary function calls. The cleanest IPC mechanism is stdout capture — the worker already intercepts all print output and posts it to the main thread. Mini-apps piggyback on this mechanism.

The Python `send()` method conditionally prints only in `RUN` mode. In `VALIDATE` mode (unit tests), signals are tracked in a `NeighborhoodTracker` singleton instead of printed.

### Neighborhood Signal Types (TypeScript enum)

Located in `apps/src/miniApps/neighborhood/constants.ts`:

```typescript
export enum NeighborhoodSignalType {
  MOVE = 'MOVE',
  INITIALIZE_PAINTER = 'INITIALIZE_PAINTER',
  TURN_LEFT = 'TURN_LEFT',
  PAINT = 'PAINT',
  REMOVE_PAINT = 'REMOVE_PAINT',
  TAKE_PAINT = 'TAKE_PAINT',
  HIDE_PAINTER = 'HIDE_PAINTER',
  SHOW_PAINTER = 'SHOW_PAINTER',
  HIDE_BUCKETS = 'HIDE_BUCKETS',
  SHOW_BUCKETS = 'SHOW_BUCKETS',
  DONE = 'DONE',
}
```

### Signal-to-Action Mapping

| Python Signal | Detail Fields | JS Action |
|---|---|---|
| `INITIALIZE_PAINTER` | `{direction, x, y, paint, id}` | `controller.addPegman(id, x, y, dir)` |
| `MOVE` | `{direction, id}` | `controller.animatedMove(direction, time, id)` |
| `TURN_LEFT` | `{id}` | `controller.subtype.turnLeft(id)` |
| `PAINT` | `{color, id}` | `controller.subtype.addPaint(id, color)` |
| `REMOVE_PAINT` | `{id}` | `controller.subtype.removePaint(id)` |
| `TAKE_PAINT` | `{id}` | `controller.subtype.takePaint(id)` |
| `HIDE_PAINTER` | `{id}` | `controller.hidePegman(id)` |
| `SHOW_PAINTER` | `{id}` | `controller.showPegman(id)` |
| `HIDE_BUCKETS` | none | `controller.subtype.setBucketVisibility(false)` |
| `SHOW_BUCKETS` | none | `controller.subtype.setBucketVisibility(true)` |
| `DONE` | none | Resolves `waitUntilDone()`, stops animation loop |

---

## 4. How Mini-Apps Are Registered

Mini-apps are wired up at four registration points:

### 4.1 The `MiniApps` Enum

**File:** `apps/src/codebridge/constants.ts`

```typescript
export enum MiniApps {
  Neighborhood = 'neighborhood',
  // Add new mini-apps here
}
```

### 4.2 MiniAppPreview Router

**File:** `apps/src/codebridge/MiniAppPreview/MiniAppPreview.tsx`

This component reads `miniApp` from the lab config and renders the right visualization:

```typescript
const miniAppComponent = useMemo(() => {
  if (miniApp === MiniApps.Neighborhood) {
    return <NeighborhoodPreview handleScaling={handleScaling} />;
  }
  return null;
}, [handleScaling, miniApp]);
```

### 4.3 CodebridgeRegistry

**File:** `apps/src/codebridge/CodebridgeRegistry.ts`

A singleton that holds a reference to the active mini-app controller, so other modules (runner, worker manager) can reach it:

```typescript
export default class CodebridgeRegistry {
  private neighborhood: Neighborhood | null;

  public setNeighborhood(neighborhood: Neighborhood | null) { ... }
  public getNeighborhood() { return this.neighborhood; }
}
```

Each mini-app needs its own `get/set` pair here.

### 4.4 Rails Level Definition

**File:** `dashboard/app/models/levels/pythonlab.rb`

```ruby
def self.mini_apps
  [['None', nil], ['Neighborhood', 'neighborhood']]
end
```

This populates the level editor dropdown. Each entry is `[display_name, value]`.

---

## 5. Full Lifecycle

### Phase 1: Level Initialization

The Rails model defines the level's mini-app configuration:

```ruby
# Stored in the level's serialized properties:
mini_app: 'neighborhood'
serialized_maze: '[[{"tileType":1,"value":0,"assetId":0}, ...]]'  # 16x16 grid
start_sources: { ... }  # Default Python files
```

These are passed to the frontend as `levelProperties`.

### Phase 2: Mini-App Component Mounting

`NeighborhoodPreview.tsx` mounts and:

1. Creates a `new Neighborhood(callbacks)` instance with four callbacks:
   - `onOutputMessage(msg)` — routes print output to console
   - `onNewlineMessage()` — handles blank lines
   - `setIsRunning(bool)` — updates run state in Redux
   - `onPartialOutputMessage(msg)` — handles `input()` prompts
2. Registers the instance: `CodebridgeRegistry.getInstance().setNeighborhood(ref)`
3. Calls `neighborhood.afterInject(levelProps, skin, config, ...)` to initialize the grid from `serialized_maze`

### Phase 3: Pyodide Worker Startup

`pyodideWebWorker.ts` loads Python packages including the mini-app's wheel file:

```typescript
await pyodide.loadPackage([
  'matplotlib', 'numpy',
  `/blockly/js/pyodide/${version}/pythonlab_setup-0.2.0-py3-none-any.whl`,
  `/blockly/js/pyodide/${version}/neighborhood-0.4.0-py3-none-any.whl`,
]);
```

### Phase 4: User Clicks Run

`pyodideRunner.ts`:

```typescript
// 1. Reset the mini-app visualization
CodebridgeRegistry.getInstance().getNeighborhood()?.reset();
CodebridgeRegistry.getInstance().getNeighborhood()?.onRun();

// 2. Execute user code, routing output to mini-app
asyncRun(mainFile, source, undefined, outputToNeighborhood = true);
```

### Phase 5: Signal Transmission & Dispatch

As Python code runs, signals are printed to stdout, captured by the worker, and posted to the main thread. `pyodideWorkerManager.ts` intercepts them:

```typescript
worker.onmessage = event => {
  const { message } = event.data;
  if (message.startsWith('[NEIGHBORHOOD]')) {
    const signal = parseMessageToNeighborhoodSignal(message);
    neighborhood.handleSignal(signal);
    return;
  }
  // Otherwise write to console
  consoleManager.writeConsoleMessage(message);
};
```

### Phase 6: Signal Queue Processing

`Neighborhood.ts` queues all signals and processes them in order with animation timing:

```typescript
processSignals() {
  if (this.signals.length > this.nextSignalIndex) {
    const signal = this.signals[this.nextSignalIndex];

    if (signal.value === NeighborhoodSignalType.DONE) {
      this.setIsRunning(false);
      this.resolveOnDone?.();
      return;
    }

    const timeForSignal = this.getAnimationTime(signal) * this.getPegmanSpeedMultiplier();
    this.mazeCommand(signal, timeForSignal);   // Dispatch to MazeController
    this.nextSignalIndex++;

    // Schedule next signal after animation completes
    timeoutList.setTimeout(() => this.processSignals(), timeForSignal + PAUSE_BETWEEN_SIGNALS);
  } else {
    // No signals yet; poll again shortly
    timeoutList.setTimeout(() => this.processSignals(), SIGNAL_CHECK_TIME);
  }
}
```

### Phase 7: Teardown

After execution completes:

1. Python code signals `[NEIGHBORHOOD] DONE` (sent automatically after user code finishes)
2. `resolveOnDone()` resolves `waitUntilDone()` promise
3. `pyodideRunner.setProjectThumbnail()` waits for animations to finish, then captures SVG as PNG
4. Worker runs cleanup: `reset_neighborhood()` clears the Python-side `World` singleton
5. Worker runs `setup_pythonlab()` to prepare for the next run

---

## 6. Neighborhood Deep Dive

### Python Package Structure

```
python/pythonlab/neighborhood/
├── pyproject.toml                    # Build config, version (currently 0.4.0)
└── neighborhood/
    ├── __init__.py                   # Public exports: Painter, World, etc.
    ├── painter.py                    # Main user-facing class
    ├── neighborhood_log.py           # Log/history object
    ├── painter_log.py
    ├── painter_event.py
    ├── position.py
    └── support/
        ├── world.py                  # Singleton grid state
        ├── grid_factory.py           # Parses serialized_maze.txt → Grid
        ├── neighborhood_context_type.py  # RUN vs VALIDATE enum
        ├── neighborhood_tracker.py   # Signal tracking for tests
        ├── neighborhood_signal_key.py    # Signal key enum (MOVE, PAINT, etc.)
        ├── neighborhood_signal_message.py  # Signal formatter/sender
        ├── signal_message_type.py    # Type enum ("NEIGHBORHOOD")
        ├── exception_key.py          # Error enum (INVALID_MOVE, etc.)
        └── direction.py              # Direction enum (NORTH, SOUTH, etc.)
```

#### The `World` Singleton

`World` holds the shared grid state, initialized from a `serialized_maze.txt` file that is written by the JS layer before each run. It uses `NeighborhoodContextType` to determine whether to print signals (RUN) or track them (VALIDATE).

#### Signal Emission Pattern (in `Painter`)

Every action method follows this pattern:

```python
def move(self):
    if self._is_valid_movement(self.direction):
        # 1. Update internal state
        if self.direction.is_north():
            self.y -= 1
        # ...
        # 2. Emit signal
        self._send_signal(NeighborhoodSignalKey.MOVE, {'direction': self.direction.value})
    else:
        raise NeighborhoodRuntimeException(ExceptionKey.INVALID_MOVE)

def _send_signal(self, signal_key, detail=None, is_boolean_message=False):
    detail = detail or {}
    detail['id'] = self.id   # Always include painter ID
    msg = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, signal_key, detail)
    msg.send(self.world.context_type, NeighborhoodTracker(self.world), is_boolean_message)
```

### TypeScript/React Structure

```
apps/src/miniApps/neighborhood/
├── Neighborhood.ts                   # Main controller (signal queue, animation loop)
├── NeighborhoodVisualization.tsx     # React component for SVG grid
├── NeighborhoodSpeedTracker.ts       # Manages speed slider state
├── types.ts                          # NeighborhoodSignal, ConsoleSignal interfaces
├── constants.ts                      # NeighborhoodSignalType enum, timing constants
└── neighborhood.module.scss          # Styles

apps/src/codebridge/MiniAppPreview/
├── MiniAppPreview.tsx                # Router: picks which mini-app to render
└── NeighborhoodPreview.tsx           # Creates Neighborhood instance, wires callbacks
```

#### The `Neighborhood` Class Interface

```typescript
class Neighborhood {
  constructor(
    onOutputMessage: (message: string) => void,
    onNewlineMessage: () => void,
    setIsRunning: (isRunning: boolean) => void,
    onPartialOutputMessage: (message: string) => void
  )

  afterInject(level, skin, config, playAudio, playAudioOnFailure, loadAudio, getTestResults): void
  handleSignal(signal: NeighborhoodSignal | ConsoleSignal | null): void
  processSignals(): void
  reset(): void
  onRun(): void
  onStop(): void
  onClose(): void
  isRunning(): boolean
  waitUntilDone(): Promise<void>
}
```

### Validation / Testing Mode

The Python package supports two execution contexts:

```python
class NeighborhoodContextType(Enum):
    RUN = "RUN"        # Signals are printed to stdout
    VALIDATE = "VALIDATE"  # Signals are recorded in NeighborhoodTracker
```

In VALIDATE mode (used by unit tests), signals are captured in a tracker so test assertions can verify what actions occurred without any stdout output.

---

## 7. Guide: Creating a New Mini-App

This section walks through adding a hypothetical **`canvas`** mini-app from scratch.

### Step 1: Create the Python Package

```
python/pythonlab/canvas/
├── pyproject.toml
└── canvas/
    ├── __init__.py
    ├── brush.py                   # Main user-facing class
    └── support/
        ├── canvas_signal_key.py   # Enum of all signals
        ├── signal_message_type.py # "CANVAS" type constant
        ├── canvas_context.py      # Singleton context (like World)
        └── canvas_signal_message.py  # Signal formatter
```

#### `pyproject.toml`

```toml
[build-system]
requires = ["setuptools", "wheel"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "canvas"
version = "0.1.0"
```

#### `canvas/support/signal_message_type.py`

```python
from enum import Enum

class SignalMessageType(Enum):
    CANVAS = "CANVAS"
```

#### `canvas/support/canvas_signal_key.py`

```python
from enum import Enum

class CanvasSignalKey(Enum):
    DRAW_LINE = "DRAW_LINE"
    DRAW_CIRCLE = "DRAW_CIRCLE"
    SET_COLOR = "SET_COLOR"
    CLEAR = "CLEAR"
    DONE = "DONE"
```

#### `canvas/support/canvas_signal_message.py`

Model this on `neighborhood_signal_message.py`. The key method:

```python
def _get_formatted_message(self) -> str:
    msg = f'[{self.type.value}] {self.key.value}'
    if self.detail:
        msg += f' {json.dumps(self.detail)}'
    return msg

def send(self, context_type):
    if context_type == CanvasContextType.RUN:
        print(self._get_formatted_message())
```

#### `canvas/brush.py`

```python
from .support.canvas_signal_key import CanvasSignalKey
from .support.signal_message_type import SignalMessageType
from .support.canvas_signal_message import CanvasSignalMessage

class Brush:
    last_id = 0

    def __init__(self):
        Brush.last_id += 1
        self.id = f"brush-{Brush.last_id}"

    def draw_line(self, x1, y1, x2, y2):
        self._send_signal(CanvasSignalKey.DRAW_LINE, {
            'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2
        })

    def _send_signal(self, key, detail=None):
        detail = detail or {}
        detail['id'] = self.id
        CanvasSignalMessage(SignalMessageType.CANVAS, key, detail).send(context_type)
```

#### `canvas/__init__.py`

```python
from .brush import Brush as Brush
```

### Step 2: Build & Package as a Wheel

Follow the same process as the `neighborhood` package:

```bash
cd python/pythonlab/canvas
pip install build
python -m build --wheel
# Results in dist/canvas-0.1.0-py3-none-any.whl
```

Deploy the wheel to the same location as the neighborhood wheel (CDN path used by Pyodide). Check `pyodideWebWorker.ts` for the existing URL pattern.

### Step 3: Create the TypeScript Controller

**File:** `apps/src/miniApps/canvas/types.ts`

```typescript
export interface CanvasSignal {
  value: CanvasSignalType;
  detail?: {
    id: string;
    x1?: number; y1?: number;
    x2?: number; y2?: number;
    color?: string;
    radius?: number;
  };
}
```

**File:** `apps/src/miniApps/canvas/constants.ts`

```typescript
export enum CanvasSignalType {
  DRAW_LINE = 'DRAW_LINE',
  DRAW_CIRCLE = 'DRAW_CIRCLE',
  SET_COLOR = 'SET_COLOR',
  CLEAR = 'CLEAR',
  DONE = 'DONE',
}

export const MESSAGE_TAG = 'CANVAS';
```

**File:** `apps/src/miniApps/canvas/Canvas.ts`

```typescript
export default class Canvas {
  private signals: CanvasSignal[] = [];
  private nextSignalIndex = 0;
  private running = false;

  constructor(
    private onOutputMessage: (msg: string) => void,
    private onNewlineMessage: () => void,
    private setIsRunning: (isRunning: boolean) => void,
  ) {}

  handleSignal(signal: CanvasSignal | null) {
    if (!signal) return;
    this.signals.push(signal);
  }

  processSignals() {
    while (this.nextSignalIndex < this.signals.length) {
      const signal = this.signals[this.nextSignalIndex++];
      if (signal.value === CanvasSignalType.DONE) {
        this.setIsRunning(false);
        return;
      }
      this.applySignal(signal);
    }
  }

  private applySignal(signal: CanvasSignal) {
    // Update canvas DOM/canvas API based on signal type
    switch (signal.value) {
      case CanvasSignalType.DRAW_LINE:
        // Use HTML5 Canvas API or SVG to draw
        break;
      // ...
    }
  }

  reset() { this.signals = []; this.nextSignalIndex = 0; }
  onRun() { this.setIsRunning(true); }
  onStop() { this.setIsRunning(false); }
  isRunning() { return this.running; }
  waitUntilDone(): Promise<void> { return Promise.resolve(); }
}
```

### Step 4: Create the React Visualization Component

**File:** `apps/src/miniApps/canvas/CanvasVisualization.tsx`

```tsx
import React, {useRef, useEffect} from 'react';

interface Props {
  className?: string;
}

const CanvasVisualization: React.FC<Props> = ({className}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className={className}>
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
};

export default CanvasVisualization;
```

**File:** `apps/src/codebridge/MiniAppPreview/CanvasPreview.tsx`

```tsx
import React, {useMemo} from 'react';
import Canvas from '../../miniApps/canvas/Canvas';
import CanvasVisualization from '../../miniApps/canvas/CanvasVisualization';
import CodebridgeRegistry from '../CodebridgeRegistry';
import {useDispatch} from 'react-redux';
import {setIsRunning} from '../redux/canvasRedux'; // if needed

const CanvasPreview: React.FC = () => {
  const dispatch = useDispatch();

  const canvas = useMemo(() => {
    const instance = new Canvas(
      msg => console.log(msg),    // onOutputMessage
      () => {},                   // onNewlineMessage
      isRunning => dispatch(setIsRunning(isRunning)),
    );
    CodebridgeRegistry.getInstance().setCanvas(instance);
    return instance;
  }, [dispatch]);

  return <CanvasVisualization />;
};

export default CanvasPreview;
```

### Step 5: Register in CodebridgeRegistry

**File:** `apps/src/codebridge/CodebridgeRegistry.ts`

Add `get/set` methods for your mini-app:

```typescript
private canvas: Canvas | null = null;

public setCanvas(canvas: Canvas | null) { this.canvas = canvas; }
public getCanvas() { return this.canvas; }
```

### Step 6: Add to MiniApps Enum

**File:** `apps/src/codebridge/constants.ts`

```typescript
export enum MiniApps {
  Neighborhood = 'neighborhood',
  Canvas = 'canvas',             // Add here
}
```

### Step 7: Wire into MiniAppPreview Router

**File:** `apps/src/codebridge/MiniAppPreview/MiniAppPreview.tsx`

```tsx
import CanvasPreview from './CanvasPreview';

const miniAppComponent = useMemo(() => {
  if (miniApp === MiniApps.Neighborhood) {
    return <NeighborhoodPreview handleScaling={handleScaling} />;
  }
  if (miniApp === MiniApps.Canvas) {
    return <CanvasPreview />;
  }
  return null;
}, [handleScaling, miniApp]);
```

### Step 8: Add Signal Parsing

**File:** `apps/src/pythonlab/pythonHelpers/messageHelpers.ts`

Add a parser alongside `parseMessageToNeighborhoodSignal`:

```typescript
export function parseMessageToCanvasSignal(message: string): CanvasSignal | null {
  const regex = /^\[CANVAS\]\s+([^\s]+)(?:\s+(\{.*\}))?$/;
  const match = message.match(regex);
  if (!match) return null;

  const [, value, detail] = match;
  return {
    value: value as CanvasSignalType,
    detail: detail ? JSON.parse(detail) : undefined,
  };
}
```

### Step 9: Wire into Worker Manager Signal Dispatch

**File:** `apps/src/pythonlab/pyodideWorkerManager.ts`

In the `onmessage` handler, add a branch for the new message tag:

```typescript
if (message.startsWith('[CANVAS]')) {
  const canvas = CodebridgeRegistry.getInstance().getCanvas();
  if (canvas) {
    const signal = parseMessageToCanvasSignal(message);
    canvas.handleSignal(signal);
  }
  return;
}
```

Also add a `MessageTag` constant in `apps/src/pythonlab/pythonHelpers/constants.ts`:

```typescript
export const MessageTag = {
  MATPLOTLIB_IMG: 'matplotlib_img',
  NEIGHBORHOOD_SIGNAL: 'NEIGHBORHOOD',
  CANVAS_SIGNAL: 'CANVAS',           // Add here
  INPUT_PROMPT: 'input_prompt',
  INPUT_FAILED: 'input_failed',
};
```

### Step 10: Add to Rails Level Definition

**File:** `dashboard/app/models/levels/pythonlab.rb`

```ruby
def self.mini_apps
  [['None', nil], ['Neighborhood', 'neighborhood'], ['Canvas', 'canvas']]
end
```

If your mini-app needs level-specific data (like Neighborhood's `serialized_maze`), add a serialized attribute and any validation logic:

```ruby
serialized_attrs %w(
  start_sources
  mini_app
  serialized_maze
  canvas_settings   # Add here if needed
  ...
)

def clean_up_mini_app_settings
  if mini_app != 'neighborhood'
    properties.delete('serialized_maze')
  end
  if mini_app != 'canvas'
    properties.delete('canvas_settings')
  end
end
```

### Step 11: Load Wheel in Pyodide Worker

**File:** `apps/src/pythonlab/pyodideWebWorker.ts`

```typescript
const loadPackages = async () => {
  await pyodide.loadPackage([
    'matplotlib', 'numpy',
    `/blockly/js/pyodide/${version}/pythonlab_setup-0.2.0-py3-none-any.whl`,
    `/blockly/js/pyodide/${version}/neighborhood-0.4.0-py3-none-any.whl`,
    `/blockly/js/pyodide/${version}/canvas-0.1.0-py3-none-any.whl`,  // Add here
  ]);
};
```

### Step 12: (Optional) Project Template for Standalone Mode

If the mini-app should be available as a standalone project type (not just a level), add a project template in `apps/src/pythonlab/constants.ts` following the pattern of `STANDALONE_NEIGHBORHOOD_PROJECT`.

---

## 8. Key Files Reference

| File | Purpose |
|---|---|
| `apps/src/codebridge/constants.ts` | `MiniApps` enum |
| `apps/src/codebridge/CodebridgeRegistry.ts` | Singleton holding active mini-app controller |
| `apps/src/codebridge/MiniAppPreview/MiniAppPreview.tsx` | Router: renders the right mini-app |
| `apps/src/codebridge/MiniAppPreview/NeighborhoodPreview.tsx` | Creates & configures Neighborhood instance |
| `apps/src/miniApps/neighborhood/Neighborhood.ts` | Signal queue, animation loop, lifecycle |
| `apps/src/miniApps/neighborhood/NeighborhoodVisualization.tsx` | SVG grid React component |
| `apps/src/miniApps/neighborhood/types.ts` | Signal type interfaces |
| `apps/src/miniApps/neighborhood/constants.ts` | Signal type enum, timing constants |
| `apps/src/pythonlab/pyodideWebWorker.ts` | Worker: loads packages, runs Python, captures stdout |
| `apps/src/pythonlab/pyodideWorkerManager.ts` | Main thread: parses signals, dispatches to mini-app |
| `apps/src/pythonlab/pyodideRunner.ts` | Orchestrates run/stop/reset, thumbnail capture |
| `apps/src/pythonlab/pythonHelpers/messageHelpers.ts` | Signal string parsers |
| `apps/src/pythonlab/pythonHelpers/constants.ts` | `MessageTag` constants (prefixes) |
| `apps/src/pythonlab/constants.ts` | Standalone project templates, lab configs |
| `python/pythonlab/neighborhood/neighborhood/painter.py` | Student-facing `Painter` class |
| `python/pythonlab/neighborhood/neighborhood/support/world.py` | Grid singleton |
| `python/pythonlab/neighborhood/neighborhood/support/neighborhood_signal_message.py` | Signal formatter |
| `python/pythonlab/neighborhood/neighborhood/support/neighborhood_context_type.py` | RUN vs VALIDATE |
| `python/pythonlab/neighborhood/neighborhood/support/neighborhood_tracker.py` | Signal tracker for tests |
| `dashboard/app/models/levels/pythonlab.rb` | Level model, mini-app dropdown, serialized attrs |

---

## Summary

Mini-apps in PythonLab use **stdout-based signal passing** as the IPC mechanism between Python (running in a Pyodide Web Worker) and JavaScript visualizations (running in the main thread). The protocol is:

1. **Python emits** `[TYPE] SIGNAL_KEY {"json": "detail"}` via `print()`
2. **Worker captures** stdout and posts it to the main thread
3. **Worker manager intercepts** messages with known type prefixes (e.g., `[NEIGHBORHOOD]`)
4. **Signal is parsed** into a typed object and passed to the mini-app controller
5. **Controller queues** signals and animates them in order with configurable timing
6. **`DONE` signal** marks end of execution and resolves the async completion promise

A new mini-app requires changes in: the Python package (signal emission), TypeScript controller (signal handling), React component (visualization), the `CodebridgeRegistry` (controller storage), `MiniAppPreview` (routing), `pyodideWorkerManager` (signal dispatch), `pyodideWebWorker` (package loading), and the Rails model (level configuration).

---

---

# Machine Learning Mini-Apps: Goals & Brainstorm

## Goals

The aim is to build one or more PythonLab mini-apps that teach **foundational ML concepts through code-driven animation**. The key pedagogical model is:

- Students **write Python** using a purpose-built library (like `Painter`)
- Each Python call **emits a signal** that triggers a visual change in the mini-app
- The visualization **animates step-by-step**, so students can see their code's effect unfold rather than just seeing a final result
- The experience is **simulation-like**: there's a setup phase (student code runs), then a playback phase (the mini-app animates)
- The goal is **intuition-building** — students see *why* ML algorithms work, not just *that* they work

The target audience is students new to ML (late middle school / high school), so the emphasis is on conceptual clarity over mathematical rigor.

---

## Notes on the Scatter Plot + Decision Boundary Idea

A scatter plot where students define labeled 2D data and watch a separator get drawn is a solid foundation. A few things that would make it stronger:

- **Animate the training process, not just the result.** Instead of showing the final decision boundary, show it moving iteration by iteration as the model learns. That's the "aha" moment — students see the boundary adjusting to minimize error.
- **Show misclassified points.** Highlighting which points are wrong at each step makes the loss function tangible.
- **Let students control the data.** The Python API should have students define their own labeled points, so they develop intuition for what data is "easy" vs. "hard" to separate.

The risk: if there's only one concept (draw points → draw line), it may feel thin as a standalone mini-app. It probably works best as one view inside a broader **Classifier mini-app** that supports multiple concepts.

---

## Potential Mini-Apps

### Tier 1: High Visual Impact, Conceptually Core

**1. K-Means Clustering Animator**

Students define unlabeled 2D data points and choose a `k` value. Press play and watch:
- `k` centroids appear at random positions
- Each point "connects" to its nearest centroid with an animated line (assignment step)
- Centroids slide to the mean of their cluster (update step)
- Repeat until convergence — or students call `step()` manually to control the pace

Why it's great: K-means has a beautiful iterative structure perfectly suited to sequential signal animation. Students can experiment with different `k` values and see how clusters form. The "wrong `k`" case is visually obvious and teaches model selection intuitively.

---

**2. Gradient Descent Landscape**

A 2D loss surface is displayed as a heatmap (blue = low loss, red = high loss). A ball starts somewhere on the surface. Students control the learning rate and optimizer via Python, then call `step()` in a loop. The ball rolls downhill toward the minimum.

Why it's great: Gradient descent is the most important concept in ML and the hardest to build intuition for. Seeing a ball take huge chaotic steps with a high learning rate vs. slow steady steps with a low learning rate is far more memorable than any formula. Students can also see local minima traps.

Variants students could explore: SGD vs. momentum vs. Adam, different loss surfaces.

---

**3. KNN Query Visualizer**

Students place labeled points on a 2D canvas via Python (`world.add_point(x, y, label='cat')`). Then they call `world.classify(x, y, k=3)` and watch the animation:
- A new mystery point appears
- Circles ripple outward from it until they've captured `k` neighbors
- The `k` nearest points highlight with connecting lines
- The point takes the majority label

Why it's great: KNN is the most conceptually transparent classifier. The animation makes the algorithm's logic completely self-evident. Changing `k` produces visually distinct results — a great lesson in the bias-variance tradeoff.

---

### Tier 2: Strong Concept, More Complex to Build

**4. Neural Network Forward/Backward Pass**

An SVG network diagram with visible nodes and weighted edges. Students define the architecture in Python (`net = Network([2, 3, 1])`), then feed in data and call `net.forward(x)`. Watch activations flow through the network as glowing pulses, with each node lighting up proportional to its activation value. On `net.backward()`, error gradients flow in reverse, and edge weights visibly thicken or thin.

Simplified enough for beginners by hiding the math behind the visual. Students can see dead neurons, see how data flows, and see what "learning" looks like.

---

**5. Decision Tree Builder**

Students provide labeled tabular data and call `tree.fit()`. Watch the tree grow: the root node shows the full dataset, then splits with an animated branch, and each subset falls into a child node. Nodes show their purity/label distribution as a pie chart. Students can control `max_depth` and see the tree stop growing.

Why it's interesting: Decision trees have a visual metaphor that's completely natural. This could teach information gain, overfitting (a deep tree memorizes), and pruning.

---

**6. Train/Test Split + Confusion Matrix**

Less a standalone app, more an **evaluation companion** that could pair with any classifier mini-app. Students split their data (`data.split(test_size=0.2)`), train, then run predictions. As each test prediction is made, the confusion matrix fills in one cell at a time. Precision, recall, and F1 update live. Students can see *which* points were misclassified by clicking on them in the scatter view.

---

### Tier 3: More Ambitious / Gamified

**7. Reinforcement Learning Grid World**

Like Neighborhood, but the character *learns* rather than being directed. Students define a reward structure (`world.set_reward(x, y, value=10)`, `world.set_penalty(x, y, value=-5)`). Then they call `agent.train(episodes=100)` and watch the agent explore the grid, try actions, get rewards, and gradually learn the optimal path. A Q-table heatmap overlaid on the grid shows which cells the agent has learned to value.

Why it's compelling: It feels like a game, and the "before training / after training" contrast is dramatic. It directly connects to the student's existing familiarity with the Neighborhood grid.

---

**8. Linear Regression with Residuals**

Students provide `(x, y)` data points. A best-fit line animates into position. Each point gets a vertical "residual" line connecting it to the regression line, visualizing error. Students can manually drag the slope/intercept via Python calls and watch the total error (sum of squared residuals) update. Then `model.fit()` snaps the line to the optimal position.

Good for a first introduction because the error is literally visible as line lengths.

---

## Recommendation

If building **one** mini-app first: **K-Means Clustering**. It:
- Has the clearest step-by-step structure (maps perfectly to the signal model)
- Teaches assignment + update + convergence — three concepts in one animation
- Requires no supervised labels, so the data setup is simpler for students
- Produces a visually satisfying result even with naively chosen parameters
- Naturally motivates follow-up questions ("what if `k` is wrong?", "why did it converge there?")

If building **two** that build on each other: K-Means followed by the **KNN Query Visualizer** creates a natural arc — first students learn unsupervised grouping, then supervised classification.
