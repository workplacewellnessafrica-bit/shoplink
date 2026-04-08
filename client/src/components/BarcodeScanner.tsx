import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scan, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [manualInput, setManualInput] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && cameraActive) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraActive]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access camera";
      setError(message);
      toast.error("Camera access denied. Use manual input instead.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleManualScan = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
      toast.success(`Barcode scanned: ${manualInput}`);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCameraActive(false);
    setManualInput("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Toggle */}
          <div className="flex gap-2">
            <Button
              variant={cameraActive ? "default" : "outline"}
              onClick={() => setCameraActive(!cameraActive)}
              className="flex-1"
            >
              {cameraActive ? "Camera On" : "Camera Off"}
            </Button>
            <Button variant="outline" onClick={handleClose} className="px-3">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Camera View */}
          {cameraActive && (
            <div className="relative bg-black rounded-lg overflow-hidden">
              {error ? (
                <div className="aspect-video flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-32 border-2 border-yellow-400 rounded-lg opacity-50" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Manual Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Manual Entry</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter barcode manually..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleManualScan();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleManualScan} disabled={!manualInput.trim()}>
                Scan
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Position the barcode in the center of the camera view. If camera access is denied, use manual entry instead.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
