import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { Thread, Reply, User, Vote, VoteDirection, AppState } from '@/types';

/* ---------- Constants ---------- */
const STORAGE_KEY = 'redrep-threads';

const MOCK_USERS: User[] = [
  { id: 'u1', displayName: 'Alice Chen' },
  { id: 'u2', displayName: 'Marcus Rivera' },
  { id: 'u3', displayName: 'Priya Patel' },
  { id: 'u4', displayName: 'Jake Thompson' },
  { id: 'u5', displayName: 'Sofia Kim' },
];

/* ---------- Helpers ---------- */
function keyForVote(targetType: 'thread' | 'reply', targetId: string): string {
  return `${targetType}:${targetId}`;
}

/* ---------- Seed Data ---------- */
function createSeedThreads(): Thread[] {
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

  const reply1a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'I usually make a one-page cheat sheet (even if I cannot use it). The act of condensing everything forces you to understand the connections between topics.',
    author: MOCK_USERS[2],
    createdAt: daysAgo(2),
    score: 12,
    lastVoteAt: daysAgo(2),
  };
  const reply1b: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'For conceptual exams, try explaining each theorem to a study partner out loud. If you cannot explain it simply, you do not understand it well enough.',
    author: MOCK_USERS[4],
    createdAt: daysAgo(1),
    score: 8,
    lastVoteAt: daysAgo(1),
  };

  const reply2a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'The official React docs (react.dev) are actually excellent now. They teach hooks-first and have interactive examples you can edit in the browser.',
    author: MOCK_USERS[3],
    createdAt: daysAgo(4),
    score: 15,
    lastVoteAt: daysAgo(4),
  };

  const reply3a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'Startups usually care more about practical skills — they might ask you to build something or debug existing code. FAANG is almost purely algorithmic. Prepare both: LeetCode for FAANG, side projects for startups.',
    author: MOCK_USERS[0],
    createdAt: daysAgo(1),
    score: 22,
    lastVoteAt: daysAgo(1),
  };
  const reply3b: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'Do not forget system design for FAANG if you are applying for anything above entry level. For startups, being able to talk about your projects in depth matters a lot.',
    author: MOCK_USERS[2],
    createdAt: daysAgo(0.5),
    score: 9,
    lastVoteAt: daysAgo(0.5),
  };

  const reply5a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'A Math minor is genuinely useful for CS grad school, especially if you are interested in ML, theory, or graphics. The linear algebra and discrete math foundations matter.',
    author: MOCK_USERS[1],
    createdAt: daysAgo(6),
    score: 18,
    lastVoteAt: daysAgo(6),
  };

  const reply6a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'The 4th floor of the Engineering building is almost always empty after 5pm. Has great natural light and plenty of outlets.',
    author: MOCK_USERS[3],
    createdAt: daysAgo(0.2),
    score: 7,
    lastVoteAt: daysAgo(0.2),
  };

  return [
    {
      id: crypto.randomUUID(),
      title: 'How do you approach studying for a cumulative final exam?',
      body: 'I have a cumulative final in Linear Algebra covering everything from vector spaces to eigenvalues. The professor said it will be "conceptual" rather than calculation-heavy. How do you prepare for that kind of exam when there is so much material to review?',
      author: MOCK_USERS[0],
      category: 'exam-prep',
      tags: ['linear-algebra', 'final-exam', 'study-strategy'],
      replies: [reply1a, reply1b],
      replyCount: 2,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
      score: 32,
      lastVoteAt: daysAgo(1),
      acceptedReplyId: reply1a.id,
    },
    {
      id: crypto.randomUUID(),
      title: 'Best resources for learning React hooks from scratch?',
      body: 'I am taking a web development course and we just started React hooks. The textbook only covers class components. Can anyone recommend good resources for learning useState, useEffect, and custom hooks? Bonus points if they include practical projects.',
      author: MOCK_USERS[1],
      category: 'homework',
      tags: ['react', 'hooks', 'web-dev'],
      replies: [reply2a],
      replyCount: 1,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(4),
      score: 21,
      lastVoteAt: daysAgo(4),
      acceptedReplyId: reply2a.id,
    },
    {
      id: crypto.randomUUID(),
      title: 'Tips for technical interviews at startups vs big tech?',
      body: 'I have interviews coming up at both a YC startup and a FAANG company. Are the interview processes really that different? Should I prepare differently for each? I have been grinding LeetCode but I am not sure if that is enough for the startup.',
      author: MOCK_USERS[3],
      category: 'career',
      tags: ['interviews', 'startups', 'faang'],
      replies: [reply3a, reply3b],
      replyCount: 2,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(0.5),
      score: 45,
      lastVoteAt: daysAgo(0.5),
      acceptedReplyId: reply3a.id,
    },
    {
      id: crypto.randomUUID(),
      title: 'How to structure a group project when everyone has different schedules?',
      body: 'We are a team of 5 for our Software Engineering project and nobody can agree on meeting times. Two people work part-time jobs, one has evening classes. We are falling behind. Any tools or strategies for async collaboration?',
      author: MOCK_USERS[4],
      category: 'project',
      tags: ['group-work', 'collaboration', 'time-management'],
      replies: [],
      replyCount: 0,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      score: 8,
      lastVoteAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(),
      title: 'Is it worth getting a minor in CS if I am already a CS major?',
      body: 'My advisor suggested I could pick up a Math minor with just 3 more courses since I have already taken most of the prerequisites. Would a Math minor actually help with grad school applications or is it better to use those credits for CS electives?',
      author: MOCK_USERS[2],
      category: 'career',
      tags: ['minor', 'grad-school', 'math'],
      replies: [reply5a],
      replyCount: 1,
      createdAt: daysAgo(7),
      updatedAt: daysAgo(6),
      score: 14,
      lastVoteAt: daysAgo(6),
      acceptedReplyId: reply5a.id,
    },
    {
      id: crypto.randomUUID(),
      title: 'Where is the best quiet study spot on campus?',
      body: 'The library is always packed during midterms. I need a quiet place where I can spread out my notes and not be disturbed for 3-4 hours. Bonus if it has good WiFi and outlets. What are your hidden gems?',
      author: MOCK_USERS[0],
      category: 'campus-life',
      tags: ['study-spots', 'campus'],
      replies: [reply6a],
      replyCount: 1,
      createdAt: daysAgo(0.5),
      updatedAt: daysAgo(0.2),
      score: 11,
      lastVoteAt: daysAgo(0.2),
    },
  ];
}

