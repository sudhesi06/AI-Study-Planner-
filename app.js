/* =========================================================
   AI Study Planner — Application Logic
   ========================================================= */

(async function () {
  'use strict';

  /* ---------- Initialize DB ---------- */
  await seedDefaultData();

  /* ---------- DOM Refs ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const sidebar = $('#sidebar');
  const sidebarToggle = $('#sidebarToggle');
  const navLinks = $$('.nav-link[data-page]');
  const pages = $$('.page-content');

  /* ---------- Helpers ---------- */
  function uid() { return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9); }

  function todayStr() { return new Date().toISOString().split('T')[0]; }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime12(t) {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function showToast(message, type = 'info') {
    const container = $('#toastContainer');
    const icons = { success: 'check_circle', info: 'info', warning: 'warning' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="material-icons-round">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.4s ease forwards';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  /* ---------- Sidebar Navigation ---------- */
  function navigateTo(page) {
    navLinks.forEach((l) => l.classList.toggle('active', l.dataset.page === page));
    pages.forEach((p) => {
      p.classList.toggle('hidden', p.id !== `page-${page}`);
    });
    sidebar.classList.remove('open');

    // Lazy render pages
    switch (page) {
      case 'dashboard': renderDashboard(); break;
      case 'subjects': renderSubjects(); break;
      case 'planner': renderPlanner(); break;
      case 'calendar': renderCalendar(); break;
      case 'smartlearning': renderSmartLearning(); break;
      case 'quizzes': renderQuizzes(); break;
      case 'progress': renderProgress(); break;
      case 'goals': renderGoals(); break;
      case 'settings': loadSettings(); break;
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  /* ==========================================================
     DASHBOARD
     ========================================================== */
  async function renderDashboard() {
    const profile = await dbGet(STORES.settings, 'profile');
    const name = profile ? profile.name.split(' ')[0] : 'Student';
    $('#welcomeGreeting').textContent = `${getGreeting()}, ${name} 👋`;
    $('#profileName').textContent = profile ? profile.name : 'Student';
    const initials = profile ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase() : 'S';
    $('#profileAvatar').textContent = initials;

    const tasks = await dbGetAll(STORES.tasks);
    const todayTasks = tasks.filter((t) => t.date === todayStr());
    const completedToday = todayTasks.filter((t) => t.status === 'completed');
    const pendingToday = todayTasks.filter((t) => t.status === 'pending');

    // Study hours (compute from completed task durations)
    const studiedMinutes = completedToday.reduce((sum, t) => sum + (t.duration || 0), 0);
    const studiedHours = (studiedMinutes / 60).toFixed(1);
    const dailyTarget = profile ? profile.dailyTarget : 4;

    $('#statStudyVal').textContent = `${studiedHours}h`;
    const studyPct = Math.min(100, Math.round((studiedHours / dailyTarget) * 100));
    $('#studyHoursRing .ring-fill').setAttribute('stroke-dasharray', `${studyPct}, 100`);

    $('#statCompletedVal').textContent = completedToday.length;

    // Overall progress
    const subjects = await dbGetAll(STORES.subjects);
    const avgProgress = subjects.length > 0 ? Math.round(subjects.reduce((s, sub) => s + sub.progress, 0) / subjects.length) : 0;
    $('#statOverallVal').textContent = `${avgProgress}%`;
    $('#overallRing .ring-fill').setAttribute('stroke-dasharray', `${avgProgress}, 100`);

    // Next deadline
    const futureTasks = tasks.filter((t) => t.status !== 'completed' && t.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));
    if (futureTasks.length > 0) {
      const next = futureTasks[0];
      const daysUntil = Math.ceil((new Date(next.date + 'T00:00:00') - new Date(todayStr() + 'T00:00:00')) / 86400000);
      $('#statDeadlineVal').textContent = daysUntil === 0 ? 'Today' : `${daysUntil} Day${daysUntil > 1 ? 's' : ''}`;
      $('#statDeadlineSub').textContent = `${next.subject} — ${next.lesson}`;
    }

    // Streak
    const streakData = await dbGet(STORES.settings, 'streak');
    $('#statStreakVal').textContent = `${streakData ? streakData.days : 0} Days`;

    // Pending
    $('#statPendingVal').textContent = `${pendingToday.length} Task${pendingToday.length !== 1 ? 's' : ''}`;

    // Today's Plan
    renderTodayPlan(todayTasks);

    // AI Recommendation
    updateAIRecommendation(subjects);

    // Weekly Chart
    renderWeeklyChart();

    // Upcoming tasks
    renderUpcoming(tasks);
  }

  function renderTodayPlan(todayTasks) {
    const container = $('#planTimeline');
    todayTasks.sort((a, b) => a.time.localeCompare(b.time));

    if (todayTasks.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-muted);">
          <span class="material-icons-round" style="font-size:48px;margin-bottom:12px;display:block;">event_available</span>
          <p>No tasks scheduled for today. Add one to get started!</p>
        </div>`;
      return;
    }

    container.innerHTML = todayTasks.map((t) => `
      <div class="plan-task-card ${t.status === 'completed' ? 'completed' : ''}" data-id="${t.id}">
        <span class="plan-task-time">${formatTime12(t.time)}</span>
        <div class="plan-task-color" style="background:${t.color}"></div>
        <div class="plan-task-info">
          <div class="plan-task-subject" style="color:${t.color}">${t.subject}</div>
          <div class="plan-task-name">${t.lesson}</div>
          <div class="plan-task-duration">
            <span class="material-icons-round">schedule</span>
            ${t.duration} min
          </div>
        </div>
        <span class="plan-task-priority ${t.priority}">${t.priority}</span>
        <div class="plan-task-actions">
          ${t.status === 'completed'
            ? `<button class="task-start-btn done" disabled><span class="material-icons-round" style="font-size:14px;">check</span> Done</button>`
            : `<button class="task-start-btn start-study-btn" data-id="${t.id}">
                <span class="material-icons-round" style="font-size:14px;">play_arrow</span> Start Study
              </button>`
          }
          <button class="task-check-btn ${t.status === 'completed' ? 'checked' : ''}" data-id="${t.id}">
            <span class="material-icons-round">check</span>
          </button>
        </div>
      </div>
    `).join('');

    // Bind events
    container.querySelectorAll('.task-check-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const task = await dbGet(STORES.tasks, id);
        if (task) {
          task.status = task.status === 'completed' ? 'pending' : 'completed';
          await dbPut(STORES.tasks, task);
          // Update subject progress
          await updateSubjectProgress(task.subjectId);
          renderDashboard();
          showToast(task.status === 'completed' ? 'Task completed! 🎉' : 'Task marked as pending.', task.status === 'completed' ? 'success' : 'info');
        }
      });
    });

    container.querySelectorAll('.start-study-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const task = await dbGet(STORES.tasks, id);
        if (task) {
          task.status = 'in-progress';
          await dbPut(STORES.tasks, task);
          renderDashboard();
          showToast(`Started studying: ${task.lesson}`, 'info');
        }
      });
    });
  }

  async function updateSubjectProgress(subjectId) {
    const tasks = await dbGetAll(STORES.tasks);
    const subTasks = tasks.filter((t) => t.subjectId === subjectId);
    const completed = subTasks.filter((t) => t.status === 'completed').length;
    const total = subTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const subject = await dbGet(STORES.subjects, subjectId);
    if (subject) {
      subject.progress = progress;
      subject.lessonsCompleted = completed;
      subject.lessonsTotal = Math.max(total, subject.lessonsTotal || 0);
      await dbPut(STORES.subjects, subject);
    }
  }

  function updateAIRecommendation(subjects) {
    if (subjects.length === 0) return;
    const weakest = [...subjects].sort((a, b) => a.progress - b.progress)[0];
    $('#aiRecText').innerHTML = `Your <strong>${weakest.name}</strong> progress is at ${weakest.progress}%, which is lower than your target. Spend today's next study session revising important concepts and solving practice questions to improve.`;
  }

  async function renderWeeklyChart() {
    const canvas = $('#weeklyCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const logs = await dbGetAll(STORES.studyLogs);
    logs.sort((a, b) => a.date.localeCompare(b.date));
    const lastSeven = logs.slice(-7);

    const profile = await dbGet(STORES.settings, 'profile');
    const target = profile ? profile.dailyTarget : 4;
    const maxHours = Math.max(target + 1, ...lastSeven.map((l) => l.hours)) + 1;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const paddingLeft = 42;
    const paddingBottom = 40;
    const paddingTop = 20;
    const paddingRight = 20;
    const chartW = W - paddingLeft - paddingRight;
    const chartH = H - paddingTop - paddingBottom;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    const gridLines = 5;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#E2E8F0';
    ctx.lineWidth = 0.5;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94A3B8';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + (chartH / gridLines) * i;
      const val = (maxHours - (maxHours / gridLines) * i).toFixed(1);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(W - paddingRight, y);
      ctx.stroke();
      ctx.fillText(`${val}h`, paddingLeft - 8, y + 4);
    }

    // Target line
    const targetY = paddingTop + chartH * (1 - target / maxHours);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, targetY);
    ctx.lineTo(W - paddingRight, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bars
    const barCount = lastSeven.length || 7;
    const barWidth = Math.min(36, (chartW / barCount) * 0.5);
    const gap = (chartW - barWidth * barCount) / (barCount + 1);

    ctx.textAlign = 'center';

    lastSeven.forEach((log, i) => {
      const x = paddingLeft + gap + i * (barWidth + gap);
      const barH = (log.hours / maxHours) * chartH;
      const y = paddingTop + chartH - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(x, y, x, paddingTop + chartH);
      grad.addColorStop(0, '#4F6BF6');
      grad.addColorStop(1, '#6C83FF');
      ctx.fillStyle = grad;

      // Rounded top bar
      const r = Math.min(6, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x, paddingTop + chartH);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r);
      ctx.lineTo(x + barWidth, paddingTop + chartH);
      ctx.closePath();
      ctx.fill();

      // Day label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94A3B8';
      ctx.font = '11px Inter, sans-serif';
      const dayLabel = log.dayName || days[i];
      ctx.fillText(dayLabel, x + barWidth / 2, paddingTop + chartH + 20);

      // Value on top
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1E293B';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillText(`${log.hours}h`, x + barWidth / 2, y - 8);
    });
  }

  async function renderUpcoming(allTasks) {
    const container = $('#upcomingList');
    const upcoming = allTasks
      .filter((t) => t.status !== 'completed' && t.date >= todayStr())
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);

    if (upcoming.length === 0) {
      container.innerHTML = `<p style="text-align:center;padding:24px;color:var(--text-muted);">All caught up! 🎉</p>`;
      return;
    }

    container.innerHTML = upcoming.map((t) => {
      const isToday = t.date === todayStr();
      const statusClass = t.status === 'in-progress' ? 'in-progress' : 'pending';
      const statusLabel = t.status === 'in-progress' ? 'In Progress' : 'Pending';
      return `
        <div class="upcoming-item">
          <div class="upcoming-color" style="background:${t.color}"></div>
          <div class="upcoming-info">
            <div class="upcoming-subject" style="color:${t.color}">${t.subject}</div>
            <div class="upcoming-task">${t.lesson}</div>
            <div class="upcoming-meta">
              <span class="upcoming-due">
                <span class="material-icons-round">event</span>
                ${isToday ? 'Today' : formatDate(t.date)}
              </span>
              <span class="upcoming-priority-tag">
                <span class="material-icons-round">flag</span>
                ${t.priority}
              </span>
            </div>
          </div>
          <span class="upcoming-status ${statusClass}">${statusLabel}</span>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================
     MY SUBJECTS
     ========================================================== */
  async function renderSubjects() {
    const subjects = await dbGetAll(STORES.subjects);
    const grid = $('#subjectsGrid');

    grid.innerHTML = subjects.map((s) => `
      <div class="subject-card" data-id="${s.id}">
        <div class="subject-card-top">
          <div class="subject-icon" style="background:${s.color}">
            <span class="material-icons-round">${s.icon}</span>
          </div>
          <div>
            <div class="subject-title">${s.name}</div>
            <div class="subject-lessons-count">${s.lessonsCompleted} / ${s.lessonsTotal} lessons completed</div>
          </div>
        </div>
        <div class="subject-progress-bar">
          <div class="subject-progress-fill" style="width:${s.progress}%;background:${s.color}"></div>
        </div>
        <div class="subject-stats">
          <div><span class="subject-stat-label">Progress</span><br><span class="subject-stat-value">${s.progress}%</span></div>
          <div><span class="subject-stat-label">Weekly Target</span><br><span class="subject-stat-value">${s.weeklyTarget}h</span></div>
          <div><span class="subject-stat-label">Lessons</span><br><span class="subject-stat-value">${s.lessonsTotal}</span></div>
        </div>
        <div class="subject-actions">
          <button class="btn btn-primary btn-sm view-subject-btn" data-id="${s.id}">
            <span class="material-icons-round" style="font-size:16px;">visibility</span> View
          </button>
          <button class="btn btn-outline btn-sm delete-subject-btn" data-id="${s.id}">
            <span class="material-icons-round" style="font-size:16px;">delete</span> Remove
          </button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.delete-subject-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove this subject?')) {
          await dbDelete(STORES.subjects, btn.dataset.id);
          renderSubjects();
          showToast('Subject removed.', 'warning');
        }
      });
    });

    grid.querySelectorAll('.view-subject-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigateTo('planner');
        showToast('Showing tasks for subject.', 'info');
      });
    });
  }

  /* ==========================================================
     STUDY PLANNER (KANBAN)
     ========================================================== */
  async function renderPlanner() {
    const tasks = await dbGetAll(STORES.tasks);
    const todo = tasks.filter((t) => t.status === 'pending');
    const inProgress = tasks.filter((t) => t.status === 'in-progress');
    const done = tasks.filter((t) => t.status === 'completed');

    $('#todoCount').textContent = todo.length;
    $('#progressCount').textContent = inProgress.length;
    $('#doneCount').textContent = done.length;

    renderKanbanColumn('#todoBody', todo);
    renderKanbanColumn('#progressBody', inProgress);
    renderKanbanColumn('#doneBody', done);
  }

  function renderKanbanColumn(selector, tasks) {
    const el = $(selector);
    if (tasks.length === 0) {
      el.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No tasks</p>`;
      return;
    }
    el.innerHTML = tasks.map((t) => `
      <div class="kanban-card" data-id="${t.id}">
        <div class="kanban-card-subject" style="color:${t.color}">${t.subject}</div>
        <div class="kanban-card-title">${t.lesson}</div>
        <div class="kanban-card-meta">
          <span class="kanban-card-due">
            <span class="material-icons-round">event</span>
            ${formatDate(t.date)}
          </span>
          <span class="kanban-card-priority ${t.priority}">${t.priority}</span>
        </div>
      </div>
    `).join('');

    // Click to cycle status
    el.querySelectorAll('.kanban-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const task = await dbGet(STORES.tasks, card.dataset.id);
        if (!task) return;
        const cycle = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' };
        task.status = cycle[task.status] || 'pending';
        await dbPut(STORES.tasks, task);
        await updateSubjectProgress(task.subjectId);
        renderPlanner();
        showToast(`Task moved to ${task.status.replace('-', ' ')}`, 'info');
      });
    });
  }

  /* ==========================================================
     CALENDAR
     ========================================================== */
  let calCurrentDate = new Date();

  async function renderCalendar() {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    $('#calMonthLabel').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();

    const tasks = await dbGetAll(STORES.tasks);
    const subjects = await dbGetAll(STORES.subjects);
    const subjectMap = {};
    subjects.forEach((s) => { subjectMap[s.id] = s; });

    let html = `
      <div class="cal-weekdays">
        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="cal-weekday">${d}</div>`).join('')}
      </div>
      <div class="cal-days">
    `;

    const todayDate = new Date();
    const todayDay = todayDate.getDate();
    const todayMonth = todayDate.getMonth();
    const todayYear = todayDate.getFullYear();

    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      html += `<div class="cal-day other-month"><div class="cal-day-num">${day}</div></div>`;
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = d === todayDay && month === todayMonth && year === todayYear;
      const dayTasks = tasks.filter((t) => t.date === dateStr);

      html += `<div class="cal-day ${isToday ? 'today' : ''}" data-date="${dateStr}">`;
      html += `<div class="cal-day-num">${d}</div>`;
      dayTasks.slice(0, 2).forEach((t) => {
        html += `<div class="cal-event-dot" style="background:${t.color}">${t.lesson.substring(0, 14)}</div>`;
      });
      if (dayTasks.length > 2) {
        html += `<div style="font-size:10px;color:var(--text-muted);">+${dayTasks.length - 2} more</div>`;
      }
      html += `</div>`;
    }

    // Next month padding
    const totalCells = startDayOfWeek + totalDays;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;
    }

    html += `</div>`;
    $('#calendarGrid').innerHTML = html;

    // Day click → show events
    $$('.cal-day:not(.other-month)').forEach((dayEl) => {
      dayEl.addEventListener('click', () => {
        const date = dayEl.dataset.date;
        if (!date) return;
        const dayTasks = tasks.filter((t) => t.date === date);
        $('#calEventsTitle').textContent = `Events for ${formatDate(date)}`;
        if (dayTasks.length === 0) {
          $('#calEventsList').innerHTML = `<p style="color:var(--text-muted);font-size:13px;padding:12px 0;">No tasks scheduled.</p>`;
        } else {
          $('#calEventsList').innerHTML = dayTasks.map((t) => `
            <div class="cal-event-item">
              <div class="cal-event-color" style="background:${t.color}"></div>
              <div class="cal-event-info">
                <div class="cal-event-title">${t.lesson}</div>
                <div class="cal-event-time">${t.subject} • ${formatTime12(t.time)} • ${t.duration} min</div>
              </div>
              <span class="upcoming-status ${t.status === 'completed' ? 'completed' : t.status === 'in-progress' ? 'in-progress' : 'pending'}">${t.status}</span>
            </div>
          `).join('');
        }
      });
    });
  }

  $('#calPrev').addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
    renderCalendar();
  });

  $('#calNext').addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
    renderCalendar();
  });

  /* ==========================================================
     SMART LEARNING
     ========================================================== */
  async function renderSmartLearning() {
    const subjects = await dbGetAll(STORES.subjects);
    const grid = $('#smartLearningGrid');

    const features = [
      { icon: 'psychology', title: 'AI Study Paths', desc: 'Get personalized study paths generated by AI based on your progress, learning pace, and upcoming deadlines.', color: 'var(--primary)', bg: 'var(--primary-ghost)', btnLabel: 'Generate Path' },
      { icon: 'lightbulb', title: 'Concept Explainer', desc: 'Struggling with a concept? Let AI break it down into simple, easy-to-understand explanations with examples.', color: 'var(--orange)', bg: 'var(--orange-light)', btnLabel: 'Try Now' },
      { icon: 'auto_fix_high', title: 'Practice Problem Generator', desc: 'Generate unlimited practice problems tailored to your current level and weak areas.', color: 'var(--green)', bg: 'var(--green-light)', btnLabel: 'Generate Problems' },
      { icon: 'analytics', title: 'Performance Insights', desc: 'Get deep insights into your study patterns, strengths, and areas that need improvement.', color: 'var(--purple)', bg: 'var(--purple-light)', btnLabel: 'View Insights' },
      { icon: 'summarize', title: 'Smart Notes', desc: 'AI generates concise study notes and summaries from your study material, perfect for quick revision.', color: 'var(--teal)', bg: 'var(--teal-light)', btnLabel: 'Create Notes' },
      { icon: 'tips_and_updates', title: 'Study Tips & Strategies', desc: 'Receive evidence-based study tips and strategies personalized for your learning style.', color: 'var(--red)', bg: 'var(--red-light)', btnLabel: 'Get Tips' },
    ];

    grid.innerHTML = features.map((f) => `
      <div class="sl-card">
        <div class="sl-card-header">
          <div class="sl-card-icon" style="background:${f.bg};color:${f.color}">
            <span class="material-icons-round">${f.icon}</span>
          </div>
          <div>
            <div class="sl-card-title">${f.title}</div>
          </div>
        </div>
        <div class="sl-card-body">${f.desc}</div>
        <button class="btn btn-primary">${f.btnLabel}</button>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-primary').forEach((btn) => {
      btn.addEventListener('click', () => showToast('AI feature coming soon! Stay tuned.', 'info'));
    });
  }

  /* ==========================================================
     QUIZZES
     ========================================================== */
  async function renderQuizzes() {
    const quizzes = await dbGetAll(STORES.quizzes);
    const grid = $('#quizzesGrid');

    grid.innerHTML = quizzes.map((q) => `
      <div class="quiz-card">
        <div class="quiz-card-header">
          <span class="quiz-subject-badge" style="background:${q.color}">${q.subject}</span>
          <span class="quiz-questions-count">${q.questions} questions</span>
        </div>
        <div class="quiz-title">${q.title}</div>
        <div class="quiz-meta">
          <span class="quiz-meta-item"><span class="material-icons-round">schedule</span>${q.duration} min</span>
          <span class="quiz-meta-item"><span class="material-icons-round">quiz</span>${q.status === 'completed' ? 'Completed' : 'New'}</span>
        </div>
        ${q.score !== null ? `
          <div class="quiz-score-bar">
            <div class="quiz-score-fill" style="width:${q.score}%;background:${q.score >= 70 ? 'var(--green)' : q.score >= 50 ? 'var(--orange)' : 'var(--red)'}"></div>
          </div>
          <div class="quiz-card-footer">
            <span class="quiz-score-text" style="color:${q.score >= 70 ? 'var(--green)' : q.score >= 50 ? 'var(--orange)' : 'var(--red)'}">Score: ${q.score}%</span>
            <button class="btn btn-outline btn-sm">Retry</button>
          </div>
        ` : `
          <div class="quiz-card-footer" style="justify-content:center;">
            <button class="btn btn-primary btn-sm start-quiz-btn" data-id="${q.id}">
              <span class="material-icons-round" style="font-size:16px;">play_arrow</span> Start Quiz
            </button>
          </div>
        `}
      </div>
    `).join('');

    grid.querySelectorAll('.start-quiz-btn').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Quiz feature launching soon!', 'info'));
    });
  }

  /* ==========================================================
     PROGRESS
     ========================================================== */
  async function renderProgress() {
    const subjects = await dbGetAll(STORES.subjects);
    const tasks = await dbGetAll(STORES.tasks);
    const logs = await dbGetAll(STORES.studyLogs);
    const streakData = await dbGet(STORES.settings, 'streak');

    const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
    const totalStudyHours = logs.reduce((s, l) => s + l.hours, 0).toFixed(1);
    const avgProgress = subjects.length > 0 ? Math.round(subjects.reduce((s, sub) => s + sub.progress, 0) / subjects.length) : 0;

    const container = $('#progressOverview');
    container.innerHTML = `
      <div class="progress-card big-stat-card">
        <div class="big-stat-value">${avgProgress}%</div>
        <div class="big-stat-label">Overall Progress</div>
        <div class="big-stat-sub">Across all subjects</div>
      </div>
      <div class="progress-card big-stat-card">
        <div class="big-stat-value" style="color:var(--green)">${totalCompleted}</div>
        <div class="big-stat-label">Tasks Completed</div>
        <div class="big-stat-sub">Total tasks finished</div>
      </div>
      <div class="progress-card big-stat-card">
        <div class="big-stat-value" style="color:var(--purple)">${totalStudyHours}h</div>
        <div class="big-stat-label">Total Study Hours</div>
        <div class="big-stat-sub">This week</div>
      </div>
      <div class="progress-card big-stat-card">
        <div class="big-stat-value" style="color:var(--orange)">${streakData ? streakData.days : 0}</div>
        <div class="big-stat-label">Day Streak</div>
        <div class="big-stat-sub">🔥 Keep it going!</div>
      </div>
      <div class="progress-card" style="grid-column: span 2;">
        <h3><span class="material-icons-round">bar_chart</span> Subject-wise Progress</h3>
        ${subjects.map((s) => `
          <div class="progress-subject-item">
            <div class="progress-subj-color" style="background:${s.color}"></div>
            <div class="progress-subj-name">${s.name}</div>
            <div class="progress-subj-bar">
              <div class="progress-subj-bar-fill" style="width:${s.progress}%;background:${s.color}"></div>
            </div>
            <div class="progress-subj-pct" style="color:${s.color}">${s.progress}%</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ==========================================================
     GOALS
     ========================================================== */
  async function renderGoals() {
    const goals = await dbGetAll(STORES.goals);
    const subjects = await dbGetAll(STORES.subjects);
    const subjectMap = {};
    subjects.forEach((s) => { subjectMap[s.id] = s; });

    const list = $('#goalsList');
    if (goals.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:60px;color:var(--text-muted);grid-column:1/-1;">
          <span class="material-icons-round" style="font-size:48px;margin-bottom:12px;display:block;">flag</span>
          <p>No goals yet. Add one to start tracking!</p>
        </div>`;
      return;
    }

    list.innerHTML = goals.map((g) => {
      const subj = subjectMap[g.subjectId];
      return `
        <div class="goal-card" data-id="${g.id}">
          <div class="goal-header">
            <div class="goal-title">${g.title}</div>
            <span class="goal-status ${g.status}">${g.status}</span>
          </div>
          ${subj ? `<div class="goal-subject-tag" style="color:${subj.color}">📚 ${subj.name}</div>` : ''}
          <div class="goal-desc">${g.description}</div>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width:${g.progress}%"></div>
          </div>
          <div class="goal-meta">
            <span>${g.progress}% completed</span>
            <span>📅 ${formatDate(g.deadline)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================
     SETTINGS
     ========================================================== */
  async function loadSettings() {
    const profile = await dbGet(STORES.settings, 'profile');
    if (profile) {
      $('#settingName').value = profile.name;
      $('#settingEmail').value = profile.email;
      $('#settingTarget').value = profile.dailyTarget;
    }

    const theme = await dbGet(STORES.settings, 'theme');
    const themeValue = theme ? theme.value : 'light';
    $$('.theme-btn').forEach((b) => b.classList.toggle('active', b.dataset.theme === themeValue));
    document.documentElement.setAttribute('data-theme', themeValue);

    const notifs = await dbGet(STORES.settings, 'notifications');
    if (notifs) {
      $('#settingReminders').checked = notifs.reminders;
      $('#settingDeadlineAlerts').checked = notifs.deadlineAlerts;
    }
  }

  $('#saveProfileBtn').addEventListener('click', async () => {
    await dbPut(STORES.settings, {
      key: 'profile',
      name: $('#settingName').value,
      email: $('#settingEmail').value,
      dailyTarget: parseInt($('#settingTarget').value) || 4,
    });
    showToast('Profile saved successfully!', 'success');
    renderDashboard();
  });

  $$('.theme-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      $$('.theme-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.theme;
      document.documentElement.setAttribute('data-theme', theme);
      await dbPut(STORES.settings, { key: 'theme', value: theme });
    });
  });

  $('#settingReminders').addEventListener('change', async () => {
    const notifs = (await dbGet(STORES.settings, 'notifications')) || { key: 'notifications' };
    notifs.reminders = $('#settingReminders').checked;
    await dbPut(STORES.settings, notifs);
    showToast('Notification settings saved.', 'success');
  });

  $('#settingDeadlineAlerts').addEventListener('change', async () => {
    const notifs = (await dbGet(STORES.settings, 'notifications')) || { key: 'notifications' };
    notifs.deadlineAlerts = $('#settingDeadlineAlerts').checked;
    await dbPut(STORES.settings, notifs);
    showToast('Notification settings saved.', 'success');
  });

  /* ==========================================================
     MODALS
     ========================================================== */

  // ---- Add Task Modal ----
  const taskModal = $('#addTaskModal');

  async function openTaskModal() {
    const subjects = await dbGetAll(STORES.subjects);
    const select = $('#taskSubject');
    select.innerHTML = `<option value="">Select subject...</option>` + subjects.map((s) => `<option value="${s.id}" data-color="${s.color}">${s.name}</option>`).join('');
    $('#taskDate').value = todayStr();
    taskModal.classList.remove('hidden');
  }

  $('#addTaskBtn').addEventListener('click', openTaskModal);
  $('#newPlanBtn').addEventListener('click', openTaskModal);
  $('#closeTaskModal').addEventListener('click', () => taskModal.classList.add('hidden'));
  $('#cancelTaskModal').addEventListener('click', () => taskModal.classList.add('hidden'));

  $('#saveTaskBtn').addEventListener('click', async () => {
    const subjectId = $('#taskSubject').value;
    if (!subjectId) { showToast('Please select a subject.', 'warning'); return; }
    const lesson = $('#taskLesson').value.trim();
    if (!lesson) { showToast('Please enter a lesson name.', 'warning'); return; }

    const subject = await dbGet(STORES.subjects, subjectId);
    const task = {
      id: uid(),
      subjectId,
      subject: subject.name,
      lesson,
      duration: parseInt($('#taskDuration').value) || 45,
      priority: $('#taskPriority').value,
      time: $('#taskTime').value,
      date: $('#taskDate').value,
      status: 'pending',
      color: subject.color,
    };
    await dbAdd(STORES.tasks, task);
    taskModal.classList.add('hidden');
    showToast('Task added successfully!', 'success');

    // Refresh current page
    const activePage = document.querySelector('.nav-link.active')?.dataset.page;
    if (activePage) navigateTo(activePage);
  });

  // ---- Add Subject Modal ----
  const subjectModal = $('#addSubjectModal');
  let selectedSubjectColor = '#4F6BF6';

  $('#addSubjectBtn').addEventListener('click', () => {
    $('#subjectName').value = '';
    $('#subjectTarget').value = 6;
    subjectModal.classList.remove('hidden');
  });
  $('#closeSubjectModal').addEventListener('click', () => subjectModal.classList.add('hidden'));
  $('#cancelSubjectModal').addEventListener('click', () => subjectModal.classList.add('hidden'));

  $$('.color-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      $$('.color-dot').forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      selectedSubjectColor = dot.dataset.color;
    });
  });

  $('#saveSubjectBtn').addEventListener('click', async () => {
    const name = $('#subjectName').value.trim();
    if (!name) { showToast('Please enter a subject name.', 'warning'); return; }

    const icons = ['menu_book', 'calculate', 'science', 'code', 'auto_stories', 'biotech', 'eco', 'language', 'brush', 'music_note'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const subject = {
      id: uid(),
      name,
      color: selectedSubjectColor,
      icon: randomIcon,
      weeklyTarget: parseInt($('#subjectTarget').value) || 6,
      progress: 0,
      lessonsTotal: 0,
      lessonsCompleted: 0,
    };
    await dbAdd(STORES.subjects, subject);
    subjectModal.classList.add('hidden');
    showToast('Subject added!', 'success');
    renderSubjects();
  });

  // ---- Add Goal Modal ----
  const goalModal = $('#addGoalModal');

  $('#addGoalBtn').addEventListener('click', async () => {
    const subjects = await dbGetAll(STORES.subjects);
    const select = $('#goalSubject');
    select.innerHTML = `<option value="">Select subject...</option>` + subjects.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
    $('#goalTitle').value = '';
    $('#goalDescription').value = '';
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    $('#goalDeadline').value = nextWeek.toISOString().split('T')[0];
    goalModal.classList.remove('hidden');
  });

  $('#closeGoalModal').addEventListener('click', () => goalModal.classList.add('hidden'));
  $('#cancelGoalModal').addEventListener('click', () => goalModal.classList.add('hidden'));

  $('#saveGoalBtn').addEventListener('click', async () => {
    const title = $('#goalTitle').value.trim();
    if (!title) { showToast('Please enter a goal title.', 'warning'); return; }

    const goal = {
      id: uid(),
      subjectId: $('#goalSubject').value || null,
      title,
      description: $('#goalDescription').value.trim(),
      deadline: $('#goalDeadline').value,
      progress: 0,
      status: 'active',
    };
    await dbAdd(STORES.goals, goal);
    goalModal.classList.add('hidden');
    showToast('Goal created!', 'success');
    renderGoals();
  });

  // Close modals on overlay click
  [taskModal, subjectModal, goalModal].forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  /* ==========================================================
     AI ASSISTANT CHAT
     ========================================================== */
  const chatMessages = $('#chatMessages');
  const chatInput = $('#chatInput');
  const chatSend = $('#chatSend');

  const aiResponses = [
    "Based on your current progress, I recommend focusing on Mathematics today. Your Calculus chapter needs attention — try spending 45 minutes on integration problems.",
    "Great question! Let me break that concept down for you. The key principle here is to approach it step by step, starting with the fundamentals.",
    "I've analyzed your study patterns. You're most productive between 9 AM and 12 PM. I'd suggest scheduling your hardest subjects during that time.",
    "Your Physics progress has improved by 12% this week! Keep up the great work. To maintain this momentum, try reviewing Wave Optics concepts tomorrow.",
    "I'd recommend taking a 15-minute break every 45 minutes during your study sessions. Research shows this improves retention by up to 30%.",
    "Looking at your goals, you're on track to complete 'Master Wave Optics' by the deadline. For 'Complete Calculus Chapter', you may need to increase your daily study time by 30 minutes.",
    "Here's a quick tip: Use the Feynman Technique — try explaining the concept in simple terms. If you can't, you need to study it more deeply.",
    "Your Chemistry Organic Reactions performance can improve. I suggest solving 10 practice problems on Aldehydes and Ketones today.",
  ];

  function addChatBubble(text, isUser = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'user' : 'ai'}`;
    bubble.innerHTML = `
      <span class="material-icons-round">${isUser ? 'person' : 'smart_toy'}</span>
      <div><p>${text}</p></div>
    `;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleChatSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    addChatBubble(text, true);
    chatInput.value = '';

    // Simulate AI response
    setTimeout(() => {
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      addChatBubble(response);
    }, 800 + Math.random() * 1200);
  }

  chatSend.addEventListener('click', handleChatSend);
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleChatSend(); });

  /* ==========================================================
     RE-OPTIMIZE BUTTON
     ========================================================== */
  $('#reoptimizeBtn').addEventListener('click', () => {
    showToast('AI is re-optimizing your schedule... ✨', 'info');
    setTimeout(() => {
      showToast('Schedule optimized! Your plan has been updated.', 'success');
      renderDashboard();
    }, 2000);
  });

  /* ==========================================================
     START AI LESSON BUTTON
     ========================================================== */
  $('#startAiLesson').addEventListener('click', () => {
    navigateTo('smartlearning');
    showToast('Opening Smart Learning...', 'info');
  });

  /* ==========================================================
     GENERATE QUIZ BUTTON
     ========================================================== */
  $('#generateQuizBtn').addEventListener('click', async () => {
    const subjects = await dbGetAll(STORES.subjects);
    if (subjects.length === 0) { showToast('Add subjects first!', 'warning'); return; }
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const quiz = {
      id: uid(),
      subjectId: randomSubject.id,
      subject: randomSubject.name,
      title: `${randomSubject.name} Practice Quiz`,
      questions: Math.floor(Math.random() * 15) + 8,
      duration: Math.floor(Math.random() * 20) + 10,
      score: null,
      color: randomSubject.color,
      status: 'new',
    };
    await dbAdd(STORES.quizzes, quiz);
    showToast(`Quiz generated for ${randomSubject.name}!`, 'success');
    renderQuizzes();
  });

  /* ==========================================================
     GLOBAL SEARCH
     ========================================================== */
  $('#globalSearch').addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) return;

    const tasks = await dbGetAll(STORES.tasks);
    const subjects = await dbGetAll(STORES.subjects);

    const matchingTask = tasks.find((t) => t.lesson.toLowerCase().includes(query) || t.subject.toLowerCase().includes(query));
    const matchingSubject = subjects.find((s) => s.name.toLowerCase().includes(query));

    if (matchingSubject) {
      navigateTo('subjects');
    } else if (matchingTask) {
      navigateTo('planner');
    }
  });

  /* ==========================================================
     THEME: Load on start
     ========================================================== */
  const savedTheme = await dbGet(STORES.settings, 'theme');
  if (savedTheme && savedTheme.value === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  /* ==========================================================
     RESIZE HANDLER (Redraw chart)
     ========================================================== */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const activePage = document.querySelector('.nav-link.active')?.dataset.page;
      if (activePage === 'dashboard') renderWeeklyChart();
    }, 250);
  });

  /* ==========================================================
     INITIAL RENDER
     ========================================================== */
  navigateTo('dashboard');

})();
