import "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      userIdentity?: {
        clientId: string;
        fingerprintHash?: string;
        name?: string;
        school?: string;
        schoolEmail?: string;
      };
      admin?: {
        id: string;
      };
    }
  }
}

export {};
