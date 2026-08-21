import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, MapPin, AlertTriangle, ThumbsUp, FileText, ArrowRight, Search, Sparkles, Cpu, Database } from 'lucide-react';
import { submitCivicReport, supportReport } from '../../services/api';

export default function ReportForm({ imageFile, locationData, aiResult, onBack }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subStep, setSubStep] = useState(1);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);
  const [duplicateData, setDuplicateData] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');

  // Step progression timer for processing animation
  useEffect(() => {
    if (!isSubmitting) {
      setSubStep(1);
      return;
    }
    const t1 = setTimeout(() => setSubStep(2), 1200);
    const t2 = setTimeout(() => setSubStep(3), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDuplicateData(null);
    setSupportMessage('');

    try {
      const payload = {
        user_id: 'usr_citizen_01',
        title: `${aiResult?.issue_label || 'Civic Issue'} near ${locationData.locationName}`,
        issue_category: aiResult?.issue_label || 'Pothole',
        location_name: locationData.locationName,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        user_description: description || `Reported ${aiResult?.issue_label || 'civic infrastructure issue'} requiring inspection.`,
        severity: aiResult?.severity || 'Medium',
        authorityAssigned: aiResult?.suggested_authority || 'Public Works Department (PWD)',
        image_url: imageFile ? URL.createObjectURL(imageFile) : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      };

      const response = await submitCivicReport(payload, imageFile);

      if (response.duplicate) {
        setDuplicateData(response);
      } else {
        setSubmittedReceipt(response.report);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportDuplicate = async () => {
    if (!duplicateData) return;
    const res = await supportReport(duplicateData.report_id, 'usr_citizen_01');
    setSupportMessage(res.message || 'You have supported this issue!');
    if (res.community_support_count) {
      setDuplicateData(prev => ({ ...prev, community_support_count: res.community_support_count }));
    }
  };

  // PROCESSING SUBMISSION ANIMATION VIEW
  if (isSubmitting) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 border border-slate-800 shadow-2xl max-w-xl mx-auto my-4 font-sans">
        
        {/* Animated Radar & Search Core */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
          <div className="absolute inset-1 rounded-full border-2 border-blue-500/40 animate-spin" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-3 rounded-full border-2 border-dashed border-emerald-400/60 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
          
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg border border-blue-400/40">
            <Search className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>

        {/* Main Status Heading */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
            <span>Processing Civic Report</span>
          </h3>
          <p className="text-xs sm:text-sm text-blue-200/90 font-medium">
            Running duplicate detection scan & Gemma 4 AI municipal report generation...
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5 max-w-md mx-auto">
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700 p-0.5">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 h-full rounded-full animate-pulse transition-all duration-700 w-full"></div>
          </div>
        </div>

        {/* Animated Pipeline Steps Checklist */}
        <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 text-left space-y-3 text-xs font-sans">
          <div className={`flex items-center gap-2.5 transition-colors ${subStep >= 1 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${subStep >= 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}>
              {subStep > 1 ? '✓' : '1'}
            </div>
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Gemma 4 AI Municipal Assessment Generation</span>
            </span>
          </div>

          <div className={`flex items-center gap-2.5 transition-colors ${subStep >= 2 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${subStep >= 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}>
              {subStep > 2 ? '✓' : '2'}
            </div>
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>Scanning 600m Radius for Existing Duplicate Reports</span>
            </span>
          </div>

          <div className={`flex items-center gap-2.5 transition-colors ${subStep >= 3 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${subStep >= 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}>
              {subStep >= 3 ? '✓' : '3'}
            </div>
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Calculating Cosine Similarity & Committing to Database</span>
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span>GPS: {locationData.latitude.toFixed(4)}°, {locationData.longitude.toFixed(4)}° • {aiResult?.issue_label || 'Pothole'}</span>
        </div>

      </div>
    );
  }

  // DUPLICATE FOUND VIEW
  if (duplicateData) {
    return (
      <div className="bg-white rounded-xl border border-amber-300 shadow-md p-6 sm:p-8 space-y-6 max-w-2xl mx-auto text-slate-800">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center border border-amber-300">
            <AlertTriangle className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">Similar Issue Already Reported</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {duplicateData.message || 'A similar civic issue has already been reported near this location.'}
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-amber-900 text-sm">
              Existing Report #{duplicateData.report_id}
            </span>
            <span className="bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded text-[11px]">
              {duplicateData.community_support_count} Citizens Supported
            </span>
          </div>
          <p className="text-slate-700">
            Our duplicate detection engine identified an existing issue within range with matching category and description similarity.
          </p>
          {supportMessage && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-md font-semibold border border-emerald-300">
              ✓ {supportMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleSupportDuplicate}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-3 px-4 rounded-lg text-center shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Support This Issue (+1)</span>
          </button>
          <Link
            to="/community"
            className="bg-white border border-slate-300 text-slate-800 font-semibold text-sm py-3 px-4 rounded-lg text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Existing Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS RECEIPT VIEW
  if (submittedReceipt) {
    return (
      <div className="bg-white rounded-xl border border-slate-300 shadow-md p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">Civic Report Registered</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Your submission has been logged into the reports single source of truth table.
          </p>
        </div>

        {/* Official Receipt Card */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 font-sans text-xs">

          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block uppercase">Official Tracking Reference</span>
              <span className="text-lg font-mono font-bold text-blue-900">
                {typeof submittedReceipt.id === 'number' ? `#SF-2026-${submittedReceipt.id}` : submittedReceipt.id}
              </span>
            </div>
            <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded font-bold uppercase text-[11px]">
              {submittedReceipt.statusLabel || submittedReceipt.status || 'Reported'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Detected Issue</span>
              <span className="font-semibold text-slate-900 text-sm">
                {submittedReceipt.issue_category || submittedReceipt.categoryLabel || 'Road Pothole'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Reported Location</span>
              <span className="font-semibold text-slate-900 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="truncate">{submittedReceipt.location_name || submittedReceipt.locationName}</span>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="text-slate-500 text-[10px] block uppercase">Assigned Authority</span>
            <span className="font-semibold text-slate-800">Public Works Department (PWD)</span>
          </div>

        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/profile"
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm py-3 px-4 rounded-lg text-center shadow-xs transition-colors"
          >
            Track Status on My Dashboard →
          </Link>
          <Link
            to="/community"
            className="bg-white border border-slate-300 text-slate-800 font-semibold text-sm py-3 px-4 rounded-lg text-center hover:bg-slate-50 transition-colors"
          >
            View Community Feed
          </Link>
        </div>
      </div>
    );
  }

  // REVIEW & FORM INPUT VIEW (Step 4)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-slate-900">Step 4: Review & Confirm Submission</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Verify payload details, add optional landmark description, and submit to municipal routing.
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-300 p-5 space-y-4">

        {/* Payload Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-200">
          <div className="h-32 rounded-lg overflow-hidden border border-slate-300 bg-slate-200">
            {aiResult?.annotated_image_url || aiResult?.image_url ? (
              <img src={aiResult.annotated_image_url || aiResult.image_url} alt="Annotated Detection Preview" className="w-full h-full object-cover" />
            ) : imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Image</div>
            )}
          </div>

          <div className="md:col-span-2 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                {aiResult?.issue_label || 'Pothole'}
              </span>
              <span className="text-slate-500 font-mono">
                Lat: {locationData.latitude.toFixed(4)}, Lng: {locationData.longitude.toFixed(4)}
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-base">
              {aiResult?.issue_label || 'Civic Issue'} near {locationData.locationName}
            </h4>

            <p className="text-slate-600 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{locationData.locationName}</span>
            </p>

            <p className="text-slate-500 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{aiResult?.suggested_authority || 'Public Works Department (PWD)'}</span>
            </p>
          </div>
        </div>

        {/* Additional Form Details */}
        <div className="space-y-4 pt-2">

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Additional Details / Landmarks (Optional):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Near main bus stop, depth approx 6 inches, blocking right lane..."
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

        </div>

      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 text-sm"
        >
          ← Back to Photo & AI
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg font-bold text-sm bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <span>Registering Report...</span>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Submit Official Report</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
}
