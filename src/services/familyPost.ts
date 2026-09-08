import { api } from '@/services/api';

import type {
  FamilyPostImage,
  FamilyPostResponse,
  TodayFamilyPostsResponse,
} from '@/types/familyPost';

export async function createFamilyPost(
  relationshipId: number,
  image: FamilyPostImage,
  message?: string,
): Promise<FamilyPostResponse> {
  const formData = new FormData();

  formData.append(
    'relationshipId',
    String(relationshipId),
  );

  if (message?.trim()) {
    formData.append(
      'message',
      message.trim(),
    );
  }

  formData.append(
    'image',
    {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any,
  );

  const response =
    await api.post<FamilyPostResponse>(
      '/api/family-posts',
      formData,
      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      },
    );

  return response.data;
}

export async function getTodayFamilyPosts(): Promise<TodayFamilyPostsResponse> {
  const response =
    await api.get<TodayFamilyPostsResponse>(
      '/api/family-posts/today',
    );

  return response.data;
}

export function getFamilyPostImageUrl(
  imageUrl: string | null,
): string | null {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://')
  ) {
    return imageUrl;
  }

  const baseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}${imageUrl}`;
}