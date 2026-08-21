import React, { useState, useEffect } from 'react';
import ImageCapture from '../components/report/ImageCapture';
import LocationCapture from '../components/report/LocationCapture';
import ReportForm from '../components/report/ReportForm';
import { ShieldCheck, Camera, MapPin, CheckCircle } from 'lucide-react';

export default function ReportIssuePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [isDetectingGps, setIsDetectingGps] = useState(true);
  const [gpsStatus, setGpsStatus] = useState('detecting'); // 'detecting' | 'detected' | 'unavailable'
  const [aiResult, setAiResult] = useState(null);

  // 1. Automatically attempt to obtain GPS location on page mount (ONCE)
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsDetectingGps(true);
      setGpsStatus('detecting');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocationData({
            latitude: lat,
            longitude: lng,
            locationName: `GPS Geotag (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
          });
          setGpsStatus('detected');
          setIsDetectingGps(false);
        },
        (error) => {
          console.warn('Automatic GPS detection unavailable or denied:', error);
          setGpsStatus('unavailable');
          setIsDetectingGps(false);
          // Non-blocking: leave locationData as null so manual location step will be shown if needed
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setGpsStatus('unavailable');
      setIsDetectingGps(false);
    }
  }, []);

  // Conditional Next Handler from Step 1 (Photo + AI Classification)
  const handleNextFromStep1 = () => {
    // Check if valid latitude + longitude are available
    if (locationData && typeof locationData.latitude === 'number' && typeof locationData.longitude === 'number') {
      // YES: Skip manual location step -> Continue directly to Review & Submit
      setCurrentStep(3);
    } else {
      // NO: Navigate to "Enter Your Location" step
      setCurrentStep(2);
    }
  };

  const stepsHeader = (locationData && gpsStatus === 'detected') ? [
    { num: 1, label: 'Photo & AI Detection', stepId: 1 },
    { num: 2, label: 'Review & Submit', stepId: 3 },
  ] : [
    { num: 1, label: 'Photo & AI Detection', stepId: 1 },
    { num: 2, label: 'Enter Location', stepId: 2 },
    { num: 3, label: 'Review & Submit', stepId: 3 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Page Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Official Reporting Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Civic Infrastructure Issue
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Document potholes, damaged lights, drainage or garbage problems with instant GPS watermarking and YOLO AI detection.
          </p>
        </div>

        {/* Stepper Header Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto">
          <div className={`grid gap-4 ${stepsHeader.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {stepsHeader.map((step) => {
              const isCurrent = currentStep === step.stepId;
              const isPassed = currentStep > step.stepId;

              return (
                <div
                  key={step.num}
                  className={`flex flex-col items-center text-center p-3 rounded-xl transition-colors ${isCurrent
                      ? 'bg-blue-50 border border-blue-200 shadow-2xs'
                      : isPassed
                        ? 'opacity-80'
                        : 'opacity-40'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                    {isPassed ? '✓' : step.num}
                  </div>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-blue-900' : 'text-slate-700'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Step Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          {currentStep === 1 && (
            <ImageCapture
              imageFile={imageFile}
              setImageFile={setImageFile}
              locationData={locationData}
              setLocationData={setLocationData}
              isDetectingGps={isDetectingGps}
              gpsStatus={gpsStatus}
              aiResult={aiResult}
              setAiResult={setAiResult}
              onNext={handleNextFromStep1}
            />
          )}

          {currentStep === 2 && (
            <LocationCapture
              locationData={locationData || { latitude: 18.5074, longitude: 73.8077, locationName: 'Kothrud, Pune, Maharashtra' }}
              setLocationData={setLocationData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <ReportForm
              imageFile={imageFile}
              locationData={locationData || { latitude: 18.5074, longitude: 73.8077, locationName: 'Kothrud, Pune, Maharashtra' }}
              aiResult={aiResult}
              onBack={() => setCurrentStep(locationData && gpsStatus === 'detected' ? 1 : 2)}
            />
          )}
        </div>

      </div>
    </div>
  );
}



