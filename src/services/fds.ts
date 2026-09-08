export type FdsResult = { isRisky: boolean; reasons: string[] };
export async function analyzeTransfer(): Promise<FdsResult> { return { isRisky: false, reasons: [] }; }
