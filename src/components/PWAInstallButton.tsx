import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner' | 'pill';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode on mobile, show installed badge if in banner
  if (isInstalled) {
    if (variant === 'banner') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>App Installed on Phone</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback guide for browsers where prompt hasn't fired yet
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'nav' && (
        <button
          onClick={handleInstallClick}
          aria-label="Download App"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Get Phone App</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {variant === 'banner' && (
        <button
          onClick={handleInstallClick}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 transition active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Download App on Phone</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-medium transition cursor-pointer"
        >
          <Download className="w-3 h-3 text-orange-600" />
          <span>Install for 1-Tap Ordering</span>
        </button>
      )}

      {/* iOS & Browser Install Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                  B
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Install Breakbite</h3>
                  <p className="text-xs text-stone-500">Add to your Phone Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-xs text-stone-600">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-stone-900">
                    {isIOS ? 'Tap Safari Share Button' : 'Tap Browser Menu'}
                  </p>
                  <p className="text-stone-600 mt-0.5">
                    {isIOS ? (
                      <span className="inline-flex items-center gap-1 font-medium text-orange-800">
                        Tap the <Share className="w-3.5 h-3.5 inline text-orange-700" /> icon in Safari's bottom bar.
                      </span>
                    ) : (
                      'Tap the three dots (⋮) in your Chrome or Edge address bar.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Add to Home Screen</p>
                  <p className="text-stone-600 mt-0.5">
                    Scroll down and select <span className="font-bold text-stone-900">"Add to Home Screen"</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Instant Access on Break</p>
                  <p className="text-stone-600 mt-0.5">
                    Launch Breakbite directly like an app, order 3 mins before your class ends!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white hover:bg-orange-700 transition active:scale-98"
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
