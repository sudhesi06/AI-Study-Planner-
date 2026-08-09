// State variables
let sessions = [];
let currentView = 'weekly'; // daily, weekly, calendar
let currentDate = new Date(2026, 7, 10); // Aug 10, 2026 for demo purposes if needed, otherwise new Date()
let subjectFilter = 'all';
let priorityFilter = 'all';

// DOM Elements
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');

const viewBtns = document.querySelectorAll('.view-btn');
const dailyView = document.getElementById('dailyView');
const weeklyView = document.getElementById('weeklyView');
const calendarView = document.getElementById('calendarView');

const currentDateDisplay = document.getElementById('currentDateDisplay');
const prevDateBtn = document.getElementById('prevDateBtn');
const nextDateBtn = document.getElementById('nextDateBtn');
const todayBtn = document.getElementById('todayBtn');

const addSessionBtn = document.getElementById('addSessionBtn');
const sessionModal = document.getElementById('sessionModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const sessionForm = document.getElementById('sessionForm');
const modalTitle = document.getElementById('modalTitle');

const subjectFilterSelect = document.getElementById('subjectFilter');
const priorityChips = document.querySelectorAll('.filter-chip');

const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let sessionToDelete = null;

// Initialize App
function init() {
    loadSessions();
    if (sessions.length === 0) {
        generateDemoData();
    }
    
    // Set initial date to Aug 10, 2026 if requested by demo, else use current
    // We'll stick to new Date() as a default, but since prompt examples use Aug 2026, let's just use current system date.
    currentDate = new Date();
    
    updateSubjectsList();
    setupEventListeners();
    updateView();
}

// Data Management
function loadSessions() {
    const stored = localStorage.getItem('studyPlannerSessions');
    if (stored) {
        sessions = JSON.parse(stored);
    }
}

function saveSessions() {
    localStorage.setItem('studyPlannerSessions', JSON.stringify(sessions));
    updateStatistics();
    updateSubjectsList();
    renderCurrentView();
}

function generateDemoData() {
    // Generate dates based on today to ensure they show up in weekly/daily views easily,
    // or just use 2026-08-10 as per prompt. Let's use relative to today for better UX,
    // but the prompt explicitly said Aug 2026. Let's use current week so it looks good.
    const today = new Date();
    const d1 = new Date(today);
    const d2 = new Date(today); d2.setDate(d2.getDate() + 1);
    const d3 = new Date(today); d3.setDate(d3.getDate() + 2);
    
    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    sessions = [
        {
            id: Date.now(),
            subject: "Data Structures",
            topic: "Trees and Graphs",
            date: formatDate(d1),
            startTime: "18:00",
            endTime: "19:00",
            priority: "High",
            status: "Not Started",
            notes: "Demo session 1"
        },
        {
            id: Date.now() + 1,
            subject: "DBMS",
            topic: "Normalization",
            date: formatDate(d2),
            startTime: "19:00",
            endTime: "19:45",
            priority: "Medium",
            status: "Not Started",
            notes: "Demo session 2"
        },
        {
            id: Date.now() + 2,
            subject: "Java",
            topic: "Collections",
            date: formatDate(d3),
            startTime: "18:00",
            endTime: "19:00",
            priority: "Low",
            status: "Not Started",
            notes: "Demo session 3"
        }
    ];
    saveSessions();
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu
    mobileMenuBtn.addEventListener('click', () => sidebar.classList.add('open'));
    mobileCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // View Switcher
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            updateView();
        });
    });

    // Date Navigation
    prevDateBtn.addEventListener('click', () => changeDate(-1));
    nextDateBtn.addEventListener('click', () => changeDate(1));
    todayBtn.addEventListener('click', goToToday);

    // Filters
    subjectFilterSelect.addEventListener('change', (e) => {
        subjectFilter = e.target.value;
        renderCurrentView();
    });

    priorityChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            priorityChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            priorityFilter = chip.dataset.priority;
            renderCurrentView();
        });
    });

    // Modals
    addSessionBtn.addEventListener('click', () => openSessionModal());
    closeModalBtn.addEventListener('click', closeSessionModal);
    cancelModalBtn.addEventListener('click', closeSessionModal);
    
    const subjectSelect = document.getElementById('subject');
    const newSubjectInput = document.getElementById('newSubject');
    
    subjectSelect.addEventListener('change', (e) => {
        if(e.target.value === 'new') {
            newSubjectInput.style.display = 'block';
            newSubjectInput.required = true;
        } else {
            newSubjectInput.style.display = 'none';
            newSubjectInput.required = false;
        }
    });

    sessionForm.addEventListener('submit', handleSessionSubmit);

    // Delete Modal
    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', () => {
        if (sessionToDelete) {
            deleteSession(sessionToDelete);
            closeDeleteModal();
        }
    });
}

