import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import config from '../firebase-applet-config.json';
import { BOJONEGORO_INNOVATION_ARTICLES } from '../src/data/bojonegoroArticles';

async function seed() {
  console.log('Initializing Firebase app...');
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  console.log(`Seeding ${BOJONEGORO_INNOVATION_ARTICLES.length} articles to Firestore collection 'articles'...`);
  const articlesCol = collection(db, 'articles');

  for (const article of BOJONEGORO_INNOVATION_ARTICLES) {
    const docRef = doc(articlesCol, article.id);
    await setDoc(docRef, article);
    console.log(`Saved: [${article.category}] ${article.title.substring(0, 50)}...`);
  }

  const snap = await getDocs(articlesCol);
  console.log(`Successfully verified! Total articles in Firestore now: ${snap.size}`);
}

seed()
  .then(() => {
    console.log('Done seeding Bojonegoro innovation articles successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding articles:', err);
    process.exit(1);
  });
