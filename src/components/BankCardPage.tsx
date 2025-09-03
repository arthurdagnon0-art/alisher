import React, { useState } from 'react';
import { ArrowLeft, CreditCard, User, Hash, DollarSign, Lock, ChevronDown } from 'lucide-react';

interface BankCardPageProps {
  onBack: () => void;
}

export const BankCardPage: React.FC<BankCardPageProps> = ({ onBack }) => {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  const walletOptions = [
    'Orange Money',
    'MTN Mobile Money',
    'Moov Money',
    'Wave',
    'Free Money'
  ];

  return (
    <div className="min-h-screen bg-gray-50 animate-slideInRight">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Bank Card Info</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Wallet Selection */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
            Portefeuille
          </label>
          <div className="relative">
            <button
              onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-gray-500">
                {selectedWallet || 'Veuillez sélectionner un portefeuille'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showWalletDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showWalletDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-slideDown">
                {walletOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedWallet(option);
                      setShowWalletDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Holder Name */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Nom du Titulaire de la Carte
          </label>
          <input
            type="text"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="Nom du titulaire du compte"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
          />
        </div>

        {/* Card Number */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Hash className="w-5 h-5 mr-2 text-blue-600" />
            Numéro de Carte
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Numéro de portefeuille mobile"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-100"
          />
        </div>

        {/* USDT TRC-20 */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-300">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
            USDT TRC-20
          </label>
          <input
            type="text"
            value={usdtAddress}
            onChange={(e) => setUsdtAddress(e.target.value)}
            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-600 font-medium"
            readOnly
          />
        </div>

        {/* Transaction Password */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp delay-400">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-blue-600" />
            Mot de Passe de Transaction
          </label>
          <input
            type="password"
            value={transactionPassword}
            onChange={(e) => setTransactionPassword(e.target.value)}
            className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            readOnly
          />
        </div>

        {/* Add Mobile Wallet Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-fadeInUp delay-500">
          Ajouter un portefeuille mobile
        </button>

        {/* Explanation */}
        <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-400 animate-fadeInUp delay-600">
          <h3 className="text-blue-600 font-semibold mb-3">Explication</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. Vous pouvez uniquement ajouter un portefeuille de transfert mobile pour les retraits.</p>
            <p>2. Veuillez vous assurer que le numéro de portefeuille de transfert mobile est correct et fonctionnel.</p>
          </div>
        </div>
      </div>
    </div>
  );
};