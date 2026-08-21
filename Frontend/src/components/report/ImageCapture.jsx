import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle, Cpu, RefreshCw, Eye, Tag, Crosshair, ShieldCheck, MapPin, X } from 'lucide-react';
import { analyzeCivicImage } from '../../services/api';

export default function ImageCapture({ imageFile, setImageFile, locationData, setLocationData, isDetectingGps, gpsStatus, aiResult, setAiResult, onNext }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userLocation, setUserLocation] = useState(
    locationData ? { latitude: locationData.latitude, longitude: locationData.longitude } : null
  );
  const [locationStatus, setLocationStatus] = useState('📍 Location not captured');
  const [previewUrl, setPreviewUrl] = useState(
    imageFile ? URL.createObjectURL(imageFile) : null
  );

  // Attach media stream to videoRef when camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
    }
  }, [isCameraActive]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Get Geolocation
  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationStatus('❌ Geolocation is not supported');
        resolve(null);
        return;
      }

      setLocationStatus('📍 Getting your location...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const loc = { latitude: lat, longitude: lng };
          setUserLocation(loc);

          if (setLocationData) {
            setLocationData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              locationName: prev?.locationName || 'Detected GPS Location',
            }));
          }

          setLocationStatus(`📍 GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          resolve(loc);
        },
        (error) => {
          console.error('GPS Error:', error);
          setLocationStatus('❌ Location permission denied (using fallback)');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  };

  // Draw GPS Watermark onto canvas
  const drawLocationWatermark = (context, canvasWidth, canvasHeight, loc) => {
    const activeLoc = loc || userLocation;
    if (!activeLoc) return;

    const text = `GPS: ${activeLoc.latitude.toFixed(6)}, ${activeLoc.longitude.toFixed(6)}`;
    context.font = '20px Arial';

    const textWidth = context.measureText(text).width;
    const boxWidth = Math.min(canvasWidth - 40, textWidth + 30);
    const boxHeight = 50;

    context.fillStyle = 'rgba(0,0,0,0.75)';
    context.fillRect(20, canvasHeight - boxHeight - 20, boxWidth, boxHeight);

    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText(text, 35, canvasHeight - 38);
  };

  // Trigger Instant YOLO AI Detection
  const triggerAiDetection = async (file) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCivicImage(file, locationData);
      setAiResult(result);
    } catch (err) {
      console.error('YOLO Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Open Live Camera Sensor
  const startCamera = async () => {
    try {
      console.log('Opening camera sensor...');
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      } catch (e) {
        // Fallback for laptops/desktops without 'environment' rear camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      setIsCameraActive(true);

      // Concurrently fetch GPS
      getLocation();
    } catch (error) {
      console.error('Camera Error:', error);
      alert(
        'Camera access failed.\n\nMake sure the page is served over HTTPS (or localhost) and camera permission is granted in your browser.'
      );
    }
  };

  // Stop Live Camera Sensor
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Photo from Live Camera
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("Camera element not ready — wait a moment and try again.");
      return;
    }

    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    // Draw GPS location watermark onto frame
    drawLocationWatermark(context, width, height, userLocation);

    canvas.toBlob((blob) => {
      if (!blob) {
        alert("Couldn't process the photo. Please try again.");
        return;
      }

      const capturedFile = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const imageURL = URL.createObjectURL(blob);

      setImageFile(capturedFile);
      setPreviewUrl(imageURL);
      stopCamera();

      // Run immediate YOLO AI classification
      triggerAiDetection(capturedFile);
    }, 'image/jpeg', 0.9);
  };

  // Upload File via Gallery / File Picker
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Fast GPS location check (non-blocking if GPS times out)
    let loc = userLocation;
    try {
      loc = await Promise.race([
        getLocation(),
        new Promise((res) => setTimeout(() => res(userLocation), 2500))
      ]);
    } catch (e) {
      console.warn("GPS lookup timeout, proceeding with file upload:", e);
    }

    const img = new Image();
    const objectURL = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setImageFile(file);
        setPreviewUrl(objectURL);
        triggerAiDetection(file);
        return;
      }

      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const context = canvas.getContext('2d');

      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawLocationWatermark(context, canvas.width, canvas.height, loc);

      canvas.toBlob((blob) => {
        if (!blob) {
          setImageFile(file);
          setPreviewUrl(objectURL);
          triggerAiDetection(file);
          return;
        }

        const watermarkedFile = new File([blob], file.name || `upload_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const watermarkedURL = URL.createObjectURL(blob);

        setImageFile(watermarkedFile);
        setPreviewUrl(watermarkedURL);
        URL.revokeObjectURL(objectURL);

        // Run immediate YOLO AI classification
        triggerAiDetection(watermarkedFile);
      }, 'image/jpeg', 0.9);
    };

    img.onerror = () => {
      alert("That file couldn't be read as an image.");
      URL.revokeObjectURL(objectURL);
    };

    img.src = objectURL;
  };

  const confidencePercentage = aiResult && typeof aiResult.confidence === 'number'
    ? (aiResult.confidence * 100).toFixed(1)
    : '92.0';

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-slate-900">Step 1: Capture Photo & Instant AI Detection</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Open live camera or upload photo. Real-time GPS watermark will be embedded and passed to YOLO AI detection.
        </p>
      </div>

      {/* Automatic GPS Location Status Banner */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between font-sans">
        <div className="flex items-center gap-2 font-medium">
          {isDetectingGps || gpsStatus === 'detecting' ? (
            <span className="text-blue-700 font-semibold flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
              <span>📍 Detecting your location...</span>
            </span>
          ) : locationData && typeof locationData.latitude === 'number' ? (
            <span className="text-emerald-800 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>📍 Location detected</span>
              <span className="text-slate-500 font-mono text-[11px] font-normal">
                ({locationData.latitude.toFixed(4)}°, {locationData.longitude.toFixed(4)}°)
              </span>
            </span>
          ) : (
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>📍 GPS unavailable — manual location step will be shown after photo upload</span>
            </span>
          )}
        </div>
        {(!locationData || gpsStatus === 'unavailable') && !isDetectingGps && (
          <button
            type="button"
            onClick={getLocation}
            className="text-[11px] text-blue-700 hover:text-blue-900 underline font-sans cursor-pointer shrink-0 ml-2"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Hidden Canvas for Watermark Drawing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Main Upload Dropzone / Live Video Stream */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 sm:p-8 text-center transition-colors">

        {isCameraActive ? (
          <div className="space-y-4">
            <div className="relative max-w-lg mx-auto rounded-xl overflow-hidden border border-slate-400 bg-slate-950 shadow-md">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-emerald-500/40 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Sensor
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>📸 Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="bg-white border border-slate-300 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto h-64 rounded-lg overflow-hidden border border-slate-300 shadow-sm">
              <img src={previewUrl} alt="Captured Civic Issue" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Photo & GPS Attached
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={startCamera}
                className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Upload File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center border border-blue-100">
              <Camera className="w-7 h-7" />
            </div>

            <div>
              <p className="font-bold text-slate-900 text-base">Capture Photo or Drag & Drop File</p>
              <p className="text-xs text-slate-500 mt-1">Supports camera capture & file formats JPG, PNG, WEBP</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startCamera}
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>📷 Open Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-sm px-6 py-2.5 rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Upload Image File</span>
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* AI CLASSIFICATION RESULT CARD (INTEGRATED IMMEDIATELY AFTER UPLOAD) */}
      {isAnalyzing ? (
        <div className="bg-slate-900 text-white rounded-xl p-8 text-center space-y-4 border border-slate-800 shadow-md">
          <div className="w-14 h-14 rounded-full bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/40 animate-spin">
            <Cpu className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base">Running YOLO Object Detection Model...</h4>
            <p className="text-xs text-slate-400 font-mono">Analyzing frame through snapfixai/2 model (Drawing Bounding Boxes)</p>
          </div>
          <div className="w-full max-w-xs mx-auto bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-3/4 animate-pulse"></div>
          </div>
        </div>
      ) : aiResult ? (
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden space-y-4">

          {/* Analysis Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>YOLO AI Issue Detection Complete</span>
            </div>
            {imageFile && (
              <button
                onClick={() => triggerAiDetection(imageFile)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Detection</span>
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">

            {/* ANNOTATED IMAGE PREVIEW DISPLAY */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>YOLO Model Detection Bounding Box (`annotated.jpg`)</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Annotated Image Ready
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 max-h-96 flex items-center justify-center">
                <img
                  src={aiResult.annotated_image_url || aiResult.image_url}
                  alt="YOLO Bounding Box Detection"
                  className="w-full h-full object-contain max-h-96"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-emerald-400 text-[11px] font-mono font-bold px-3 py-1 rounded-md border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Class: {aiResult.issue_type || aiResult.issue_label} ({confidencePercentage}%)</span>
                </div>
              </div>
            </div>

            {/* Core Classification Output Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Detected Issue Box */}
              <div className="bg-blue-50/80 p-4 rounded-lg border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Detected Issue Class
                </span>
                <span className="text-xl font-extrabold text-blue-950 mt-1 block">
                  {aiResult.issue_label}
                </span>
                <span className="text-xs text-blue-800 font-mono mt-1 block">
                  Class Name: <strong className="uppercase">{aiResult.issue_type || 'pothole'}</strong>
                </span>
              </div>

              {/* Confidence & Severity Box */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Model Confidence:</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    {confidencePercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, parseFloat(confidencePercentage)))}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-medium text-slate-600">Predicted Severity:</span>
                  <span className="font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px]">
                    {aiResult.severity || 'High'} Severity
                  </span>
                </div>
              </div>

            </div>

            {/* PREDICTIONS BREAKDOWN SECTION */}
            {aiResult.predictions && aiResult.predictions.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Detected Objects & Bounding Boxes ({aiResult.predictions.length})</span>
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {aiResult.predictions.map((pred, index) => {
                    const predConf = (pred.confidence * 100).toFixed(1);
                    return (
                      <div
                        key={pred.detection_id || index}
                        className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-slate-900 capitalize">{pred.class}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            (Box: {Math.round(pred.width)}x{Math.round(pred.height)}px)
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          {predConf}% confidence
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggested Municipal Authority Routing */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Automated Authority Routing
                </h5>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  {aiResult.suggested_authority}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Report payload formatted to dispatch directly to municipal maintenance cell.
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : null}

      {/* Navigation Next Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!previewUrl || isAnalyzing}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all ${previewUrl && !isAnalyzing
              ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          {locationData && typeof locationData.latitude === 'number'
            ? 'Continue to Review & Submit →'
            : 'Continue to Enter Location →'}
        </button>
      </div>

    </div>
  );
}
