import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileJson,
  X,
  Sparkles,
} from 'lucide-react';
import { PlatformDataBackup } from '../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => PlatformDataBackup;
  onImport: (importedData: PlatformDataBackup) => void;
  onResetToSample: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onResetToSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const data = onExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omran-quran-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorStatus(null);
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.students || !Array.isArray(parsed.students)) {
          setErrorStatus('ملف النسخة الاحتياطية غير صالح أو ناقص البنية.');
          return;
        }
        onImport(parsed);
        setImportStatus('تم استيراد قاعدة البيانات بنجاح وتحديث كافة السجلات!');
      } catch (err) {
        setErrorStatus('فشل قراءة الملف، تأكد من اختيار ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-md">
            <Database className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-kufi text-slate-100">
              إدارة وتصدير قاعدة البيانات
            </h2>
            <p className="text-xs text-slate-400">
              حفظ نسخة احتياطية كاملة لكافة الطلاب، التقييمات، الخطط، وسجلات الحضور
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="mb-4 p-3.5 bg-emerald-950/80 border border-emerald-600 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {errorStatus && (
          <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-600 rounded-2xl text-rose-300 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorStatus}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Export JSON Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-200">تصدير وتحميل النسخة الاحتياطية (JSON)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تنزيل ملف يحتوي على كافة بيانات المنصة لحفظها بأمان
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>تحميل النسخة</span>
            </button>
          </div>

          {/* Import JSON Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-200">استيراد ورفع نسخة احتياطية</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                رفع ملف JSON محفوظ سابقاً لاستعادة جميع الطلاب وسجلاتهم
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-teal-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>اختيار ملف</span>
            </button>
          </div>

          {/* Reset to Sample Data */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-amber-300">إعادة تهيئة البيانات الافتراضية</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إعادة تحميل بيانات الحلقة القرآنية والطلاب النموذجية المسبقة
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('هل تريد استعادة البيانات الافتراضية النموذجية للحلقة؟')) {
                  onResetToSample();
                  setImportStatus('تمت استعادة البيانات النموذجية بنجاح!');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
