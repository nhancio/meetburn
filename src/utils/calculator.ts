export interface MeetingCalculation {
  costPerSecond: number;
  costPerMinute: number;
  hourlyRate: number;
}

export function calculateMeetingRate(
  numberOfPeople: number,
  averageAnnualSalary: number,
  workingHoursPerWeek: number = 40,
  workingWeeksPerYear: number = 52
): MeetingCalculation {
  const hourlyRate = averageAnnualSalary / (workingWeeksPerYear * workingHoursPerWeek);
  const costPerSecond = (hourlyRate * numberOfPeople) / 3600;
  const costPerMinute = costPerSecond * 60;
  return { costPerSecond, costPerMinute, hourlyRate };
}

export function calculateTotalCost(costPerSecond: number, seconds: number): number {
  return costPerSecond * seconds;
}

export function calculateCostPerPerson(totalCost: number, numberOfPeople: number): number {
  return totalCost / numberOfPeople;
}

export function calculateMonthlyImpact(totalCost: number): number {
  return totalCost * 4; // if repeated weekly
}

export function formatCurrency(
  amount: number,
  currencySymbol: string = '$',
  showDecimals: boolean = true
): string {
  const absAmount = Math.abs(amount);
  if (showDecimals) {
    const formatted = absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${currencySymbol}${formatted}`;
  }
  const formatted = Math.round(absAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currencySymbol}${formatted}`;
}

export function formatSalary(amount: number): string {
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount}`;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDurationShort(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