/* ---------- Actions ---------- */
type ThreadAction =
  | { type: 'CREATE_THREAD'; payload: { id: string; data: Omit<Thread, 'id' | 'replies' | 'replyCount' | 'createdAt' | 'updatedAt' | 'score' | 'lastVoteAt'> } }
  | { type: 'ADD_REPLY'; payload: { threadId: string; body: string; author: User } }
  | { type: 'DELETE_THREAD'; payload: { threadId: string } }
  | { type: 'VOTE'; payload: { userId: string; targetType: 'thread' | 'reply'; targetId: string; direction: VoteDirection } }
  | { type: 'ACCEPT_REPLY'; payload: { threadId: string; replyId: string; byUserId: string } }
  | { type: 'LOAD'; payload: AppState };

/* ---------- Initial State ---------- */
const INITIAL_STATE: AppState = {
  threads: [],
  votes: {},
  currentUserId: 'current-user',
};

/* ---------- Reducer ---------- */
function threadReducer(state: AppState, action: ThreadAction): AppState {
  switch (action.type) {
    case 'CREATE_THREAD': {
      const now = new Date().toISOString();
      const newThread: Thread = {
        ...action.payload.data,
        id: action.payload.id,
        replies: [],
        replyCount: 0,
        createdAt: now,
        updatedAt: now,
        score: 0,
        lastVoteAt: now,
      };
      return { ...state, threads: [newThread, ...state.threads] };
    }

    case 'ADD_REPLY': {
      const { threadId, body, author } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        threads: state.threads.map((t) => {
          if (t.id !== threadId) return t;
          const reply: Reply = {
            id: crypto.randomUUID(),
            threadId,
            body,
            author,
            createdAt: now,
            score: 0,
            lastVoteAt: now,
          };
          return {
            ...t,
            replies: [...t.replies, reply],
            replyCount: t.replyCount + 1,
            updatedAt: now,
          };
        }),
      };
    }

    case 'DELETE_THREAD':
      return {
        ...state,
        threads: state.threads.filter((t) => t.id !== action.payload.threadId),
      };

    case 'VOTE': {
      const { userId, targetType, targetId, direction } = action.payload;
      const key = keyForVote(targetType, targetId);
      const existing = state.votes[key];
      const prevDirection = existing?.direction ?? 0;

      // Compute delta: toggling same → 0, new or flip → new direction - old direction
      let newDirection: VoteDirection;
      if (direction === prevDirection) {
        newDirection = 0; // toggle off
      } else {
        newDirection = direction;
      }
      const delta = newDirection - prevDirection;

      const now = new Date().toISOString();
      const newVotes = { ...state.votes };
      if (newDirection === 0) {
        delete newVotes[key];
      } else {
        newVotes[key] = { userId, direction: newDirection };
      }

      const newThreads = state.threads.map((t) => {
        if (targetType === 'thread' && t.id === targetId) {
          return { ...t, score: t.score + delta, lastVoteAt: now };
        }
        if (targetType === 'reply') {
          const replyIndex = t.replies.findIndex((r) => r.id === targetId);
          if (replyIndex !== -1) {
            const updatedReplies = [...t.replies];
            updatedReplies[replyIndex] = {
              ...updatedReplies[replyIndex],
              score: updatedReplies[replyIndex].score + delta,
              lastVoteAt: now,
            };
            return { ...t, replies: updatedReplies };
          }
        }
        return t;
      });

      return { ...state, threads: newThreads, votes: newVotes };
    }

    case 'ACCEPT_REPLY': {
      const { threadId, replyId, byUserId } = action.payload;
      return {
        ...state,
        threads: state.threads.map((t) => {
          if (t.id !== threadId) return t;
          // Only the thread author can accept a reply
          if (t.author.id !== byUserId) return t;
          // Toggle: clicking the same reply un-accepts it
          const newAccepted = t.acceptedReplyId === replyId ? undefined : replyId;
          return { ...t, acceptedReplyId: newAccepted };
        }),
      };
    }

    case 'LOAD':
      return action.payload;

    default:
      return state;
  }
}

