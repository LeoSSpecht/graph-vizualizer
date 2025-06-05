import { Edge, Graph, Vertex } from "./Graph";
import { GraphTraversal } from "./GraphTraversal";
import { MinHeap } from "./MinHeap";

type PriorityNode = { priority: number; vertexID: string };
type BacktrackNode = { previous: string; distance: number };

export class AStar implements GraphTraversal {
  graph: Graph;
  hasDestinationOption: boolean = true;
  originNode!: Vertex;
  destinationNode?: Vertex;
  currentNode!: Vertex;

  history: AStar[] = [];

  // Array of nodes in priority to be visited
  minHeap: MinHeap<PriorityNode> = new MinHeap<PriorityNode>(
    (a: PriorityNode, b: PriorityNode) => {
      return a.priority < b.priority;
    }
  );

  // Tracking of the best distance to vertices
  // Map of Vertex -> Best distance to node, previous node
  backmap: Map<string, BacktrackNode> = new Map<string, BacktrackNode>();

  // Set of visited nodes
  visited: Set<string> = new Set();

  // Best path once path is found
  path: string[] = [];
  pathEdges: string[] = [];
  // Total distance once path is found
  totalDistance: number = 0;

  constructor(graph: Graph) {
    this.graph = graph;
    this.SetDestination(graph.getVertex("4")!);
    this.SetOrigin(graph.getVertex("0")!);
  }

  ResetTraversal(): void {
    this.visited.clear();
    this.backmap.clear();
    this.path = [];
    this.pathEdges = [];
    this.totalDistance = 0;
    this.history = [];
    this.minHeap = new MinHeap<PriorityNode>(this.minHeap.comparator);
    this.currentNode = this.originNode;
    if (this.currentNode) {
      this.backmap.set(this.currentNode.id, {
        distance: 0,
        previous: "",
      });
      this.visited.add(this.currentNode.id);
    }
  }

  SetOrigin(v: Vertex): void {
    this.originNode = v;
    this.ResetTraversal();
  }

  SetDestination(v: Vertex): void {
    this.ResetTraversal();
    this.destinationNode = v;
  }

  GetLegend(): { color: string; title: string; type: "arrow" | "circle" }[] {
    return [
      { color: "gray", title: "Unvisited", type: "circle" },
      { color: "red", title: "Current Vertex", type: "circle" },
      { color: "blue", title: "Visited", type: "circle" },
      { color: "green", title: "Best Path", type: "circle" },
      { color: "yellow", title: "Destination", type: "circle" },
    ];
  }

  HasStarted(): boolean {
    return this.currentNode.id !== this.originNode.id;
  }

  IsDone(): boolean {
    const neighbors = this.graph.getNeighbors(this.currentNode.id) ?? [];
    return (
      this.currentNode.id === this.destinationNode?.id ||
      (this.minHeap.items.length === 0 && neighbors.length === 0)
    );
  }

  IsPathFound(): boolean {
    return this.IsDone() && this.path.length !== 0;
  }

  BacktrackPath(): void {
    if (this.currentNode.id !== this.destinationNode?.id) {
      throw new Error("Should only backtrack when path is found");
    }
    let backmapNode = this.backmap.get(this.destinationNode.id)!;
    this.totalDistance = backmapNode.distance;

    let curr_id = this.destinationNode!.id;
    do {
      this.path.push(curr_id);

      let previous = backmapNode.previous;
      this.pathEdges.push(this.graph._getEdgeID(previous, curr_id));
      curr_id = previous;
      backmapNode = this.backmap.get(curr_id)!;
    } while (curr_id !== this.originNode.id);

    this.path.push(curr_id);
  }

  Traverse(): void {
    this.history.push(this.DeepCopy());
    if (!this.destinationNode) {
      throw new Error("Need destination node in order to traverse");
    }

    let edges = this.graph.getNeighbors(this.currentNode.id);

    if (!edges && this.minHeap.items.length !== 0) {
      let pop = this.minHeap.heappop()!;
      this.currentNode = this.graph.getVertex(pop.vertexID)!;
      return;
    }

    let currDistance = this.backmap.get(this.currentNode.id)?.distance ?? 0;

    for (let edge of edges!) {
      // Add each neighbor to the priority list
      let neighbor = edge.destination;
      let currDistanceToNeighbor = currDistance + edge.weight;
      let existingDistanceToNeighbor =
        this.backmap.get(neighbor.id)?.distance ?? Infinity;

      // Revisit priority to check for A*
      if (currDistanceToNeighbor < existingDistanceToNeighbor) {
        this.backmap.set(neighbor.id, {
          distance: currDistanceToNeighbor,
          previous: this.currentNode.id,
        });

        let dX = Math.abs(this.destinationNode.x - neighbor.x);
        let dY = Math.abs(this.destinationNode.y - neighbor.y);

        let destinationEstimatedDistance = Math.sqrt(dX * dX + dY * dY);
        this.minHeap.heappush({
          priority: currDistanceToNeighbor + destinationEstimatedDistance,
          vertexID: neighbor.id,
        });
      }
    }

    this.currentNode = this.graph.getVertex(this.minHeap.heappop()!.vertexID)!;
    this.visited.add(this.currentNode.id);

    if (this.currentNode.id === this.destinationNode.id) {
      this.BacktrackPath();
    }
  }

  Undo(): void {
    if (this.history.length > 0) {
      Object.assign(this, this.history.pop());
      return;
    }
    throw new Error("Can't undo with no history");
  }

  DeepCopy(): AStar {
    let clone = new AStar(this.graph);
    clone.originNode = this.originNode;
    clone.destinationNode = this.destinationNode;
    clone.currentNode = this.currentNode;
    // Deep copy of history (might not be necessary)
    clone.history = this.history.slice();
    clone.minHeap = this.minHeap.deepcopy();
    clone.backmap = structuredClone(this.backmap);
    clone.visited = structuredClone(this.visited);
    clone.path = this.path.slice();
    clone.pathEdges = this.pathEdges.slice();
    clone.totalDistance = this.totalDistance;

    return clone;
  }

  GetVertexColor(v: Vertex): string {
    if (this.path.includes(v.id)) {
      return "green";
    }
    if (this.currentNode.id === v.id) {
      return "red";
    }
    if (this.destinationNode && this.destinationNode.id === v.id) {
      return "yellow";
    }
    if (this.visited.has(v.id)) {
      return "blue";
    }

    return "gray";
  }

  GetEdgeColor(e: Edge): string {
    if (this.pathEdges.includes(e.id)) {
      return "green";
    }
    return "rgb(64, 101, 145)";
  }
}
