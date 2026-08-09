// --- Default Data ---
const demoSubjects = [
    {
        id: 'subj_1',
        name: 'Data Structures',
        chapters: ['Arrays', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs'],
        difficulty: 'Hard',
        examDate: '2026-09-10',
        progress: 45
    },
    {
        id: 'subj_2',
        name: 'DBMS',
        chapters: ['SQL', 'Normalization', 'Transactions', 'Indexing'],
        difficulty: 'Medium',
        examDate: '2026-09-15',
        progress: 70
    },
    {
        id: 'subj_3',
        name: 'Java',
        chapters: ['OOP', 'Collections', 'Exception Handling', 'Streams'],
        difficulty: 'Easy',
        examDate: '2026-09-25',
        progress: 85
    }
];

// --- State Management ---
let state = {
    subjects: [],
    timetable: [],
    preferences: null,
    progress: {
        completedSessions: 0,
        totalSessions: 0
    }
};

// --- DOM Elements ---
const DOM = {
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileMenuClose: document.getElementById('mobile-menu-close'),
    sidebar: document.getElementById('sidebar'),
    statHours: document.getElementById('stat-hours'),
    statSubjects: document.getElementById('stat-subjects'),
    statPriority: document.getElementById('stat-priority'),
    statProgress: document.getElementById('stat-progress'),
    generatorForm: document.getElementById('ai-generator-form'),
    timetableContainer: document.getElementById('timetable-container'),
    timetableList: document.getElementById('timetable-list'),
    priorityList: document.getElementById('priority-list'),
    insightsList: document.getElementById('insights-list'),
    recommendationsList: document.getElementById('recommendations-list'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingText: document.getElementById('loading-text'),
    loadingProgressFill: document.getElementById('loading-progress-fill'),
    btnRegenerate: document.getElementById('btn-regenerate'),
    confirmModal: document.getElementById('confirm-modal'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    btnConfirmModal: document.getElementById('btn-confirm-modal'),
    toastContainer: document.getElementById('toast-container')
};

// --- Initialization ---
function init() {
    loadPlannerData();
    setupEventListeners();
    updateDashboard();
    renderPrioritySubjects('all');
    renderRecommendations();
    renderInsights();
    if (state.timetable.length > 0) {
        DOM.timetableContainer.style.display = 'block';
        renderTimetable();
    }
}

// --- Data Persistence ---
function loadPlannerData() {
    const storedSubjects = localStorage.getItem('studyPlannerSubjects');
    const storedTimetable = localStorage.getItem('studyPlannerTimetable');
    const storedPreferences = localStorage.getItem('studyPlannerPreferences');
    const storedProgress = localStorage.getItem('studyPlannerProgress');

    if (storedSubjects) {
        state.subjects = JSON.parse(storedSubjects);
    } else {
        state.subjects = [...demoSubjects];
        savePlannerData('subjects');
    }

    if (storedTimetable) {
        state.timetable = JSON.parse(storedTimetable);
    }

    if (storedPreferences) {
        state.preferences = JSON.parse(storedPreferences);
        // Pre-fill form
        document.getElementById('study-hours').value = state.preferences.hours;
        document.getElementById('session-duration').value = state.preferences.duration;
        document.getElementById('start-time').value = state.preferences.startTime;
        document.getElementById('end-time').value = state.preferences.endTime;
        document.getElementById('study-preference').value = state.preferences.preference;
    }

    if (storedProgress) {
        state.progress = JSON.parse(storedProgress);
    }
}

function savePlannerData(key = 'all') {
    if (key === 'all' || key === 'subjects') {
        localStorage.setItem('studyPlannerSubjects', JSON.stringify(state.subjects));
    }
    if (key === 'all' || key === 'timetable') {
        localStorage.setItem('studyPlannerTimetable', JSON.stringify(state.timetable));
    }
    if (key === 'all' || key === 'preferences') {
        localStorage.setItem('studyPlannerPreferences', JSON.stringify(state.preferences));
    }
    if (key === 'all' || key === 'progress') {
        localStorage.setItem('studyPlannerProgress', JSON.stringify(state.progress));
    }
}

// --- AI Priority Logic ---
function calculatePriority(subject) {
    // Priority Score = Exam Urgency + Difficulty + Weakness + Remaining Topics
    
    // 1. Exam Urgency (0-40 points)
    const today = new Date('2026-08-09'); // Using current date context
    const examDate = new Date(subject.examDate);
    const daysUntilExam = Math.max(0, Math.floor((examDate - today) / (1000 * 60 * 60 * 24)));
    let urgencyScore = 0;
    if (daysUntilExam <= 7) urgencyScore = 40;
    else if (daysUntilExam <= 14) urgencyScore = 30;
    else if (daysUntilExam <= 30) urgencyScore = 20;
    else urgencyScore = 10;

    // 2. Difficulty (0-20 points)
    let diffScore = 0;
    if (subject.difficulty === 'Hard') diffScore = 20;
    else if (subject.difficulty === 'Medium') diffScore = 10;
    else diffScore = 5;

    // 3. Weakness / Progress Inverse (0-30 points)
    const weaknessScore = Math.floor(((100 - subject.progress) / 100) * 30);

    // 4. Remaining Topics Weight (0-10 points)
    const remainingRatio = (100 - subject.progress) / 100;
    const remainingTopicsScore = Math.floor((subject.chapters.length * remainingRatio) / Math.max(1, subject.chapters.length) * 10);

    const totalScore = Math.min(100, urgencyScore + diffScore + weaknessScore + remainingTopicsScore);
    
    let priorityLevel = 'LOW';
    let reason = 'On track. Keep up the good work.';
    
    if (totalScore >= 75) {
        priorityLevel = 'HIGH';
        reason = 'Exam is approaching and current progress is low.';
    } else if (totalScore >= 50) {
        priorityLevel = 'MEDIUM';
        reason = 'Moderate attention needed to complete remaining topics.';
    }

    return { score: totalScore, level: priorityLevel, reason: reason };
}

// --- Timetable Generation Simulation ---
function handleGenerateSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(DOM.generatorForm);
    const days = formData.getAll('days');
    
    state.preferences = {
        hours: parseInt(document.getElementById('study-hours').value),
        duration: parseInt(document.getElementById('session-duration').value),
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        days: days,
        preference: document.getElementById('study-preference').value
    };
    
    savePlannerData('preferences');
    simulateAIGeneration();
}

function simulateAIGeneration() {
    DOM.loadingOverlay.classList.add('active');
    
    const steps = [
        { text: "AI is analyzing your subjects...", progress: 25, delay: 500 },
        { text: "Calculating subject priorities...", progress: 50, delay: 1500 },
        { text: "Creating personalized timetable...", progress: 75, delay: 2500 },
        { text: "Optimizing your study schedule...", progress: 100, delay: 3500 }
    ];

    steps.forEach(step => {
        setTimeout(() => {
            DOM.loadingText.textContent = step.text;
            DOM.loadingProgressFill.style.width = step.progress + '%';
        }, step.delay);
    });

    setTimeout(() => {
        generateTimetableLogic();
        DOM.loadingOverlay.classList.remove('active');
        DOM.timetableContainer.style.display = 'block';
        showToast("AI timetable generated successfully.", "success");
        // Scroll to timetable
        DOM.timetableContainer.scrollIntoView({ behavior: 'smooth' });
    }, 4500);
}

function generateTimetableLogic() {
    // Simulate assigning subjects based on priority
    const prioritizedSubjects = state.subjects.map(sub => ({
        ...sub,
        priorityInfo: calculatePriority(sub)
    })).sort((a, b) => b.priorityInfo.score - a.priorityInfo.score);

    const newTimetable = [];
    let currentTime = parseTime(state.preferences.startTime);
    const duration = state.preferences.duration;
    
    // Just a basic simulation generating 4 sessions
    const sessionsToGenerate = Math.min(4, Math.floor((state.preferences.hours * 60) / duration));
    
    for (let i = 0; i < sessionsToGenerate; i++) {
        // Pick subject - heavily favor high priority
        let subjectIndex = 0;
        if (i > 1 && prioritizedSubjects.length > 1) {
             subjectIndex = i % prioritizedSubjects.length;
        }
        
        const subject = prioritizedSubjects[subjectIndex];
        
        // Pick a random topic based on chapters (simulated)
        const topic = subject.chapters[Math.floor(Math.random() * subject.chapters.length)];
        
        newTimetable.push({
            id: 'session_' + Date.now() + i,
            time: formatTime(currentTime),
            subjectId: subject.id,
            subjectName: subject.name,
            topic: topic,
            duration: duration,
            priority: subject.priorityInfo.level,
            status: 'Not Started'
        });

        // Add duration + 15 min break
        currentTime.setMinutes(currentTime.getMinutes() + duration + 15);
    }

    state.timetable = newTimetable;
    state.progress.totalSessions = newTimetable.length;
    state.progress.completedSessions = 0; // reset for new plan
    
    savePlannerData();
    renderTimetable();
    updateDashboard();
}

// --- DOM Rendering ---
function updateDashboard() {
    // 1. Study Hours (simulated based on preference)
    const hours = state.preferences ? state.preferences.hours * state.preferences.days.length : 24;
    DOM.statHours.textContent = hours + ' hrs';
    
    // 2. Subjects
    DOM.statSubjects.textContent = state.subjects.length;
    
    // 3. Priority Subjects
    let highPriorityCount = 0;
    state.subjects.forEach(sub => {
        if(calculatePriority(sub).level === 'HIGH') highPriorityCount++;
    });
    DOM.statPriority.textContent = highPriorityCount;
    
    // 4. Plan Progress
    let progressPct = 0;
    if (state.progress.totalSessions > 0) {
        progressPct = Math.round((state.progress.completedSessions / state.progress.totalSessions) * 100);
    }
    DOM.statProgress.textContent = progressPct + '%';
}

function renderPrioritySubjects(filterLevel = 'all') {
    DOM.priorityList.innerHTML = '';
    
    let subjectsWithPriority = state.subjects.map(sub => {
        return { ...sub, priorityInfo: calculatePriority(sub) };
    });
    
    // Sort by score
    subjectsWithPriority.sort((a, b) => b.priorityInfo.score - a.priorityInfo.score);
    
    // Filter
    if (filterLevel !== 'all') {
        subjectsWithPriority = subjectsWithPriority.filter(sub => sub.priorityInfo.level.toLowerCase() === filterLevel);
    }
    
    if (subjectsWithPriority.length === 0) {
        DOM.priorityList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem;">No subjects found for this priority level.</p>';
        return;
    }

    subjectsWithPriority.forEach(sub => {
        const badgeClass = 'badge-' + sub.priorityInfo.level.toLowerCase();
        
        const cardHTML = `
            <div class="priority-card">
                <div class="priority-header">
                    <h4>${sub.name}</h4>
                    <span class="badge ${badgeClass}">${sub.priorityInfo.level}</span>
                </div>
                <div class="priority-meta">
                    <span>📅 ${new Date(sub.examDate).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                    <span>•</span>
                    <span>⚡ ${sub.difficulty}</span>
                </div>
                <div class="priority-reason">
                    "${sub.priorityInfo.reason}"
                </div>
                <div class="priority-score">
                    <span>Priority Score</span>
                    <span>${sub.priorityInfo.score}/100</span>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                        <span>Progress</span>
                        <span>${sub.progress}%</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${sub.progress}%"></div>
                    </div>
                </div>
            </div>
        `;
        DOM.priorityList.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function renderTimetable() {
    DOM.timetableList.innerHTML = '';
    
    if (state.timetable.length === 0) {
        DOM.timetableList.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No timetable generated yet.</p>';
        return;
    }

    state.timetable.forEach((session, index) => {
        const badgeClass = 'badge-' + session.priority.toLowerCase();
        const isCompleted = session.status === 'Completed';
        
        const buttonHTML = isCompleted 
            ? `<button class="btn btn-outline btn-sm" disabled style="opacity: 0.5;">Completed ✓</button>`
            : `<button class="btn btn-primary btn-sm" onclick="markSessionComplete('${session.id}')">Mark Complete</button>`;

        const itemHTML = `
            <div class="timetable-item" style="${isCompleted ? 'opacity: 0.7;' : ''}">
                <div class="time-badge">${session.time}</div>
                <div class="session-details">
                    <h4>${session.subjectName}</h4>
                    <p>${session.topic}</p>
                    <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                        <span class="badge ${badgeClass}">${session.priority}</span>
                        <span class="badge" style="background: var(--background); color: var(--text-muted);">${session.duration} min</span>
                        ${isCompleted ? '<span class="badge badge-low">Completed</span>' : ''}
                    </div>
                </div>
                <div class="session-actions">
                    ${buttonHTML}
                </div>
            </div>
        `;
        DOM.timetableList.insertAdjacentHTML('beforeend', itemHTML);
    });
}

function renderInsights() {
    const sorted = [...state.subjects].map(s => ({...s, prio: calculatePriority(s)})).sort((a,b) => b.progress - a.progress);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length-1];
    
    DOM.insightsList.innerHTML = `
        <div class="insight-item">
            <span class="rec-icon">💪</span>
            <p>Your strongest subject is <strong>${strongest.name}</strong> (${strongest.progress}% completed).</p>
        </div>
        <div class="insight-item">
            <span class="rec-icon">⚠️</span>
            <p><strong>${weakest.name}</strong> needs the most attention due to approaching exams and low progress.</p>
        </div>
        <div class="insight-item">
            <span class="rec-icon">📅</span>
            <p>Your exam workload is highest during the second week of September.</p>
        </div>
        <div class="insight-item">
            <span class="rec-icon">⏱️</span>
            <p>Recommended daily study time: <strong>4 hours</strong> based on your remaining chapters.</p>
        </div>
    `;
}

function renderRecommendations() {
    // Dynamic generation based on subjects
    DOM.recommendationsList.innerHTML = '';
    
    const weakSub = state.subjects.find(s => s.progress < 50);
    const strongSub = state.subjects.find(s => s.progress > 80);
    
    if (weakSub) {
        DOM.recommendationsList.insertAdjacentHTML('beforeend', `
            <div class="recommendation-card">
                <div class="rec-icon">⚠️</div>
                <div class="rec-content">
                    <h4>Focus on ${weakSub.name}</h4>
                    <p>Topics like ${weakSub.chapters[0]} and ${weakSub.chapters[1]} need more practice before the upcoming exam.</p>
                    <button class="btn btn-outline btn-sm" onclick="showToast('Added study session for ${weakSub.name}', 'success')">Study Now</button>
                </div>
            </div>
        `);
    }

    if (strongSub) {
        DOM.recommendationsList.insertAdjacentHTML('beforeend', `
            <div class="recommendation-card">
                <div class="rec-icon">📚</div>
                <div class="rec-content">
                    <h4>Revise ${strongSub.name}</h4>
                    <p>You have completed most topics. Schedule a revision session this week to retain knowledge.</p>
                    <button class="btn btn-outline btn-sm" onclick="showToast('Revision session added to calendar', 'success')">Add Revision</button>
                </div>
            </div>
        `);
    }
    
    DOM.recommendationsList.insertAdjacentHTML('beforeend', `
        <div class="recommendation-card">
            <div class="rec-icon">⏱️</div>
            <div class="rec-content">
                <h4>Use Short Sessions</h4>
                <p>Try 45-minute focused sessions with 10-minute breaks to maintain consistency and avoid burnout.</p>
                <button class="btn btn-outline btn-sm" onclick="applyRecDuration(45)">Apply</button>
            </div>
        </div>
    `);
}

// --- Interactions ---

// Called from HTML onclick
window.markSessionComplete = function(sessionId) {
    const session = state.timetable.find(s => s.id === sessionId);
    if (session && session.status !== 'Completed') {
        session.status = 'Completed';
        state.progress.completedSessions++;
        
        // Update subject progress slightly (simulation)
        const subject = state.subjects.find(s => s.id === session.subjectId);
        if(subject && subject.progress < 100) {
            subject.progress = Math.min(100, subject.progress + 5);
        }
        
        savePlannerData();
        renderTimetable();
        updateDashboard();
        renderPrioritySubjects(document.querySelector('.filter-btn.active').dataset.filter);
        showToast("Study session completed.", "success");
    }
};

window.applyRecDuration = function(duration) {
    document.getElementById('session-duration').value = duration;
    showToast("Session duration updated to " + duration + " mins.", "info");
};

// --- Utilities ---
function parseTime(t) {
    var d = new Date();
    var time = t.match(/(\d+)(?::(\d\d))?\s*(p?)/);
    d.setHours(parseInt(time[1]) + (time[3] ? 12 : 0));
    d.setMinutes(parseInt(time[2]) || 0);
    return d;
}

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    
    DOM.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // Wait for transition
    }, 3000);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    DOM.generatorForm.addEventListener('submit', handleGenerateSubmit);
    
    // Priority Filters
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            DOM.filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderPrioritySubjects(e.target.dataset.filter);
        });
    });

    // Mobile Menu
    DOM.mobileMenuBtn.addEventListener('click', () => {
        DOM.sidebar.classList.add('active');
    });
    
    DOM.mobileMenuClose.addEventListener('click', () => {
        DOM.sidebar.classList.remove('active');
    });

    // Regenerate Modal
    DOM.btnRegenerate.addEventListener('click', () => {
        DOM.confirmModal.classList.add('active');
    });

    DOM.btnCancelModal.addEventListener('click', () => {
        DOM.confirmModal.classList.remove('active');
    });

    DOM.btnConfirmModal.addEventListener('click', () => {
        DOM.confirmModal.classList.remove('active');
        simulateAIGeneration();
    });
}

// --- Run App ---
document.addEventListener('DOMContentLoaded', init);