/* ---------- Context ---------- */
interface ThreadContextValue {
  threads: Thread[];
  votes: Record<string, Vote>;
  currentUserId: string;
  createThread: (
    data: Omit<Thread, 'id' | 'replies' | 'replyCount' | 'createdAt' | 'updatedAt' | 'score' | 'lastVoteAt'>
  ) => string;
  addReply: (threadId: string, body: string, author: User) => void;
  deleteThread: (threadId: string) => void;
  vote: (targetType: 'thread' | 'reply', targetId: string, direction: VoteDirection) => void;
  acceptReply: (threadId: string, replyId: string) => void;
}

const ThreadContext = createContext<ThreadContextValue | null>(null);

/* ---------- Storage Helpers ---------- */

/** Migrate a bare Thread[] (old format) or AppState (new format) from localStorage. */
function loadFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      // New format: has threads array + votes map
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.threads)) {
        return migrateState(parsed);
      }

      // Old format: bare Thread[] array
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migratedThreads = parsed.map((t: Thread) => ({
          ...t,
          score: t.score ?? 0,
          lastVoteAt: t.lastVoteAt ?? t.createdAt,
          replies: (t.replies ?? []).map((r: Reply) => ({
            ...r,
            score: r.score ?? 0,
            lastVoteAt: r.lastVoteAt ?? r.createdAt,
          })),
        }));
        return {
          threads: migratedThreads,
          votes: {},
          currentUserId: 'current-user',
        };
      }
    }
  } catch {
    // corrupted — fall through to seed
  }

  // Fresh seed
  return {
    threads: createSeedThreads(),
    votes: {},
    currentUserId: 'current-user',
  };
}

/** Defensive migration: ensure every thread/reply has score + lastVoteAt. */
function migrateState(state: Partial<AppState>): AppState {
  const threads = (state.threads ?? []).map((t) => ({
    ...t,
    score: t.score ?? 0,
    lastVoteAt: t.lastVoteAt ?? t.createdAt,
    replies: (t.replies ?? []).map((r) => ({
      ...r,
      score: r.score ?? 0,
      lastVoteAt: r.lastVoteAt ?? r.createdAt,
    })),
  }));
  return {
    threads,
    votes: state.votes ?? {},
    currentUserId: state.currentUserId ?? 'current-user',
  };
}

/* ---------- Provider ---------- */
export function ThreadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(threadReducer, INITIAL_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'LOAD', payload: loadFromStorage() });
  }, []);

  // Auto-sync to localStorage on every state change
  useEffect(() => {
    if (state.threads.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // storage full — silently fail
      }
    }
  }, [state]);

  const value = useMemo<ThreadContextValue>(
    () => ({
      threads: state.threads,
      votes: state.votes,
      currentUserId: state.currentUserId,
      createThread: (data) => {
        const id = crypto.randomUUID();
        dispatch({ type: 'CREATE_THREAD', payload: { id, data } });
        return id;
      },
      addReply: (threadId, body, author) =>
        dispatch({ type: 'ADD_REPLY', payload: { threadId, body, author } }),
      deleteThread: (threadId) =>
        dispatch({ type: 'DELETE_THREAD', payload: { threadId } }),
      vote: (targetType, targetId, direction) =>
        dispatch({
          type: 'VOTE',
          payload: { userId: state.currentUserId, targetType, targetId, direction },
        }),
      acceptReply: (threadId, replyId) =>
        dispatch({
          type: 'ACCEPT_REPLY',
          payload: { threadId, replyId, byUserId: state.currentUserId },
        }),
    }),
    [state]
  );

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

/** Access thread state and actions from any component. */
export function useThreads() {
  const ctx = useContext(ThreadContext);
  if (!ctx) throw new Error('useThreads must be used within <ThreadProvider>');
  return ctx;
}
