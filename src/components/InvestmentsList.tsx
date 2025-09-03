import React, { useState, useEffect } from "react";
import { Zap, ArrowLeft, Crown } from "lucide-react";
import { InvestmentService } from "../services/investmentService";

interface InvestmentsListProps {
  onBack?: () => void;
  user?: any;
}

export const InvestmentsList: React.FC<InvestmentsListProps> = ({
  onBack,
  user,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("VIPs");
  const [activeTab, setActiveTab] = useState("vip");
  const [vipPackages, setVipPackages] = useState<any[]>([]);
  const [stakingPlans, setStakingPlans] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvestmentData();
  }, []);

  const loadInvestmentData = async () => {
    setIsLoadingData(true);
    try {
      const vipResult = await InvestmentService.getVIPPackages();
      if (vipResult.success) setVipPackages(vipResult.data);

      const stakingResult = await InvestmentService.getStakingPlans();
      if (stakingResult.success) setStakingPlans(stakingResult.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount);
  };

  const handleInvest = async (packageData: any, type: "vip" | "staking") => {
    setSelectedPackage({ ...packageData, type });
    setShowInvestModal(true);
  };

  const confirmInvestment = async () => {
    if (!investAmount || !selectedPackage || !user) {
      setError("Informations manquantes");
      return;
    }

    const amount = parseFloat(investAmount);
    if (amount < selectedPackage.min_amount) {
      setError(
        `Montant minimum: ${selectedPackage.min_amount.toLocaleString()} FCFA`
      );
      return;
    }

    if (selectedPackage.type === "vip" && amount > selectedPackage.max_amount) {
      setError(
        `Montant maximum: ${selectedPackage.max_amount.toLocaleString()} FCFA`
      );
      return;
    }

    if (amount > user.balance_deposit) {
      setError("Solde insuffisant");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let result;
      if (selectedPackage.type === "vip") {
        result = await InvestmentService.createVIPInvestment(
          user.id,
          selectedPackage.id,
          amount
        );
      } else {
        result = await InvestmentService.createStakingInvestment(
          user.id,
          selectedPackage.id,
          amount
        );
      }

      if (result.success) {
        alert(
          `Investissement ${selectedPackage.type.toUpperCase()} créé avec succès !`
        );
        setShowInvestModal(false);
        setInvestAmount("");
        window.location.reload();
      } else {
        setError(result.error || "Erreur lors de l'investissement");
      }
    } catch (error: any) {
      setError(error.message || "Erreur lors de l'investissement");
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    {
      id: "VIPs",
      label: "VIPs",
      src: "https://i.postimg.cc/SKC9pmqt/vip-icon-1.png",
    },
    {
      id: "STAKINGS",
      label: "STAKINGS",
      src: "https://i.postimg.cc/sDH7YnwK/invest-active.png",
    },
  ];

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-blue-500 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold flex-1 text-center">
            Liste des Investissements
          </h1>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-16 sm:w-20 bg-white shadow-sm border-r border-gray-200">
          <div className="py-4 flex flex-col items-center space-y-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`w-full p-3 flex flex-col items-center text-xs transition-all duration-300 ${
                  selectedFilter === filter.id
                    ? "bg-blue-100 text-blue-600 border-r-4 border-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <img
                  src={filter.src}
                  className="w-6 h-6 mb-1"
                  alt={filter.label}
                />
                <span className="font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 p-2 sm:p-4">
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setActiveTab("vip")}
                className={`flex-1 py-2 sm:py-3 font-medium text-sm sm:text-base transition-all ${
                  activeTab === "vip"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                VIP Packs
              </button>
              <button
                onClick={() => setActiveTab("staking")}
                className={`flex-1 py-2 sm:py-3 font-medium text-sm sm:text-base transition-all ${
                  activeTab === "staking"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Staking
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTab === "vip" &&
                vipPackages.map((vip, index) => (
                  <div
                    key={vip.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-[8px] text-center leading-tight">
                          Alisher
                          <br />
                          USMANOV
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                            {vip.name}
                          </h3>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            {vip.name}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Taux:</span>
                            <span className="text-green-600 font-bold">
                              {vip.daily_rate}% / jour
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Durée:</span>
                            <span className="text-orange-600 font-medium">
                              Illimitée
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-blue-600 font-bold text-sm">
                            FCFA {formatAmount(vip.min_amount)}
                            <div className="text-gray-500 text-xs">
                              à {formatAmount(vip.max_amount)}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleInvest(
                                {
                                  ...vip,
                                  title: `Titres à revenu fixe - ${vip.name}`,
                                },
                                "vip"
                              )
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transform hover:scale-105 transition-all flex items-center shadow-md"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Investir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {activeTab === "staking" &&
                stakingPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-tr from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-[8px] text-center leading-tight">
                          Alisher
                          <br />
                          USMANOV
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                            {plan.name}
                          </h3>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                            {plan.duration_days}J
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Taux:</span>
                            <span className="text-green-600 font-bold">
                              {plan.daily_rate}% / jour
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Durée:</span>
                            <span className="text-blue-600 font-medium">
                              {plan.duration_days} jours
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Total:</span>
                            <span className="text-purple-600 font-bold">
                              {(plan.daily_rate * plan.duration_days).toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-blue-600 font-bold text-sm">
                            FCFA {formatAmount(plan.min_amount)}
                          </div>
                          <button
                            onClick={() => handleInvest(plan, "staking")}
                            className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-green-700 transform hover:scale-105 transition-all flex items-center shadow-md"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Staker
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvestModal(false);
              setError("");
              setInvestAmount("");
            }
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center space-x-3 p-5 border-b border-gray-100">
              <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-[8px] text-center leading-tight">
                  Alisher
                  <br />
                  USMANOV
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {selectedPackage?.name}
                </h3>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold flex items-center w-fit mt-1">
                  <Crown className="w-3 h-3 mr-1" />
                  {selectedPackage?.type === "vip"
                    ? selectedPackage?.name
                    : `${selectedPackage?.duration_days}J`}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Prix Unitaire</span>
                  <span className="font-bold text-blue-600">
                    FCFA {formatAmount(selectedPackage?.min_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taux</span>
                  <span className="font-bold text-green-600">
                    {selectedPackage?.daily_rate?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Durée</span>
                  <span className="font-bold text-gray-800">
                    {selectedPackage?.type === "vip"
                      ? "∞"
                      : `${selectedPackage?.duration_days} jours`}
                  </span>
                </div>
              </div>

              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder={`Min: ${formatAmount(
                  selectedPackage?.min_amount || 0
                )}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {/* Solde */}
              <div className="bg-yellow-50 rounded-lg p-3 text-sm border-l-4 border-yellow-400">
                <p>
                  <strong>Solde disponible:</strong>{" "}
                  <span
                    className={`font-bold ${
                      (user?.balance_deposit || 0) >=
                      (parseFloat(investAmount) ||
                        selectedPackage?.min_amount ||
                        0)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    FCFA {formatAmount(user?.balance_deposit || 0)}
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={confirmInvestment}
                disabled={
                  isLoading ||
                  (user?.balance_deposit || 0) <
                    (parseFloat(investAmount) ||
                      selectedPackage?.min_amount ||
                      0)
                }
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
              >
                {isLoading ? "Traitement..." : "Confirmer l’investissement"}
              </button>
              <button
                onClick={() => {
                  setShowInvestModal(false);
                  setError("");
                  setInvestAmount("");
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
