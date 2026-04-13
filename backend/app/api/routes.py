from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.config import OUTPUT_DIR
from app.core.astar import astar
from app.core.grid import default_start_goal, generate_grid
from app.core.simulator import render_grid_image
from app.utils import validate_start_goal

router = APIRouter()


@router.get("/")
def root():
    return {
        "message": "AI-Based Autonomous Navigation System API",
        "docs": "/docs",
        "status": "running",
    }


@router.post("/generate-grid")
def generate_grid_route(payload: dict):
    rows = int(payload["rows"])
    cols = int(payload["cols"])
    obstacle_ratio = float(payload.get("obstacle_ratio", 0.2))
    seed = payload.get("seed")

    start, goal = default_start_goal(rows, cols)

    grid = generate_grid(
        rows=rows,
        cols=cols,
        obstacle_ratio=obstacle_ratio,
        seed=seed,
        protected_cells=[start, goal],
    )

    return {
        "rows": rows,
        "cols": cols,
        "obstacle_ratio": obstacle_ratio,
        "seed": seed,
        "grid": grid,
    }


@router.post("/navigate")
def navigate_route(payload: dict):
    grid = payload["grid"]
    start = tuple(payload["start"])
    goal = tuple(payload["goal"])

    try:
        validate_start_goal(grid, start, goal)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    result = astar(grid, start, goal)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    image_name = f"navigation_{timestamp}.png"
    image_path = Path(OUTPUT_DIR) / image_name

    if result.path:
        render_grid_image(
            grid=grid,
            path=result.path,
            start=start,
            goal=goal,
            output_path=image_path,
        )
        return {
            "success": True,
            "message": "Path found successfully.",
            "path": result.path,
            "explored_nodes": result.explored_nodes,
            "path_length": len(result.path),
            "image_file": image_name,
        }

    return {
        "success": False,
        "message": "No valid path found.",
        "path": [],
        "explored_nodes": result.explored_nodes,
        "path_length": 0,
        "image_file": None,
    }


@router.post("/demo-run")
def demo_run_route(payload: dict):
    rows = int(payload["rows"])
    cols = int(payload["cols"])
    obstacle_ratio = float(payload.get("obstacle_ratio", 0.2))
    seed = payload.get("seed")

    start, goal = default_start_goal(rows, cols)

    grid = generate_grid(
        rows=rows,
        cols=cols,
        obstacle_ratio=obstacle_ratio,
        seed=seed,
        protected_cells=[start, goal],
    )

    result = astar(grid, start, goal)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    image_name = f"demo_run_{timestamp}.png"
    image_path = Path(OUTPUT_DIR) / image_name

    if result.path:
        render_grid_image(
            grid=grid,
            path=result.path,
            start=start,
            goal=goal,
            output_path=image_path,
        )
        return {
            "success": True,
            "message": "Demo run completed successfully.",
            "path": result.path,
            "explored_nodes": result.explored_nodes,
            "path_length": len(result.path),
            "image_file": image_name,
        }

    return {
        "success": False,
        "message": "Demo run completed, but no path was found.",
        "path": [],
        "explored_nodes": result.explored_nodes,
        "path_length": 0,
        "image_file": None,
    }