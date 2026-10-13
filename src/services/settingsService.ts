import {
  doc,
  setDoc,
  collection,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PortalSettings, SliderSlide } from '../types';
import { sanitizeForFirestore } from './articleService';

export const SETTINGS_STORAGE_KEY = 'RUANG_LEGOWO_PERMANENT_SETTINGS_V2';
export const SLIDES_STORAGE_KEY = 'RUANG_LEGOWO_PERMANENT_SLIDES_V2';

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && window.localStorage !== null;
  } catch {
    return false;
  }
}

export const DEFAULT_LOGO_URL = '/src/assets/images/ruang_legowo_logo_v3_1791863614156.jpg';
export const PREVIOUS_LOGO_URL = '/src/assets/images/ruang_legowo_logo_1791862685453.jpg';
export const LEGACY_LOGO_URL = '/src/assets/images/ruang_legowo_logo_1791449321676.jpg';

export function isDefaultOrLegacyLogo(url?: string): boolean {
  return !url || url === LEGACY_LOGO_URL || url === PREVIOUS_LOGO_URL;
}

export const DEFAULT_SETTINGS: PortalSettings = {
  brandName: 'RUANG LEGOWO',
  brandTagline: 'Portal Media Berita, Analisis & Opini Terbuka',
  brandLogo: DEFAULT_LOGO_URL,
  breakingAnnouncement: 'Selamat datang di Ruang Legowo — Jurnalisme berintegritas, analisis mendalam, dan independen.',
  footerAbout: 'Portal media berita independen Ruang Legowo: Mengedepankan keterbukaan, integritas jurnalisme, analisis mendalam, dan pembaruan fakta terverifikasi secara real-time.',
  footerAddress: 'Gedung Graha Pers Legowo Lt. 7, Jl. Merdeka Selatan, Jakarta Pusat',
  footerEmail: 'redaksi@ruanglegowo.id',
  footerPhone: '(021) 3890-7766',
  footerCopyright: '© 2026 Ruang Legowo Media Group. Hak cipta dilindungi undang-undang.',
  sliderIntervalSeconds: 5,
  htmlTitle: 'Ruang Legowo - Portal Media Berita, Analisis & CMS Real-time',
  htmlFavicon: DEFAULT_LOGO_URL,
  adminCustomUsername: 'admin',
  adminCustomPassword: 'admin',
  deletedSlideIds: [],
};

// Retrieve settings from local storage backup immediately
export function getStoredSettings(): PortalSettings {
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const resolvedBrandLogo = isDefaultOrLegacyLogo(parsed.brandLogo)
          ? DEFAULT_LOGO_URL
          : parsed.brandLogo;
        const resolvedFavicon = isDefaultOrLegacyLogo(parsed.htmlFavicon)
          ? DEFAULT_LOGO_URL
          : parsed.htmlFavicon;

        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          brandLogo: resolvedBrandLogo,
          htmlFavicon: resolvedFavicon,
          adminCustomUsername: parsed.adminCustomUsername || DEFAULT_SETTINGS.adminCustomUsername,
          adminCustomPassword: parsed.adminCustomPassword || DEFAULT_SETTINGS.adminCustomPassword,
          deletedSlideIds: Array.isArray(parsed.deletedSlideIds) ? parsed.deletedSlideIds : [],
        };
      }
    } catch (err) {
      console.warn('Error reading stored settings:', err);
    }
  }
  return DEFAULT_SETTINGS;
}

// Retrieve slides from local storage backup immediately
export function getStoredSlides(): SliderSlide[] {
  try {
    const raw = localStorage.getItem(SLIDES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading stored slides:', err);
  }
  return [];
}

// Real-time subscribe to Portal Settings with instantaneous local cache hydration
export function subscribeToPortalSettings(
  onUpdate: (settings: PortalSettings) => void
): () => void {
  // Deliver stored settings immediately (0ms latency, durable on reload)
  const initial = getStoredSettings();
  onUpdate(initial);

  const docRef = doc(db, 'settings', 'portal');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const firestoreData = snapshot.data() as Partial<PortalSettings>;
        const resolvedBrandLogo = (isDefaultOrLegacyLogo(firestoreData.brandLogo)
          ? (initial.brandLogo && !isDefaultOrLegacyLogo(initial.brandLogo) ? initial.brandLogo : DEFAULT_LOGO_URL)
          : firestoreData.brandLogo) || DEFAULT_LOGO_URL;
        const resolvedFavicon = (isDefaultOrLegacyLogo(firestoreData.htmlFavicon)
          ? (initial.htmlFavicon && !isDefaultOrLegacyLogo(initial.htmlFavicon) ? initial.htmlFavicon : DEFAULT_LOGO_URL)
          : firestoreData.htmlFavicon) || DEFAULT_LOGO_URL;

        const merged: PortalSettings = {
          ...DEFAULT_SETTINGS,
          ...firestoreData,
          brandLogo: resolvedBrandLogo,
          htmlFavicon: resolvedFavicon,
          adminCustomUsername: firestoreData.adminCustomUsername || initial.adminCustomUsername || DEFAULT_SETTINGS.adminCustomUsername,
          adminCustomPassword: firestoreData.adminCustomPassword || initial.adminCustomPassword || DEFAULT_SETTINGS.adminCustomPassword,
          deletedSlideIds: Array.isArray(firestoreData.deletedSlideIds)
            ? firestoreData.deletedSlideIds
            : (Array.isArray(initial.deletedSlideIds) ? initial.deletedSlideIds : []),
        };
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {}
        onUpdate(merged);
      } else {
        // If document doesn't exist yet in Firestore, initialize it with current settings
        updatePortalSettings(initial).catch(() => {});
        onUpdate(initial);
      }
    },
    (err) => {
      console.warn('Settings subscription fallback to persistent local cache:', err);
      onUpdate(getStoredSettings());
    }
  );
}

