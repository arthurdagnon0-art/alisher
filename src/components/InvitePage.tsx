import React from 'react';
import { Share2, Copy, ArrowLeft, ChevronRight } from 'lucide-react';
import { referralRates } from '../data/investments';
import { ReferralService } from '../services/referralService';

interface InvitePageProps {
  user: any;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export const InvitePage: React.FC<InvitePageProps> = ({ user, onBack }) => {
  const [teamStats, setTeamStats] = React.useState<any>({
    level1: { count: 0, active: 0 },
    level2: { count: 0, active: 0 },
    level3: { count: 0, active: 0 },
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

  const inviteLink = `https://clone-de-l-applicati-e9f9.bolt.host/?invitation_code=${user?.referral_code || 'XXXXXX'}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Lien d\'invitation copié !');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rejoignez Alisher USMANOV Investment',
        text: 'Investissez et gagnez avec nous !',
        url: inviteLink
      });
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="mr-3">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold flex-1 text-center">invitation</h1>
        </div>
      </div>

      {/* Commission Section */}
      <div className="bg-blue-600 text-white px-4 pb-6">
        <div className="mb-4">
          <p className="text-sm opacity-90">Commission</p>
          <p className="text-2xl font-bold">
            FCFA{isLoading ? '...' : teamStats.total_commission.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Invite Link Section */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Lien d'invitation</p>
              <p className="text-xs text-gray-500 break-all">https://clone-de-l-applicati-e9f9.bolt.host/?invitation_code={user?.referral_code || 'XXXXXX'}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
            >
              Copier
            </button>
          </div>
        </div>
      </div>

      {/* Team Levels Section */}
      <div className="px-2 xxs:px-3 xs:px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Niveau de l'équipe</h3>
        </div>

        <div className="space-y-3">
          {/* Niveau 1 */}
          <div className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg p-4 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-gothic-italic">Niveau 1</span>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xs">🏆</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{referralRates.level1}%</p>
                <p className="text-xs opacity-90">Remise Niveau 1</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : teamStats.level1.count}</p>
                <p className="text-xs opacity-90">Total invités</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : teamStats.level1.active}</p>
                <p className="text-xs opacity-90">Actifs</p>
              </div>
            </div>
          </div>

          {/* Niveau 2 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-gothic-italic">Niveau 2</span>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xs">✈️</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{referralRates.level2}%</p>
                <p className="text-xs opacity-90">Remise Niveau 2</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : teamStats.level2.count}</p>
                <p className="text-xs opacity-90">Total invités</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : teamStats.level2.active}</p>
                <p className="text-xs opacity-90">Actifs</p>
              </div>
            </div>
          </div>

          {/* Level 3 */}
          <div className="bg-gradient-to-r from-red-400 to-pink-400 rounded-lg p-4 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-gothic-italic">Level3</span>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xs">🔺</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{referralRates.level3}%</p>
                <p className="text-xs opacity-90">Remise Niveau 3</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : teamStats.level3.count}</p>
                <p className="text-xs opacity-90">Total invités</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '...' : teamStats.level3.active}</p>
                <p className="text-xs opacity-90">Actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};