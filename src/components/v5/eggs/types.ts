export type TokenInfo = {
  header: string;
  payload: string;
  signature: string;
  claims: Record<string, unknown>;
};
