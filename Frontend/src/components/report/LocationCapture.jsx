import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle, RefreshCw } from 'lucide-react';

export default function LocationCapture({ locationData, setLocationData, onNext, onBack }) {
  const [isLocating, setIsLocating] = useState(false);

  const presetLocations = [
    { name: 'Kothrud, Pune, Maharashtra', lat: 18.5074, lng: 73.8077 },
    { name: 'Indiranagar 100ft Rd, Bengaluru, Karnataka', lat: 12.9784, lng: 77.6408 },
    { name: 'Dadar West, Mumbai, Maharashtra', lat: 19.0178, lng: 72.8478 },
    { name: 'Connaught Place Outer Ring, New Delhi', lat: 28.6315, lng: 77.2167 },
  ];

  const handleDetectGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationName: 'Detected Location (Current GPS Position)',
          });
        },
        (error) => {
          setIsLocating(false);
          // Fallback to Pune preset
          setLocationData({
            latitude: 18.5074,
            longitude: 73.8077,
            locationName: 'Kothrud, Pune, Maharashtra (Default GPS)',
          });
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      setLocationData(presetLocations[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-slate-900">Step 2: Pinpoint Issue Location</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Geotagging helps municipal authority teams locate the exact street infrastructure requiring repair.
        </p>
      </div>

      {/* GPS Detection Box */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-6 space-y-4">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Automatic GPS Geolocation</h4>
            <p className="text-xs text-slate-500">Retrieves browser high-accuracy coordinates</p>
          </div>
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Detect Current GPS</span>
              </>
            )}
          </button>
        </div>

        {/* Selected Coordinates Card */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Active Coordinates Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block">LATITUDE</span>
              <span className="font-bold text-slate-900 text-sm">{locationData.latitude.toFixed(4)}° N</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block">LONGITUDE</span>
              <span className="font-bold text-slate-900 text-sm">{locationData.longitude.toFixed(4)}° E</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 sm:col-span-1">
              <span className="text-slate-500 text-[10px] block">LOCATION NAME</span>
              <span className="font-bold text-slate-900 truncate block">{locationData.locationName}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Preset Location Quick Selectors */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
        <label className="text-xs font-semibold text-slate-700 block">
          Or select from common municipal ward areas:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {presetLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLocationData(loc)}
              className={`p-2.5 text-left rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${locationData.locationName === loc.name
                  ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="truncate">{loc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stepper Footer Controls */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 text-sm cursor-pointer"
        >
          ← Back to Photo & AI
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg font-bold text-sm bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all cursor-pointer"
        >
          Continue to Review & Submit →
        </button>
      </div>

    </div>
  );
}
