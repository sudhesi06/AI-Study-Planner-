/* ================================================================
   StudyPlanner AI – Progress Tracking  |  app.js
   Pure Vanilla JS – No frameworks, no external libraries
   ================================================================ */

'use strict';

// ── Storage Keys ─────────────────────────────────────────────────
const STORAGE_KEYS = {
  tasks:        'studyPlannerTasks',
  stats:        'studyPlannerStats',
  achievements: 'studyPlannerAchievements',
  weeklyGoal:   'studyPlannerWeeklyGoal',
};

// ── App State ─────────────────────────────────────────────────────
let state = {
  tasks:        [],
  stats:        {},
  achievements: [],
  weeklyGoal:   30,
  activeFilter: 'all',
  activeSubject: 'all',
  activeDateRange: 'week',
};

// ── Demo Data ─────────────────────────────────────────────────────
function buildDemoData() {
  const today = new Date();
  function daysAgo(n) {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  const tasks = [
    { id: 't001', name: 'Arrays Basics',               subject: 'Data Structures',    duration: 90,  date: daysAgo(6), status: 'completed',   completedAt: daysAgo(6) },
    { id: 't002', name: 'Linked List Implementation',  subject: 'Data Structures',    duration: 120, date: daysAgo(5), status: 'completed',   completedAt: daysAgo(5) },
    { id: 't003', name: 'Stack Operations',            subject: 'Data Structures',    duration: 60,  date: daysAgo(5), status: 'completed',   completedAt: daysAgo(5) },
    { id: 't004', name: 'Queue Practice',              subject: 'Data Structures',    duration: 60,  date: daysAgo(4), status: 'completed',   completedAt: daysAgo(4) },
    { id: 't005', name: 'Binary Trees',                subject: 'Data Structures',    duration: 150, date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't006', name: 'Graph Traversal',             subject: 'Data Structures',    duration: 120, date: daysAgo(2), status: 'completed',   completedAt: daysAgo(2) },
    { id: 't007', name: 'Sorting Algorithms',          subject: 'Data Structures',    duration: 90,  date: daysAgo(3), status: 'completed',   completedAt: daysAgo(3) },
    { id: 't008', name: 'Dynamic Programming Intro',   subject: 'Data Structures',    duration: 180, date: daysAgo(2), status: 'completed',   completedAt: daysAgo(2) },
    { id: 't009', name: 'Greedy Algorithms',           subject: 'Data Structures',    duration: 90,  date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't010', name: 'Hashing Techniques',          subject: 'Data Structures',    duration: 60,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't011', name: 'Heap and Priority Queue',     subject: 'Data Structures',    duration: 90,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't012', name: 'Tries and Segment Trees',     subject: 'Data Structures',    duration: 120, date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't013', name: 'Backtracking Problems',       subject: 'Data Structures',    duration: 150, date: daysAgo(0), status: 'in-progress', completedAt: null },
    { id: 't014', name: 'Advanced Graph Problems',     subject: 'Data Structures',    duration: 180, date: daysAgo(0), status: 'pending',     completedAt: null },

    { id: 't015', name: 'SQL Joins',                   subject: 'DBMS',               duration: 90,  date: daysAgo(6), status: 'completed',   completedAt: daysAgo(6) },
    { id: 't016', name: 'Normalization Concepts',      subject: 'DBMS',               duration: 120, date: daysAgo(5), status: 'completed',   completedAt: daysAgo(5) },
    { id: 't017', name: 'ER Diagram Modeling',         subject: 'DBMS',               duration: 90,  date: daysAgo(4), status: 'completed',   completedAt: daysAgo(4) },
    { id: 't018', name: 'Transactions & ACID',         subject: 'DBMS',               duration: 60,  date: daysAgo(3), status: 'completed',   completedAt: daysAgo(3) },
    { id: 't019', name: 'Indexing & Hashing',          subject: 'DBMS',               duration: 75,  date: daysAgo(3), status: 'completed',   completedAt: daysAgo(3) },
    { id: 't020', name: 'Query Optimization',          subject: 'DBMS',               duration: 90,  date: daysAgo(2), status: 'completed',   completedAt: daysAgo(2) },
    { id: 't021', name: 'Concurrency Control',         subject: 'DBMS',               duration: 90,  date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't022', name: 'Recovery Techniques',         subject: 'DBMS',               duration: 60,  date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't023', name: 'NoSQL Databases',             subject: 'DBMS',               duration: 90,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't024', name: 'Distributed Databases',       subject: 'DBMS',               duration: 120, date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't025', name: 'Database Security',           subject: 'DBMS',               duration: 60,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't026', name: 'Database Administration',     subject: 'DBMS',               duration: 90,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't027', name: 'Stored Procedures & Triggers',subject: 'DBMS',               duration: 120, date: daysAgo(0), status: 'in-progress', completedAt: null },
    { id: 't028', name: 'Data Warehousing',            subject: 'DBMS',               duration: 120, date: daysAgo(0), status: 'pending',     completedAt: null },

    { id: 't029', name: 'Java OOP Concepts',           subject: 'Java',               duration: 120, date: daysAgo(6), status: 'completed',   completedAt: daysAgo(6) },
    { id: 't030', name: 'Java Collections Framework', subject: 'Java',               duration: 150, date: daysAgo(5), status: 'completed',   completedAt: daysAgo(5) },
    { id: 't031', name: 'Exception Handling',          subject: 'Java',               duration: 90,  date: daysAgo(4), status: 'completed',   completedAt: daysAgo(4) },
    { id: 't032', name: 'Multithreading',              subject: 'Java',               duration: 120, date: daysAgo(3), status: 'completed',   completedAt: daysAgo(3) },
    { id: 't033', name: 'Java 8 Streams & Lambda',    subject: 'Java',               duration: 150, date: daysAgo(2), status: 'completed',   completedAt: daysAgo(2) },
    { id: 't034', name: 'Design Patterns',             subject: 'Java',               duration: 180, date: daysAgo(2), status: 'completed',   completedAt: daysAgo(2) },
    { id: 't035', name: 'Java I/O and NIO',            subject: 'Java',               duration: 90,  date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't036', name: 'Spring Boot Basics',          subject: 'Java',               duration: 180, date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't037', name: 'JUnit Testing',               subject: 'Java',               duration: 90,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't038', name: 'Maven & Build Tools',         subject: 'Java',               duration: 60,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't039', name: 'RESTful APIs with Java',      subject: 'Java',               duration: 150, date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't040', name: 'JVM Internals',               subject: 'Java',               duration: 120, date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't041', name: 'Java Memory Management',      subject: 'Java',               duration: 90,  date: daysAgo(0), status: 'in-progress', completedAt: null },
    { id: 't042', name: 'Hibernate ORM',               subject: 'Java',               duration: 150, date: daysAgo(0), status: 'pending',     completedAt: null },

    { id: 't043', name: 'Network Layers (OSI Model)', subject: 'Computer Networks',  duration: 90,  date: daysAgo(6), status: 'completed',   completedAt: daysAgo(6) },
    { id: 't044', name: 'TCP/IP Protocol Suite',      subject: 'Computer Networks',  duration: 120, date: daysAgo(5), status: 'completed',   completedAt: daysAgo(5) },
    { id: 't045', name: 'Routing Basics',             subject: 'Computer Networks',  duration: 90,  date: daysAgo(5), status: 'completed',   completedAt: daysAgo(5) },
    { id: 't046', name: 'Switching & VLANs',          subject: 'Computer Networks',  duration: 90,  date: daysAgo(4), status: 'completed',   completedAt: daysAgo(4) },
    { id: 't047', name: 'DNS & DHCP',                 subject: 'Computer Networks',  duration: 60,  date: daysAgo(3), status: 'completed',   completedAt: daysAgo(3) },
    { id: 't048', name: 'HTTP & HTTPS',               subject: 'Computer Networks',  duration: 60,  date: daysAgo(2), status: 'completed',   completedAt: daysAgo(2) },
    { id: 't049', name: 'Network Security Basics',    subject: 'Computer Networks',  duration: 90,  date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't050', name: 'Firewalls & Proxies',        subject: 'Computer Networks',  duration: 75,  date: daysAgo(1), status: 'completed',   completedAt: daysAgo(1) },
    { id: 't051', name: 'Wireless Networking',        subject: 'Computer Networks',  duration: 90,  date: daysAgo(0), status: 'completed',   completedAt: daysAgo(0) },
    { id: 't052', name: 'Network Monitoring',         subject: 'Computer Networks',  duration: 60,  date: daysAgo(0), status: 'in-progress', completedAt: null },
    { id: 't053', name: 'QoS & Traffic Shaping',      subject: 'Computer Networks',  duration: 90,  date: daysAgo(0), status: 'pending',     completedAt: null },
    { id: 't054', name: 'SDN & NFV',                  subject: 'Computer Networks',  duration: 120, date: daysAgo(0), status: 'pending',     completedAt: null },
    { id: 't055', name: 'Cloud Networking',           subject: 'Computer Networks',  duration: 90,  date: daysAgo(0), status: 'pending',     completedAt: null },
    { id: 't056', name: 'Network Design Project',     subject: 'Computer Networks',  duration: 180, date: daysAgo(0), status: 'pending',     completedAt: null },
    { id: 't057', name: 'Subnetting Mastery',         subject: 'Computer Networks',  duration: 90,  date: daysAgo(0), status: 'pending',     completedAt: null },
  ];

  const weeklyData = { Mon: 3, Tue: 4, Wed: 2, Thu: 5, Fri: 4, Sat: 6, Sun: 4 };

  const dailyProductivity = { Mon: 78, Tue: 92, Wed: 65, Thu: 88, Fri: 74, Sat: 95, Sun: 70 };

  const stats = {
    weeklyData,
    dailyProductivity,
    sessions: 24,
    totalStudyHours: 28.5,
  };

  const achievementDefs = [
    { id: 'a001', icon: '🏆', name: '7 Day Streak',     desc: 'Studied for 7 consecutive days.',         threshold: 7,  type: 'streak',      value: 7 },
    { id: 'a002', icon: '🎯', name: '50 Tasks Completed',desc: 'You completed 50 study tasks.',           threshold: 50, type: 'tasks',       value: 34 },
    { id: 'a003', icon: '⏱️', name: '25 Study Hours',    desc: 'You studied for 25+ hours this week.',   threshold: 25, type: 'hours',       value: 28.5 },
    { id: 'a004', icon: '🔥', name: 'Perfect Week',      desc: 'Completed all planned sessions this week.', threshold: 1, type: 'perfect',   value: 1 },
    { id: 'a005', icon: '📚', name: 'Subject Master',    desc: 'Achieved 80%+ in any subject.',           threshold: 80, type: 'subjectpct', value: 80 },
    { id: 'a006', icon: '⚡', name: 'Speed Learner',     desc: 'Completed 5 tasks in a single day.',      threshold: 5,  type: 'dailytasks',  value: 5 },
  ];

  return { tasks, stats, achievementDefs, weeklyGoal: 30 };
}

// ── LocalStorage Helpers ──────────────────────────────────────────
function saveProgressData() {
  localStorage.setItem(STORAGE_KEYS.tasks,        JSON.stringify(state.tasks));
  localStorage.setItem(STORAGE_KEYS.stats,        JSON.stringify(state.stats));
  localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(state.achievements));
  localStorage.setItem(STORAGE_KEYS.weeklyGoal,   JSON.stringify(state.weeklyGoal));
}

