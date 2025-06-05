import { RefObject, useEffect } from "react";
import { PIXEL_TO_DISTANCE_SCALE } from "../services/GraphDraw";

type GraphCanvasProps = {
  ref?: RefObject<HTMLCanvasElement | null>;
  virtualX?: number;
  virtualY?: number;
  // Handles clicks given the virtual coordinates
  onClickHandler?: (x: number, y: number) => void;
};

export function GraphCanvas({
  ref,
  virtualX,
  virtualY,
  onClickHandler,
}: GraphCanvasProps) {
  // Set the virtual height of the canvas
  useEffect(() => {
    const canvas = ref?.current;
    if (canvas) {
      const { width: actualWidth, height: actualHeight } =
        canvas.getBoundingClientRect();

      canvas.width = virtualX ? virtualX : actualWidth;
      canvas.height = virtualY ? virtualY : actualHeight;
      const context = canvas.getContext("2d")!;
      context.scale(PIXEL_TO_DISTANCE_SCALE, PIXEL_TO_DISTANCE_SCALE);

      // context?.scale(2, 2);
      const clickEventListener = (event: MouseEvent) => {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width / PIXEL_TO_DISTANCE_SCALE;
        var scaleY = canvas.height / rect.height / PIXEL_TO_DISTANCE_SCALE;

        var x = (event.clientX - rect.left) * scaleX;
        var y = (event.clientY - rect.top) * scaleY;

        if (onClickHandler) {
          onClickHandler(x, y);
        }
      };

      canvas.addEventListener("click", clickEventListener);
      return () => {
        canvas.removeEventListener("click", clickEventListener);
      };
    }
  }, [ref, virtualX, virtualY, onClickHandler]);

  return <canvas ref={ref} style={{ height: 550, width: 550 }}></canvas>;
}
