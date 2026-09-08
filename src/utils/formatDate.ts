export function formatDate(value: string | Date): string { return new Date(value).toLocaleDateString('ko-KR'); }
