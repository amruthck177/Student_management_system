import React, { useState } from 'react';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import { ShieldCheck, CheckCircle2, AlertCircle, KeyRound, QrCode } from 'lucide-react';

const TwoFactorSetupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('init'); // 'init' | 'qrcode' | 'verified'
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateSecret = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/2fa/generate');
      if (res.data.success) {
        setSecret(res.data.secret);
        setQrCodeUrl(res.data.qrCodeUrl);
        setStep('qrcode');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/2fa/verify', { token, secret });
      if (res.data.success) {
        setStep('verified');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 6-digit code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Two-Factor Authentication (2FA) Security">
      <div className="space-y-4 text-xs text-slate-300">
        {step === 'init' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-1">Enhance Your Account Security</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Two-factor authentication adds an extra layer of protection by requiring a time-based code from Google Authenticator, Authy, or 1Password upon sign-in.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateSecret}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Configure Authenticator App'}
              </button>
            </div>
          </div>
        )}

        {step === 'qrcode' && (
          <form onSubmit={handleVerifyToken} className="space-y-4">
            <p className="text-slate-300 text-xs">
              1. Scan this QR code with your mobile authenticator app (Google Authenticator / Authy):
            </p>

            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-md">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44" />
            </div>

            <div className="text-center">
              <span className="text-[10px] text-slate-400">Or enter secret key manually:</span>
              <div className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 mt-1 inline-block select-all">
                {secret}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                2. Enter the 6-digit verification code from your app:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold tracking-widest text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep('init')}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || token.length < 6}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </div>
          </form>
        )}

        {step === 'verified' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">2FA Successfully Enabled!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your account is now secured with Time-based One-Time Password (TOTP) protection.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md text-xs"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TwoFactorSetupModal;
