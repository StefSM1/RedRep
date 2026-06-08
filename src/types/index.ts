/**
 * RedRep Type Definitions
 * Core data models for the Q&A forum prototype.
 */

export interface User {
  id: string;
  displayName: string;
  avatar?: string; // URL or initials fallback
}

export type Category =
  | 'general'
  | 'homework'
  | 'exam-prep'
  | 'project'
  | 'career'
  | 'campus-life';

/** Sort modes for the thread list. */
export type ThreadSort = 'hot' | 'new' | 'top';

/** Direction of a user's vote. 0 = no vote. */
export type VoteDirection = -1 | 0 | 1;

/** A single vote record. */
export interface Vote {
  userId: string;
  direction: VoteDirection;
}

export interface Reply {
  id: string;
  threadId: string;
  body: string;
  author: User;
  createdAt: string; // ISO date string
  parentReplyId?: string; // For nested replies
  score: number;
  lastVoteAt: string; // ISO date string
}

export interface Thread {
  id: string;
  title: string;
  body: string;
  author: User;
  category: Category;
  tags: string[];
  replies: Reply[];
  replyCount: number;
  createdAt: string; // ISO date string
  updatedAt: string;
  score: number;
  lastVoteAt: string; // ISO date string
  acceptedReplyId?: string;
}

/** Top-level application state (replaces the old ThreadState). */
export interface AppState {
  threads: Thread[];
  /** Map of "thread:abc" or "reply:xyz" → Vote */
  votes: Record<string, Vote>;
  /** Stable id for the local user. Always "current-user" for this prototype. */
  currentUserId: string;
}
