// Utilitaires pour la gestion unifiée du solde unique sur toute la plateforme
export class BalanceUtils {
  // Calculer le solde total disponible (UNIQUE pour toute la plateforme)
  // Ce solde sert pour TOUT : investissements VIP, staking ET retraits
  static getTotalAvailableBalance(user: any): number {
    if (!user) return 0;
    
    const balanceDeposit = Number(user?.balance_deposit) || 0;
    const balanceWithdrawal = Number(user?.balance_withdrawal) || 0;
    const totalBalance = balanceDeposit + balanceWithdrawal;
    
    console.log('💰 BalanceUtils - Calcul solde total:', {
      userId: user?.id,
      balance_deposit: balanceDeposit,
      balance_withdrawal: balanceWithdrawal,
      total_available: totalBalance
    });
    
    return totalBalance;
  }

  // Formater le solde pour l'affichage (sans décimales)
  static formatBalance(amount: number): string {
    return Math.floor(amount).toLocaleString();
  }

  // Vérifier si le solde est suffisant pour une opération
  static hasSufficientBalance(user: any, requiredAmount: number): boolean {
    const available = this.getTotalAvailableBalance(user);
    const sufficient = available >= requiredAmount;
    
    console.log('🔍 BalanceUtils - Vérification solde:', {
      available,
      required: requiredAmount,
      sufficient
    });
    
    return sufficient;
  }

  // Calculer les frais de retrait
  static calculateWithdrawalFees(amount: number, feeRate: number = 10): number {
    return Math.floor((amount * feeRate) / 100);
  }

  // Calculer le montant total avec frais
  static calculateTotalWithFees(amount: number, feeRate: number = 10): number {
    return amount + this.calculateWithdrawalFees(amount, feeRate);
  }

  // Obtenir le solde disponible formaté pour affichage
  static getFormattedAvailableBalance(user: any): string {
    return `FCFA${this.formatBalance(this.getTotalAvailableBalance(user))}`;
  }
}