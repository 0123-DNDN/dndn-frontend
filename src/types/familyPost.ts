export type FamilyPostResponse = {
  familyPostId: number;
  relationshipId: number;
  targetDate: string;
  imageUrl: string | null;
  message: string | null;
};

export type TodayFamilyPostsResponse = {
  unlocked: boolean;
  posts: FamilyPostResponse[];
};

export type FamilyPostImage = {
  uri: string;
  name: string;
  type: string;
};