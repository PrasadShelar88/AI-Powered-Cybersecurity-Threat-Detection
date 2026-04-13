from typing import List, Optional, Tuple
from pydantic import BaseModel, Field

Coordinate = Tuple[int, int]

class GridRequest(BaseModel):
    rows: int
    cols: int
    obstacle_ratio: float = 0.2
    seed: Optional[int] = None

class NavigationRequest(BaseModel):
    grid: List[List[int]]
    start: Coordinate
    goal: Coordinate

class NavigationResponse(BaseModel):
    success: bool
    message: str
    path: List[Coordinate]
    path_length: int
