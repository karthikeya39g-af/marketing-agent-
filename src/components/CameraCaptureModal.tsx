import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  primaryColor: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  primaryColor,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializing(true);
    setError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use file upload.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      // Try fallback to any available video device
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (fallbackErr: any) {
        setError(fallbackErr.message || 'Unable to access device camera. Please upload an image file instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleTakeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopStream();
    onCapture(dataUrl);
    onClose();
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="camera-capture-dialog"
        className="bg-neutral-900 text-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-700 flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold tracking-tight">Snap Product Photo</h3>
          </div>
          <button
            id="close-camera-modal-btn"
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder / Video Container */}
        <div className="relative aspect-square sm:aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center space-y-3 max-w-xs">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs text-neutral-300 leading-relaxed">{error}</p>
              <button
                id="camera-error-close-btn"
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
              >
                Use File Upload Instead
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                  <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  <p className="text-xs text-neutral-400">Starting camera...</p>
                </div>
              )}

              {/* Viewfinder crosshairs overlay */}
              {!isInitializing && (
                <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-3 h-3 border-t-2 border-l-2 border-amber-400 absolute top-0 left-0" />
                  <div className="w-3 h-3 border-t-2 border-r-2 border-amber-400 absolute top-0 right-0" />
                  <div className="w-3 h-3 border-b-2 border-l-2 border-amber-400 absolute bottom-0 left-0" />
                  <div className="w-3 h-3 border-b-2 border-r-2 border-amber-400 absolute bottom-0 right-0" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls Bar */}
        {!error && (
          <div className="p-4 bg-neutral-950 flex items-center justify-between border-t border-neutral-800">
            <button
              id="flip-camera-btn"
              type="button"
              onClick={handleToggleFacingMode}
              className="px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Flip camera"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flip</span>
            </button>

            <button
              id="snap-photo-cta-btn"
              type="button"
              disabled={isInitializing}
              onClick={handleTakeSnapshot}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              <Camera className="w-4 h-4" />
              <span>Capture Photo</span>
            </button>

            <button
              id="cancel-camera-btn"
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