function loadProgressData() {
  const savedTasks   = localStorage.getItem(STORAGE_KEYS.tasks);
  const savedStats   = localStorage.getItem(STORAGE_KEYS.stats);
  const savedAch     = localStorage.getItem(STORAGE_KEYS.achievements);
  const savedGoal    = localStorage.getItem(STORAGE_KEYS.weeklyGoal);

  if (savedTasks && savedStats && savedAch) {
    state.tasks        = JSON.parse(savedTasks);
    state.stats        = JSON.parse(savedStats);
    state.achievements = JSON.parse(savedAch);
    state.weeklyGoal   = savedGoal ? JSON.parse(savedGoal) : 30;
  } else {
    const demo = buildDemoData();
    state.tasks        = demo.tasks;
    state.stats        = demo.stats;
    state.achievements = demo.achievementDefs;
    state.weeklyGoal   = demo.weeklyGoal;
    saveProgressData();
  }
}

// ── Calculations ──────────────────────────────────────────────────
function calculateOverallProgress() {
  const total     = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === 'completed').length;
  const inProgress = state.tasks.filter(t => t.status === 'in-progress').length;
  const pending   = state.tasks.filter(t => t.status === 'pending').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, inProgress, pending, pct };
}

function calculateSubjectProgress() {
  const subjects = ['Data Structures', 'DBMS', 'Java', 'Computer Networks'];
  return subjects.map(subject => {
    const subjectTasks = state.tasks.filter(t => t.subject === subject);
    const total     = subjectTasks.length;
    const completed = subjectTasks.filter(t => t.status === 'completed').length;
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { subject, total, completed, pct };
  });
}

