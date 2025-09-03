import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { supportedCountries } from '../data/investments';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  placeholder?: string;
}

// Codes téléphoniques par pays
const phoneCountryCodes = {
  'BJ': '+229',
  'TG': '+228', 
  'CI': '+225',
  'CM': '+237',
  'SN': '+221',
  'BF': '+226',
  'GA': '+241',
  'CD': '+243'
};

export const PhoneInput: React.FC<PhoneInputProps> = ({ 
  value, 
  onChange, 
  selectedCountry,
  onCountryChange,
  placeholder 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const selectedCountryData = supportedCountries.find(c => c.code === selectedCountry);
  const selectedCode = phoneCountryCodes[selectedCountry] || '+229';

  return (
    <div className="space-y-2">
      <label className="block text-xs xxs:text-sm font-medium text-gray-700">
        Pays et Numéro de Téléphone
      </label>
      
      <div className="flex flex-col xxs:flex-row space-y-2 xxs:space-y-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-2 xxs:px-3 py-2 xxs:py-3 bg-gray-100 border xxs:border-r-0 rounded-lg xxs:rounded-l-lg xxs:rounded-r-none text-xs xxs:text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[100px] xxs:min-w-[120px] w-full xxs:w-auto justify-between xxs:justify-start"
          >
            <div className="flex items-center">
              <span className="mr-1 xxs:mr-2">{selectedCountryData?.flag}</span>
              <span className="mr-1">{selectedCode}</span>
            </div>
            <ChevronDown className="w-3 h-3 xxs:w-4 xxs:h-4" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 xxs:right-auto z-10 mt-1 bg-white border rounded-lg shadow-lg min-w-[200px] max-h-60 overflow-y-auto">
              {supportedCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onCountryChange(country.code);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-left text-xs xxs:text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="mr-3">{country.flag}</span>
                  <div>
                    <div className="font-medium">{country.name}</div>
                    <div className="text-[10px] xxs:text-xs text-gray-500">{phoneCountryCodes[country.code]}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 relative">
          <input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "288639"}
            className="w-full px-3 py-2 xxs:py-3 border rounded-lg xxs:rounded-l-none xxs:rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm xxs:text-base"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3 xxs:w-4 xxs:h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="text-[10px] xxs:text-xs text-gray-500 flex items-center mt-1">
        <span className="mr-2">{selectedCode}</span>
        <span>{selectedCountryData?.name}</span>
      </div>
    </div>
  );
};