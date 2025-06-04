import { Edge, Vertex } from "./Graph";

export interface GraphTraversal {
  // Should show option to select destination vertex
  hasDestinationOption: boolean;

  // Get the legend colors
  GetLegend(): { color: string; title: string; type: "arrow" | "circle" }[];

  // Has the traversal started
  HasStarted(): boolean;
  // Is the traversal done
  IsDone(): boolean;

  // Traverse the graph
  Traverse(): void;

  // Undo traverse
  Undo(): void;

  // Gets the color for a vertex
  GetVertexColor(v: Vertex): string;

  // Gets the color for an edge
  GetEdgeColor(e: Edge): string;

  // Set the origin for the traversal
  SetOrigin(v: Vertex): void;

  // Set the destination for the traversal
  SetDestination?(v: Vertex): void;

  // Funcition to be called before traversal
  BeforeTraversal?(): void;

  // Function to be called after traversal
  AfterTraversal?(): void;
}
