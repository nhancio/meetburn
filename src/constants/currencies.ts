export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  // Americas
  { code: 'USD', symbol: '$', label: '$ USD', locale: 'en-US' },
  { code: 'CAD', symbol: 'C$', label: 'C$ CAD', locale: 'en-CA' },
  { code: 'BRL', symbol: 'R$', label: 'R$ BRL', locale: 'pt-BR' },
  { code: 'MXN', symbol: 'MX$', label: 'MX$ MXN', locale: 'es-MX' },
  { code: 'ARS', symbol: 'AR$', label: 'AR$ ARS', locale: 'es-AR' },
  { code: 'CLP', symbol: 'CL$', label: 'CL$ CLP', locale: 'es-CL' },
  { code: 'COP', symbol: 'CO$', label: 'CO$ COP', locale: 'es-CO' },

  // Europe
  { code: 'EUR', symbol: '€', label: '€ EUR', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: '£ GBP', locale: 'en-GB' },
  { code: 'CHF', symbol: 'Fr', label: 'Fr CHF', locale: 'de-CH' },
  { code: 'SEK', symbol: 'kr', label: 'kr SEK', locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', label: 'kr NOK', locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr', label: 'kr DKK', locale: 'da-DK' },
  { code: 'PLN', symbol: 'zł', label: 'zł PLN', locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', label: 'Kč CZK', locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', label: 'Ft HUF', locale: 'hu-HU' },
  { code: 'RON', symbol: 'lei', label: 'lei RON', locale: 'ro-RO' },
  { code: 'TRY', symbol: '₺', label: '₺ TRY', locale: 'tr-TR' },
  { code: 'RUB', symbol: '₽', label: '₽ RUB', locale: 'ru-RU' },
  { code: 'UAH', symbol: '₴', label: '₴ UAH', locale: 'uk-UA' },

  // Asia & Pacific
  { code: 'INR', symbol: '₹', label: '₹ INR', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', label: '¥ JPY', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', label: '¥ CNY', locale: 'zh-CN' },
  { code: 'KRW', symbol: '₩', label: '₩ KRW', locale: 'ko-KR' },
  { code: 'SGD', symbol: 'S$', label: 'S$ SGD', locale: 'en-SG' },
  { code: 'HKD', symbol: 'HK$', label: 'HK$ HKD', locale: 'zh-HK' },
  { code: 'TWD', symbol: 'NT$', label: 'NT$ TWD', locale: 'zh-TW' },
  { code: 'THB', symbol: '฿', label: '฿ THB', locale: 'th-TH' },
  { code: 'MYR', symbol: 'RM', label: 'RM MYR', locale: 'ms-MY' },
  { code: 'IDR', symbol: 'Rp', label: 'Rp IDR', locale: 'id-ID' },
  { code: 'PHP', symbol: '₱', label: '₱ PHP', locale: 'en-PH' },
  { code: 'VND', symbol: '₫', label: '₫ VND', locale: 'vi-VN' },
  { code: 'PKR', symbol: 'Rs', label: 'Rs PKR', locale: 'ur-PK' },
  { code: 'BDT', symbol: '৳', label: '৳ BDT', locale: 'bn-BD' },
  { code: 'LKR', symbol: 'Rs', label: 'Rs LKR', locale: 'si-LK' },
  { code: 'AUD', symbol: 'A$', label: 'A$ AUD', locale: 'en-AU' },
  { code: 'NZD', symbol: 'NZ$', label: 'NZ$ NZD', locale: 'en-NZ' },

  // Middle East & Africa
  { code: 'AED', symbol: 'د.إ', label: 'د.إ AED', locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼', label: '﷼ SAR', locale: 'ar-SA' },
  { code: 'QAR', symbol: 'ر.ق', label: 'ر.ق QAR', locale: 'ar-QA' },
  { code: 'KWD', symbol: 'د.ك', label: 'د.ك KWD', locale: 'ar-KW' },
  { code: 'BHD', symbol: '.د.ب', label: '.د.ب BHD', locale: 'ar-BH' },
  { code: 'OMR', symbol: 'ر.ع.', label: 'ر.ع. OMR', locale: 'ar-OM' },
  { code: 'EGP', symbol: 'E£', label: 'E£ EGP', locale: 'ar-EG' },
  { code: 'ZAR', symbol: 'R', label: 'R ZAR', locale: 'en-ZA' },
  { code: 'NGN', symbol: '₦', label: '₦ NGN', locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh', label: 'KSh KES', locale: 'en-KE' },
  { code: 'ILS', symbol: '₪', label: '₪ ILS', locale: 'he-IL' },
];

export const INDUSTRY_PRESETS = [
  { label: 'Tech', salary: 130000 },
  { label: 'Finance', salary: 120000 },
  { label: 'Consulting', salary: 140000 },
  { label: 'Healthcare', salary: 90000 },
  { label: 'Education', salary: 65000 },
  { label: 'Government', salary: 80000 },
  { label: 'Agency', salary: 95000 },
  { label: 'Startup', salary: 110000 },
];

export const SALARY_PRESETS = [50000, 75000, 100000, 150000];

export const COST_MILESTONES = [100, 250, 500, 1000, 2500, 5000];
