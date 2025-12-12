export interface Customer {
  customer_id: number;
  customer_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  total_spent: number;
  total_orders: number;
  is_member: boolean;
  referral_code?: string;
  membership_card?: MembershipCard;
}
export interface MembershipCard {
  card_id: number;
  customer_id: number;
  card_number: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  discount_percentage: number;
  is_active: boolean;
}