function getStatusLabel(pct) {
  if (pct >= 80) return { label: 'Excellent', cls: 'badge-green' };
  if (pct >= 60) return { label: 'Good',      cls: 'badge-blue' };
  if (pct >= 40) return { label: 'Average',   cls: 'badge-orange' };
  return           { label: 'Needs Attention', cls: 'badge-red' };
}

function getSubjectColor(subject) {
  const colors = {
    'Data Structures':   '#6366f1',
    'DBMS':              '#10b981',
    'Java':              '#f59e0b',
    'Computer Networks': '#ef4444',
  };
  return colors[subject] || '#6366f1';
}

function getFilteredTasks() {
  return state.tasks.filter(t => {
    const matchFilter  = state.activeFilter === 'all' || t.status === state.activeFilter;
    const matchSubject = state.activeSubject === 'all' || t.subject === state.activeSubject;
    return matchFilter && matchSubject;
  });
}

// ── Render: Statistics Cards ──────────────────────────────────────
function renderStatistics() {
  const { total, completed, inProgress, pending, pct } = calculateOverallProgress();
  const totalHrs = state.stats.totalStudyHours || 0;

  document.getElementById('statOverallVal').textContent    = pct + '%';
  document.getElementById('statTasksVal').textContent      = completed;
  document.getElementById('statTasksChange').textContent   = `Out of ${total} tasks`;
  document.getElementById('statHoursVal').textContent      = totalHrs + ' hrs';
  document.getElementById('statSessionsVal').textContent   = state.stats.sessions || 0;
  document.getElementById('miniProgressBar').style.width   = pct + '%';
  document.getElementById('miniTasksBar').style.width      = (total > 0 ? (completed / total) * 100 : 0) + '%';
}

