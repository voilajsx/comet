/**
 * Comet Framework - API TypeScript Definitions
 * Essential types for API utility
 * @module @voilajsx/comet
 * @file types/platform/api.d.ts
 */

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface ApiFetchResponse {
  ok: boolean;
  status: number;
  data: any;
  error?: string;
  json(): Promise<any>;
}

export interface CometAPI {
  fetch(url: string, options?: ApiFetchOptions): Promise<ApiFetchResponse>;
  get(url: string, headers?: Record<string, string>): Promise<ApiFetchResponse>;
  post(url: string, data?: any, headers?: Record<string, string>): Promise<ApiFetchResponse>;
  put(url: string, data?: any, headers?: Record<string, string>): Promise<ApiFetchResponse>;
  patch(url: string, data?: any, headers?: Record<string, string>): Promise<ApiFetchResponse>;
  delete(url: string, headers?: Record<string, string>): Promise<ApiFetchResponse>;
}

export declare const comet: CometAPI;