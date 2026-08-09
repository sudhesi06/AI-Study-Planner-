/**
 * Subject Management App
 * AI Study Planner Module
 */

// Constants
const STORAGE_KEY = 'studyPlannerSubjects';

// DOM Elements
const addSubjectBtn = document.getElementById('addSubjectBtn');
const subjectModal = document.getElementById('subjectModal');
const closeModalIcon = document.getElementById('closeModalIcon');
const cancelBtn = document.getElementById('cancelBtn');
const subjectForm = document.getElementById('subjectForm');
const modalTitle = document.getElementById('modalTitle');
const subjectsContainer = document.getElementById('subjectsContainer');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');

// Statistics Elements
const statTotalSubjects = document.getElementById('statTotalSubjects');
const statTotalChapters = document.getElementById('statTotalChapters');
const statUpcomingExams = document.getElementById('statUpcomingExams');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Form Inputs
const inputSubjectId = document.getElementById('subjectId');
const inputSubjectName = document.getElementById('subjectName');
const inputSubjectChapters = document.getElementById('subjectChapters');
const inputSubjectDifficulty = document.getElementById('subjectDifficulty');
const inputSubjectDate = document.getElementById('subjectDate');

// State
let subjects = [];
let subjectToDeleteId = null;

// Initialize Application
function init() {
    loadData();
    setupEventListeners();
    renderSubjects();
    updateStats();
}

