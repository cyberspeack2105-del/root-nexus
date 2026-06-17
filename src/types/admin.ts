// src/types/admin.ts
import type { ObjectId } from 'mongodb'

export interface Project {
  _id?: ObjectId;         // MongoDB document ID (absent before insert)
  id: string;             // string form of _id, used in URLs and Server Actions
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  image: string;
  thumbnail?: string;     // path to optimized thumbnail image (400x300)
  imageAlt: string;       // alt text for images (required for accessibility)
  websiteUrl: string;     // required HTTPS URL for project website
  demoUrl?: string;       // optional URL to demo/live version
  client: string;
  timeline: string;
  results: string[];      // stored as BSON array in MongoDB
  content: string;
  isFeatured?: boolean;   // featured project flag (defaults to false)
  tags?: string[];        // project tags (max 5 items)
  screenshots?: string[]; // project screenshots list
  createdAt: string;      // ISO 8601 UTC string
  updatedAt: string;      // ISO 8601 UTC string
}

export interface AdminUser {
  _id?: ObjectId;
  id: string;             // string form of _id
  username: string;
  passwordHash: string;   // bcrypt hash ($2b$ or $2a$ prefix)
  createdAt: string;
}

export interface SessionPayload {
  adminId: string;        // string ObjectId of the admin document
  username: string;
  expiresAt: string;      // ISO 8601 UTC string
}

// Server Action result shapes
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface ProjectFormData {
  title: string;
  category: string;
  shortDescription: string;
  image: string;
  client: string;
  timeline: string;
  results: string;        // comma-separated on form; split to string[] before DB write
  content: string;
}
