export function formatAccount(accountNumber: string): string { return accountNumber.replace(/(\\d{4})(?=\\d)/g, '$1-'); }
