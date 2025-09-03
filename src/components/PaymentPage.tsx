import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, AlertCircle } from 'lucide-react';

interface PaymentPageProps {
  amount: string;
  paymentMethod: string;
  onBack: () => void;
  onComplete: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ amount, paymentMethod, onBack, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 9); // 14:09 in seconds
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')} : 09`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('TTetqLeWRGyg9NzGJ8xQFt7AtgBfaTBEAc');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 relative">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowLanguageModal(true)}
            className="border border-white px-3 py-1 rounded text-sm"
          >
            EN FRANÇAIS ⇄
          </button>
        </div>
        <h1 className="text-xl font-bold text-center mt-8">Scan to pay(USDT_TRC20)</h1>
      </div>

      <div className="p-6 text-center">
        {/* Amount */}
        <div className="mb-6">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {amount} <span className="text-lg">USDT_TRC20</span>
          </div>
          <button onClick={handleCopyAddress} className="text-blue-600 text-sm">
            copy
          </button>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Remaining payment time</p>
          <div className="text-2xl font-bold text-red-600">
            {formatTime(timeLeft)}
          </div>
        </div>

        <p className="text-orange-500 mb-8">Please pay the order amount in time</p>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center relative">
            {/* QR Code Pattern */}
            <div className="w-56 h-56 bg-black relative">
              {/* QR Code squares pattern */}
              <div className="absolute inset-0 grid grid-cols-8 gap-1 p-2">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                    } rounded-sm`}
                  />
                ))}
              </div>
              {/* Center logo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">B$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-2 break-all">
            TTetqLeWRGyg9NzGJ8xQFt7AtgBfaTBEAc
          </p>
          <button onClick={handleCopyAddress} className="text-blue-600 text-sm">
            copy
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-700 font-medium">Kind tips</span>
          </div>
          <div className="mt-2 text-sm text-red-700 text-left space-y-2">
            <p>1. Use all wallets that support TRC for payment</p>
            <p>2. Confirm that the payment is successful and wait patiently for 1 to 3 minutes. If it has not been received within 5 minutes, please contact the online customer service to handle it for you~</p>
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-900">Select Language</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded">
                EN FRANÇAIS ⇄
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded">
                ENGLISH ⇄
              </button>
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};