// ── Render: Circular Progress ─────────────────────────────────────
function renderCircularProgress() {
  const { total, completed, inProgress, pending, pct } = calculateOverallProgress();
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const fill = document.getElementById('circularFill');
  if (fill) {
    fill.setAttribute('stroke-dasharray', circumference);
    setTimeout(() => { fill.setAttribute('stroke-dashoffset', offset); }, 100);
  }

  const pctEl = document.getElementById('circularPct');
  if (pctEl) pctEl.textContent = pct + '%';

  const prog = document.getElementById('circularProgress');
  if (prog) prog.setAttribute('aria-valuenow', pct);

  document.getElementById('progressTaskInfo').textContent = `${completed} of ${total} tasks completed`;
  document.getElementById('psCompleted').textContent   = completed;
  document.getElementById('psInProgress').textContent  = inProgress;
  document.getElementById('psRemaining').textContent   = pending;

  // Inject gradient into SVG
  const svg = document.querySelector('.circular-svg');
  if (svg && !svg.querySelector('defs')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="circleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient>`;
    svg.prepend(defs);
  }
}

// ── Render: Subject Progress ──────────────────────────────────────
function renderSubjectProgress() {
  const container = document.getElementById('subjectProgressCards');
  if (!container) return;
  const subjects = calculateSubjectProgress();
  container.innerHTML = subjects.map(s => {
    const { label, cls } = getStatusLabel(s.pct);
    const color = getSubjectColor(s.subject);
    return `
      <div class="subject-card" data-subject="${s.subject}">
        <div class="subject-card-header">
          <span class="subject-name">${s.subject}</span>
          <span class="subject-pct" style="color:${color}">${s.pct}%</span>
        </div>
        <div class="subject-bar-bg">
          <div class="subject-bar-fill" style="width:0%; background:${color}" data-target="${s.pct}"></div>
        </div>
        <div class="subject-footer">
          <span class="subject-tasks-info">${s.completed} / ${s.total} tasks completed</span>
          <span class="badge ${cls}">${label}</span>
        </div>
      </div>`;
  }).join('');

  // Animate progress bars
  requestAnimationFrame(() => {
    container.querySelectorAll('.subject-bar-fill').forEach(bar => {
      const target = bar.dataset.target;
      setTimeout(() => { bar.style.width = target + '%'; }, 100);
    });
  });
}

