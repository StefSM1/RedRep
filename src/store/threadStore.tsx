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
  { id: 'u1', displayName: 'Алиса Чен' },
  { id: 'u2', displayName: 'Маркус Ривера' },
  { id: 'u3', displayName: 'Прия Пател' },
  { id: 'u4', displayName: 'Джейк Томпсън' },
  { id: 'u5', displayName: 'София Ким' },
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
    body: 'Обикновено си правя шпаргалка на един лист (дори и да не мога да я ползвам). Самото подреждане на всичко на едно място ти помага да разбереш връзките между темите.',
    author: MOCK_USERS[2],
    createdAt: daysAgo(2),
    score: 12,
    lastVoteAt: daysAgo(2),
  };
  const reply1b: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'За изпити с теория, опитай да обясниш всяка теорема на приятел на глас. Ако не можеш да го обясниш просто, значи не го разбираш достатъчно добре.',
    author: MOCK_USERS[4],
    createdAt: daysAgo(1),
    score: 8,
    lastVoteAt: daysAgo(1),
  };

  const reply2a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'Официалната документация на React (react.dev) вече е много добра. Учи чрез hooks от самото начало и има интерактивни примери, които можеш да редактираш в браузъра.',
    author: MOCK_USERS[3],
    createdAt: daysAgo(4),
    score: 15,
    lastVoteAt: daysAgo(4),
  };

  const reply3a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'Стартъпите обикновено ценят повече практични умения — може да те накарат да построиш нещо или да дебъгнеш код. FAANG е почти изцяло алгоритмично. Готви се и за двете: LeetCode за FAANG, странични проекти за стартъпи.',
    author: MOCK_USERS[0],
    createdAt: daysAgo(1),
    score: 22,
    lastVoteAt: daysAgo(1),
  };
  const reply3b: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'Не забравяй system design за FAANG, ако кандидатстваш за позиция над начално ниво. За стартъпи е важно да можеш да говориш подробно за проектите си.',
    author: MOCK_USERS[2],
    createdAt: daysAgo(0.5),
    score: 9,
    lastVoteAt: daysAgo(0.5),
  };

  const reply5a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: 'Математическият минор наистина помага за магистратура по CS, особено ако те интересуват ML, теория или графика. Основите по линейна алгебра и дискретна математика са важни.',
    author: MOCK_USERS[1],
    createdAt: daysAgo(6),
    score: 18,
    lastVoteAt: daysAgo(6),
  };

  const reply6a: Reply = {
    id: crypto.randomUUID(),
    threadId: '',
    body: '4-тият етаж на Инженерния факултет почти винаги е празен след 17ч. Има страхотна естествена светлина и много контакти.',
    author: MOCK_USERS[3],
    createdAt: daysAgo(0.2),
    score: 7,
    lastVoteAt: daysAgo(0.2),
  };

  return [
    {
      id: crypto.randomUUID(),
      title: 'Как подхождате към ученето за общ финален изпит?',
      body: 'Имам общ финален изпит по Линейна алгебра, който покрива всичко от векторни пространства до собствени стойности. Професорът каза, че ще е „концептуален", а не с много сметки. Как се подготвяте за такъв изпит, когато има толкова много материал?',
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
      title: 'Най-добри ресурси за учене на React hooks от нулата?',
      body: 'Карам курс по уеб програмиране и току-що започнахме React hooks. Учебникът покрива само class components. Може ли някой да препоръча добри ресурси за useState, useEffect и custom hooks? Бонус, ако включват практични проекти.',
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
      title: 'Съвети за технически интервюта — стартъп срещу голяма компания?',
      body: 'Имам интервюта в YC стартъп и FAANG компания. Процесите наистина ли са толкова различни? Трябва ли да се готвя различно за всяко? Решавам задачи в LeetCode, но не съм сигурен дали стига за стартъпа.',
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
      title: 'Как да организираме групов проект, когато всички имат различни графици?',
      body: 'Екип от 5 души сме за проекта по Софтуерно инженерство и никой не може да се съгласи за часове за среща. Двама работят на непълен работен ден, един има вечерни занятия. Изоставаме. Някакви инструменти или стратегии за асинхронна работа?',
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
      title: 'Струва ли си да взема минор по математика, ако съм специалност CS?',
      body: 'Моят научен ръководител предложи да взема минор по математика само с 3 допълнителни курса, понеже вече съм взел повечето prerequisites. Минор по математика наистина ли помага за магистратура или е по-добре да използвам кредитите за CS избираеми?',
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
      title: 'Къде е най-доброто тихо място за учене в кампуса?',
      body: 'Библиотеката винаги е препълнена по време на междинните изпити. Трябва ми тихо място, където да разпростра бележките си и да не ме безпокоят 3-4 часа. Бонус, ако има добър WiFi и контакти. Кои са вашите скрити места?',
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
