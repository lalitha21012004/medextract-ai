import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, X, Cpu, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/Api';

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    // Validate client-side file type (PDF, PNG, JPG)
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload a PDF, PNG, or JPG diagnostic scan.');
      return;
    }

    // Size limit check (e.g. 10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit. Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProcessingStep(1);

    // Simulate realistic multi-stage OCR/AI processing indicators for UX polish
    const stepTimer1 = setTimeout(() => setProcessingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setProcessingStep(3), 2500);

    const formData = new FormData();
    formData.append('report_file', file);

    try {
      const response = await api.post('/reports/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const reportId = response.data.id || response.data.report_id;
      if (reportId) {
        navigate(`/report/${reportId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error('Upload failed:', err);
      const apiErrorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || 'Failed to process lab report. Please check your network connection or file integrity.';
      setError(apiErrorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Diagnostic Report</h1>
        <p className="text-sm text-slate-500">Secure OCR & Gemini AI Extraction for Blood Tests, Scans & PDFs</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-6">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />
        
        {!isProcessing ? (
          <>
            <label
              htmlFor="file-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`cursor-pointer flex flex-col items-center gap-3 border-2 border-dashed rounded-xl p-8 transition ${
                isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-400 bg-slate-50/30'
              }`}
            >
              <div className="p-4 bg-blue-600/10 text-blue-600 rounded-full">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <span className="font-semibold text-blue-600 hover:underline">Click to browse</span> or drag and drop your files here
                <p className="text-xs text-slate-400 mt-1">PDF, PNG, or JPG formats (Maximum size: 10MB)</p>
              </div>
            </label>

            {file && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-left animate-fadeIn">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • Ready for extraction</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
            >
              Analyze & Extract Report
            </button>
          </>
        ) : (
          /* Multi-Stage AI Processing State */
          <div className="py-12 space-y-6 animate-fadeIn">
            <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-full relative">
              <Loader2 className="w-10 h-10 animate-spin" />
              <Cpu className="w-5 h-5 absolute inset-0 m-auto text-blue-700" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Processing Medical Intelligence</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Our HIPAA-compliant pipeline is extracting and verifying diagnostic markers.
              </p>
            </div>

            {/* Step Progress Indicators */}
            <div className="max-w-xs mx-auto space-y-2 text-left text-xs font-medium text-slate-600">
              <div className={`flex items-center gap-2 p-2 rounded-lg transition ${processingStep >= 1 ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-400'}`}>
                <CheckCircle2 className={`w-4 h-4 ${processingStep > 1 ? 'text-emerald-600' : processingStep === 1 ? 'text-blue-600 animate-pulse' : 'text-slate-300'}`} />
                <span>1. Extracting raw text via PDF & OCR parser</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg transition ${processingStep >= 2 ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-400'}`}>
                <CheckCircle2 className={`w-4 h-4 ${processingStep > 2 ? 'text-emerald-600' : processingStep === 2 ? 'text-blue-600 animate-pulse' : 'text-slate-300'}`} />
                <span>2. Analyzing biometric markers with Gemini AI</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-lg transition ${processingStep >= 3 ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-400'}`}>
                <CheckCircle2 className={`w-4 h-4 ${processingStep === 3 ? 'text-blue-600 animate-pulse' : 'text-slate-300'}`} />
                <span>3. Structuring clinical risk parameters & summary</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Diagnostic Storage & Secure Processing</span>
        </div>
      </div>
    </div>
  );
}