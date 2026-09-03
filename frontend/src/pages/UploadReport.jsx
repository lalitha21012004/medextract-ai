import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setIsProcessing(true);

    // Simulate OCR + AI Parsing delay (Mock processing flow)
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/report/1');
    }, 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Lab Report</h1>
        <p className="text-sm text-slate-500">Supported formats: PDF, PNG, JPG (OCR Text Parsing)</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <span className="font-semibold text-blue-600 hover:underline">Click to upload</span> or drag and drop
            <p className="text-xs text-slate-400 mt-1">Medical Blood Test Scans & Diagnostic PDF Files</p>
          </div>
        </label>

        {file && (
          <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extracting OCR & AI Parameters...
            </>
          ) : (
            'Analyze & Extract Report'
          )}
        </button>
      </div>
    </div>
  );
}