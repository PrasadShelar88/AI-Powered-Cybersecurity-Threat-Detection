import { useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const sampleGrid = [
  [0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 1],
  [0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0],
  [1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0]
];

function StatCard({ label, value, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtext ? <div className="stat-subtext">{subtext}</div> : null}
    </div>
  );
}

function GridCell({ value, isStart, isGoal, isPath }) {
  let className = "cell";
  if (value === 1) className += " obstacle";
  if (isPath) className += " path";
  if (isStart) className += " start";
  if (isGoal) className += " goal";

  return <div className={className} />;
}

function GridPreview({ grid, start, goal, path }) {
  const pathSet = useMemo(() => {
    const set = new Set();
    for (const [r, c] of path || []) set.add(`${r}-${c}`);
    return set;
  }, [path]);

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 1}, minmax(0, 1fr))` }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => (
          <GridCell
            key={`${r}-${c}`}
            value={cell}
            isStart={start?.[0] === r && start?.[1] === c}
            isGoal={goal?.[0] === r && goal?.[1] === c}
            isPath={pathSet.has(`${r}-${c}`)}
          />
        ))
      )}
    </div>
  );
}

export default function App() {
  const [rows, setRows] = useState(15);
  const [cols, setCols] = useState(15);
  const [obstacleRatio, setObstacleRatio] = useState(0.2);
  const [seed, setSeed] = useState(42);

  const [grid, setGrid] = useState(sampleGrid);
  const [start, setStart] = useState([0, 0]);
  const [goal, setGoal] = useState([6, 6]);

  const [path, setPath] = useState([]);
  const [pathLength, setPathLength] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Generate a grid or run a demo simulation.");
  const [imageUrl, setImageUrl] = useState("");
  const [exploredNodes, setExploredNodes] = useState(0);

  async function handleGenerateGrid() {
    setLoading(true);
    setStatus("Generating");
    setMessage("Creating a virtual navigation map...");

    try {
      const res = await fetch(`${API_BASE}/generate-grid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: Number(rows),
          cols: Number(cols),
          obstacle_ratio: Number(obstacleRatio),
          seed: seed === "" ? null : Number(seed)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to generate grid.");
      }

      const nextStart = [0, 0];
      const nextGoal = [data.rows - 1, data.cols - 1];

      setGrid(data.grid);
      setStart(nextStart);
      setGoal(nextGoal);
      setPath([]);
      setPathLength(0);
      setExploredNodes(0);
      setImageUrl("");
      setStatus("Grid Ready");
      setMessage("Grid generated successfully. You can now run navigation.");
    } catch (error) {
      setStatus("Error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNavigate() {
    setLoading(true);
    setStatus("Navigating");
    setMessage("Running A* path planning on the generated grid...");

    try {
      const res = await fetch(`${API_BASE}/navigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid,
          start,
          goal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Navigation failed.");
      }

      setPath(data.path || []);
      setPathLength(data.path_length || 0);
      setExploredNodes(data.explored_nodes || 0);
      setImageUrl(data.image_file ? `${API_BASE}/outputs/${data.image_file}` : "");
      setStatus(data.success ? "Success" : "No Path");
      setMessage(data.message || "Navigation completed.");
    } catch (error) {
      setStatus("Error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoRun() {
    setLoading(true);
    setStatus("Demo Running");
    setMessage("Generating grid and finding route in one click...");

    try {
      const res = await fetch(`${API_BASE}/demo-run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: Number(rows),
          cols: Number(cols),
          obstacle_ratio: Number(obstacleRatio),
          seed: seed === "" ? null : Number(seed)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Demo run failed.");
      }

      // Refresh grid too, so UI looks consistent
      await handleGenerateGrid();

      setPath(data.path || []);
      setPathLength(data.path_length || 0);
      setExploredNodes(data.explored_nodes || 0);
      setImageUrl(data.image_file ? `${API_BASE}/outputs/${data.image_file}` : "");
      setStatus(data.success ? "Demo Success" : "Demo Finished");
      setMessage(data.message || "Demo completed.");
    } catch (error) {
      setStatus("Error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">AI</div>
          <div>
            <h1>Autonomous Navigation</h1>
            <p>Virtual simulation dashboard</p>
          </div>
        </div>

        <div className="panel">
          <h2>Simulation Controls</h2>

          <label>
            Rows
            <input type="number" min="5" max="100" value={rows} onChange={(e) => setRows(e.target.value)} />
          </label>

          <label>
            Columns
            <input type="number" min="5" max="100" value={cols} onChange={(e) => setCols(e.target.value)} />
          </label>

          <label>
            Obstacle Ratio
            <input
              type="number"
              step="0.05"
              min="0"
              max="0.6"
              value={obstacleRatio}
              onChange={(e) => setObstacleRatio(e.target.value)}
            />
          </label>

          <label>
            Seed
            <input type="number" value={seed} onChange={(e) => setSeed(e.target.value)} />
          </label>

          <div className="button-group">
            <button onClick={handleGenerateGrid} disabled={loading}>Generate Grid</button>
            <button onClick={handleNavigate} disabled={loading}>Run Navigation</button>
            <button className="secondary" onClick={handleDemoRun} disabled={loading}>One-Click Demo</button>
          </div>
        </div>

        <div className="panel">
          <h2>How it works</h2>
          <ul className="info-list">
            <li>Generate a 2D obstacle map.</li>
            <li>Use start and goal points automatically.</li>
            <li>Run A* path planning through the backend API.</li>
            <li>Preview the route in the dashboard and exported image.</li>
          </ul>
        </div>
      </aside>

      <main className="main">
        <section className="hero">
          <div>
            <div className="badge">Student Portfolio Project</div>
            <h2>AI-Based Autonomous Navigation System</h2>
            <p>
              A clean virtual simulation frontend for showcasing grid generation,
              obstacle avoidance, shortest path planning, and backend integration.
            </p>
          </div>
          <div className="hero-status">
            <span className={`status-dot ${status.toLowerCase().replace(/\s+/g, "-")}`}></span>
            <span>{status}</span>
          </div>
        </section>

        <section className="stats">
          <StatCard label="Grid Size" value={`${grid.length} × ${grid[0]?.length || 0}`} />
          <StatCard label="Path Length" value={pathLength} />
          <StatCard label="Explored Nodes" value={exploredNodes} />
          <StatCard label="Backend URL" value="8000" subtext="FastAPI running locally" />
        </section>

        <section className="content-grid">
          <div className="panel large">
            <div className="panel-header">
              <h2>Grid Preview</h2>
              <span className="panel-note">Green = start, Red = goal, Blue = path, Dark = obstacle</span>
            </div>
            <GridPreview grid={grid} start={start} goal={goal} path={path} />
          </div>

          <div className="panel large">
            <div className="panel-header">
              <h2>Simulation Output</h2>
              <span className="panel-note">Rendered by backend</span>
            </div>
            <div className="result-box">
              {imageUrl ? (
                <img src={imageUrl} alt="Simulation result" className="result-image" />
              ) : (
                <div className="empty-state">
                  No output image yet. Run navigation or one-click demo.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <h2>System Message</h2>
            <div className="message-box">{message}</div>
          </div>

          <div className="panel">
            <h2>Backend Endpoints</h2>
            <div className="endpoint">GET /</div>
            <div className="endpoint">GET /health</div>
            <div className="endpoint">POST /generate-grid</div>
            <div className="endpoint">POST /navigate</div>
            <div className="endpoint">POST /demo-run</div>
          </div>
        </section>
      </main>
    </div>
  );
}
