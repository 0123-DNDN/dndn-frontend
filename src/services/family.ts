import { api } from '@/services/api';

import type {
  ConnectionCodeResponse,
  FamilyConnectRequest,
  FamilyMember,
  FamilyRelationResponse,
} from '@/types/family';

export async function createFamilyConnectionCode(): Promise<ConnectionCodeResponse> {
  const response =
    await api.post<ConnectionCodeResponse>(
      '/api/family/code',
    );

  return response.data;
}

export async function connectFamily(
  request: FamilyConnectRequest,
): Promise<FamilyRelationResponse> {
  const response =
    await api.post<FamilyRelationResponse>(
      '/api/family/connect',
      request,
    );

  return response.data;
}

export async function getFamilyRelation(): Promise<FamilyRelationResponse> {
  const response =
    await api.get<FamilyRelationResponse>(
      '/api/family/relation',
    );

  return response.data;
}

/*
 * 기존 코드 호환용.
 * 실제 가족 목록 조회 API는 아직 없음.
 */
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  return [];
}