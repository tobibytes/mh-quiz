import "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      userIdentity?: {
        clientId: string;
        fingerprintHash?: string;
      };
      admin?: {
        id: string;
      };
    }
  }
}

export {};
