import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Extract and validate pagination parameters from request query
 * @param req - Express request object
 * @param defaultLimit - Default items per page (default: 10)
 * @param maxLimit - Maximum items per page (default: 100)
 * @returns Pagination parameters
 */
export const getPaginationParams = (
  req: Request,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  let limit = parseInt(req.query.limit as string) || defaultLimit;

  // Enforce max limit
  limit = Math.min(limit, maxLimit);
  limit = Math.max(1, limit); // Ensure at least 1

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create a paginated response with metadata
 * @param data - Array of data items
 * @param total - Total count of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated response object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