// ── Render: Task List ─────────────────────────────────────────────
function renderCompletedTasks() {
  const container = document.getElementById('taskListContainer');
  if (!container) return;
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📋</span>
        No tasks found for this filter.
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(task => {
    const isCompleted  = task.status === 'completed';
    const isInProgress = task.status === 'in-progress';
    const isPending    = task.status === 'pending';

    const statusBadge = isCompleted
      ? `<span class="badge badge-green">✓ Completed</span>`
      : isInProgress
      ? `<span class="badge badge-blue">⟳ In Progress</span>`
      : `<span class="badge badge-orange">○ Pending</span>`;

    const checkClass = isCompleted ? 'completed' : isInProgress ? 'in-progress' : '';
    const checkIcon  = isCompleted ? '✓' : isInProgress ? '⟳' : '';
    const nameClass  = isCompleted ? 'task-name completed' : 'task-name';
    const dateInfo   = task.completedAt
      ? formatRelativeDate(task.completedAt)
      : formatRelativeDate(task.date);

    return `
      <div class="task-item" data-id="${task.id}">
        <button class="task-check-btn ${checkClass}" 
          onclick="cycleTaskStatus('${task.id}')"
          aria-label="Toggle task status for ${task.name}">
          <span class="task-check-icon">${checkIcon}</span>
        </button>
        <div class="task-body">
          <p class="${nameClass}">${task.name}</p>
          <div class="task-meta">
            <span class="task-meta-item" style="color:${getSubjectColor(task.subject)}">
              ● ${task.subject}
            </span>
            <span class="task-meta-item">📅 ${dateInfo}</span>
            <span class="task-meta-item">⏱ ${task.duration} min</span>
            ${statusBadge}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn danger" onclick="deleteTask('${task.id}')" aria-label="Delete task ${task.name}">🗑</button>
        </div>
      </div>`;
  }).join('');
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)   return `${diff} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Render: Weekly Bar Chart ──────────────────────────────────────
function renderWeeklyChart() {
  const container = document.getElementById('weeklyBarChart');
  if (!container) return;
  const data = state.stats.weeklyData || {};
  const days  = Object.keys(data);
  const vals  = Object.values(data);
  const maxVal = Math.max(...vals, 1);

  container.innerHTML = `
    <div class="bar-chart-wrap">
      <div class="bar-chart-area" id="barChartArea"></div>
    </div>`;

  const area = document.getElementById('barChartArea');

  days.forEach((day, i) => {
    const val = vals[i];
    const heightPct = (val / maxVal) * 100;
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `
      <div class="bar-col" style="height:0%" data-target="${heightPct}" aria-label="${day}: ${val} hours" role="img">
        <div class="bar-tooltip">${val}h</div>
      </div>
      <span class="bar-label">${day}</span>
      <span class="bar-val">${val}h</span>`;
    area.appendChild(item);
  });

  // Animate bars
  requestAnimationFrame(() => {
    area.querySelectorAll('.bar-col').forEach((bar, i) => {
      setTimeout(() => {
        bar.style.height = bar.dataset.target + '%';
        bar.style.transition = 'height 0.8s cubic-bezier(0.34,1.56,0.64,1)';
      }, i * 80);
    });
  });
}

// ── Render: Trend Line Chart (SVG) ───────────────────────────────
function renderTrendChart() {
  const container = document.getElementById('trendLineChart');
  if (!container) return;
  const data = state.stats.weeklyData || {};
  const days  = Object.keys(data);
  const vals  = Object.values(data);
  const maxVal = Math.max(...vals, 1);

  const W = 460, H = 180, padL = 36, padR = 16, padT = 24, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xs = days.map((_, i) => padL + (i / (days.length - 1)) * chartW);
  const ys = vals.map(v => padT + chartH - (v / maxVal) * chartH);

  // Build SVG path
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cpx1 = (xs[i-1] + xs[i]) / 2;
    d += ` C ${cpx1} ${ys[i-1]}, ${cpx1} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }

  // Area path
  let areaD = d + ` L ${xs[xs.length-1]} ${padT + chartH} L ${xs[0]} ${padT + chartH} Z`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'trend-svg');
  svg.setAttribute('aria-hidden', 'true');

  svg.innerHTML = `
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6366f1" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- Grid lines -->
    ${[0,1,2,3,4].map(i => {
      const y = padT + (i / 4) * chartH;
      const label = Math.round(maxVal - (i / 4) * maxVal);
      return `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
              <text x="${padL-6}" y="${y+4}" class="trend-y-label">${label}h</text>`;
    }).join('')}
    <!-- X Labels -->
    ${days.map((d, i) => `<text x="${xs[i]}" y="${H-6}" class="trend-x-label">${d}</text>`).join('')}
    <!-- Area -->
    <path d="${areaD}" class="trend-area"/>
    <!-- Line -->
    <path d="${d}" class="trend-line" stroke-dasharray="1000" stroke-dashoffset="1000">
      <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="1.2s" fill="freeze" begin="0.2s"/>
    </path>
    <!-- Dots -->
    ${vals.map((v, i) => `
      <circle cx="${xs[i]}" cy="${ys[i]}" r="4.5" class="trend-dot" 
        data-val="${v}" data-day="${days[i]}"
        aria-label="${days[i]}: ${v} hours">
      </circle>`).join('')}`;

  container.innerHTML = '';
  container.style.position = 'relative';
  container.appendChild(svg);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'trend-tooltip';
  container.appendChild(tooltip);

  svg.querySelectorAll('.trend-dot').forEach(dot => {
    dot.addEventListener('mouseenter', (e) => {
      const rect = container.getBoundingClientRect();
      const cx   = parseFloat(dot.getAttribute('cx'));
      const cy   = parseFloat(dot.getAttribute('cy'));
      const svgW = svg.clientWidth || 460;
      const svgH = svg.clientHeight || 180;
      const scaleX = svgW / W;
      const scaleY = svgH / H;
      tooltip.textContent = `${dot.dataset.day}: ${dot.dataset.val}h`;
      tooltip.style.left   = (cx * scaleX - 30) + 'px';
      tooltip.style.top    = (cy * scaleY - 36) + 'px';
      tooltip.style.opacity = '1';
    });
    dot.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
  });
}

// ── Render: Task Completion Donut Chart ───────────────────────────
function renderTaskCompletionChart() {
  const container = document.getElementById('donutChart');
  const legend    = document.getElementById('donutLegend');
  if (!container || !legend) return;

  const { completed, inProgress, pending } = calculateOverallProgress();
  const data = [
    { label: 'Completed',   value: completed,  color: '#10b981' },
    { label: 'In Progress', value: inProgress, color: '#3b82f6' },
    { label: 'Pending',     value: pending,    color: '#e2e8f0' },
  ];

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size  = 140;
  const cx = size / 2, cy = size / 2;
  const r = 52, innerR = 30;
  const circumference = 2 * Math.PI * r;

  let paths = '';
  let offset = 0;
  data.forEach((d, i) => {
    const pct   = d.value / total;
    const dash  = pct * circumference;
    const gap   = circumference - dash;
    // rotate so starts at top
    const rotation = (offset / total) * 360 - 90;
    paths += `
      <circle cx="${cx}" cy="${cy}" r="${r}"
        fill="none"
        stroke="${d.color}"
        stroke-width="${innerR}"
        stroke-dasharray="${dash} ${gap}"
        transform="rotate(${rotation} ${cx} ${cy})"
        data-label="${d.label}"
        data-value="${d.value}"
        class="donut-segment"
        style="cursor:pointer; transition: stroke-width .2s;"
        aria-label="${d.label}: ${d.value}">
        <title>${d.label}: ${d.value}</title>
      </circle>`;
    offset += d.value;
  });

  const svgWrap = document.createElement('div');
  svgWrap.className = 'donut-svg-wrap';
  svgWrap.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      ${paths}
    </svg>
    <div class="donut-center-text">
      <span class="donut-center-num">${completed}</span>
      <span class="donut-center-lbl">Done</span>
    </div>`;

  container.innerHTML = '';
  container.appendChild(svgWrap);

  // Hover effect
  svgWrap.querySelectorAll('.donut-segment').forEach(seg => {
    seg.addEventListener('mouseenter', () => { seg.setAttribute('stroke-width', innerR + 6); });
    seg.addEventListener('mouseleave', () => { seg.setAttribute('stroke-width', innerR); });
  });

  // Legend
  legend.innerHTML = data.map(d => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${d.color}"></span>
      <span class="legend-label">${d.label}</span>
      <span class="legend-val">${d.value}</span>
    </div>`).join('');
}

