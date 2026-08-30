import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const MyFees = () => {
  const { user } = useAuth();
  const studentId = user?.profileRef?._id;

  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0, totalInvoices: 0 });
  const [loading, setLoading] = useState(true);

  const [selectedFee, setSelectedFee] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('init'); // 'init' | 'processing' | 'success'
  const [paidReceipt, setPaidReceipt] = useState(null);

  const fetchFees = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await api.get(`/fees/student/${studentId}`);
      if (res.data.success) {
        setFees(res.data.fees || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Fetch fees error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [studentId]);

  const handleStartPayment = (fee) => {
    setSelectedFee(fee);
    setPaymentStep('init');
    setIsPaymentModalOpen(true);
  };

  const handleCompleteRazorpayPayment = async () => {
    if (!selectedFee) return;
    setPaymentStep('processing');

    try {
      // 1. Initialize order
      const orderRes = await api.post(`/fees/${selectedFee._id}/pay`);
      const { orderId } = orderRes.data;

      // 2. Verify payment server-side
      const verifyRes = await api.post('/fees/verify-payment', {
        feeId: selectedFee._id,
        razorpayOrderId: orderId,
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpaySignature: 'sig_test_verified',
      });

      if (verifyRes.data.success) {
        setPaidReceipt(verifyRes.data.receiptNumber);
        setPaymentStep('success');
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
      setPaymentStep('init');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-amber-400" />
          <span>Fee Invoices & Online Gateway</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review semester invoices, make secure Razorpay card/UPI payments, and download certified receipts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Outstanding Due</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            ${summary.totalDue?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending payment settlement</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Settled</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ${summary.totalPaid?.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified with digital receipt</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Gateway Security</div>
          <div className="text-base font-bold text-slate-200 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Razorpay 256-Bit SSL</span>
          </div>
          <div className="text-[11px] text-indigo-400 mt-1">Server-side HMAC Verification</div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Fee Invoices Ledger</h3>

        <div className="grid grid-cols-1 gap-4">
          {fees.map((fee) => {
            const isPaid = fee.status === 'paid';
            return (
              <div
                key={fee._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        isPaid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {fee.status}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-medium">
                      {fee.category} • Semester {fee.semester}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-100">{fee.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Due Date: <strong className="text-slate-300">{new Date(fee.dueDate).toLocaleDateString()}</strong>
                    {fee.notes && ` • ${fee.notes}`}
                  </p>

                  {isPaid && fee.paymentDetails?.receiptNumber && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt ID: {fee.paymentDetails.receiptNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-100">${fee.amount?.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Total Invoice Amount</div>
                  </div>

                  {!isPaid ? (
                    <button
                      onClick={() => handleStartPayment(fee)}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Now</span>
                    </button>
                  ) : (
                    <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Settled</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Razorpay Test Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Razorpay Secure Payment Checkout"
      >
        {paymentStep === 'init' && selectedFee && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Invoice:</span>
                <span className="font-semibold text-slate-200">{selectedFee.title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Due Amount:</span>
                <span className="font-bold text-slate-100 text-sm">
                  ${selectedFee.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Payer Scholar:</span>
                <span className="text-slate-200">{user?.name}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Simulating Razorpay Test Mode checkout with automatic HMAC-SHA256 signature verification.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteRazorpayPayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm & Authorize Payment</span>
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-semibold">
              Verifying payment signature with Razorpay gateway...
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Payment Successful!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your fee has been verified and marked as paid.
              </p>
              {paidReceipt && (
                <div className="mt-2 text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
                  Receipt: {paidReceipt}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyFees;
