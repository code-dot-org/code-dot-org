from enum import Enum

# Enum for neighborhood context type, which indicates if we are in a "regular"
# run or a validation run.
class NeighborhoodContextType(Enum):
  RUN = "RUN"
  VALIDATE = "VALIDATE"