// Data Management
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            subjects = JSON.parse(data);
        } catch (e) {
            console.error('Error parsing local storage data', e);
            subjects = [];
        }
    } else {
        // Default Demo Data
        subjects = [
            {
                id: generateId(),
                name: "Data Structures",
                chapters: ["Arrays", "Linked List", "Stack", "Queue", "Trees"],
                difficulty: "Hard",
                examDate: "2026-09-10"
            },
            {
                id: generateId(),
                name: "Database Management",
                chapters: ["SQL", "Normalization", "Transactions", "Indexing"],
                difficulty: "Medium",
                examDate: "2026-09-15"
            }
        ];
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// UI Rendering
function renderSubjects(filterQuery = '') {
    subjectsContainer.innerHTML = '';
    
    // Filter subjects
    const filteredSubjects = subjects.filter(subject => 
        subject.name.toLowerCase().includes(filterQuery.toLowerCase())
    );

    // Empty state handling
    if (filteredSubjects.length === 0) {
        emptyState.style.display = 'block';
        if (filterQuery !== '') {
            emptyState.querySelector('h3').textContent = 'No subjects found matching your search';
            emptyState.querySelector('p').textContent = 'Try a different keyword.';
        } else {
            emptyState.querySelector('h3').textContent = 'No subjects found';
            emptyState.querySelector('p').textContent = 'Add a new subject to start planning.';
        }
    } else {
        emptyState.style.display = 'none';
        
        filteredSubjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            
            // Generate chapter list HTML safely
            const chaptersHtml = subject.chapters.map(chapter => 
                `<li>${escapeHtml(chapter.trim())}</li>`
            ).join('');
            
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(subject.name)}</h3>
                    <div class="card-actions">
                        <button class="btn-icon edit-btn" data-id="${subject.id}" title="Edit Subject">✏️</button>
                        <button class="btn-icon delete-btn" data-id="${subject.id}" title="Delete Subject">🗑️</button>
                    </div>
                </div>
                <div class="card-meta">
                    <span class="badge badge-${subject.difficulty.toLowerCase()}">${escapeHtml(subject.difficulty)}</span>
                    <span class="meta-item">📅 ${formatDate(subject.examDate)}</span>
                </div>
                <div class="card-body">
                    <h4 class="chapter-title">Chapters (${subject.chapters.length})</h4>
                    <ul class="chapter-list">
                        ${chaptersHtml}
                    </ul>
                </div>
            `;
            
            subjectsContainer.appendChild(card);
        });

        // Add event listeners for edit and delete buttons on generated cards
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openDeleteModal(e.currentTarget.dataset.id));
        });
    }
}

function updateStats() {
    const totalSubjects = subjects.length;
    
    let totalChapters = 0;
    subjects.forEach(sub => {
        totalChapters += sub.chapters.length;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let upcomingExams = 0;
    subjects.forEach(sub => {
        const examDate = new Date(sub.examDate);
        if (examDate >= today) {
            upcomingExams++;
        }
    });

    statTotalSubjects.textContent = totalSubjects;
    statTotalChapters.textContent = totalChapters;
    statUpcomingExams.textContent = upcomingExams;
}

// Utility Functions
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    // adding timezone offset to prevent shifting day behind
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctDate = new Date(date.getTime() + userTimezoneOffset);
    return correctDate.toLocaleDateString('en-US', options);
}

// Modal Management
function openAddModal() {
    modalTitle.textContent = 'Add Subject';
    subjectForm.reset();
    inputSubjectId.value = '';
    clearValidationErrors();
    subjectModal.classList.add('active');
}

function openEditModal(id) {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;

    modalTitle.textContent = 'Edit Subject';
    inputSubjectId.value = subject.id;
    inputSubjectName.value = subject.name;
    inputSubjectChapters.value = subject.chapters.join(', ');
    inputSubjectDifficulty.value = subject.difficulty;
    inputSubjectDate.value = subject.examDate;
    
    clearValidationErrors();
    subjectModal.classList.add('active');
}

function closeModal() {
    subjectModal.classList.remove('active');
}

function openDeleteModal(id) {
    subjectToDeleteId = id;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    subjectToDeleteId = null;
}

// Form Validation and Submission
function clearValidationErrors() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
    });
}

function validateForm() {
    let isValid = true;
    clearValidationErrors();

    const name = inputSubjectName.value.trim();
    const chapters = inputSubjectChapters.value.trim();
    const difficulty = inputSubjectDifficulty.value;
    const date = inputSubjectDate.value;

    if (!name) {
        inputSubjectName.parentElement.classList.add('has-error');
        isValid = false;
    } else {
        // Optional: Check for duplicates when adding new
        const id = inputSubjectId.value;
        const exists = subjects.some(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== id);
        if (exists) {
            const errorMsg = document.getElementById('nameError');
            errorMsg.textContent = 'A subject with this name already exists';
            inputSubjectName.parentElement.classList.add('has-error');
            isValid = false;
        } else {
            document.getElementById('nameError').textContent = 'Subject name is required';
        }
    }

    if (!chapters) {
        inputSubjectChapters.parentElement.classList.add('has-error');
        isValid = false;
    }

    if (!difficulty) {
        inputSubjectDifficulty.parentElement.classList.add('has-error');
        isValid = false;
    }

    if (!date) {
        inputSubjectDate.parentElement.classList.add('has-error');
        isValid = false;
    }

    return isValid;
}

function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const id = inputSubjectId.value;
    const name = inputSubjectName.value.trim();
    const chaptersStr = inputSubjectChapters.value.trim();
    
    // Parse chapters string into array, removing empty parts
    const chapters = chaptersStr.split(',')
        .map(ch => ch.trim())
        .filter(ch => ch.length > 0);
        
    const difficulty = inputSubjectDifficulty.value;
    const examDate = inputSubjectDate.value;

    if (id) {
        // Edit existing
        const index = subjects.findIndex(s => s.id === id);
        if (index !== -1) {
            subjects[index] = { id, name, chapters, difficulty, examDate };
        }
    } else {
        // Add new
        subjects.push({
            id: generateId(),
            name,
            chapters,
            difficulty,
            examDate
        });
    }

    saveData();
    closeModal();
    
    // Maintain search context if any
    renderSubjects(searchInput.value);
    updateStats();
}

function handleDeleteConfirm() {
    if (subjectToDeleteId) {
        subjects = subjects.filter(s => s.id !== subjectToDeleteId);
        saveData();
        renderSubjects(searchInput.value);
        updateStats();
    }
    closeDeleteModal();
}

// Event Listeners Setup
function setupEventListeners() {
    // Add Subject Button
    addSubjectBtn.addEventListener('click', openAddModal);

    // Modal Close Buttons
    closeModalIcon.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Form Submit
    subjectForm.addEventListener('submit', handleFormSubmit);

    // Delete Modal Actions
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);

    // Search Input
    searchInput.addEventListener('input', (e) => {
        renderSubjects(e.target.value);
    });

    // Close modals on outside click
    subjectModal.addEventListener('click', (e) => {
        if (e.target === subjectModal) {
            closeModal();
        }
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// Boot the app
document.addEventListener('DOMContentLoaded', init);
