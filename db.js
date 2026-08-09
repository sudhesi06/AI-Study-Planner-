/* =========================================================
   AI Study Planner — IndexedDB Database Layer
   ========================================================= */

const DB_NAME = 'AIStudyPlannerDB';
const DB_VERSION = 1;

const STORES = {
  subjects: 'subjects',
  tasks: 'tasks',
  goals: 'goals',
  studyLogs: 'studyLogs',
  settings: 'settings',
  quizzes: 'quizzes',
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(STORES.subjects)) {
        const subjectStore = db.createObjectStore(STORES.subjects, { keyPath: 'id' });
        subjectStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.tasks)) {
        const taskStore = db.createObjectStore(STORES.tasks, { keyPath: 'id' });
        taskStore.createIndex('subjectId', 'subjectId', { unique: false });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('date', 'date', { unique: false });
        taskStore.createIndex('priority', 'priority', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.goals)) {
        const goalStore = db.createObjectStore(STORES.goals, { keyPath: 'id' });
        goalStore.createIndex('subjectId', 'subjectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.studyLogs)) {
        const logStore = db.createObjectStore(STORES.studyLogs, { keyPath: 'id' });
        logStore.createIndex('date', 'date', { unique: false });
        logStore.createIndex('subjectId', 'subjectId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.quizzes)) {
        const quizStore = db.createObjectStore(STORES.quizzes, { keyPath: 'id' });
        quizStore.createIndex('subjectId', 'subjectId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ---------- Generic CRUD Helpers ---------- */
async function dbAdd(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).add(data);
    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbPut(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGet(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function dbDelete(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/* ---------- Seed default data ---------- */
async function seedDefaultData() {
  const subjects = await dbGetAll(STORES.subjects);
  if (subjects.length > 0) return; // Already seeded

  const defaultSubjects = [
    { id: 's1', name: 'Mathematics', color: '#4F6BF6', icon: 'calculate', weeklyTarget: 8, progress: 58, lessonsTotal: 24, lessonsCompleted: 14 },
    { id: 's2', name: 'Physics', color: '#8B5CF6', icon: 'science', weeklyTarget: 6, progress: 72, lessonsTotal: 20, lessonsCompleted: 14 },
    { id: 's3', name: 'Chemistry', color: '#10B981', icon: 'biotech', weeklyTarget: 6, progress: 65, lessonsTotal: 18, lessonsCompleted: 12 },
    { id: 's4', name: 'English Literature', color: '#F59E0B', icon: 'auto_stories', weeklyTarget: 4, progress: 80, lessonsTotal: 16, lessonsCompleted: 13 },
    { id: 's5', name: 'Computer Science', color: '#06B6D4', icon: 'code', weeklyTarget: 5, progress: 70, lessonsTotal: 22, lessonsCompleted: 15 },
    { id: 's6', name: 'Biology', color: '#EF4444', icon: 'eco', weeklyTarget: 5, progress: 55, lessonsTotal: 20, lessonsCompleted: 11 },
  ];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const defaultTasks = [
    { id: 't1', subjectId: 's1', subject: 'Mathematics', lesson: 'Quadratic Equations', duration: 45, priority: 'high', time: '09:00', date: todayStr, status: 'completed', color: '#4F6BF6' },
    { id: 't2', subjectId: 's2', subject: 'Physics', lesson: 'Wave Optics — Interference', duration: 60, priority: 'high', time: '10:00', date: todayStr, status: 'completed', color: '#8B5CF6' },
    { id: 't3', subjectId: 's3', subject: 'Chemistry', lesson: 'Organic Reactions — Aldehydes', duration: 50, priority: 'medium', time: '11:30', date: todayStr, status: 'completed', color: '#10B981' },
    { id: 't4', subjectId: 's1', subject: 'Mathematics', lesson: 'Trigonometric Identities', duration: 45, priority: 'medium', time: '14:00', date: todayStr, status: 'completed', color: '#4F6BF6' },
    { id: 't5', subjectId: 's5', subject: 'Computer Science', lesson: 'Data Structures — Binary Trees', duration: 55, priority: 'high', time: '15:30', date: todayStr, status: 'completed', color: '#06B6D4' },
    { id: 't6', subjectId: 's4', subject: 'English Literature', lesson: 'Shakespeare — Hamlet Act 3', duration: 40, priority: 'medium', time: '17:00', date: todayStr, status: 'completed', color: '#F59E0B' },
    { id: 't7', subjectId: 's6', subject: 'Biology', lesson: 'Cell Division — Mitosis', duration: 45, priority: 'medium', time: '18:30', date: todayStr, status: 'in-progress', color: '#EF4444' },
    { id: 't8', subjectId: 's1', subject: 'Mathematics', lesson: 'Calculus — Integration', duration: 50, priority: 'high', time: '20:00', date: todayStr, status: 'pending', color: '#4F6BF6' },
    { id: 't9', subjectId: 's2', subject: 'Physics', lesson: 'Electromagnetism Basics', duration: 45, priority: 'low', time: '21:00', date: todayStr, status: 'pending', color: '#8B5CF6' },
    // Upcoming
    { id: 't10', subjectId: 's3', subject: 'Chemistry', lesson: 'Chemical Bonding — Hybridization', duration: 50, priority: 'high', time: '09:00', date: tomorrowStr, status: 'pending', color: '#10B981' },
    { id: 't11', subjectId: 's5', subject: 'Computer Science', lesson: 'Algorithms — Sorting', duration: 60, priority: 'medium', time: '11:00', date: tomorrowStr, status: 'pending', color: '#06B6D4' },
    { id: 't12', subjectId: 's4', subject: 'English Literature', lesson: 'Poetry Analysis — Keats', duration: 40, priority: 'low', time: '14:00', date: dayAfterStr, status: 'pending', color: '#F59E0B' },
    { id: 't13', subjectId: 's2', subject: 'Physics', lesson: 'Thermodynamics — Entropy', duration: 55, priority: 'high', time: '09:30', date: dayAfterStr, status: 'pending', color: '#8B5CF6' },
    { id: 't14', subjectId: 's6', subject: 'Biology', lesson: 'Genetics — DNA Replication', duration: 50, priority: 'medium', time: '15:00', date: nextWeekStr, status: 'pending', color: '#EF4444' },
  ];

  const defaultGoals = [
    { id: 'g1', subjectId: 's1', title: 'Complete Calculus Chapter', description: 'Finish all exercises and concept reviews for the Calculus chapter, including integration and differentiation.', deadline: nextWeekStr, progress: 45, status: 'active' },
    { id: 'g2', subjectId: 's2', title: 'Master Wave Optics', description: 'Complete all theory + numerical problems for Wave Optics before the upcoming deadline.', deadline: dayAfterStr, progress: 72, status: 'active' },
    { id: 'g3', subjectId: 's5', title: 'Build Practice Project', description: 'Complete the binary tree visualizer project for Computer Science.', deadline: nextWeekStr, progress: 30, status: 'active' },
    { id: 'g4', subjectId: 's4', title: 'Finish Shakespeare Unit', description: 'Read and annotate all assigned acts of Hamlet.', deadline: tomorrowStr, progress: 90, status: 'active' },
  ];

  // Weekly study logs
  const logs = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hours = i === 0 ? 3.5 : [2.5, 4, 3, 4.5, 3.5, 5, 2][6 - i];
    logs.push({ id: `log_${dateStr}`, date: dateStr, hours, dayName: dayNames[d.getDay()] });
  }

  const defaultQuizzes = [
    { id: 'q1', subjectId: 's1', subject: 'Mathematics', title: 'Quadratic Equations Quiz', questions: 15, duration: 20, score: 78, color: '#4F6BF6', status: 'completed' },
    { id: 'q2', subjectId: 's2', subject: 'Physics', title: 'Wave Optics MCQs', questions: 20, duration: 25, score: 85, color: '#8B5CF6', status: 'completed' },
    { id: 'q3', subjectId: 's3', subject: 'Chemistry', title: 'Organic Reactions Practice', questions: 12, duration: 15, score: null, color: '#10B981', status: 'new' },
    { id: 'q4', subjectId: 's5', subject: 'Computer Science', title: 'Data Structures Challenge', questions: 18, duration: 30, score: null, color: '#06B6D4', status: 'new' },
  ];

  // Insert all seed data
  for (const s of defaultSubjects) await dbAdd(STORES.subjects, s);
  for (const t of defaultTasks) await dbAdd(STORES.tasks, t);
  for (const g of defaultGoals) await dbAdd(STORES.goals, g);
  for (const l of logs) await dbAdd(STORES.studyLogs, l);
  for (const q of defaultQuizzes) await dbAdd(STORES.quizzes, q);

  // Default settings
  await dbPut(STORES.settings, { key: 'profile', name: 'Vishv Shah', email: 'vishv@student.edu', dailyTarget: 4 });
  await dbPut(STORES.settings, { key: 'theme', value: 'light' });
  await dbPut(STORES.settings, { key: 'notifications', reminders: true, deadlineAlerts: true });
  await dbPut(STORES.settings, { key: 'streak', days: 14, lastDate: todayStr });
}
