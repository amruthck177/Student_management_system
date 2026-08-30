import React from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { FileDown, CreditCard, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

const DocumentDownload = () => {
  const { user } = useAuth();
  const student = user?.profileRef;

  const downloadPDF = async (url, filename) => {
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('PDF generation error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FileDown className="w-6 h-6 text-indigo-400" />
          <span>Official Academic Document Credentials</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Digitally generated PDFs with cryptographic verification tokens
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Official Report Card Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Official Semester Transcript & Report Card
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Certified academic report card containing semester grade points, overall CGPA, course credits, and attendance compliance record.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Includes 10-point GPA Breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Attendance Percentage & Low-Attendance Flag</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Registrar & Examination Controller Sign-off</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              downloadPDF(
                `/students/${student?._id || user?._id}/report-card`,
                `ReportCard_${student?.rollNumber || 'Scholar'}.pdf`
              )
            }
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Official Report Card PDF</span>
          </button>
        </div>

        {/* Official Student ID Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Student Identity Credential (ID Card)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Printable standard CR80 format Student ID card formatted with scholar roll number, emergency contact, and department barcode reference.
            </p>

            <div className="mt-4 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>CR80 Card Standard Dimensions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Valid for Spring 2026 Academic Session</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Emergency Contact & Blood Group Indexed</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              downloadPDF(
                `/students/${student?._id || user?._id}/id-card`,
                `ID_Card_${student?.rollNumber || 'Scholar'}.pdf`
              )
            }
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Download Official ID Card PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDownload;
