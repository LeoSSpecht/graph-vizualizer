import {
  MoveLeft,
  MoveRight,
  RotateCcw,
  Save,
  StepForward,
  Upload,
} from "lucide-react";
import { styles } from "./Style";
import { GraphOptions, GraphSelector } from "./GraphSelector";
import { TraversalStatus } from "./TraversalStatus";
import { GraphTraversal } from "../services/GraphTraversal";
import { Vertex } from "../services/Graph";
import { AStar } from "../services/AStarTraversal";
import { Selector } from "./Selector";

type ControlsOptions = {
  onSave: () => void;
  onImportFile: () => void;
  onSelectGraph: (id: string) => void;
  restartTraversal: () => void;
  fullTraversal: () => void;
  defaultGraphs: Map<string, GraphOptions>;
  setTraversalInterval: (s: number) => void;
  traversalInterval: number;
  //
  hasTraversalStarted: boolean;
  isTraversalDone: boolean;
  graphTraversal: AStar;
  undoTraverse: () => void;
  traverse: () => void;
  originNode: Vertex | null;
  destinationNode: Vertex | null;
  isSelectingOrigin: boolean;
  isSelectingDestination: boolean;
  setIsSelectingOrigin: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;
  setIsSelectingDestination: (
    value: boolean | ((current: boolean) => boolean)
  ) => void;
  shouldShowIDs: boolean;
  setShouldShowIDs: (value: boolean) => void;
  shouldShowWeights: boolean;
  setShouldShowWeights: (value: boolean) => void;
};

export function Controls({
  onSave,
  onImportFile,
  onSelectGraph,
  restartTraversal,
  fullTraversal,
  defaultGraphs,
  setTraversalInterval,
  traversalInterval,
  //
  hasTraversalStarted,
  isTraversalDone,
  graphTraversal,
  undoTraverse,
  traverse,
  originNode,
  destinationNode,
  isSelectingOrigin,
  isSelectingDestination,
  setIsSelectingOrigin,
  setIsSelectingDestination,
  shouldShowIDs,
  setShouldShowIDs,
  shouldShowWeights,
  setShouldShowWeights,
}: ControlsOptions) {
  return (
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

        <div id="options" style={{ ...styles.BUTTON_CONTAINER, width: "100%" }}>
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
  );
}
