from enum import Enum

class SquareType(Enum):
    WALL = "WALL"
    OPEN = "OPEN"
    START = "START"
    FINISH = "FINISH"
    OBSTACLE = "OBSTACLE"
    STARTANDFINISH = "STARTANDFINISH"
    UNKNOWN = "UNKNOWN"