// ── Render: Daily Productivity ────────────────────────────────────
function renderDailyProductivity() {
  const container = document.getElementById('dailyProductivity');
  if (!container) return;
  const data = state.stats.dailyProductivity || {};
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  container.innerHTML = days.map(day => {
    const pct = data[day] || 0;
    const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#6366f1' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return `
      <div class="day-prod-item">
        <span class="day-prod-label">${day}</span>
        <div class="day-prod-bar-bg">
          <div class="day-prod-bar-fill" style="width:0%; background:${color}" data-target="${pct}"></div>
        </div>
        <span class="day-prod-pct" style="color:${color}">${pct}%</span>
      </div>`;
  }).join('');

  requestAnimationFrame(() => {
    container.querySelectorAll('.day-prod-bar-fill').forEach((bar, i) => {
      setTimeout(() => { bar.style.width = bar.dataset.target + '%'; }, i * 60 + 100);
    });
  });
}

// ── Render: Achievements ──────────────────────────────────────────
function renderAchievements(highlightId = null) {
  const container = document.getElementById('achievementsGrid');
  if (!container) return;

  const { completed, pct: overallPct } = calculateOverallProgress();
  const totalHrs = state.stats.totalStudyHours || 0;
  const subjectData = calculateSubjectProgress();
  const maxSubjectPct = Math.max(...subjectData.map(s => s.pct));

  container.innerHTML = state.achievements.map(ach => {
    let unlocked = false;
    switch (ach.type) {
      case 'streak':      unlocked = true; break; // demo: always unlocked for 7 days
      case 'tasks':       unlocked = completed >= ach.threshold; break;
      case 'hours':       unlocked = totalHrs >= ach.threshold; break;
      case 'perfect':     unlocked = true; break;  // demo: unlocked
      case 'subjectpct':  unlocked = maxSubjectPct >= ach.threshold; break;
      case 'dailytasks':  unlocked = true; break;  // demo
      default:            unlocked = false;
    }

    const isNew = highlightId === ach.id;
    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'} ${isNew ? 'unlock-glow' : ''}" 
        aria-label="${ach.name} achievement ${unlocked ? 'unlocked' : 'locked'}" role="article">
        ${isNew ? '<span class="achievement-badge-new">New!</span>' : ''}
        <span class="achievement-icon">${ach.icon}</span>
        <p class="achievement-name">${ach.name}</p>
        <p class="achievement-desc">${ach.desc}</p>
      </div>`;
  }).join('');
}

// ── Render: AI Insights ───────────────────────────────────────────
function renderAIInsights() {
  const container = document.getElementById('aiInsightsBody');
  if (!container) return;

  const { completed, pct } = calculateOverallProgress();
  const totalHrs = state.stats.totalStudyHours || 0;
  const subjects  = calculateSubjectProgress();
  const weakSubjects = subjects.filter(s => s.pct < 50);
  const strongSubjects = subjects.filter(s => s.pct >= 80);

  const insights = [];

  if (pct >= 80) {
    insights.push({ type: '🎉 Excellent Work', msg: `Outstanding! You've completed ${pct}% of all tasks. Keep this momentum going!`, bg: '#f0fdf4', icon: '🚀' });
  } else if (pct >= 60) {
    insights.push({ type: '✅ Good Progress', msg: `Great consistency! You've completed ${completed} tasks and reached ${pct}% overall progress.`, bg: '#eff6ff', icon: '📈' });
  } else {
    insights.push({ type: '⚠️ Needs Improvement', msg: `Your overall progress is at ${pct}%. Consider scheduling dedicated study blocks to boost it.`, bg: '#fff7ed', icon: '⚠️' });
  }

  if (totalHrs >= 20) {
    insights.push({ type: '⏱ Study Hours', msg: `Great consistency! You studied ${totalHrs} hours this week — above the recommended 20h target.`, bg: '#f0f4ff', icon: '🏅' });
  } else {
    insights.push({ type: '⏱ Study Hours', msg: `You've studied ${totalHrs} hours this week. Try to aim for at least 20 hours for optimal progress.`, bg: '#fff7ed', icon: '📅' });
  }

  weakSubjects.forEach(s => {
    insights.push({ type: `📌 ${s.subject}`, msg: `${s.subject} needs more attention at ${s.pct}%. Prioritize pending topics and schedule 2 extra sessions.`, bg: '#fff1f2', icon: '🔴' });
  });

  strongSubjects.forEach(s => {
    insights.push({ type: `🌟 ${s.subject}`, msg: `Excellent work on ${s.subject}! With ${s.pct}% completion, you're mastering this subject.`, bg: '#f0fdf4', icon: '✨' });
  });

  insights.push({ type: '💡 AI Recommendation', msg: `Based on your study pattern, your most productive study window is Saturday morning. Schedule difficult topics then.`, bg: '#faf5ff', icon: '🤖' });

  container.innerHTML = insights.map(ins => `
    <div class="insight-item">
      <div class="insight-icon" style="background: ${ins.bg}">${ins.icon}</div>
      <div class="insight-text">
        <p class="insight-type">${ins.type}</p>
        <p class="insight-msg">${ins.msg}</p>
      </div>
    </div>`).join('');
}

