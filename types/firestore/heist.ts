import { DocumentData, QueryDocumentSnapshot, FieldValue } from 'firebase/firestore';

export type FinalStatus = 'success' | 'failure' | null;

// Document — what you read from Firestore (after conversion)
export interface Heist {
  id: string;
  createdAt: Date;
  title: string;
  description: string;
  createdBy: string; // UID
  createdByCodename: string; // display name
  assignedTo: string; // UID
  assignedToCodename: string; // display name
  deadline: Date; // 48 hours from creation
  finalStatus: FinalStatus;
}

// Create Input — what you pass to addDoc
export interface CreateHeistInput {
  title: string;
  description: string;
  createdBy: string;
  createdByCodename: string;
  assignedTo: string;
  assignedToCodename: string;
  deadline: Date;
  createdAt: FieldValue; // serverTimestamp()
  finalStatus: null; // always null on creation
}

// Update Input — partial fields for updateDoc (no createdAt)
export interface UpdateHeistInput {
  title?: string;
  description?: string;
  assignedTo?: string;
  assignedToCodename?: string;
  deadline?: Date;
  finalStatus?: FinalStatus;
}

export const heistConverter = {
  toFirestore: (data: Partial<Heist | CreateHeistInput>): DocumentData => data,

  fromFirestore: (snapshot: QueryDocumentSnapshot): Heist => ({
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate(),
    deadline: snapshot.data().deadline?.toDate(),
  } as Heist),
};
