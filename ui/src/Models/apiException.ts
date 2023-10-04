class AppError extends Error {
    constructor() {
      super();
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }

export class APIError extends AppError {
    status?: number;
    exception?: any;
    userMessage?: string;
    endpoint?: string;
  }
