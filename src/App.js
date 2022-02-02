import { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import download from "downloadjs";

import "./app.css";
import Canvas from "./Canvas";

function App() {
  const [editEnabled, setEditEnabled] = useState(false);
  const [canvas, setCanvas] = useState();
  const [image, setImage] = useState();

  // refs for canvas objects
  const refs = useRef({
    cropGroup: null,
    crop: null,
    image: null,
    croppedImage: null,
  }).current;

  // check and fix crop area inside image
  const updateCropLimits = useCallback(() => {
    // check crop scale
    if (refs.cropGroup.scaleX > 1) refs.cropGroup.set({ scaleX: 1 });
    if (refs.cropGroup.scaleY > 1) refs.cropGroup.set({ scaleY: 1 });

    const { top, left, width, height, set, scaleX, scaleY } = refs.cropGroup;

    const w = refs.image.scaleX * refs.image.width;
    const h = refs.image.scaleY * refs.image.height;

    const minTop = refs.image.top + (height * scaleY - h) / 2;
    const maxTop = refs.image.top + (h - height * scaleY) / 2;
    const minLeft = refs.image.left + (width * scaleX - w) / 2;
    const maxLeft = refs.image.left + (w - width * scaleX) / 2;

    // check crop position
    if (top < minTop) refs.cropGroup.set({ top: minTop });
    if (top > maxTop) refs.cropGroup.set({ top: maxTop });
    if (left < minLeft) refs.cropGroup.set({ left: minLeft });
    if (left > maxLeft) refs.cropGroup.set({ left: maxLeft });
  }, []);

  // initialize objects on canvas ready
  const onReady = useCallback((canvas) => {
    // initialize crop group
    refs.cropGroup = new fabric.Group();
    refs.cropGroup
      .setControlsVisibility({
        mtr: false,
      })
      .set({
        selectable: false,
        originX: "center",
        originY: "center",
        lockScalingFlip: true,
      });
    refs.cropGroup.on("selected", () => setEditEnabled(true));
    refs.cropGroup.on("deselected", () => setEditEnabled(false));
    refs.cropGroup.on("moving", updateCropLimits);
    refs.cropGroup.on("scaling", updateCropLimits);

    // initialize crop
    refs.crop = new fabric.Rect({
      fill: "transparent",
      selectable: false,
      originX: "center",
      originY: "center",
      left: canvas.center.left,
      top: canvas.center.top,
      absolutePositioned: true,
    });
    // select crop area on double mouse click
    refs.crop.on("mousedblclick", (e) =>
      canvas.setActiveObject(refs.cropGroup)
    );
    refs.cropGroup.addWithUpdate(refs.crop);
    canvas.add(refs.cropGroup);

    canvas.hoverCursor = "default";
    canvas.selection = false;

    setCanvas(canvas);
  }, []);

  // crop mode switch
  useEffect(() => {
    if (!canvas) return;

    if (editEnabled) image.set({ opacity: 0.5 });
    else image.set({ opacity: 0 });

    canvas.renderAll();
  }, [editEnabled]);

  const fileRef = useRef();
  const openImageSelect = useCallback(() => fileRef.current.click(), []);

  // image select handler
  const handleImageSelect = useCallback(
    (e) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        // destroy previous image
        image?.dispose();

        var img = new Image();
        img.src = e.target.result;
        img.onload = function () {
          const image = new fabric.Image(img);
          const scale =
            canvas.maxSize / (img.height < img.width ? img.height : img.width);

          // fit crop area with image sizes
          refs.crop.set({
            width: img.width * scale,
            height: img.height * scale,
          });
          refs.cropGroup.set({
            width: img.width * scale,
            height: img.height * scale,
          });

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
              selectable: false,
              originX: "center",
              originY: "center",
              left: canvas.center.left,
              top: canvas.center.top,
              opacity: 0,
            });

          // clone original image for crop area
          const croppedImage = fabric.util.object.clone(image);
          croppedImage.clipPath = refs.crop;
          croppedImage.set({ opacity: 1 });

          refs.image = image;
          refs.croppedImage = croppedImage;

          canvas.add(image);
          canvas.add(croppedImage);
          canvas.add(refs.crop);
          setImage(image);
        };
      };
      reader.readAsDataURL(e.target.files[0]);
    },
    [canvas, image]
  );

  // export cropped image
  const exportImage = useCallback(() => {
    const width = refs.cropGroup.width * refs.cropGroup.scaleX;
    const height = refs.cropGroup.height * refs.cropGroup.scaleY;
    const base64 = canvas.toDataURL({
      format: "png",
      multiplier: window.devicePixelRatio,
      left: refs.cropGroup.left - width / 2,
      top: refs.cropGroup.top - height / 2,
      width,
      height,
    });
    download(base64, "cropped-image.png");
  }, [canvas]);

  return (
    <div className="container">
      <Canvas onReady={onReady} />
      {!image && (
        <div className="no-image-container">
          <div className="no-image">Please select image</div>
        </div>
      )}
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
