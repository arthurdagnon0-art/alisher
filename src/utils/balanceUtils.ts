// Utilitaires pour la gestion unifiée du solde
export class BalanceUtils {
  // Calculer le solde total disponible (unique pour toute la plateforme)
  static getTotalAvailableBalance(user: any): number {
    const balanceDeposit = Number(user?.balance_deposit) || 0;
    const balanceWithdrawal = Number(user?.balance_withdrawal) || 0;
    return balanceDeposit + balanceWithdrawal;
  }

  // Formater le solde pour l'affichage
  static formatBalance(amount: number): string {
    return amount.toLocaleString();
  }

  // Vérifier si le solde est suffisant
  static hasSufficientBalance(user: any, requiredAmount: number): boolean {
    return this.getTotalAvailableBalance(user) >= requiredAmount;
  }

  // Calculer les frais de retrait
  static calculateWithdrawalFees(amount: number, feeRate: number = 10): number {
    return (amount * feeRate) / 100;
  }

  // Calculer le montant total avec frais
  static calculateTotalWithFees(amount: number, feeRate: number = 10): number {
    return amount + this.calculateWithdrawalFees(amount, feeRate);
  }
}