// ── Render: Recent Activity ───────────────────────────────────────
function renderRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;

  const completedTasks = state.tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 6);

  if (completedTasks.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">📅</span>No activity yet.</div>';
    return;
  }

  const times = ['8:30 PM', '6:45 PM', '8:00 PM', '6:30 PM', '9:00 AM', '4:15 PM'];
  container.innerHTML = completedTasks.map((task, i) => `
    <div class="activity-item">
      <div class="activity-icon-wrap">✓</div>
      <div class="activity-body">
        <p class="activity-name">Completed "${task.name}"</p>
        <div class="activity-meta">
          <span class="activity-subject" style="color:${getSubjectColor(task.subject)}">${task.subject}</span>
          <span class="activity-time">${formatRelativeDate(task.completedAt)}, ${times[i % times.length]}</span>
        </div>
      </div>
      <span class="activity-duration">${task.duration}m</span>
    </div>`).join('');
}

// ── Render: Weekly Goal ───────────────────────────────────────────
function renderWeeklyGoal() {
  const goal  = state.weeklyGoal || 30;
  const done  = state.stats.totalStudyHours || 0;
  const pct   = Math.min(Math.round((done / goal) * 100), 100);
  const remain = Math.max(goal - done, 0);

  document.getElementById('goalMain').textContent      = `Goal: ${goal} hours`;
  document.getElementById('goalCompleted').textContent = `Completed: ${done} hours`;
  document.getElementById('goalPct').textContent       = pct + '%';
  document.getElementById('goalRemaining').textContent = remain > 0 ? `${remain} hours remaining` : '🎉 Goal achieved!';

  const bar = document.getElementById('goalProgressFill');
  if (bar) {
    bar.setAttribute('aria-valuenow', pct);
    setTimeout(() => { bar.style.width = pct + '%'; }, 200);
  }
}

// ── Render: Performance Table ─────────────────────────────────────
function renderPerformanceTable() {
  const tbody = document.getElementById('perfTableBody');
  if (!tbody) return;
  const subjects = calculateSubjectProgress();

  tbody.innerHTML = subjects.map(s => {
    const { label, cls } = getStatusLabel(s.pct);
    const color = getSubjectColor(s.subject);
    return `
      <tr>
        <td><strong style="color:${color}">${s.subject}</strong></td>
        <td>${s.total}</td>
        <td>${s.completed}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="tbl-progress-bar-bg">
              <div class="tbl-progress-bar-fill" style="width:${s.pct}%; background:${color}"></div>
            </div>
            <span style="font-weight:700; font-size:.8rem; color:${color}">${s.pct}%</span>
          </div>
        </td>
        <td><span class="badge ${cls}">${label}</span></td>
      </tr>`;
  }).join('');
}

// ── Filters ───────────────────────────────────────────────────────
function filterTasks(filter) {
  state.activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });
  renderCompletedTasks();
}

function filterBySubject(subject) {
  state.activeSubject = subject;
  renderAll();
}

function filterByDate(range) {
  state.activeDateRange = range;
  document.querySelectorAll('.date-btn').forEach(btn => {
    const active = btn.dataset.range === range;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });
  // In a real app, filter tasks by date range; here we just re-render
  renderAll();
}

// ── Task CRUD ─────────────────────────────────────────────────────
function cycleTaskStatus(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const cycle = { 'pending': 'in-progress', 'in-progress': 'completed', 'completed': 'pending' };
  const prev = task.status;
  task.status = cycle[task.status] || 'pending';

  if (task.status === 'completed') {
    task.completedAt = new Date().toISOString().split('T')[0];
    showToast('Task completed successfully! 🎉', 'success');
  } else if (task.status === 'in-progress') {
    task.completedAt = null;
    showToast('Task marked as In Progress ⟳', 'info');
  } else {
    task.completedAt = null;
    showToast('Task set back to Pending ○', 'info');
  }

  saveProgressData();
  updateDashboard();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  saveProgressData();
  updateDashboard();
  showToast('Task deleted.', 'warning');
}

