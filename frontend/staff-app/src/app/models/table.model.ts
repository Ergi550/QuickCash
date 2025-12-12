export interface Table {
  table_id: number;
  table_number: string;
  table_name: string;
  seating_capacity: number;
  location_zone: 'indoor' | 'outdoor' | 'vip';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  current_order_id?: number;
  is_active: boolean;
}
