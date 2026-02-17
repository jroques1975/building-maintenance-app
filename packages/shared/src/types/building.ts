export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalUnits: number;
  managerId?: string;
  yearBuilt?: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface CreateBuildingDto {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalUnits: number;
  managerId?: string;
  yearBuilt?: number;
  imageUrl?: string;
}

export interface UpdateBuildingDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  totalUnits?: number;
  managerId?: string;
  yearBuilt?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  isOccupied: boolean;
  tenantId?: string;
  notes?: string;
}