// Navigation & Views
function updateView() {
    dailyView.style.display = 'none';
    weeklyView.style.display = 'none';
    calendarView.style.display = 'none';

    if (currentView === 'daily') {
        dailyView.style.display = 'block';
        updateDateDisplayDaily();
        renderDailyView();
    } else if (currentView === 'weekly') {
        weeklyView.style.display = 'block';
        updateDateDisplayWeekly();
        renderWeeklyView();
    } else if (currentView === 'calendar') {
        calendarView.style.display = 'block';
        updateDateDisplayCalendar();
        renderCalendar();
    }
    updateStatistics();
}

function changeDate(dir) {
    if (currentView === 'daily') {
        currentDate.setDate(currentDate.getDate() + dir);
    } else if (currentView === 'weekly') {
        currentDate.setDate(currentDate.getDate() + (dir * 7));
    } else if (currentView === 'calendar') {
        currentDate.setMonth(currentDate.getMonth() + dir);
    }
    updateView();
}

function goToToday() {
    currentDate = new Date();
    updateView();
}

function updateDateDisplayDaily() {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    currentDateDisplay.textContent = currentDate.toLocaleDateString('en-US', options);
    document.getElementById('dailyDateTitle').textContent = currentDateDisplay.textContent;
}

function updateDateDisplayWeekly() {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    currentDateDisplay.textContent = `${startStr} - ${endStr}`;
}

function updateDateDisplayCalendar() {
    const options = { month: 'long', year: 'numeric' };
    currentDateDisplay.textContent = currentDate.toLocaleDateString('en-US', options);
}

function renderCurrentView() {
    if (currentView === 'daily') renderDailyView();
    else if (currentView === 'weekly') renderWeeklyView();
    else if (currentView === 'calendar') renderCalendar();
}

