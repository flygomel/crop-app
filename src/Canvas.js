import { useEffect, useRef } from "react";
import { fabric } from "fabric";

function App({ onReady }) {
  const parentRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const el = canvasRef.current;
    const parentEl = parentRef.current;
    const { clientWidth: width, clientHeight: height } = parentRef.current;

    const canvas = new fabric.Canvas(el);
    canvas.controlsAboveOverlay = true;

    const setCurrentDimensions = () => {
      canvas.setWidth(parentEl.clientWidth);
      canvas.setHeight(parentEl.clientHeight);
      canvas.diameter =
        (canvas.height > canvas.width ? canvas.width : canvas.height) / 2;
      canvas.radius = canvas.diameter / 2;
      canvas.center = {
        left: canvas.width / 2,
        top: canvas.height / 2,
      };
      canvas.renderAll();
    };

    const resizeCanvas = () => {
      setCurrentDimensions();
    };
    setCurrentDimensions();

    window.addEventListener("resize", resizeCanvas, false);

    onReady?.(canvas);

    return () => {
      canvas.dispose();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div ref={parentRef} style={{ flex: 1, width: "100%" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
