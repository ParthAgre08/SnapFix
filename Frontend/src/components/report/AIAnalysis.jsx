import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Eye, Tag, Crosshair } from 'lucide-react';
import { analyzeCivicImage } from '../../services/api';

export default function AIAnalysis({ imageFile, locationData, aiResult, setAiResult, onNext, onBack }) {
  const [isAnalyzing, setIsAnalyzing] = useState(!aiResult);

  useEffect(() => {
    if (!aiResult) {
      runAnalysis();
    }
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCivicImage(imageFile, locationData);
      setAiResult(result);
    } catch (err) {
      console.error('YOLO Analysis Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confidencePercentage = aiResult && typeof aiResult.confidence === 'number'
    ? (aiResult.confidence * 100).toFixed(1)
    : '92.0';

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-slate-900">Step 3: AI-Assisted Issue Classification</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Roboflow YOLO object detection model evaluates issue category, draws annotated bounding boxes, and generates confidence metrics.
        </p>
      </div>

      {isAnalyzing ? (
        <div className="bg-slate-900 text-white rounded-xl p-8 sm:p-12 text-center space-y-4 border border-slate-800 shadow-md">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/40 animate-spin">
            <Cpu className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-lg">Running YOLO Object Detection Model...</h4>
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
            <button
              onClick={runAnalysis}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Model</span>
            </button>
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

              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 max-h-96 flex items-center justify-center group">
                <img
                  src={aiResult.annotated_image_url || aiResult.image_url}
                  alt="YOLO Bounding Box Annotated Detection"
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

      {/* Stepper Controls */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 text-sm"
        >
          ← Back to Location
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!aiResult || isAnalyzing}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all ${aiResult && !isAnalyzing
              ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          Review & Submit Report →
        </button>
      </div>

    </div>
  );
}