// Update settings to Firestore and persistent local storage
export async function updatePortalSettings(newSettings: Partial<PortalSettings>): Promise<void> {
  const current = getStoredSettings();
  const merged: PortalSettings = {
    ...current,
    ...newSettings,
  };

  // 1. Immediately save to persistent local cache
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }

  // 2. Persist to Firestore permanent cloud database
  const docRef = doc(db, 'settings', 'portal');
  try {
    const cleaned = sanitizeForFirestore(merged);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/portal');
    throw err;
  }
}

// Subscribe to Custom Slider Slides with instantaneous local cache hydration
export function subscribeToSliderSlides(
  onUpdate: (slides: SliderSlide[]) => void
): () => void {
  // Deliver stored slides immediately
  const initial = getStoredSlides();
  onUpdate(initial);

  const colRef = collection(db, 'slider_slides');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: SliderSlide[] = [];
      snapshot.forEach((snap) => {
        items.push({
          ...(snap.data() as SliderSlide),
          id: snap.id,
        });
      });
      items.sort((a, b) => a.order - b.order);

      // Persist to local cache
      if (isLocalStorageAvailable()) {
        try {
          window.localStorage.setItem(SLIDES_STORAGE_KEY, JSON.stringify(items));
        } catch (_) {}
      }

      onUpdate(items);
    },
    (err) => {
      console.warn('Slider slides subscription notice, using persistent local cache:', err);
      onUpdate(getStoredSlides());
    }
  );
}

// Save or add slider slide (Firestore + localStorage)
export async function saveSliderSlide(slide: Omit<SliderSlide, 'id'> & { id?: string }): Promise<string> {
  const colRef = collection(db, 'slider_slides');
  try {
    const docRef = slide.id ? doc(colRef, slide.id) : doc(colRef);
    const dataToSave: SliderSlide = {
      ...slide,
      id: docRef.id,
    };

    // Save to local cache first
    if (isLocalStorageAvailable()) {
      try {
        const slides = getStoredSlides();
        const existingIdx = slides.findIndex((s) => s.id === docRef.id);
        if (existingIdx >= 0) {
          slides[existingIdx] = dataToSave;
        } else {
          slides.push(dataToSave);
        }
        slides.sort((a, b) => a.order - b.order);
        window.localStorage.setItem(SLIDES_STORAGE_KEY, JSON.stringify(slides));
      } catch (_) {}
    }

    // Save to Firestore
    const cleaned = sanitizeForFirestore(dataToSave);
    await setDoc(docRef, cleaned, { merge: true });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'slider_slides');
    throw err;
  }
}

// Delete slider slide (Firestore + localStorage + permanent exclusion tracking)
export async function deleteSliderSlide(slideId: string, articleId?: string): Promise<void> {
  // 1. Remove from local slides cache
  if (isLocalStorageAvailable()) {
    try {
      const slides = getStoredSlides().filter((s) => s.id !== slideId);
      window.localStorage.setItem(SLIDES_STORAGE_KEY, JSON.stringify(slides));
    } catch (_) {}
  }

  // 2. Track permanently in portalSettings.deletedSlideIds so it never resurfaces in fallback
  try {
    const current = getStoredSettings();
    const set = new Set(current.deletedSlideIds || []);
    set.add(slideId);
    if (articleId) set.add(articleId);
    if (slideId.startsWith('slide-custom-')) {
      set.add(slideId.replace('slide-custom-', ''));
    }
    await updatePortalSettings({
      deletedSlideIds: Array.from(set),
    });
  } catch (err) {
    console.warn('Notice saving deletedSlideIds:', err);
  }

  // 3. Delete from Firestore collection if exists
  const docRef = doc(db, 'slider_slides', slideId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    // Non-fatal if document did not exist in Firestore (e.g. preset/fallback slide)
    console.warn('Notice deleting slide from Firestore:', err);
  }
}

// Reset/restore deleted slides if admin requests preset recovery
export async function restoreDeletedSliderSlides(): Promise<void> {
  await updatePortalSettings({
    deletedSlideIds: [],
  });
}

