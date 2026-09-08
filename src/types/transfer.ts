export type TransferStatus = 'pending' | 'approved' | 'completed' | 'rejected';
export type Transfer = { id: string; amount: number; status: TransferStatus };
