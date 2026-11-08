export interface CheckInPost {
  id: string;
  placeName: string;
  address: string | null;
  note: string | null;
  visitedAt: string;
  createdAt: string;
  imageUrl: string | null; 
  moods: string[];
  drinks: string[];
}
