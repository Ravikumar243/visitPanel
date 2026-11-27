import React from "react";
import {
  TransformWrapper,
  TransformComponent,
} from "react-zoom-pan-pinch";

import { Button } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RefreshIcon from "@mui/icons-material/Refresh";

const ImageViewer = ({ imageUrl }) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        wheel={{
          step: 0.2,
        }}
        doubleClick={{
          mode: "zoomIn",
        }}
        pinch={{
          disabled: false,
        }}
        panning={{
          disabled: false,
        }}
      >
        {({
          zoomIn,
          zoomOut,
          resetTransform,
        }) => (
          <>
            {/* TOOLBAR */}
            <div
              style={{
                position: "absolute",
                top: "15px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                padding: "8px",
                background: "rgba(0,0,0,0.75)",
                borderRadius: "8px",
                zIndex: 1000,
              }}
            >
              <Button
                variant="contained"
                onClick={() => zoomIn()}
                startIcon={<ZoomInIcon />}
                style={{
                  backgroundColor: "#5932ea",
                  color: "#fff",
                  textTransform: "none",
                }}
              >
                Zoom In
              </Button>

              <Button
                variant="contained"
                onClick={() => zoomOut()}
                startIcon={<ZoomOutIcon />}
                style={{
                  backgroundColor: "#5932ea",
                  color: "#fff",
                  textTransform: "none",
                }}
              >
                Zoom Out
              </Button>

              <Button
                variant="contained"
                onClick={() => resetTransform()}
                startIcon={<RefreshIcon />}
                style={{
                  backgroundColor: "#616161",
                  color: "#fff",
                  textTransform: "none",
                }}
              >
                Reset
              </Button>
            </div>

            {/* IMAGE AREA */}
            <div
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Preview"
                  draggable={false}
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "85vh",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                    userSelect: "none",
                    WebkitUserDrag: "none",
                    cursor: "grab",
                  }}
                  onError={(e) => {
                    console.error(
                      "Error loading image:",
                      imageUrl
                    );
                    e.currentTarget.style.display = "none";
                  }}
                />
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default ImageViewer;