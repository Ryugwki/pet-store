// Minimal populated parent shape (father/mother), as returned when the
// backend populates the lineage references on a kitten.
export interface PetParentRef {
  _id: string;
  name: string;
  category?: string;
  petImages?: string[];
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  litter: string[];
  category?: "Kings" | "Queens" | "Kittens";
  // Keep UI-friendly casing while backend stores lowercase
  gender: "male" | "female";
  dob?: string;
  pedigreeURL?: string;
  description: string;
  petImages: string[];
  pedigreeImages?: string[];
  awardsImages?: string[];
  certificateImages?: string[];
  cattery?: string;
  // Coefficient of inbreeding + registry body (e.g. "WCF", "CFA").
  coi?: number | string;
  registry?: string;
  health: {
    vaccinated: boolean;
    dewormed: boolean;
    healthCertificate: boolean;
  };
  characteristics: {
    size?: string;
    color: string;
    weight?: number;
    personality: string[];
  };
  // Lineage references + optional populated parents.
  fatherId?: string;
  motherId?: string;
  father?: PetParentRef;
  mother?: PetParentRef;
  location: string;
  createdAt: string;
  updatedAt: string;
}
