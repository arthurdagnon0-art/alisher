import React from 'react';
import { ArrowLeft, Users, TrendingUp, Award, Building } from 'lucide-react';

interface AboutUsPageProps {
  onBack: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onBack }) => {
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
          <h1 className="text-xl font-bold flex-1 text-center">À Propos de Nous</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-xl p-6 shadow-xl animate-fadeInUp">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-white font-bold text-xs leading-tight text-center font-gothic">Alisher<br/>USMANOV</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ABOUT US</h2>
          </div>

          {/* Professional Image */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg animate-scaleIn delay-200">
            <img 
              src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Alisher USMANOV Professional" 
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="space-y-4 animate-fadeInUp delay-300">
            <h3 className="text-xl font-bold text-gray-900">
              USMANOV offers a better, more modern way to build and manage wealth
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Everything we do as a company is focused on helping our clients take ownership of their financial futures.
            </p>
          </div>
        </div>

        {/* Who We Serve Section */}
        <div className="bg-white rounded-xl p-6 shadow-xl animate-fadeInUp delay-400">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Who We Serve
          </h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our 32,100 employees are champions of investors and those who serve them.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            * Beginning in the fourth quarter 2023, Retirement Plan Participants was expanded to include accounts in Stock Plan Services, Designated Brokerage Services, and Retirement Business Services. Participants may be enrolled in services in more than one Workplace business. Prior periods have been recast to reflect this change.
          </p>
        </div>

        {/* Individual Investors Section */}
        <div className="bg-white rounded-xl p-6 shadow-xl animate-fadeInUp delay-500">
          <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Individual Investor" 
              className="w-full h-48 object-cover"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
            Individual Investors
          </h3>
          <p className="text-gray-600 leading-relaxed">
            We provide comprehensive investment solutions for individual investors looking to build and manage their wealth effectively.
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl animate-fadeInUp delay-600">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center transform hover:scale-110 transition-all duration-300">
              <Building className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="text-2xl font-bold">32,100</p>
              <p className="text-sm opacity-90">Employés</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-all duration-300">
              <Award className="w-8 h-8 mx-auto mb-2 animate-pulse delay-300" />
              <p className="text-2xl font-bold">2023</p>
              <p className="text-sm opacity-90">Depuis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};