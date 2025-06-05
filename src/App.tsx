import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { GraphCanvas } from "./components/GraphCanvas";
import { GraphDraw } from "./services/GraphDraw";
import { Graph } from "./services/Graph";
import { AStar } from "./services/AStarTraversal";
import { Selector } from "./components/Selector";
import { styles } from "./components/Style";
import {
  Import,
  MoveLeft,
  MoveRight,
  RotateCcw,
  Save,
  StepForward,
  Upload,
} from "lucide-react";
import { TraversalStatus } from "./components/TraversalStatus";
import { DefaultGraph, GridGraph } from "./services/GraphFactories";
import { GraphOptions, GraphSelector } from "./components/GraphSelector";

const saveFile = async (obj: any, filename: string = "graph.json") => {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.addEventListener("click", (e) => {
    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
  });
  a.click();
  a.remove();
};

const defaultGraphs = new Map<string, GraphOptions>([
  [
    "default",
    {
      graph: DefaultGraph,
      name: "Default graph",
      origin: "0",
      destination: "4",
    },
  ],
  [
    "grid",
    {
      graph: GridGraph,
      name: "Small grid",
      origin: "0",
      destination: "2",
    },
  ],
]);

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graph = useMemo(() => DefaultGraph(), []);
  const graphTraversal = useMemo(() => new AStar(graph), [graph]);

  const [isSelectingOrigin, setIsSelectingOrigin] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [shouldShowIDs, setShouldShowIDs] = useState(true);
  const [shouldShowWeights, setShouldShowWeights] = useState(true);

  const [originNode, setOriginNodeState] = useState(graphTraversal.originNode);
  const [destinationNode, setDestinationNodeState] = useState(
    graphTraversal.destinationNode
  );

  const [isTraversalDone, setIsTraversalDone] = useState(
    graphTraversal.IsDone()
  );
  const [hasTraversalStarted, setHasTraversalStarted] = useState(
    graphTraversal.HasStarted()
  );
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const [traversalInterval, setTraversalInterval] = useState(500);
  const [fullTraversalID, setFullTraversalID] = useState<NodeJS.Timer | null>(
    null
  );

  const inputFile = useRef<HTMLInputElement | null>(null);

  const setNode = (x: number, y: number) => {
    const selectedVertex = graph.getVertexAtPosition(x, y);
    if (!selectedVertex) {
      return;
    }

    if (isSelectingOrigin) {
      graphTraversal.SetOrigin(selectedVertex);
      setOriginNodeState(selectedVertex);
      setIsSelectingOrigin(false);
    } else if (isSelectingDestination) {
      graphTraversal.SetDestination(selectedVertex);
      setDestinationNodeState(selectedVertex);
      setIsSelectingDestination(false);
    }

    restartTraversal();
  };

  const Draw = () => {
    GraphDraw(
      canvasRef,
      graph,
      graphTraversal,
      shouldShowIDs,
      shouldShowWeights
    );
  };

  // eslint-disable-next-line
  const undoTraverse = () => {
    if (!graphTraversal.HasStarted()) {
      console.log("Should not be calling undo");
      return;
    }
    graphTraversal.Undo();
    setIsTraversalDone(graphTraversal.IsDone());
    Draw();
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  // eslint-disable-next-line
  const traverse = () => {
    if (graphTraversal.IsDone()) {
      console.log("Should not be calling traverse");
      return;
    }
    graphTraversal.Traverse();
    Draw();
    setIsTraversalDone(graphTraversal.IsDone());
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  const onSelectGraph = (id: string) => {
    const newGraphOption = defaultGraphs.get(id)!;

    Object.assign(graph, newGraphOption.graph());

    // Might need to make some update to graph traversal
    const originVertex = graph.getVertex(newGraphOption.origin);
    graphTraversal.SetOrigin(originVertex!);
    setOriginNodeState(originVertex!);

    const destinationVertex = graph.getVertex(newGraphOption.destination)!;

    graphTraversal.SetDestination(destinationVertex);
    setDestinationNodeState(destinationVertex);

    Draw();

    setIsTraversalDone(graphTraversal.IsDone());
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  const onSave = () => {
    const obj = {
      traversal: {
        origin: graphTraversal.originNode.id,
        destination: graphTraversal.destinationNode?.id,
      },
      graph: graph.exportGraph(),
    };

    saveFile(obj);
  };

  const onImportFile = () => {
    inputFile.current?.click();
  };

  const restartTraversal = () => {
    graphTraversal.ResetTraversal();
    setIsTraversalDone(graphTraversal.IsDone());
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  const fullTraversal = () => {
    const id = setInterval(() => {
      traverse();
      if (graphTraversal.IsDone()) {
        clearInterval(id!);
      }
    }, traversalInterval);
    setFullTraversalID(id);
  };

  const handleImport = (graphName: string, jsonData: any) => {
    // Import the graph data
    if (jsonData.graph) {
      Object.assign(graph, Graph.importGraph(jsonData.graph));
    } else {
      throw new Error("Invalid graph file");
    }

    // Set traversal points if they exist
    if (jsonData.traversal) {
      const vertex = graph.getVertex(jsonData.traversal.origin);
      if (vertex) {
        graphTraversal.SetOrigin(vertex);
        setOriginNodeState(vertex);
      }

      if (jsonData.traversal.destination) {
        const destVertex = graph.getVertex(jsonData.traversal.destination);
        if (destVertex) {
          graphTraversal.SetDestination(destVertex);
          setDestinationNodeState(destVertex);
        }
      }
    }

    const gCopy = structuredClone(graph);
    defaultGraphs.set(graphName, {
      graph: () => {
        return structuredClone(gCopy);
      },
      name: graphName,
      origin: jsonData.traversal.origin,
      destination: jsonData.traversal.destination,
    });

    // Update states
    Draw();

    setIsTraversalDone(graphTraversal.IsDone());
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith(".json")) return;

    const graphName = file.name.slice(0, file.name.length - 5);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      handleImport(graphName, jsonData);
    } catch (error) {
      console.error("Error importing graph:", error);
    }

    setIsDraggingFile(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".json")) return;

    const graphName = file.name.slice(0, file.name.length - 5);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      handleImport(graphName, jsonData);

      // Reset file input
      event.target.value = "";
    } catch (error) {
      console.error("Error importing graph:", error);
    }
  };

  useEffect(() => {
    Draw();
  });

  useEffect(() => {
    const keyEventHandlers: { [key: string]: () => void } = {
      ArrowRight: traverse,
      ArrowLeft: undoTraverse,
    };

    const f = (key: KeyboardEvent) => {
      if (keyEventHandlers[key.key]) {
        keyEventHandlers[key.key]();
      }
    };
    document.addEventListener("keydown", f);

    return () => {
      document.removeEventListener("keydown", f);
    };
  }, [traverse, undoTraverse]);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        style={{
          position: "absolute",
          backgroundColor: " #9ca8ba",
          border: "4px dashed #626a77",
          inset: 0,
          boxSizing: "border-box",
          borderRadius: 5,
          opacity: isDraggingFile ? 0.5 : 0,
          transition: "0.2s ease-in",
          alignContent: "center",
          display: !isDraggingFile ? "none" : "block",
        }}
      >
        <Import size={32} color="rgb(47, 51, 58)" />
      </div>
      <input
        type="file"
        id="file"
        ref={inputFile}
        style={{ display: "none" }}
        accept=".json"
        onChange={handleFileUpload}
      />
      <GraphCanvas
        ref={canvasRef}
        virtualX={1000}
        virtualY={1000}
        onClickHandler={setNode}
      />
      <div id="options" style={{ display: "flex", padding: 10, gap: 10 }}>
        <div
          id="controls2"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
          }}
        >
          <button style={styles.BUTTON_CONTAINER} onClick={onSave}>
            <Save />
            Save Graph
          </button>
          <button style={styles.BUTTON_CONTAINER} onClick={onImportFile}>
            <Upload />
            Import Graph
          </button>
          <GraphSelector onChange={onSelectGraph} options={defaultGraphs} />
          <button style={styles.BUTTON_CONTAINER} onClick={restartTraversal}>
            <RotateCcw />
            Restart Traversal
          </button>
          <button style={styles.BUTTON_CONTAINER} onClick={fullTraversal}>
            Full Traversal
            <StepForward />
          </button>
          <div
            style={{
              ...styles.BUTTON_CONTAINER,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span>Interval (ms)</span>
            <input
              type="number"
              style={{ maxWidth: 60, textAlign: "center" }}
              value={traversalInterval}
              onChange={(e) => setTraversalInterval(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div
          id="controls"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
          }}
        >
          {
            <TraversalStatus
              HasStarted={hasTraversalStarted}
              IsDone={isTraversalDone}
              PathFound={graphTraversal.IsPathFound()}
              PathSize={graphTraversal.totalDistance}
            />
          }
          <div id="traversal-controls" style={{ display: "flex", gap: 10 }}>
            <button
              style={styles.BUTTON_CONTAINER}
              disabled={!hasTraversalStarted}
              onClick={undoTraverse}
            >
              <MoveLeft />
              Undo
            </button>
            <button
              style={styles.BUTTON_CONTAINER}
              disabled={isTraversalDone}
              onClick={traverse}
            >
              Traverse
              <MoveRight />
            </button>
          </div>

          <div id="node-selector" style={{ display: "flex", gap: 10 }}>
            <Selector
              title="Origin Node"
              selectedValue={originNode?.id}
              isSelecting={isSelectingOrigin}
              onSelect={() => {
                setIsSelectingOrigin((current) => !current);
                setIsSelectingDestination(false);
              }}
            ></Selector>
            <Selector
              title="Destination Node"
              selectedValue={destinationNode?.id}
              isSelecting={isSelectingDestination}
              onSelect={() => {
                setIsSelectingDestination((current) => !current);
                setIsSelectingOrigin(false);
              }}
            ></Selector>
          </div>

          <div
            id="options"
            style={{ ...styles.BUTTON_CONTAINER, width: "100%" }}
          >
            <div
              style={{
                display: "flex",
              }}
            >
              <input
                type="checkbox"
                checked={shouldShowIDs}
                onChange={() => setShouldShowIDs(!shouldShowIDs)}
              />
              <span>IDs</span>
            </div>
            <div
              style={{
                display: "flex",
              }}
            >
              <input
                type="checkbox"
                checked={shouldShowWeights}
                onChange={() => setShouldShowWeights(!shouldShowWeights)}
              />
              <span>Weights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
