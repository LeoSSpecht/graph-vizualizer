import { Graph } from "./Graph";

export function DefaultGraph() {
  const g = new Graph();
  g.addVertex(10, 10);
  g.addVertex(30, 30);
  g.addVertex(30, 45);

  g.addVertex(52, 30);

  g.addVertex(45, 45);

  g.addEdge("0", "1", 10);
  g.addEdge("1", "2", 5);
  g.addEdge("1", "3", 10);
  g.addEdge("2", "4", 1);
  g.addEdge("3", "4", 10);
  return g;
}

export function GridGraph() {
  const g = new Graph();
  g.addVertex(10, 10);
  g.addVertex(20, 10);
  g.addVertex(30, 10);

  g.addEdge("0", "1", 10);
  g.addEdge("1", "2", 5);

  return g;
}
