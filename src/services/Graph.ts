import { CIRCLE_RADIUS } from "./GraphDraw";

export class Vertex {
  /// ID of the vertex
  id: string;
  /// X position of vertex
  x: number;
  /// Y position of vertex
  y: number;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }
}

export class Edge {
  /// ID of the edge
  id: string;
  /// Origin Vertex
  origin: Vertex;
  /// Destination Vertex
  destination: Vertex;
  /// Weight of edge
  weight: number;

  constructor(id: string, origin: Vertex, destination: Vertex, weight: number) {
    this.id = id;
    this.origin = origin;
    this.destination = destination;
    this.weight = weight;
  }
}

type VertexSerialization = {
  id: string;
  x: number;
  y: number;
};

type EdgeSerialization = {
  origin: string;
  destination: string;
  weight: number;
};

type EdgesSerialization = {
  origin: string;
  neighbors: EdgeSerialization[];
};

type GraphSerialization = {
  vertices: VertexSerialization[];
  edges: EdgesSerialization[];
};

export class Graph {
  /// Map of vertex id to Vertex object
  vertices: Map<string, Vertex> = new Map<string, Vertex>();
  /// Map of vertex id to list of outgoing edges
  edges: Map<string, Edge[]> = new Map<string, Edge[]>();

  getFirstVertex(): Vertex {
    let k = Array.from(this.vertices.keys());
    return this.vertices.get(k.at(0)!)!;
  }

  _getVertexID(): string {
    return this.vertices.size.toString();
  }

  addVertex(x: number, y: number): void {
    const vertexID = this._getVertexID();
    this.vertices.set(vertexID, new Vertex(vertexID, x, y));
  }

  addVertexWithId(id: string, x: number, y: number): void {
    this.vertices.set(id, new Vertex(id, x, y));
  }

  _getEdgeID(vertexID1: string, vertexID2: string): string {
    return vertexID1 + "_" + vertexID2;
  }

  addEdge(vertexID1: string, vertexID2: string, weight: number = 0): void {
    // Check if both vertices exist
    if (!this.vertices.has(vertexID1) || !this.vertices.has(vertexID2)) {
      throw new Error("Both vertices need to exist when adding edges");
    }

    if (!this.edges.has(vertexID1)) {
      this.edges.set(vertexID1, []);
    }
    const edgeID = this._getEdgeID(vertexID1, vertexID2);
    let edges = this.edges.get(vertexID1)!;
    edges.push(
      new Edge(
        edgeID,
        this.vertices.get(vertexID1)!,
        this.vertices.get(vertexID2)!,
        weight
      )
    );
  }

  getNeighbors(vertexID: string) {
    return this.edges.get(vertexID);
  }

  getVertex(vertexID: string) {
    return this.vertices.get(vertexID);
  }

  getVertexAtPosition(x: number, y: number): Vertex | undefined {
    return Array.from(this.vertices.values()).find((v: Vertex) => {
      const dX = Math.abs(x - v.x);
      const dY = Math.abs(y - v.y);
      const D = Math.sqrt(dX * dX + dY * dY);
      return D < CIRCLE_RADIUS;
    });
  }

  exportGraph(): GraphSerialization {
    let edges: EdgesSerialization[] = [];
    this.edges.forEach((neighbors, key) => {
      edges.push({
        origin: key,
        neighbors: neighbors.flatMap((edge) => {
          return {
            origin: edge.origin.id,
            destination: edge.destination.id,
            weight: edge.weight,
          };
        }),
      });
    });

    let vertices: VertexSerialization[] = [];
    this.vertices.forEach((vertex, key) => {
      vertices.push({
        id: vertex.id,
        x: vertex.x,
        y: vertex.y,
      });
    });

    return {
      edges: edges,
      vertices: vertices,
    };
  }

  static importGraph(g: GraphSerialization) {
    let graph = new Graph();

    g.vertices.forEach((v) => {
      graph.addVertexWithId(v.id, v.x, v.y);
    });

    g.edges.forEach((n) => {
      n.neighbors.forEach((e) => {
        graph.addEdge(e.origin, e.destination, e.weight);
      });
    });

    return graph;
  }
}
