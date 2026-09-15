export const EMISSION_FACTORS: Record<string, { factor: number; unit: string; category: string }> = {
  "Car travel": { factor: 0.20, unit: "km", category: "Transport" },
  "Bus travel": { factor: 0.08, unit: "km", category: "Transport" },
  "Flight": { factor: 0.25, unit: "km", category: "Transport" },
  "Electricity": { factor: 0.80, unit: "kWh", category: "Electricity" },
  "Vegetarian meal": { factor: 0.5, unit: "meals", category: "Food" },
  "Non-vegetarian meal": { factor: 2.0, unit: "meals", category: "Food" },
};

export const ACTIVITY_TYPES = Object.keys(EMISSION_FACTORS);

export function calculateCO2(type: string, quantity: number): number {
  const info = EMISSION_FACTORS[type];
  if (!info) return 0;
  return quantity * info.factor;
}

export function getCategory(type: string): string {
  return EMISSION_FACTORS[type]?.category || "Other";
}

export function getUnit(type: string): string {
  return EMISSION_FACTORS[type]?.unit || "";
}
