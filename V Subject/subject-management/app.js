// Constants and default data
const STORAGE_KEY = 'studyPlannerSubjects';

const DEFAULT_SUBJECTS = [
    {
        id: 1,
        name: "Data Structures",
        chapters: ["Arrays", "Linked List", "Stack", "Queue", "Trees"],
        difficulty: "Hard",
        examDate: "2026-09-10"
    },
    {
        id: 2,
        name: "Database Management",
        chapters: ["SQL", "Normalization", "Transactions", "Indexing"],
        difficulty: "Medium",
        examDate: "2026-09-15"
    }
];

// State
let subjects = [];

// DOM Elements
const subjectsGrid = document.getElementById('subjectsGrid');
const searchInput = document.getElementById('searchInput');

// Stats Elements
const statTotalSubjects = document.getElementById('stat-total-subjects');
const statTotalChapters = document.getElementById('stat-total-chapters');
const statUpcomingExams = document.getElementById('stat-upcoming-exams');

// Modal Elements
const modal = document.getElementById('subjectModal');
const modalTitle = document.getElementById('modalTitle');
const subjectForm = document.getElementById('subjectForm');
const formError = document.getElementById('formError');

// Inputs
const inputId = document.getElementById('subjectId');
const inputName = document.getElementById('subjectName');
const inputChapters = document.getElementById('subjectChapters');
const inputDifficulty = document.getElementById('subjectDifficulty');
const inputExamDate = document.getElementById('subjectExamDate');

// Buttons
const btnAddSubject = document.getElementById('addSubjectBtn');
const btnCloseIcon = document.getElementById('closeModalIcon');
const btnCancel = document.getElementById('cancelModalBtn');

// Initialization
function init() {
    loadData();
    renderSubjects();
    updateStats();
    setupEventListeners();
}

// Data Management
function loadData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        try {
            subjects = JSON.parse(storedData);
        } catch (e) {
            console.error('Failed to parse subjects from LocalStorage', e);
            subjects = [...DEFAULT_SUBJECTS];
        }
    } else {
        // Create demo data if empty
        subjects = [...DEFAULT_SUBJECTS];
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
}

// Event Listeners
function setupEventListeners() {
    btnAddSubject.addEventListener('click', () => openModal());
    btnCloseIcon.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    
    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    subjectForm.addEventListener('submit', handleFormSubmit);
    
    searchInput.addEventListener('input', (e) => {
        renderSubjects(e.target.value);
    });
}

// UI Updates
function renderSubjects(filterText = '') {
    subjectsGrid.innerHTML = '';

    const filteredSubjects = subjects.filter(sub => 
        sub.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredSubjects.length === 0) {
        subjectsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No subjects found</h3>
                <p>${filterText ? 'Try a different search term.' : 'Add a new subject to start planning.'}</p>
            </div>
        `;
        return;
    }

    filteredSubjects.forEach(subject => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        
        const badgeClass = `badge-${subject.difficulty.toLowerCase()}`;
        
        // Escape content safely
        const safeName = escapeHtml(subject.name);
        
        // Format chapters
        const chaptersHtml = subject.chapters.map(ch => `<li>${escapeHtml(ch.trim())}</li>`).join('');

        card.innerHTML = `
            <div class="subject-header">
                <h3>${safeName}</h3>
                <span class="badge ${badgeClass}">${subject.difficulty}</span>
            </div>
            <div class="subject-details">
                <span><strong>Chapters:</strong> ${subject.chapters.length}</span>
                <span><strong>Exam Date:</strong> ${formatDate(subject.examDate)}</span>
            </div>
            <div class="chapters-list">
                <h4>Chapter List:</h4>
                <ul>
                    ${chaptersHtml}
                </ul>
            </div>
            <div class="card-actions">
                <button class="btn-icon edit" onclick="editSubject(${subject.id})">✏️ Edit</button>
                <button class="btn-icon delete" onclick="deleteSubject(${subject.id})">🗑️ Delete</button>
            </div>
        `;
        
        subjectsGrid.appendChild(card);
    });
}

function updateStats() {
    // Total Subjects
    statTotalSubjects.textContent = subjects.length;

    // Total Chapters
    const totalChapters = subjects.reduce((sum, sub) => sum + sub.chapters.length, 0);
    statTotalChapters.textContent = totalChapters;

    // Upcoming Exams (Today or future)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    let upcomingCount = 0;
    subjects.forEach(sub => {
        if (sub.examDate) {
            const examDate = new Date(sub.examDate);
            if (examDate >= today) {
                upcomingCount++;
            }
        }
    });
    
    statUpcomingExams.textContent = upcomingCount;
}

// Modal Functions
function openModal(editId = null) {
    formError.style.display = 'none';
    formError.textContent = '';
    
    if (editId !== null) {
        modalTitle.textContent = 'Edit Subject';
        const subject = subjects.find(s => s.id === editId);
        if (subject) {
            inputId.value = subject.id;
            inputName.value = subject.name;
            inputChapters.value = subject.chapters.join(', ');
            inputDifficulty.value = subject.difficulty;
            inputExamDate.value = subject.examDate;
        }
    } else {
        modalTitle.textContent = 'Add Subject';
        subjectForm.reset();
        inputId.value = '';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validation
    const name = inputName.value.trim();
    const chaptersText = inputChapters.value.trim();
    const difficulty = inputDifficulty.value;
    const examDate = inputExamDate.value;
    
    if (!name || !chaptersText || !difficulty || !examDate) {
        showError('All fields are required.');
        return;
    }
    
    const chaptersArray = chaptersText.split(',').map(ch => ch.trim()).filter(ch => ch.length > 0);
    if (chaptersArray.length === 0) {
        showError('Please enter at least one valid chapter.');
        return;
    }

    const currentId = inputId.value;
    
    // Check duplicate name
    const isDuplicate = subjects.some(s => s.name.toLowerCase() === name.toLowerCase() && s.id.toString() !== currentId);
    if (isDuplicate) {
        showError('A subject with this name already exists.');
        return;
    }

    if (currentId) {
        // Edit existing
        const index = subjects.findIndex(s => s.id.toString() === currentId);
        if (index !== -1) {
            subjects[index] = {
                id: parseInt(currentId),
                name,
                chapters: chaptersArray,
                difficulty,
                examDate
            };
        }
    } else {
        // Add new
        const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
        subjects.push({
            id: newId,
            name,
            chapters: chaptersArray,
            difficulty,
            examDate
        });
    }

    saveData();
    
    // Re-apply current search filter if any
    renderSubjects(searchInput.value);
    updateStats();
    
    closeModal();
}

function showError(msg) {
    formError.textContent = msg;
    formError.style.display = 'block';
}

// Global exposure for inline onclick handlers
window.editSubject = function(id) {
    openModal(id);
};

window.deleteSubject = function(id) {
    const confirmDelete = confirm("Are you sure you want to delete this subject?");
    if (confirmDelete) {
        subjects = subjects.filter(s => s.id !== id);
        saveData();
        renderSubjects(searchInput.value);
        updateStats();
    }
};

// Utilities
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Start app
init();