// Formatting helpers
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${m} ${ampm}`;
}

function getDuration(start, end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
}

// Filtering
function filterSessions(sessionList) {
    return sessionList.filter(s => {
        const matchSubject = subjectFilter === 'all' || s.subject === subjectFilter;
        const matchPriority = priorityFilter === 'all' || s.priority === priorityFilter;
        return matchSubject && matchPriority;
    }).sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });
}

// Views Renderers
function renderDailyView() {
    const timeline = document.getElementById('dailyTimeline');
    timeline.innerHTML = '';
    
    const dateStr = formatDate(currentDate);
    let daySessions = filterSessions(sessions.filter(s => s.date === dateStr));

    if (daySessions.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <h3>No study sessions scheduled</h3>
                <p>Add a study session to start planning your day.</p>
                <button class="btn btn-primary" onclick="openSessionModal()">+ Add Session</button>
            </div>
        `;
        return;
    }

    // Current time indicator logic
    const now = new Date();
    const isToday = formatDate(now) === dateStr;

    // We can list them out sequentially like the prompt example
    let html = '';
    daySessions.forEach(session => {
        const duration = getDuration(session.startTime, session.endTime);
        const cardClass = `session-card ${session.priority.toLowerCase()} ${session.status === 'Completed' ? 'completed' : ''}`;
        
        html += `
            <div class="time-row">
                <div class="time-label">${formatTime(session.startTime)}</div>
                <div class="time-content">
                    <div class="${cardClass}">
                        <div class="session-header">
                            <div>
                                <h4 class="session-subject">${session.subject}</h4>
                                <p class="session-topic">${session.topic}</p>
                            </div>
                            <div class="session-actions">
                                ${session.status === 'Not Started' ? 
                                    `<button class="btn btn-outline" onclick="startSession(${session.id})">Start</button>` : ''}
                                ${session.status === 'In Progress' ? 
                                    `<button class="btn btn-outline" style="background:var(--success-bg); color:var(--success)" onclick="completeSession(${session.id})">Complete</button>` : ''}
                                ${session.status === 'Completed' ? 
                                    `<span style="color:var(--success); font-size:16px;">✅</span>` : ''}
                                <button class="btn btn-outline" onclick="editSession(${session.id})">Edit</button>
                                <button class="btn btn-outline" onclick="confirmDelete(${session.id})" style="color:var(--danger)">Delete</button>
                            </div>
                        </div>
                        <div class="session-meta">
                            <span>⏱️ ${duration} min</span>
                            <span>⏳ ${formatTime(session.startTime)} - ${formatTime(session.endTime)}</span>
                            <span class="session-priority-badge">${session.priority}</span>
                            <span>Status: ${session.status}</span>
                        </div>
                        ${session.notes ? `<p style="font-size:12px; color:var(--text-muted); margin-top:8px">${session.notes}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    timeline.innerHTML = html;

    if (isToday) {
        // Add current time indicator if within visible hours
        const currentMins = now.getHours() * 60 + now.getMinutes();
        // Since we are not rendering a strict Y-axis grid, placing an indicator precisely is tricky without fixed heights.
        // But we can just create it dynamically inside the container.
    }
}

function renderWeeklyView() {
    const grid = document.getElementById('weeklyGrid');
    const weekStart = getWeekStart(currentDate);
    const dates = [];
    
    for(let i=0; i<7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }

    // Build headers
    let html = `<div class="weekly-header-cell">Time</div>`;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    dates.forEach((d, i) => {
        const isToday = formatDate(d) === formatDate(new Date());
        html += `<div class="weekly-header-cell ${isToday ? 'today' : ''}">
            ${days[i]}<br>
            <span style="font-size:12px; font-weight:400">${d.getDate()}</span>
        </div>`;
    });

    // We will render hours from 6 AM to 10 PM
    for(let hour = 6; hour <= 22; hour++) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        html += `<div class="weekly-time-cell">${h} ${ampm}</div>`;
        
        dates.forEach(d => {
            html += `<div class="weekly-day-column" data-date="${formatDate(d)}" data-hour="${hour}"></div>`;
        });
    }

    grid.innerHTML = html;

    // Place sessions
    const weekSessions = filterSessions(sessions.filter(s => {
        const sd = new Date(s.date);
        return sd >= weekStart && sd <= dates[6];
    }));

    weekSessions.forEach(session => {
        const dateStr = session.date;
        const [sh, sm] = session.startTime.split(':').map(Number);
        
        // Find column
        const cols = document.querySelectorAll(`.weekly-day-column[data-date="${dateStr}"][data-hour="${sh}"]`);
        if(cols.length > 0) {
            const duration = getDuration(session.startTime, session.endTime);
            const height = (duration / 60) * 60; // 60px per hour
            const top = (sm / 60) * 60;
            
            const block = document.createElement('div');
            block.className = `weekly-session-block ${session.priority.toLowerCase()} ${session.status === 'Completed' ? 'completed' : ''}`;
            block.style.top = `${top}px`;
            block.style.height = `${Math.max(20, height)}px`;
            block.innerHTML = `
                <div class="weekly-session-title">${session.subject}</div>
                <div class="weekly-session-time">${formatTime(session.startTime)}</div>
            `;
            block.onclick = () => {
                // If in weekly view, clicking could open edit or show daily view.
                currentDate = new Date(session.date);
                currentView = 'daily';
                document.querySelector('.view-btn[data-view="daily"]').click();
            };
            
            cols[0].appendChild(block);
        }
    });
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startingDay = firstDay.getDay(); // 0 is Sunday
    const monthLength = lastDay.getDate();
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    let html = '';
    let day = 1;
    
    const todayStr = formatDate(new Date());
    const selectedStr = formatDate(currentDate);

    for (let i = 0; i < 42; i++) {
        if (i < startingDay) {
            // Previous month
            const pDay = prevMonthLastDay - startingDay + i + 1;
            html += `<div class="calendar-cell other-month">${pDay}</div>`;
        } else if (day <= monthLength) {
            // Current month
            const currentCellDate = new Date(year, month, day);
            const dateStr = formatDate(currentCellDate);
            
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedStr;
            
            const daySessions = filterSessions(sessions.filter(s => s.date === dateStr));
            
            let indicators = '';
            daySessions.forEach(s => {
                let cl = s.priority.toLowerCase();
                if(s.status === 'Completed') cl = 'completed';
                indicators += `<div class="indicator-dot ${cl}"></div>`;
            });

            html += `
                <div class="calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" onclick="selectDate('${dateStr}')">
                    <div class="calendar-date">${day}</div>
                    <div class="calendar-indicators">
                        ${indicators}
                    </div>
                </div>
            `;
            day++;
        } else {
            // Next month
            const nDay = day - monthLength;
            html += `<div class="calendar-cell other-month">${nDay}</div>`;
            day++;
        }
    }
    
    grid.innerHTML = html;
    
    // Update Day Details below calendar
    renderCalendarDayDetails(selectedStr);
}

function selectDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    currentDate = new Date(y, m - 1, d);
    renderCalendar();
}

function renderCalendarDayDetails(dateStr) {
    const detailsContainer = document.getElementById('calendarDaySessions');
    document.getElementById('selectedDateText').textContent = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    const daySessions = filterSessions(sessions.filter(s => s.date === dateStr));
    
    if (daySessions.length === 0) {
        detailsContainer.innerHTML = '<p style="color:var(--text-muted)">No study sessions scheduled for this date.</p>';
        return;
    }
    
    let html = '';
    daySessions.forEach(session => {
        const cardClass = `session-card ${session.priority.toLowerCase()} ${session.status === 'Completed' ? 'completed' : ''}`;
        html += `
            <div class="${cardClass}" style="background:var(--bg-white); border: 1px solid var(--border); border-left: 4px solid var(--priority-${session.priority.toLowerCase()})">
                <div class="session-header">
                    <div>
                        <h5 style="margin-bottom:4px;">${session.subject}</h5>
                        <p style="font-size:12px; color:var(--text-muted);">${session.topic}</p>
                    </div>
                    <div style="font-size:12px; font-weight:600;">
                        ${formatTime(session.startTime)}
                    </div>
                </div>
            </div>
        `;
    });
    
    detailsContainer.innerHTML = html;
}

// Statistics
function updateStatistics() {
    const todayStr = formatDate(new Date());
    const todaySessions = sessions.filter(s => s.date === todayStr);
    
    document.getElementById('stat-today').textContent = todaySessions.length;
    
    let totalMins = 0;
    let completed = 0;
    
    todaySessions.forEach(s => {
        totalMins += getDuration(s.startTime, s.endTime);
        if (s.status === 'Completed') completed++;
    });
    
    const hrs = (totalMins / 60).toFixed(1);
    document.getElementById('stat-hours').textContent = `${hrs} hrs`;
    
    document.getElementById('stat-completed').textContent = `${completed} / ${todaySessions.length}`;
    
    document.getElementById('stat-remaining').textContent = todaySessions.length - completed;
}

