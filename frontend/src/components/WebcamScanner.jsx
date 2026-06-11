import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Brain, Camera, CameraOff } from "lucide-react";

export default function WebcamScanner({ onEmotionDetected }) {
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const isActiveRef = useRef(false);
  
  // The Emotion Buffer prevents rapid text flickering
  const emotionBuffer = useRef([]); 
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState("neutral");

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      isActiveRef.current = false;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "https://unpkg.com/@vladmandic/face-api/model/";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setIsInitializing(false);
      } catch (error) {
        console.error("Error loading face models:", error);
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 240 } })
      .then((stream) => {
        let video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
          setIsCameraActive(true);
          isActiveRef.current = true;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const stopVideo = () => {
    let video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
    isActiveRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleVideoPlay = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const scanFrame = async () => {
      if (!isActiveRef.current || !videoRef.current) return;

      try {
        // MAX ACCURACY SETTINGS: High resolution, low threshold
        const options = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 608, 
          scoreThreshold: 0.2 
        });

        const detections = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceExpressions();

        if (detections) {
          const expressions = detections.expressions;
          let dominant = "neutral";
          let maxAdjustedScore = 0;

          for (const [emotion, score] of Object.entries(expressions)) {
            // Aggressive sensitivity booster to break out of "neutral"
            const multiplier = emotion === "neutral" ? 1.0 : 1.5; 
            const adjustedScore = score * multiplier;

            if (adjustedScore > maxAdjustedScore) {
              maxAdjustedScore = adjustedScore;
              dominant = emotion;
            }
          }

          // FLICKER PROTECTION: Require 3 consecutive matching frames to change UI
          emotionBuffer.current.push(dominant);
          if (emotionBuffer.current.length > 3) {
            emotionBuffer.current.shift(); // Keep only the last 3 frames
          }

          // If all 3 recent frames agree, update the state
          if (emotionBuffer.current.every(val => val === emotionBuffer.current[0])) {
            const stableEmotion = emotionBuffer.current[0];
            setCurrentEmotion((prev) => {
              if (prev !== stableEmotion) {
                if (onEmotionDetected) onEmotionDetected(stableEmotion);
                return stableEmotion;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn("Frame scan failed:", err);
      }

      // HYPERSPEED POLLING: 150ms (approx 6.6 FPS) instead of 1000ms
      timeoutRef.current = setTimeout(scanFrame, 150);
    };

    scanFrame();
  };

  return (
    <div className="bg-ink border border-azure-800 rounded-xl p-4 flex flex-col items-center shadow-soft">
      <div className="flex items-center justify-between w-full mb-3">
        <h3 className="text-azure-100 text-sm font-semibold flex items-center gap-2">
          <Brain size={16} className="text-azure-400" />
          Visual Cortex
        </h3>
        <button
          onClick={isCameraActive ? stopVideo : startVideo}
          disabled={isInitializing}
          className={`p-2 rounded-full transition-colors ${
            isCameraActive ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-azure-500/20 text-azure-400 hover:bg-azure-500/30"
          } disabled:opacity-50`}
        >
          {isCameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
        </button>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        {isInitializing ? (
          <div className="text-azure-400/50 text-xs animate-pulse">Loading AI Core...</div>
        ) : !isCameraActive ? (
          <div className="text-azure-400/50 text-xs">Camera Offline</div>
        ) : null}

        <video
          ref={videoRef}
          onPlay={handleVideoPlay}
          className={`w-full h-full object-cover transform -scale-x-100 ${!isCameraActive ? 'hidden' : ''}`}
          muted
        />
      </div>

      {isCameraActive && (
        <div className="mt-3 text-xs text-azure-200 bg-azure-900/50 px-3 py-1 rounded-full capitalize">
          Detected: <span className="font-bold text-azure-400">{currentEmotion}</span>
        </div>
      )}
    </div>
  );
}