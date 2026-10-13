import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Article, Comment } from '../types';
import { BOJONEGORO_INNOVATION_ARTICLES } from '../data/bojonegoroArticles';

export const INITIAL_SEEDED_ARTICLES: Article[] = BOJONEGORO_INNOVATION_ARTICLES;

export const ARTICLES_STORAGE_KEY = 'RUANG_LEGOWO_PERMANENT_ARTICLES_V2';
export const DELETED_IDS_STORAGE_KEY = 'RUANG_LEGOWO_DELETED_ARTICLE_IDS_V2';
export const SEEDED_FLAG_KEY = 'RUANG_LEGOWO_SEEDED_FLAG_V2';

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && window.localStorage !== null;
  } catch {
    return false;
  }
}

// Retrieve permanently stored articles from local cache
export function getStoredArticles(): Article[] {
  if (isLocalStorageAvailable()) {
    try {
      // Purge any legacy keys from older revisions
      const legacyKeys = [
        'RUANG_LEGOWO_PERMANENT_ARTICLES',
        'RUANG_LEGOWO_PERMANENT_ARTICLES_V1',
        'RUANG_LEGOWO_ARTICLES',
        'ruang_legowo_articles',
        'RUANG_LEGOWO_INITIAL_ARTICLES',
        'RUANG_LEGOWO_SEEDED_ARTICLES',
      ];
      for (const k of legacyKeys) {
        if (window.localStorage.getItem(k) !== null) {
          window.localStorage.removeItem(k);
        }
      }

      const raw = window.localStorage.getItem(ARTICLES_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading stored articles from local cache:', err);
    }
  }

  return BOJONEGORO_INNOVATION_ARTICLES;
}

// Retrieve set of permanently deleted article IDs
export function getDeletedArticleIds(): Set<string> {
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(DELETED_IDS_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      }
    } catch (_) {}
  }
  return new Set();
}

// Save deleted ID permanently
function markArticleDeleted(id: string) {
  if (isLocalStorageAvailable()) {
    try {
      const set = getDeletedArticleIds();
      set.add(id);
      window.localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch (_) {}
  }
}

// Helper to remove any undefined fields before sending to Firestore
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

// Seed Bojonegoro innovation articles directly to Firestore and local cache
export async function seedBojonegoroArticles(): Promise<void> {
  const articlesCol = collection(db, 'articles');
  try {
    for (const art of BOJONEGORO_INNOVATION_ARTICLES) {
      const docRef = doc(articlesCol, art.id);
      await setDoc(docRef, sanitizeForFirestore(art));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'articles');
    throw err;
  }

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(BOJONEGORO_INNOVATION_ARTICLES));
      window.localStorage.removeItem(DELETED_IDS_STORAGE_KEY);
      window.localStorage.setItem(SEEDED_FLAG_KEY, 'true');
    } catch (_) {}
  }
}

// Seed initial articles if Firestore is empty and hasn't been seeded yet
export async function seedInitialArticlesIfEmpty(): Promise<void> {
  const articlesCol = collection(db, 'articles');
  try {
    const snap = await getDocs(articlesCol);
    if (snap.empty) {
      await seedBojonegoroArticles();
    }
  } catch (err) {
    console.warn('Initial seeding check fallback:', err);
  }
}

// Delete all articles permanently from Firestore and local cache
export async function deleteAllArticles(): Promise<void> {
  const articlesCol = collection(db, 'articles');
  try {
    const snap = await getDocs(articlesCol);
    for (const docSnap of snap.docs) {
      await deleteDoc(doc(db, 'articles', docSnap.id));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'articles');
    throw err;
  }

  // Clear local permanent cache
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify([]));
      window.localStorage.setItem(SEEDED_FLAG_KEY, 'true');
    } catch (_) {}
  }
}

// Real-time subscribe to articles with instantaneous local cache hydration
export function subscribeToArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (err: any) => void
): () => void {
  // Emit locally stored articles immediately (0ms delay for permanent instant load)
  const initialArticles = getStoredArticles();
  onUpdate(initialArticles);

  const articlesCol = collection(db, 'articles');
  const q = query(articlesCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const deletedIds = getDeletedArticleIds();
      const items: Article[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const artId = docSnap.id;
        if (!deletedIds.has(artId)) {
          items.push({
            ...(data as Article),
            id: artId,
          });
        }
      });

      // Synchronize fresh articles snapshot to local cache
      if (isLocalStorageAvailable()) {
        try {
          window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(items));
          window.localStorage.setItem(SEEDED_FLAG_KEY, 'true');
        } catch (_) {}
      }
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      console.warn('Firestore subscription fallback to permanent local cache:', error);
      onUpdate(getStoredArticles());
    }
  );
}

