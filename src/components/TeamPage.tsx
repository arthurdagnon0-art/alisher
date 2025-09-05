import React from 'react';
import { ArrowLeft, Copy, Users, TrendingUp, Award } from 'lucide-react';
import { referralRates } from '../data/investments';
import { User } from '../types';
import { ReferralService } from '../services/referralService';

interface TeamPageProps {
  user: User;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ user, onBack }) => {
}
export const TeamPage: React.FC<TeamPageProps> = ({ user, onBack, onNavigate }) => {
  const [teamStats, setTeamStats] = React.useState<any>({
    level1: { count: 0, active: 0, total_invested: 0 },
    level2: { count: 0, active: 0, total_invested: 0 },
    level3: { count: 0, active: 0, total_invested: 0 },
    total_commission: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadTeamStats();
  }, [user?.id]);

  const loadTeamStats = async () => {
    if (!user?.id) return;
    
    try {
      const result = await ReferralService.getTeamStats(user.id);
      if (result.success) {
        setTeamStats(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats équipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`https://clone-de-l-applicati-e9f9.bolt.host/?invitation_code=${user?.referral_code || 'XXXXXX'}`);
    alert('Lien d\'invitation copié !');
  };

  return (
    <div className="min-h-screen font-gothic bg-gradient-to-br from-blue-600 to-purple-700 animate-slideInRight">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">Équipe</h1>
        </div>
      </div>

      {/* Commission Section */}
      <div className="bg-blue-600 text-white px-4 pb-6">
        <div className="mb-4 animate-fadeInUp">
          <p className="text-sm opacity-90 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Commission
          </p>
          <p className="text-3xl font-bold">
            FCFA{isLoading ? '...' : teamStats.total_commission.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Team Illustration */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-xl p-6 shadow-xl mb-6 animate-fadeInUp delay-100">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Animated team illustration */}

            </div>
          </div>

          <div className="flex items-center space-x-3 bg-blue-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Lien d'invitation</p>
              <p className="text-xs text-gray-500 break-all">https://clone-de-l-applicati-e9f9.bolt.host/?invitation_code={user?.referral_code || 'XXXXXX'}</p>
            </div>
            <button
              onClick={handleCopyInviteLink}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Copier
            </button>
          </div>
        </div>
      </div>

      {/* Team Levels */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white text-lg flex items-center">
            <Award className="w-6 h-6 mr-2" />
            Niveau de l'équipe
          </h3>
          <button 
            onClick={() => onNavigate('team-details')}
            className="text-white text-sm flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-all duration-300"
          >
            Détails de l'équipe &gt;
          </button>
        </div>

        <div className="space-y-4">
          {/* Niveau 1 */}
          <div className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 rounded-xl p-6 text-white relative overflow-hidden shadow-xl animate-fadeInLeft delay-100 hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="font-gothic-italic text-xl">Niveau 1</span>
              <div className="w-12 h-12 bg-black bg-opacity-40 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-2xl"><img src='https://i.postimg.cc/90JTN1Vm/lv1.png' width={30} /></span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center relative z-10">
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{referralRates.level1}%</p>
                <p className="text-xs opacity-90">Remise Niveau 1</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{isLoading ? '...' : teamStats.level1.count}</p>
                <p className="text-xs opacity-90">Total invités</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{isLoading ? '...' : teamStats.level1.active}</p>
                <p className="text-xs opacity-90">Actifs</p>
              </div>
            </div>
          </div>

          {/* Niveau 2 */}
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden shadow-xl animate-fadeInLeft delay-200 hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="font-gothic-italic text-xl">Niveau 2</span>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse delay-300">
                <span className="text-2xl"><img src='https://i.postimg.cc/RhMKRykp/lv2.png' width={30} /></span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center relative z-10">
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{referralRates.level2}%</p>
                <p className="text-xs opacity-90">Remise Niveau 2</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{isLoading ? '...' : teamStats.level2.count}</p>
                <p className="text-xs opacity-90">Total invités</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{isLoading ? '...' : teamStats.level2.active}</p>
                <p className="text-xs opacity-90">Actifs</p>
              </div>
            </div>
          </div>

          {/* Level 3 */}
          <div className="bg-gradient-to-r from-red-400 via-pink-500 to-red-600 rounded-xl p-6 text-white relative overflow-hidden shadow-xl animate-fadeInLeft delay-300 hover:scale-105 transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -ml-10 -mb-10"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="font-gothic-italic text-xl">Level3</span>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse delay-500">
                <span className="text-2xl"><img src='https://i.postimg.cc/xCVKkct2/lv3.png' width={30} /></span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center relative z-10">
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{referralRates.level3}%</p>
                <p className="text-xs opacity-90">Remise Niveau 3</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{isLoading ? '...' : teamStats.level3.count}</p>
                <p className="text-xs opacity-90">Total invités</p>
              </div>
              <div className="transform hover:scale-110 transition-all duration-300">
                <p className="text-3xl font-bold mb-1">{isLoading ? '...' : teamStats.level3.active}</p>
                <p className="text-xs opacity-90">Actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};