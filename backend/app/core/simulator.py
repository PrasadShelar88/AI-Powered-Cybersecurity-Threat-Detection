from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np


def render_grid_image(grid, path, start, goal, output_path: Path):
    arr = np.array(grid, dtype=int)

    fig, ax = plt.subplots(figsize=(8, 8))
    ax.imshow(arr, cmap="Greys", origin="upper")

    rows, cols = arr.shape
    ax.set_xticks(np.arange(-0.5, cols, 1), minor=True)
    ax.set_yticks(np.arange(-0.5, rows, 1), minor=True)
    ax.grid(which="minor", color="lightgray", linestyle="-", linewidth=0.5)

    if path:
        x_coords = [c for _, c in path]
        y_coords = [r for r, _ in path]
        ax.plot(x_coords, y_coords, marker="o", linewidth=2)

    ax.scatter(start[1], start[0], marker="s", s=120, label="Start")
    ax.scatter(goal[1], goal[0], marker="*", s=180, label="Goal")

    ax.set_title("Autonomous Navigation Simulation")
    ax.set_xlabel("Columns")
    ax.set_ylabel("Rows")
    ax.legend()
    plt.tight_layout()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path)
    plt.close(fig)

    return output_path.name