// Create new article in permanent Firestore and persistent local cache
export async function createArticle(articleData: Omit<Article, 'id'>): Promise<string> {
  const articlesCol = collection(db, 'articles');
  try {
    const newDocRef = doc(articlesCol);
    const newArticle: Article = {
      ...articleData,
      id: newDocRef.id,
      status: articleData.status || 'published', // Default to published so it appears on beranda
      createdAt: articleData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: articleData.views || 0,
      shares: articleData.shares || 0,
      likes: articleData.likes || 0,
    };

    // Sanitize to prevent "Unsupported field value: undefined" error in Firestore
    const cleanedArticle = sanitizeForFirestore(newArticle);

    // 1. Save to local permanent cache immediately
    if (isLocalStorageAvailable()) {
      try {
        const current = getStoredArticles();
        const updated = [newArticle, ...current.filter((a) => a.id !== newArticle.id)];
        window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to local cache:', e);
      }
    }

    // 2. Save to Firestore cloud database
    await setDoc(newDocRef, cleanedArticle);
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'articles');
    throw err;
  }
}

// Update article in permanent Firestore and persistent local cache
export async function updateArticle(id: string, updates: Partial<Article>): Promise<void> {
  const cleanUpdates = sanitizeForFirestore({
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  // 1. Update in local permanent cache immediately
  if (isLocalStorageAvailable()) {
    try {
      const current = getStoredArticles();
      const idx = current.findIndex((a) => a.id === id);
      if (idx >= 0) {
        current[idx] = {
          ...current[idx],
          ...cleanUpdates,
        };
        window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Failed to update local cache:', e);
    }
  }

  // 2. Update in Firestore with merge: true to safely handle existing or newly saved docs
  const articleDoc = doc(db, 'articles', id);
  try {
    await setDoc(articleDoc, cleanUpdates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `articles/${id}`);
    throw err;
  }
}

// Delete article permanently from Firestore and local cache
export async function deleteArticle(id: string): Promise<void> {
  // 1. Mark as deleted so it can never be resurrected
  markArticleDeleted(id);

  // 2. Remove from local permanent cache immediately
  if (isLocalStorageAvailable()) {
    try {
      const current = getStoredArticles().filter((a) => a.id !== id);
      window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to remove from local cache:', e);
    }
  }

  // 3. Delete from Firestore
  const articleDoc = doc(db, 'articles', id);
  try {
    await deleteDoc(articleDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
    throw err;
  }
}

// Metrics increments
export async function incrementArticleViews(id: string): Promise<void> {
  const articleDoc = doc(db, 'articles', id);
  try {
    await setDoc(
      articleDoc,
      {
        views: increment(1),
      },
      { merge: true }
    );
  } catch (err) {
    // Non-blocking for reader
    console.error('Failed to increment views:', err);
  }
}

// Admin manual views setting
export async function setArticleViews(id: string, newViews: number): Promise<void> {
  const articleDoc = doc(db, 'articles', id);
  try {
    await setDoc(
      articleDoc,
      {
        views: Math.max(0, Math.round(newViews)),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `articles/${id}`);
    throw err;
  }
}

// Admin manual views addition (+100, +500, +1000)
export async function addArticleViews(id: string, delta: number): Promise<void> {
  const articleDoc = doc(db, 'articles', id);
  try {
    await setDoc(
      articleDoc,
      {
        views: increment(delta),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `articles/${id}`);
    throw err;
  }
}

export async function incrementArticleLikes(id: string): Promise<void> {
  const articleDoc = doc(db, 'articles', id);
  try {
    await setDoc(
      articleDoc,
      {
        likes: increment(1),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to increment likes:', err);
  }
}

export async function incrementArticleShares(id: string): Promise<void> {
  const articleDoc = doc(db, 'articles', id);
  try {
    await setDoc(
      articleDoc,
      {
        shares: increment(1),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to increment shares:', err);
  }
}

// Comments
export function subscribeToComments(
  articleId: string,
  onUpdate: (comments: Comment[]) => void
): () => void {
  const commentsCol = collection(db, 'comments');
  const q = query(commentsCol, where('articleId', '==', articleId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Comment[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...(docSnap.data() as Comment),
          id: docSnap.id,
        });
      });
      // Sort in-memory to prevent complex composite index requirement
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'comments');
    }
  );
}

export async function addComment(comment: Omit<Comment, 'id'>): Promise<string> {
  const commentsCol = collection(db, 'comments');
  try {
    const newDocRef = doc(commentsCol);
    const newComment: Comment = {
      ...comment,
      id: newDocRef.id,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    await setDoc(newDocRef, sanitizeForFirestore(newComment));
    return newDocRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'comments');
    throw err;
  }
}
