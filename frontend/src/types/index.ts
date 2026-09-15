export interface Activity {
  id: number;
  type: string;
  quantity: number;
  unit: string;
  emission_factor: number;
  co2_kg: number;
  date: string;
  created_at: string;
}

export interface Settings {
  id: number;
  weekly_target_kg: number;
}
