import { useCallback, useRef, useState } from "react";
import { fabric } from "fabric";
import download from "downloadjs";

import "./app.css";
import Canvas from "./Canvas";

const isTouchDevice =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

function App() {
  const [canvas, setCanvas] = useState();
  const [image, setImage] = useState();
  const onReady = useCallback((canvas) => {
    setCanvas(canvas);

    const circle = new fabric.Circle({
      fill: "#31343a",
      selectable: false,
      originX: "center",
      originY: "center",
      left: canvas.center.left,
      top: canvas.center.top,
      radius: canvas.radius,
    });

    canvas.hoverCursor = "default";
    canvas.selection = false;
    canvas.clipPath = circle;
    canvas.add(circle);
  }, []);

  const fileRef = useRef();
  const openImageSelect = useCallback(() => fileRef.current.click(), []);
  const handleImageSelect = useCallback(
    (e) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        image?.dispose();

        var img = new Image();
        img.src = e.target.result;
        img.onload = function () {
          const image = new fabric.Image(img);
          const scale =
            canvas.diameter / (img.height < img.width ? img.height : img.width);

          !isTouchDevice &&
            image.on("mousedblclick", (e) =>
              canvas.setActiveObject(image).renderAll()
            );
          image
            .scale(scale)
            .setControlsVisibility({
              mb: false,
              ml: false,
              mr: false,
              mt: false,
              mtr: false,
            })
            .set({
              selectable: isTouchDevice,
              originX: "center",
              originY: "center",
              left: canvas.center.left,
              top: canvas.center.top,
            });

          canvas.add(image).setActiveObject(image);
          setImage(image);
        };
      };
      reader.readAsDataURL(e.target.files[0]);
    },
    [canvas, image]
  );

  const exportImage = useCallback(() => {
    canvas.item(0).set({ visible: false });
    canvas.renderAll();
    const base64 = canvas.toDataURL({
      format: "png",
      multiplier: window.devicePixelRatio,
      left: canvas.center.left - canvas.radius,
      top: canvas.center.top - canvas.radius,
      width: canvas.radius * 2,
      height: canvas.radius * 2,
    });
    canvas.item(0).set({ visible: true });
    canvas.renderAll();
    download(base64, "cropped-image.png");
  }, [canvas]);

  return (
    <div className="container">
      <Canvas onReady={onReady} />
      <div className="buttons">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
        />
        <button disabled={!canvas} onClick={openImageSelect}>
          Select image
        </button>
        <button disabled={!image} onClick={exportImage}>
          Export
        </button>
      </div>
    </div>
  );
}

export default App;