function addTask(taskData) {
  const id = 't' + Date.now();
  const newTask = {
    id,
    name:        taskData.name,
    subject:     taskData.subject,
    duration:    parseInt(taskData.duration, 10),
    date:        taskData.date,
    status:      taskData.status,
    completedAt: taskData.status === 'completed' ? taskData.date : null,
  };
  state.tasks.push(newTask);

  // Update study hours if completed
  if (newTask.status === 'completed') {
    state.stats.totalStudyHours = Math.round(
      ((state.stats.totalStudyHours || 0) + newTask.duration / 60) * 10
    ) / 10;
  }

  saveProgressData();
  updateDashboard();
  showToast('Task added successfully! ✓', 'success');
}

function updateWeeklyGoal(hours) {
  state.weeklyGoal = hours;
  saveProgressData();
  renderWeeklyGoal();
  showToast('Weekly goal updated! 🎯', 'success');
}

// ── Update Dashboard ──────────────────────────────────────────────
function updateDashboard() {
  renderStatistics();
  renderCircularProgress();
  renderSubjectProgress();
  renderCompletedTasks();
  renderWeeklyChart();
  renderTrendChart();
  renderTaskCompletionChart();
  renderDailyProductivity();
  renderAchievements();
  renderAIInsights();
  renderRecentActivity();
  renderWeeklyGoal();
  renderPerformanceTable();
}

function renderAll() {
  updateDashboard();
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '✅'}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// ── Modal Helpers ─────────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const focusable = modal.querySelector('input, select, button');
  if (focusable) setTimeout(() => focusable.focus(), 80);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ── Event Listeners ───────────────────────────────────────────────
function setupEventListeners() {
  // Sidebar toggle
  const hamburger     = document.getElementById('hamburgerBtn');
  const sidebarEl     = document.getElementById('sidebar');
  const sidebarClose  = document.getElementById('sidebarClose');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebarEl.classList.add('open');
    sidebarOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    sidebarEl.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger)      hamburger.addEventListener('click', openSidebar);
  if (sidebarClose)   sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Nav items (prevent default, just highlight)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  // Date filter
  document.querySelectorAll('.date-btn').forEach(btn => {
    btn.addEventListener('click', () => filterByDate(btn.dataset.range));
  });

  // Subject filter
  const subjectFilter = document.getElementById('subjectFilter');
  if (subjectFilter) {
    subjectFilter.addEventListener('change', () => filterBySubject(subjectFilter.value));
  }

  // Task filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
  });

  // Add Task modal
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) addTaskBtn.addEventListener('click', () => {
    document.getElementById('taskDate').value = new Date().toISOString().split('T')[0];
    openModal('addTaskModal');
  });
  document.getElementById('modalClose')?.addEventListener('click',  () => closeModal('addTaskModal'));
  document.getElementById('modalCancel')?.addEventListener('click', () => closeModal('addTaskModal'));

  // Add Task form submit
  const addTaskForm = document.getElementById('addTaskForm');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', e => {
      e.preventDefault();
      const name    = document.getElementById('taskName').value.trim();
      const subject = document.getElementById('taskSubject').value;
      const duration = document.getElementById('taskDuration').value;
      const date    = document.getElementById('taskDate').value;
      const status  = document.getElementById('taskStatus').value;

      if (!name || !subject || !duration || !date) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      addTask({ name, subject, duration, date, status });
      closeModal('addTaskModal');
      addTaskForm.reset();
    });
  }

  // Edit Goal modal
  const editGoalBtn = document.getElementById('editGoalBtn');
  if (editGoalBtn) editGoalBtn.addEventListener('click', () => {
    document.getElementById('goalHours').value = state.weeklyGoal;
    openModal('editGoalModal');
  });
  document.getElementById('goalModalClose')?.addEventListener('click',  () => closeModal('editGoalModal'));
  document.getElementById('goalModalCancel')?.addEventListener('click', () => closeModal('editGoalModal'));

  const editGoalForm = document.getElementById('editGoalForm');
  if (editGoalForm) {
    editGoalForm.addEventListener('submit', e => {
      e.preventDefault();
      const hrs = parseFloat(document.getElementById('goalHours').value);
      if (!hrs || hrs < 1) {
        showToast('Please enter a valid goal.', 'error');
        return;
      }
      updateWeeklyGoal(hrs);
      closeModal('editGoalModal');
    });
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Keyboard: Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('addTaskModal');
      closeModal('editGoalModal');
      if (window.innerWidth <= 768) closeSidebar();
    }
  });

  // Notification button
  document.getElementById('notifBtn')?.addEventListener('click', () => {
    showToast('You have 3 new notifications 🔔', 'info');
  });
}

// ── Init ──────────────────────────────────────────────────────────
function init() {
  loadProgressData();
  setupEventListeners();
  renderAll();

  // Slight delay for bar animations to trigger after layout
  setTimeout(() => {
    renderWeeklyChart();
    renderSubjectProgress();
    renderDailyProductivity();
    renderWeeklyGoal();
  }, 150);
}

document.addEventListener('DOMContentLoaded', init);
