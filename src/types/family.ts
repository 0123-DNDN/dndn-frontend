export type FamilyRelationshipStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'REJECTED';

export type ConnectionCodeResponse = {
  code: string;
  expiresAt: string;
};

export type FamilyConnectRequest = {
  code: string;
};

export type FamilyRelationResponse = {
  relationshipId: number;
  seniorUserId: number;
  guardianUserId: number;
  status: FamilyRelationshipStatus | string;
};

export type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
};

export type FamilyPost = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
};