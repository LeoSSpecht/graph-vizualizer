import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { GraphCanvas } from "./components/GraphCanvas";
import { GraphDraw } from "./services/GraphDraw";
import { Graph } from "./services/Graph";
import { AStar } from "./services/AStarTraversal";
import { Selector } from "./components/Selector";
import { styles } from "./components/Style";
import { MoveLeft, MoveRight } from "lucide-react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graph = useMemo(() => new Graph(), []);
  const graphTraversal = useMemo(() => new AStar(graph), [graph]);

  const [isSelectingOrigin, setIsSelectingOrigin] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);

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

    setIsTraversalDone(graphTraversal.IsDone());
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  const undoTraverse = () => {
    graphTraversal.Undo();
    GraphDraw(canvasRef, graph, graphTraversal);
    setIsTraversalDone(graphTraversal.IsDone());
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  const traverse = () => {
    graphTraversal.Traverse();
    GraphDraw(canvasRef, graph, graphTraversal);
    setIsTraversalDone(graphTraversal.IsDone());
    setHasTraversalStarted(graphTraversal.HasStarted());
  };

  useEffect(() => {
    GraphDraw(canvasRef, graph, graphTraversal);
  });

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <GraphCanvas
        ref={canvasRef}
        virtualX={1000}
        virtualY={1000}
        onClickHandler={setNode}
      />
      <div
        id="controls"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 10,
          alignItems: "center",
        }}
      >
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

        <div style={{ display: "flex", gap: 10 }}>
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
      </div>
    </div>
  );
}

export default App;
