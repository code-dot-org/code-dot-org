from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional

import numpy as np

from .color import Color
from .font import Font, FontStyle
from .image import Image
from ..instrument import Instrument


class SceneActionType(Enum):
  CLEAR_SCENE = auto()
  PLAY_SOUND = auto()
  PLAY_NOTE = auto()
  PAUSE = auto()
  DRAW_IMAGE = auto()
  DRAW_TEXT = auto()
  DRAW_LINE = auto()
  DRAW_POLYGON = auto()
  DRAW_SHAPE = auto()
  DRAW_ELLIPSE = auto()
  DRAW_RECTANGLE = auto()


# Sentinel for the "size not specified" branch in draw_image.
UNSPECIFIED = -1

# Simple data classes for various actions in a theater program.

@dataclass
class ClearScene:
  color: Color
  type: SceneActionType = SceneActionType.CLEAR_SCENE


@dataclass
class PlaySound:
  samples: np.ndarray  # normalized float samples in [-1.0, 1.0]
  type: SceneActionType = SceneActionType.PLAY_SOUND


@dataclass
class PlayNote:
  instrument: Instrument
  note: int
  seconds: float
  type: SceneActionType = SceneActionType.PLAY_NOTE


@dataclass
class Pause:
  seconds: float
  type: SceneActionType = SceneActionType.PAUSE


@dataclass
class DrawImage:
  image: Image
  x: int
  y: int
  size: int
  width: int
  height: int
  rotation: float
  type: SceneActionType = SceneActionType.DRAW_IMAGE


@dataclass
class DrawText:
  text: str
  x: int
  y: int
  rotation: float
  height: int
  font: Font
  font_style: FontStyle
  color: Color
  type: SceneActionType = SceneActionType.DRAW_TEXT


@dataclass
class DrawLine:
  start_x: int
  start_y: int
  end_x: int
  end_y: int
  color: Color
  stroke_width: float
  type: SceneActionType = SceneActionType.DRAW_LINE


@dataclass
class DrawPolygon:
  x: int
  y: int
  sides: int
  radius: int
  stroke_color: Optional[Color]
  fill_color: Optional[Color]
  stroke_width: float
  type: SceneActionType = SceneActionType.DRAW_POLYGON


@dataclass
class DrawShape:
  points: list
  close: bool
  stroke_color: Optional[Color]
  fill_color: Optional[Color]
  stroke_width: float
  type: SceneActionType = SceneActionType.DRAW_SHAPE


@dataclass
class DrawEllipse:
  x: int
  y: int
  width: int
  height: int
  stroke_color: Optional[Color]
  fill_color: Optional[Color]
  stroke_width: float
  type: SceneActionType = SceneActionType.DRAW_ELLIPSE


@dataclass
class DrawRectangle:
  x: int
  y: int
  width: int
  height: int
  stroke_color: Optional[Color]
  fill_color: Optional[Color]
  stroke_width: float
  type: SceneActionType = SceneActionType.DRAW_RECTANGLE