function updateSubjectsList() {
    const subjects = new Set(sessions.map(s => s.subject));
    const predefined = ["Data Structures", "DBMS", "Java"];
    predefined.forEach(p => subjects.add(p));
    
    // Update Filter
    subjectFilterSelect.innerHTML = '<option value="all">All Subjects</option>';
    
    // Update Form Select
    const formSelect = document.getElementById('subject');
    formSelect.innerHTML = '<option value="" disabled selected>Select or type a subject...</option>';
    
    Array.from(subjects).sort().forEach(sub => {
        subjectFilterSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        formSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
    
    formSelect.innerHTML += `<option value="new">+ Add New Subject</option>`;
    
    subjectFilterSelect.value = subjectFilter;
}

// Modals & Form
function openSessionModal(sessionId = null) {
    const newSubjectInput = document.getElementById('newSubject');
    if (sessionId) {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            document.getElementById('modalTitle').textContent = 'Edit Study Session';
            document.getElementById('sessionId').value = session.id;
            
            // Check if subject exists in dropdown
            const subjectSelect = document.getElementById('subject');
            let hasSubject = false;
            for(let i=0; i<subjectSelect.options.length; i++){
                if(subjectSelect.options[i].value === session.subject){
                    hasSubject = true;
                    break;
                }
            }
            if(!hasSubject) {
                subjectSelect.value = 'new';
                newSubjectInput.style.display = 'block';
                newSubjectInput.value = session.subject;
            } else {
                subjectSelect.value = session.subject;
                newSubjectInput.style.display = 'none';
                newSubjectInput.value = '';
            }

            document.getElementById('topic').value = session.topic;
            document.getElementById('date').value = session.date;
            document.getElementById('startTime').value = session.startTime;
            document.getElementById('endTime').value = session.endTime;
            document.getElementById('priority').value = session.priority;
            document.getElementById('notes').value = session.notes || '';
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Add Study Session';
        sessionForm.reset();
        document.getElementById('sessionId').value = '';
        document.getElementById('date').value = formatDate(currentDate);
        newSubjectInput.style.display = 'none';
    }
    
    sessionModal.classList.add('active');
}

function closeSessionModal() {
    sessionModal.classList.remove('active');
}

function handleSessionSubmit(e) {
    e.preventDefault();
    
    let subject = document.getElementById('subject').value;
    if(subject === 'new') {
        subject = document.getElementById('newSubject').value.trim();
    }
    
    const sessionId = document.getElementById('sessionId').value;
    const sessionData = {
        subject: subject,
        topic: document.getElementById('topic').value,
        date: document.getElementById('date').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        priority: document.getElementById('priority').value,
        notes: document.getElementById('notes').value
    };

    if (sessionId) {
        // Edit
        const index = sessions.findIndex(s => s.id === Number(sessionId));
        if (index > -1) {
            sessions[index] = { ...sessions[index], ...sessionData };
            showToast('Study session updated.');
        }
    } else {
        // Add
        sessions.push({
            id: Date.now(),
            status: 'Not Started',
            ...sessionData
        });
        showToast('Study session added successfully.');
    }

    saveSessions();
    closeSessionModal();
}

// Session Actions
function startSession(id) {
    const session = sessions.find(s => s.id === id);
    if (session) {
        session.status = 'In Progress';
        saveSessions();
        showToast('Session started.');
    }
}

function completeSession(id) {
    const session = sessions.find(s => s.id === id);
    if (session) {
        session.status = 'Completed';
        saveSessions();
        showToast('Session marked as completed.');
    }
}

function editSession(id) {
    openSessionModal(id);
}

function confirmDelete(id) {
    sessionToDelete = id;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    sessionToDelete = null;
}

function deleteSession(id) {
    sessions = sessions.filter(s => s.id !== id);
    saveSessions();
    showToast('Study session deleted.');
}

// Toast
function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Run app
document.addEventListener('DOMContentLoaded', init);
