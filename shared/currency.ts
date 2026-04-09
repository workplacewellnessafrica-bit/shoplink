/**
 * Currency configuration for ShopLink
 * Base currency: KSH (Kenyan Shilling)
 */

export const CURRENCY = {
  code: "KSH",
  symbol: "KSh",
  name: "Kenyan Shilling",
  locale: "en-KE",
  decimalPlaces: 0, // KSH typically uses whole numbers
} as const;

/**
 * Format a price in KSH
 * @param amount - Price amount in KSH
 * @returns Formatted price string (e.g., "KSh 1,500")
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return `${CURRENCY.symbol} 0`;
  }

  const formatter = new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: CURRENCY.decimalPlaces,
    maximumFractionDigits: CURRENCY.decimalPlaces,
  });

  return formatter.format(amount);
}

/**
 * Format a price for display (shorter format)
 * @param amount - Price amount in KSH
 * @returns Formatted price string (e.g., "KSh1,500")
 */
export function formatPriceShort(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return `${CURRENCY.symbol}0`;
  }

  return `${CURRENCY.symbol}${new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: CURRENCY.decimalPlaces,
    maximumFractionDigits: CURRENCY.decimalPlaces,
  }).format(amount)}`;
}

/**
 * Parse a price string to number
 * @param priceString - Price string (e.g., "1500" or "1,500")
 * @returns Parsed price as number
 */
export function parsePrice(priceString: string): number {
  return parseInt(priceString.replace(/[^0-9]/g, ""), 10) || 0;
}

/**
 * Validate if a value is a valid price
 * @param value - Value to validate
 * @returns True if valid price
 */
export function isValidPrice(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}
