import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, TrendingUp, Award, Eye, Calendar, Phone, DollarSign } from 'lucide-react';
import { ReferralService } from '../services/referralService';

interface TeamDetailsPageProps {
  user: any;
  onBack: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  total_invested: number;
  is_active: boolean;
  created_at: string;
}

export const TeamDetailsPage: React.FC<TeamDetailsPageProps> = ({ user, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamStats, setTeamStats] = useState<any>({
    level1: { count: 0, active: 0, total_invested: 0 },
    level2: { count: 0, active: 0, total_invested: 0 },
    level3: { count: 0, active: 0, total_invested: 0 },
    total_commission: 0
  });

  useEffect(() => {
    loadTeamStats();
    loadLevelDetails(selectedLevel as 1 | 2 | 3);
  }, [user?.id, selectedLevel]);

  const loadTeamStats = async () => {
    if (!user?.id) return;
    
    try {
      const result = await ReferralService.getTeamStats(user.id);
      if (result.success) {
        setTeamStats(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats équipe:', error);
    }
  };

  const loadLevelDetails = async (level: 1 | 2 | 3) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await ReferralService.getLevelDetails(user.id, level);
      if (result.success) {
        setTeamMembers(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des détails');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors du chargement des détails');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPhone = (phone: string) => {
    if (phone.length <= 6) return phone;
    return `${phone.substring(0, 3)}****${phone.slice(-3)}`;
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'from-orange-400 to-yellow-400';
      case 2: return 'from-blue-500 to-purple-500';
      case 3: return 'from-red-400 to-pink-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getLevelStats = (level: number) => {
    switch (level) {
      case 1: return teamStats.level1;
      case 2: return teamStats.level2;
      case 3: return teamStats.level3;
      default: return { count: 0, active: 0, total_invested: 0 };
    }
  };

  const currentLevelStats = getLevelStats(selectedLevel);

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
          <h1 className="text-xl font-bold flex-1 text-center">Détails de l'Équipe</h1>
        </div>
      </div>

      {/* Level Selector */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                selectedLevel === level
                  ? 'bg-white text-blue-600 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Niveau {level}
            </button>
          ))}
        </div>
      </div>

      {/* Level Stats Card */}
      <div className="p-4">
        <div className={`bg-gradient-to-r ${getLevelColor(selectedLevel)} rounded-xl p-6 text-white shadow-xl animate-fadeInUp`}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-gothic-italic text-2xl">Niveau {selectedLevel}</span>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
              <Award className="w-6 h-6" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="transform hover:scale-110 transition-all duration-300">
              <p className="text-3xl font-bold mb-1">{currentLevelStats.count}</p>
              <p className="text-xs opacity-90">Total Membres</p>
            </div>
            <div className="transform hover:scale-110 transition-all duration-300">
              <p className="text-3xl font-bold mb-1">{currentLevelStats.active}</p>
              <p className="text-xs opacity-90">Actifs</p>
            </div>
            <div className="transform hover:scale-110 transition-all duration-300">
              <p className="text-3xl font-bold mb-1">{Math.round((currentLevelStats.active / Math.max(currentLevelStats.count, 1)) * 100)}%</p>
              <p className="text-xs opacity-90">Taux d'Activité</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white border-opacity-30">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Total Investi par ce Niveau</span>
              <span className="text-xl font-bold">FCFA {currentLevelStats.total_invested?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="px-4 pb-24">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Membres du Niveau {selectedLevel}
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                {currentLevelStats.count}
              </span>
            </h3>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun membre</h3>
              <p className="text-gray-500">
                Aucun membre trouvé pour le niveau {selectedLevel}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="p-4 hover:bg-gray-50 transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{member.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          member.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span className="font-mono">{formatPhone(member.phone)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(member.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Investment Amount */}
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-bold">
                          {member.total_invested > 0 
                            ? `${member.total_invested.toLocaleString()}` 
                            : '0'
                          }
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">FCFA Investi</p>
                    </div>
                  </div>

                  {/* Commission Earned from this Member */}
                  {member.total_invested > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Commission gagnée</span>
                        <span className="font-bold text-purple-600">
                          FCFA {Math.round((member.total_invested * (selectedLevel === 1 ? 11 : selectedLevel === 2 ? 2 : 1)) / 100).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};