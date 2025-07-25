export interface QuorumStatus {
  current: number;
  needed: number;
  isActive: boolean;
  timeRemaining?: number;
}
