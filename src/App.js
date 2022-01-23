import { useCallback } from "react";
import { fabric } from "fabric";

import Canvas from "./Canvas";

function App() {
  const onReady = useCallback((canvas) => {
    const diameter =
      (canvas.height > canvas.width ? canvas.width : canvas.height) / 2;
    const radius = diameter / 2;

    const selectable = false;
    const originX = "center";
    const originY = "center";
    const left = canvas.width / 2;
    const top = canvas.height / 2;

    const circle = new fabric.Circle({
      fill: "#31343a",
      selectable,
      originX,
      originY,
      left,
      top,
      radius,
    });

    canvas.clipPath = circle;
    canvas.add(circle);

    fabric.Image.fromURL("./img.jpeg", function (img) {
      const scale =
        diameter / (img.height < img.width ? img.height : img.width);

      img
        .on("mousedblclick", (e) => canvas.setActiveObject(img).renderAll())
        .scale(scale)
        .setControlsVisibility({
          mb: false,
          ml: false,
          mr: false,
          mt: false,
          mtr: false,
        })
        .set({
          selectable,
          originX,
          originY,
          left,
          top,
        });
      canvas.add(img);
    });
  }, []);

  return <Canvas onReady={onReady} />;
}

export default App;
