import { AccessResult } from "@/utils/permissions.utils";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      noteAccess?: AccessResult;
      taskAccess?: AccessResult;
    }
  }
}

export {};
