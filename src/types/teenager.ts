export interface TeenagerData {
  ts: number;
  teenager: {
    userId: string;
    status: number;
    allow: boolean;
    popup: boolean;
  };
  teenagerMeta: {
    duration: number;
    start: string;
    end: string;
  };
}
