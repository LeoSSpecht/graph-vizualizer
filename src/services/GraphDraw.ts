import { RefObject } from "react";
import { Edge, Graph, Vertex } from "./Graph";
import { GraphTraversal } from "./GraphTraversal";

export const CIRCLE_RADIUS = 2.5;
const LEGEND_CIRCLE_RADIUS = 2;
const LINE_WIDTH = 0.5;
const ARROW_SIZE = 2;
const ARROW_ANGLE = 0.5; // Angle on the tip of the edge in radians

const LEGEND_PADDING = 3;
const LINE_PADDING = 4.5;
const LEGEND_FONT = "3px system-ui";
const CENTERED_TEXT_DEFAULT_FONT = "bold 3px system-ui";
const CANVAS_BACKGROUND = "black";

// Each 10 pixels represents a distance of 1
export const PIXEL_TO_DISTANCE_SCALE = 10;

function DrawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  // Center X coordinate of text
  centeredX: number,
  // Center Y coordinate of text
  centeredY: number,
  font: string = CENTERED_TEXT_DEFAULT_FONT,
  color: string = "black"
) {
  ctx.font = font;
  ctx.fillStyle = color;

  const textMeasurement = ctx.measureText(text);
  let textHeight = textMeasurement.actualBoundingBoxAscent;
  let textWidth = textMeasurement.width;

  let physicalX = centeredX - textWidth / 2;
  let physicalY = centeredY + textHeight / 2;
  // Padding on the left to account for everything drawn before
  ctx.fillText(text, physicalX, physicalY);
}

function DrawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function DrawLine(
  ctx: CanvasRenderingContext2D,
  origin: Vertex,
  destination: Vertex,
  color: string
) {
  // Draw initial line
  ctx.strokeStyle = color;
  ctx.lineWidth = LINE_WIDTH;
  ctx.beginPath();

  const x1 = origin.x;
  const y1 = origin.y;

  const x2 = destination.x;
  const y2 = destination.y;

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function DrawArrowHead(
  ctx: CanvasRenderingContext2D,
  origin: Vertex,
  destination: Vertex,
  color: string
) {
  ctx.fillStyle = color;

  const x1 = origin.x;
  const y1 = origin.y;
  const x2 = destination.x;
  const y2 = destination.y;

  // Calculate the lenght of the arrow
  var dX = x2 - x1;
  var dY = y2 - y1;
  var lineSize = Math.sqrt(dX * dX + dY * dY);
  // Calculate how far from the end of the line the arrow should be drawn
  var arrowDelta = (lineSize - CIRCLE_RADIUS) / lineSize;
  var startX = x1 + dX * arrowDelta;
  var startY = y1 + dY * arrowDelta;

  // Angle of rotation based on the angle of the line
  var angle = Math.atan2(dY, dX);

  // Calculate arrow points
  ctx.beginPath();
  ctx.moveTo(startX, startY); // Tip of the arrow
  ctx.lineTo(
    startX - ARROW_SIZE * Math.cos(angle - ARROW_ANGLE),
    startY - ARROW_SIZE * Math.sin(angle - ARROW_ANGLE)
  );
  ctx.lineTo(
    startX - ARROW_SIZE * Math.cos(angle + ARROW_ANGLE),
    startY - ARROW_SIZE * Math.sin(angle + ARROW_ANGLE)
  );
  ctx.closePath();
  ctx.fill();
}

function DrawEdge(
  ctx: CanvasRenderingContext2D,
  e: Edge,
  graphTraversal: GraphTraversal,
  shouldShowWeights: boolean
) {
  let edgeColor = graphTraversal.GetEdgeColor(e);
  DrawLine(ctx, e.origin, e.destination, edgeColor);
  DrawArrowHead(ctx, e.origin, e.destination, edgeColor);

  let dX = e.destination.x - e.origin.x;
  let dY = e.destination.y - e.origin.y;

  let midpointX = e.origin.x + dX / 2;
  let midpointY = e.origin.y + dY / 2;

  if (shouldShowWeights) {
    DrawCenteredText(
      ctx,
      e.weight.toString(),
      midpointX,
      midpointY,
      undefined,
      "rgb(33, 238, 112)"
    );
  }
}

function DrawVertex(
  ctx: CanvasRenderingContext2D,
  v: Vertex,
  graphTraversal: GraphTraversal,
  shouldShowIDs: boolean
) {
  ctx.fillStyle = graphTraversal.GetVertexColor(v);
  DrawCircle(ctx, v.x, v.y, CIRCLE_RADIUS);
  if (shouldShowIDs) {
    DrawCenteredText(ctx, v.id, v.x, v.y);
  }
}

function DrawLegend(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  graphTraversal: GraphTraversal
) {
  let h = canvas.height / PIXEL_TO_DISTANCE_SCALE;

  ctx.font = LEGEND_FONT;

  var currentY = h - LEGEND_PADDING;
  for (const item of graphTraversal.GetLegend()) {
    ctx.fillStyle = item.color;

    const textMeasurement = ctx.measureText(item.title);
    let textHeight = textMeasurement.actualBoundingBoxAscent;

    DrawCircle(
      ctx,
      // Padding to the left plus distance from center
      LEGEND_PADDING + LEGEND_CIRCLE_RADIUS / 2,
      // Circle aligned with text
      currentY - textHeight / 2,
      LEGEND_CIRCLE_RADIUS
    );
    ctx.fillStyle = "white";

    // Padding on the left to account for everything drawn before
    ctx.fillText(
      item.title,
      LEGEND_PADDING * 2 + LEGEND_CIRCLE_RADIUS,
      currentY
    );
    currentY -= LINE_PADDING;
  }
}

export function GraphDraw(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  graph: Graph,
  graphTraversal: GraphTraversal,
  shouldShowIDs: boolean,
  shouldShowWeights: boolean
) {
  if (!canvasRef.current) {
    return;
  }

  const canvas = canvasRef.current;
  var ctx = canvas.getContext("2d")!;

  // Reset canvas
  ctx.fillStyle = CANVAS_BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw legend
  DrawLegend(canvas, ctx, graphTraversal);

  // Draw out each edge
  graph.edges.forEach((edges) => {
    edges.forEach((e) => {
      DrawEdge(ctx, e, graphTraversal, shouldShowWeights);
    });
  });

  // Draw out each vertex
  graph.vertices.forEach((v) => {
    DrawVertex(ctx, v, graphTraversal, shouldShowIDs);
  });
}
