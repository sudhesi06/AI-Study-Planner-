/**
 * AI Study Planner - User & Authentication Module
 * Senior Frontend Core Javascript
 */

// ==========================================================================
// CONFIGURATIONS & STATE
// ==========================================================================

// Configurable Session Expiration (Simulation duration in Milliseconds)
// Default is 300,000ms (5 minutes) for demo purposes. Can be adjusted here.
const SESSION_DURATION_MS = 300000; 

let activeSessionTimeout = null;
let currentUser = null;

// ==========================================================================
// LOCALIZATION SYSTEM (ENGLISH & TAMIL DICTIONARIES)
// ==========================================================================

const TRANSLATIONS = {
  en: {
    // Branding
    "branding-title": "Study Smarter.<br>Achieve More.",
    "branding-subtitle": "Your personalized AI-powered study planning assistant.",
    // Login
    "login-title": "Welcome Back",
    "login-subtitle": "Sign in to continue your study journey.",
    "login-email-label": "Email",
    "login-email-placeholder": "Enter your email",
    "login-password-label": "Password",
    "login-password-placeholder": "Enter your password",
    "login-remember-label": "Remember me",
    "login-btn": "Login",
    "login-footer-text": "Don't have an account?",
    "login-create-account": "Create Account",
    // Signup
    "signup-title": "Create Your Account",
    "signup-subtitle": "Start planning your studies with AI.",
    "signup-name-label": "Full Name",
    "signup-name-placeholder": "Enter your full name",
    "signup-email-label": "Email Address",
    "signup-email-placeholder": "Enter your email",
    "signup-password-label": "Password",
    "signup-password-placeholder": "Create a password",
    "signup-strength-title": "Password Strength",
    "signup-req-length": "Min 6 characters",
    "signup-req-case": "Uppercase & Lowercase",
    "signup-req-num-spec": "Numbers or Special Characters",
    "signup-confirm-label": "Confirm Password",
    "signup-confirm-placeholder": "Confirm your password",
    "signup-terms-text": "I agree to the",
    "signup-terms-link": "Terms & Conditions",
    "signup-btn": "Create Account",
    "signup-footer-text": "Already have an account?",
    "signup-login-link": "Login",
    // Dropdown / Navigation
    "nav-profile": "My Profile",
    "nav-settings": "Settings",
    "nav-logout": "Logout",
    // Dashboard Welcome
    "dash-welcome": "Welcome back,",
    "dash-subtitle": "Ready to continue your study journey? Your AI assistant prepared your daily schedule.",
    "dash-study-title": "Today's Study",
    "dash-study-sub": "Target: 4h recommended by AI",
    "dash-tasks-title": "Completed Tasks",
    "dash-tasks-sub": "85% completions this week",
    "dash-progress-title": "Overall Progress",
    "dash-progress-sub": "+12% speed increase vs last week",
    "dash-exams-title": "Upcoming Exams",
    "dash-exams-sub": "Next: Calculus in 4 days",
    // Suggestions / Actions
    "dash-suggestions-title": "Active AI Planner Suggestions",
    "dash-suggestion-1-start": "Based on your current goal",
    "dash-suggestion-1-end": "you should practice writing algorithms for at least 1 hour today.",
    "dash-suggestion-2": "Calculus exam prep is falling behind by 2 hours. Try adjusting your settings to receive more push reminders.",
    "dash-actions-title": "Quick Actions",
    "dash-view-profile": "View Profile",
    "dash-manage-settings": "Manage Settings",
    // Profile Modal
    "modal-profile-title": "My Profile",
    "profile-avatar-upload": "Upload Avatar",
    "profile-avatar-hint": "JPG, PNG, WEBP allowed.",
    "profile-name-label": "Full Name",
    "profile-email-label": "Email Address",
    "profile-goal-label": "Current Study Goal",
    "profile-hours-label": "Daily Study Hours",
    "profile-since-label": "Member Since",
    "profile-status-label": "Account Status",
    "profile-status-val": "Active",
    "profile-edit-btn": "Edit Profile",
    // Edit profile subsection
    "profile-edit-title": "Edit Profile Information",
    "profile-goal-label-edit": "Study Goal",
    "profile-hours-label-edit": "Daily Study Hours",
    "hours-1": "1 Hour",
    "hours-2": "2 Hours",
    "hours-3": "3 Hours",
    "hours-4": "4 Hours",
    "hours-5": "5+ Hours",
    "profile-edit-cancel": "Cancel",
    "profile-edit-save": "Save Changes",
    // Change password
    "profile-change-pw": "Change Password",
    "profile-current-pw": "Current Password",
    "profile-new-pw": "New Password",
    "profile-confirm-pw": "Confirm New Password",
    "profile-update-pw-btn": "Update Password",
    // Session Info
    "profile-session-title": "Active Session Information",
    "profile-session-status": "Status:",
    "profile-session-online": "Active Now",
    "profile-session-login-time": "Login Time:",
    "profile-session-type": "Session Type:",
    "profile-session-email": "Connected Email:",
    "profile-session-logout-btn": "Logout from Device",
    // Settings Modal
    "modal-settings-title": "Account Settings",
    "settings-email-label": "Email Notifications",
    "settings-email-sub": "Receive AI summary emails and review reminders.",
    "settings-reminders-label": "Study Reminders",
    "settings-reminders-sub": "Get browser popups when a study block is scheduled.",
    "settings-dark-label": "Dark Mode",
    "settings-dark-sub": "Switch application theme to high-contrast dark theme.",
    "settings-lang-label": "Language / மொழி",
    "settings-lang-sub": "Set the primary app language.",
    "settings-cancel-btn": "Cancel",
    "settings-save-btn": "Save Settings",
    // Logout confirmation
    "modal-logout-title": "Confirm Logout",
    "modal-logout-body": "Are you sure you want to logout? This will terminate your session and close any active planners.",
    "modal-logout-cancel": "Cancel",
    "modal-logout-confirm": "Logout",
    // Session expired
    "modal-expired-title": "Session Expired",
    "modal-expired-body": "Your demo session has expired. Please login again to continue.",
    "modal-expired-ok": "OK"
  },
  ta: {
    // Branding
    "branding-title": "புத்திசாலித்தனமாகப் படியுங்கள்.<br>அதிகம் சாதியுங்கள்.",
    "branding-subtitle": "உங்களின் தனிப்பயனாக்கப்பட்ட AI-ஆல் இயங்கும் படிப்பு திட்டமிடல் உதவியாளர்.",
    // Login
    "login-title": "மீண்டும் வருக",
    "login-subtitle": "உங்களது படிப்புப் பயணத்தைத் தொடர உள்நுழையவும்.",
    "login-email-label": "மின்னஞ்சல்",
    "login-email-placeholder": "மின்னஞ்சலை உள்ளிடவும்",
    "login-password-label": "கடவுச்சொல்",
    "login-password-placeholder": "கடவுச்சொல்லை உள்ளிடவும்",
    "login-remember-label": "என்னை நினைவில் கொள்",
    "login-btn": "உள்நுழை",
    "login-footer-text": "கணக்கு இல்லையா?",
    "login-create-account": "கணக்கை உருவாக்கு",
    // Signup
    "signup-title": "கணக்கை உருவாக்கவும்",
    "signup-subtitle": "AI மூலம் உங்களது படிப்பைத் திட்டமிடத் தொடங்குங்கள்.",
    "signup-name-label": "முழு பெயர்",
    "signup-name-placeholder": "உங்களது முழு பெயரை உள்ளிடவும்",
    "signup-email-label": "மின்னஞ்சல் முகவரி",
    "signup-email-placeholder": "மின்னஞ்சலை உள்ளிடவும்",
    "signup-password-label": "கடவுச்சொல்",
    "signup-password-placeholder": "புதிய கடவுச்சொல்லை உருவாக்கவும்",
    "signup-strength-title": "கடவுச்சொல் வலிமை",
    "signup-req-length": "குறைந்தது 6 எழுத்துக்கள்",
    "signup-req-case": "பெரிய மற்றும் சிறிய எழுத்துக்கள்",
    "signup-req-num-spec": "எண்கள் அல்லது சிறப்பு எழுத்துக்கள்",
    "signup-confirm-label": "கடவுச்சொல்லை உறுதிப்படுத்துக",
    "signup-confirm-placeholder": "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
    "signup-terms-text": "நான் ஒப்புக்கொள்கிறேன்",
    "signup-terms-link": "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
    "signup-btn": "கணக்கை உருவாக்கு",
    "signup-footer-text": "ஏற்கனவே கணக்கு உள்ளதா?",
    "signup-login-link": "உள்நுழை",
    // Dropdown / Navigation
    "nav-profile": "என் சுயவிவரம்",
    "nav-settings": "அமைப்புகள்",
    "nav-logout": "வெளியேறு",
    // Dashboard Welcome
    "dash-welcome": "மீண்டும் வருக,",
    "dash-subtitle": "உங்களது படிப்புப் பயணத்தைத் தொடரத் தயாரா? உங்களது AI உதவியாளர் தினசரி அட்டவணையைத் தயாரித்துள்ளார்.",
    "dash-study-title": "இன்றைய படிப்பு",
    "dash-study-sub": "இலக்கு: AI பரிந்துரைத்த 4 மணி நேரம்",
    "dash-tasks-title": "முடிவுற்ற பணிகள்",
    "dash-tasks-sub": "இந்த வாரம் 85% பணிகள் முடிவுற்றன",
    "dash-progress-title": "ஒட்டுமொத்த முன்னேற்றம்",
    "dash-progress-sub": "கடந்த வாரத்தை விட +12% வேக அதிகரிப்பு",
    "dash-exams-title": "வரவிருக்கும் தேர்வுகள்",
    "dash-exams-sub": "அடுத்தது: 4 நாட்களில் கால்குலஸ் தேர்வு",
    // Suggestions / Actions
    "dash-suggestions-title": "செயலில் உள்ள AI திட்டமிடல் பரிந்துரைகள்",
    "dash-suggestion-1-start": "உங்களது தற்போதைய இலக்கான",
    "dash-suggestion-1-end": "என்பதன் அடிப்படையில், இன்று குறைந்தது 1 மணிநேரம் அல்காரிதம் எழுதப் பழக வேண்டும்.",
    "dash-suggestion-2": "கால்குலஸ் தேர்வுத் தயாரிப்பு 2 மணிநேரம் பின்தங்கியுள்ளது. கூடுதல் நினைவூட்டல்களைப் பெற உங்களது அமைப்புகளைச் சரிசெய்யவும்.",
    "dash-actions-title": "விரைவான செயல்கள்",
    "dash-view-profile": "சுயவிவரத்தைக் காண்க",
    "dash-manage-settings": "அமைப்புகளை நிர்வகி",
    // Profile Modal
    "modal-profile-title": "என் சுயவிவரம்",
    "profile-avatar-upload": "அவதாரத்தைப் பதிவேற்று",
    "profile-avatar-hint": "JPG, PNG, WEBP அனுமதிக்கப்படும்.",
    "profile-name-label": "முழு பெயர்",
    "profile-email-label": "மின்னஞ்சல் முகவரி",
    "profile-goal-label": "தற்போதைய படிப்பு இலக்கு",
    "profile-hours-label": "தினசரி படிப்பு நேரம்",
    "profile-since-label": "உறுப்பினர் சேர்ந்த நாள்",
    "profile-status-label": "கணக்கு நிலை",
    "profile-status-val": "செயலில் உள்ளது",
    "profile-edit-btn": "சுயவிவரத்தைத் திருத்து",
    // Edit profile subsection
    "profile-edit-title": "சுயவிவரத் தகவலைத் திருத்து",
    "profile-goal-label-edit": "படிப்பு இலக்கு",
    "profile-hours-label-edit": "தினசரி படிப்பு நேரம்",
    "hours-1": "1 மணி நேரம்",
    "hours-2": "2 மணி நேரம்",
    "hours-3": "3 மணி நேரம்",
    "hours-4": "4 மணி நேரம்",
    "hours-5": "5+ மணி நேரம்",
    "profile-edit-cancel": "ரத்துசெய்",
    "profile-edit-save": "மாற்றங்களைச் சேமி",
    // Change password
    "profile-change-pw": "கடவுச்சொல்லை மாற்று",
    "profile-current-pw": "தற்போதைய கடவுச்சொல்",
    "profile-new-pw": "புதிய கடவுச்சொல்",
    "profile-confirm-pw": "புதிய கடவுச்சொல்லை உறுதிப்படுத்துக",
    "profile-update-pw-btn": "கடவுச்சொல்லைப் புதுப்பி",
    // Session Info
    "profile-session-title": "செயலில் உள்ள அமர்வு தகவல்",
    "profile-session-status": "நிலை:",
    "profile-session-online": "இப்போது செயலில்",
    "profile-session-login-time": "உள்நுழைந்த நேரம்:",
    "profile-session-type": "அமர்வு வகை:",
    "profile-session-email": "இணைக்கப்பட்ட மின்னஞ்சல்:",
    "profile-session-logout-btn": "சாதனத்திலிருந்து வெளியேறு",
    // Settings Modal
    "modal-settings-title": "கணக்கு அமைப்புகள்",
    "settings-email-label": "மின்னஞ்சல் அறிவிப்புகள்",
    "settings-email-sub": "AI சுருக்க மின்னஞ்சல்கள் மற்றும் நினைவூட்டல்களைப் பெறுங்கள்.",
    "settings-reminders-label": "படிப்பு நினைவூட்டல்கள்",
    "settings-reminders-sub": "படிப்புத் தொகுதி திட்டமிடப்படும்போது உலாவி அறிவிப்புகளைப் பெறவும்.",
    "settings-dark-label": "இருண்ட பயன்முறை",
    "settings-dark-sub": "பயன்பாட்டு தீமினை உயர் மாறுபட்ட இருண்ட தீமிற்கு மாற்றவும்.",
    "settings-lang-label": "Language / மொழி",
    "settings-lang-sub": "பயன்பாட்டின் முதன்மை மொழியை அமைக்கவும்.",
    "settings-cancel-btn": "ரத்துசெய்",
    "settings-save-btn": "அமைப்புகளைச் சேமி",
    // Logout confirmation
    "modal-logout-title": "வெளியேறுவதை உறுதிசெய்",
    "modal-logout-body": "நிச்சயமாக வெளியேற வேண்டுமா? இது உங்களது அமர்வை முடித்து, திட்டமிடுபவர்களை மூடிவிடும்.",
    "modal-logout-cancel": "ரத்துசெய்",
    "modal-logout-confirm": "வெளியேறு",
    // Session expired
    "modal-expired-title": "அமர்வு காலாவதியானது",
    "modal-expired-body": "உங்களது டெமோ அமர்வு காலாவதியாகிவிட்டது. தொடர மீண்டும் உள்நுழையவும்.",
    "modal-expired-ok": "சரி"
  }
};

function applyLanguage(lang = "en") {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  document.querySelectorAll("[data-i18n]").forEach(elem => {
    const key = elem.getAttribute("data-i18n");
    if (dictionary[key]) {
      if (elem.tagName === "INPUT" && elem.placeholder) {
        elem.placeholder = dictionary[key];
      } else if (elem.getAttribute("data-i18n-html") === "true") {
        elem.innerHTML = dictionary[key];
      } else {
        elem.textContent = dictionary[key];
      }
    }
  });
  
  // Update HTML lang attribute
  document.documentElement.setAttribute("lang", lang);
}

// ==========================================================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Demo Data & Check Sessions
  initializeDemoUser();
  checkAuth();
  
  // Navigation / View Switching Bindings
  document.getElementById("go-to-signup").addEventListener("click", showSignup);
  document.getElementById("go-to-login").addEventListener("click", showLogin);
  
  // Form Submission Bindings
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loginUser();
  });
  
  document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    signupUser();
  });

  document.getElementById("edit-profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    updateProfile();
  });

  document.getElementById("change-password-form").addEventListener("submit", (e) => {
    e.preventDefault();
    changePassword();
  });

  document.getElementById("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveSettings();
  });

  // Real-time dark mode preview
  const dmToggle = document.getElementById("settings-dark-mode");
  dmToggle.addEventListener("change", () => {
    if (dmToggle.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  });

  // Password Visibility Toggle Listeners
  document.querySelectorAll(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => togglePassword(btn));
  });

  // Real-time password strength analyzer
  const signupPasswordInput = document.getElementById("signup-password");
  signupPasswordInput.addEventListener("input", () => {
    checkPasswordStrength(signupPasswordInput.value);
  });

  // File Upload listener for Profile Avatar
  const avatarInput = document.getElementById("avatar-input");
  avatarInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarUpload(e.target.files[0]);
    }
  });

  // Modal Profile View/Edit Toggle Button
  document.getElementById("btn-edit-profile-toggle").addEventListener("click", editProfile);
  document.getElementById("btn-edit-profile-cancel").addEventListener("click", () => {
    document.getElementById("profile-edit-section").classList.add("hidden");
    document.getElementById("profile-view-section").classList.remove("hidden");
  });

  // Dropdown Toggle Logic
  const dropdownBtn = document.getElementById("dropdown-btn");
  const dropdownMenu = document.getElementById("user-dropdown-menu");
  
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = dropdownBtn.getAttribute("aria-expanded") === "true";
    dropdownBtn.setAttribute("aria-expanded", !isExpanded);
    dropdownMenu.classList.toggle("active");
  });

  // Close dropdown on click outside
  document.addEventListener("click", () => {
    dropdownBtn.setAttribute("aria-expanded", "false");
    dropdownMenu.classList.remove("active");
  });

  // Navbar Items Bindings for Profile Modals
  document.getElementById("nav-profile-btn").addEventListener("click", () => openModal("profile-modal"));
  document.getElementById("nav-settings-btn").addEventListener("click", () => openModal("settings-modal"));
  
  // Logout Buttons Actions
  const openLogoutModal = () => openModal("logout-modal");
  document.getElementById("nav-logout-btn").addEventListener("click", openLogoutModal);
  document.getElementById("session-logout-btn").addEventListener("click", openLogoutModal);
  
  document.getElementById("logout-confirm-btn").addEventListener("click", () => {
    closeModal("logout-modal");
    logoutUser();
  });

  document.getElementById("session-expired-ok-btn").addEventListener("click", () => {
    closeModal("expired-modal");
    logoutUser(true); // silent logout
  });

  // Modal general bindings (Escape key closes, click overlay backdrop closes)
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && overlay.dataset.backdrop !== "static") {
        closeModal(overlay.id);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".modal-overlay.active");
      if (activeModal && activeModal.dataset.backdrop !== "static") {
        closeModal(activeModal.id);
      }
    }
  });
});

// ==========================================================================
// SECTOR: VIEW MANAGEMENT (LOGIN, SIGNUP, DASHBOARD)
// ==========================================================================

function showLogin() {
  document.getElementById("signup-card").classList.remove("active");
  document.getElementById("login-card").classList.add("active");
  
  // Clear inputs & errors
  document.getElementById("login-form").reset();
  clearInputErrors("login-form");
}

function showSignup() {
  document.getElementById("login-card").classList.remove("active");
  document.getElementById("signup-card").classList.add("active");
  
  // Clear inputs, strength and errors
  document.getElementById("signup-form").reset();
  clearInputErrors("signup-form");
  checkPasswordStrength("");
}

function showDashboard() {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
  
  // Render active dashboard metrics & configurations
  document.getElementById("dash-display-name").textContent = currentUser.name;
  document.getElementById("dash-study-hours").textContent = currentUser.dailyStudyHours + (currentUser.dailyStudyHours === "5+" ? " Hours" : " Hours");
  document.getElementById("dash-study-goal").textContent = currentUser.studyGoal || "Define your Study Goal in Profile";
  
  // Render Quick Header Avatar
  updateUIUserElements();
}

// Helper to clear error messages
function clearInputErrors(formId) {
  const form = document.getElementById(formId);
  form.querySelectorAll(".error-msg").forEach(span => span.textContent = "");
  form.querySelectorAll("input").forEach(input => input.style.borderColor = "");
}

// ==========================================================================
// SECTOR: USER AUTHENTICATION & SESSIONS
// ==========================================================================

function checkAuth() {
  // Check if session exists in sessionStorage (Active temporary session)
  let sessionRaw = sessionStorage.getItem("studyPlannerSession");
  let rememberSessionRaw = localStorage.getItem("studyPlannerRememberedSession");
  
  let activeSession = null;
  let isRemembered = false;

  if (sessionRaw) {
    activeSession = JSON.parse(sessionRaw);
  } else if (rememberSessionRaw) {
    activeSession = JSON.parse(rememberSessionRaw);
    isRemembered = true;
    // Restore into sessionStorage for consistency during runtime
    sessionStorage.setItem("studyPlannerSession", JSON.stringify(activeSession));
  }

  if (activeSession) {
    const users = JSON.parse(localStorage.getItem("studyPlannerUsers") || "[]");
    const matchedUser = users.find(u => u.id === activeSession.userId || u.email === activeSession.email);
    
    if (matchedUser) {
      currentUser = matchedUser;
      
      // Calculate remaining demo session duration
      const loginTime = new Date(activeSession.loginTime).getTime();
      const now = Date.now();
      const elapsed = now - loginTime;
      
      if (elapsed >= SESSION_DURATION_MS) {
        // Session expired while user was away
        logoutUser(true); // silent logout
        openModal("expired-modal");
      } else {
        // Session still active, show dashboard and schedule remaining timeout
        showDashboard();
        loadSettings();
        renderProfile();
        
        const remainingTime = SESSION_DURATION_MS - elapsed;
        scheduleSessionExpiration(remainingTime);
      }
      return;
    }
  }

  // No session: force login screen
  document.getElementById("dashboard-section").classList.add("hidden");
  document.getElementById("auth-section").classList.remove("hidden");
  showLogin();
  loadSettings(); // load settings for non-authenticated dark mode preference
}

function loginUser() {
  if (!validateLogin()) return;

  const emailVal = document.getElementById("login-email").value.trim();
  const passwordVal = document.getElementById("login-password").value;
  const rememberMe = document.getElementById("login-remember").checked;
  
  const submitBtn = document.querySelector("#login-form button[type='submit']");
  const spinner = submitBtn.querySelector(".btn-spinner");
  const btnText = submitBtn.querySelector("span");

  // Show Loader
  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Verifying...";

  // Simulated minor network latency for professional feel
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("studyPlannerUsers") || "[]");
    const user = users.find(u => u.email.toLowerCase() === emailVal.toLowerCase() && u.password === passwordVal);

    if (user) {
      currentUser = user;
      createSession(user, rememberMe);
      
      showToast("Login successful!", "success");
      showDashboard();
      renderProfile();
    } else {
      showToast("Invalid email or password.", "error");
      document.getElementById("login-password-error").textContent = "Invalid email or password.";
      document.getElementById("login-password").style.borderColor = "var(--error-color)";
    }

    // Reset Loader
    submitBtn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = "Login";
  }, 600);
}

function signupUser() {
  if (!validateSignup()) return;

  const nameVal = document.getElementById("signup-name").value.trim();
  const emailVal = document.getElementById("signup-email").value.trim();
  const passwordVal = document.getElementById("signup-password").value;
  
  const submitBtn = document.querySelector("#signup-form button[type='submit']");
  const spinner = submitBtn.querySelector(".btn-spinner");
  const btnText = submitBtn.querySelector("span");

  // Show Loader
  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Creating Account...";

  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("studyPlannerUsers") || "[]");
    
    // Validate duplicate emails
    const emailExists = users.some(u => u.email.toLowerCase() === emailVal.toLowerCase());
    if (emailExists) {
      showToast("Duplicate email address. Please use another email.", "error");
      document.getElementById("signup-email-error").textContent = "This email is already registered.";
      document.getElementById("signup-email").style.borderColor = "var(--error-color)";
      
      submitBtn.disabled = false;
      spinner.classList.add("hidden");
      btnText.textContent = "Create Account";
      return;
    }

    // Create and store user object
    const newUser = {
      id: Date.now(),
      name: nameVal,
      email: emailVal,
      password: passwordVal,
      avatar: "",
      studyGoal: "Become a Full Stack Developer",
      dailyStudyHours: 2,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    users.push(newUser);
    localStorage.setItem("studyPlannerUsers", JSON.stringify(users));

    showToast("Account created successfully. Please login.", "success");
    showLogin();
    
    // Autofill signup email in login for comfort
    document.getElementById("login-email").value = emailVal;

    submitBtn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = "Create Account";
  }, 750);
}

function createSession(user, rememberMe) {
  const sessionData = {
    userId: user.id,
    email: user.email,
    loginTime: new Date().toISOString(),
    rememberMe: rememberMe
  };

  sessionStorage.setItem("studyPlannerSession", JSON.stringify(sessionData));
  
  if (rememberMe) {
    localStorage.setItem("studyPlannerRememberedSession", JSON.stringify(sessionData));
  } else {
    localStorage.removeItem("studyPlannerRememberedSession");
  }

  scheduleSessionExpiration(SESSION_DURATION_MS);
}

function scheduleSessionExpiration(durationMs) {
  if (activeSessionTimeout) {
    clearTimeout(activeSessionTimeout);
  }

  activeSessionTimeout = setTimeout(() => {
    openModal("expired-modal");
  }, durationMs);
}

function clearSession() {
  sessionStorage.removeItem("studyPlannerSession");
  localStorage.removeItem("studyPlannerRememberedSession");
  
  if (activeSessionTimeout) {
    clearTimeout(activeSessionTimeout);
    activeSessionTimeout = null;
  }
  
  currentUser = null;
}

function logoutUser(silent = false) {
  clearSession();
  
  // Transition back to login view
  document.getElementById("dashboard-section").classList.add("hidden");
  document.getElementById("auth-section").classList.remove("hidden");
  showLogin();

  if (!silent) {
    showToast("You have been logged out successfully.", "success");
  }
}

// ==========================================================================
// SECTOR: VALIDATION LOGIC
// ==========================================================================

function validateLogin() {
  let isValid = true;
  clearInputErrors("login-form");

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  if (!emailInput.value.trim()) {
    setError(emailInput, "login-email-error", "Please enter your email.");
    isValid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    setError(emailInput, "login-email-error", "Please enter a valid email.");
    isValid = false;
  }

  if (!passwordInput.value) {
    setError(passwordInput, "login-password-error", "Password is required.");
    isValid = false;
  }

  return isValid;
}

function validateSignup() {
  let isValid = true;
  clearInputErrors("signup-form");

  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const confirmInput = document.getElementById("signup-confirm-password");
  const termsCheckbox = document.getElementById("signup-terms");

  if (!nameInput.value.trim()) {
    setError(nameInput, "signup-name-error", "Full name is required.");
    isValid = false;
  }

  if (!emailInput.value.trim()) {
    setError(emailInput, "signup-email-error", "Email is required.");
    isValid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    setError(emailInput, "signup-email-error", "Please enter a valid email address.");
    isValid = false;
  }

  if (!passwordInput.value) {
    setError(passwordInput, "signup-password-error", "Password is required.");
    isValid = false;
  } else if (passwordInput.value.length < 6) {
    setError(passwordInput, "signup-password-error", "Password must contain at least 6 characters.");
    isValid = false;
  }

  if (!confirmInput.value) {
    setError(confirmInput, "signup-confirm-password-error", "Please confirm your password.");
    isValid = false;
  } else if (passwordInput.value !== confirmInput.value) {
    setError(confirmInput, "signup-confirm-password-error", "Passwords do not match.");
    isValid = false;
  }

  if (!termsCheckbox.checked) {
    document.getElementById("signup-terms-error").textContent = "Please accept the Terms & Conditions.";
    isValid = false;
  }

  return isValid;
}

function setError(inputElement, errorSpanId, message) {
  inputElement.style.borderColor = "var(--error-color)";
  document.getElementById(errorSpanId).textContent = message;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ==========================================================================
// SECTOR: PASSWORD STRENGTH EVALUATOR
// ==========================================================================

function checkPasswordStrength(password) {
  const strengthBar = document.getElementById("strength-bar");
  const statusText = document.getElementById("strength-status-text");
  
  const lengthReq = document.getElementById("req-length");
  const caseReq = document.getElementById("req-case");
  const numSpecReq = document.getElementById("req-num-spec");

  if (!password) {
    strengthBar.className = "";
    strengthBar.style.width = "0%";
    statusText.textContent = "None";
    statusText.className = "strength-text-weak";
    lengthReq.className = "req-failed";
    caseReq.className = "req-failed";
    numSpecReq.className = "req-failed";
    return;
  }

  let score = 0;
  
  // Rule 1: Min 6 characters
  const hasMinLength = password.length >= 6;
  if (hasMinLength) {
    lengthReq.className = "req-success";
    score++;
  } else {
    lengthReq.className = "req-failed";
  }

  // Rule 2: Upper and Lower case
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  if (hasUpperCase && hasLowerCase) {
    caseReq.className = "req-success";
    score++;
  } else {
    caseReq.className = "req-failed";
  }

  // Rule 3: Numbers or Special Characters
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (hasNumber || hasSpecial) {
    numSpecReq.className = "req-success";
    score++;
  } else {
    numSpecReq.className = "req-failed";
  }

  // Classify Score
  if (score === 0) {
    strengthBar.className = "";
    strengthBar.style.width = "0%";
    statusText.textContent = "Weak";
    statusText.className = "strength-text-weak";
  } else if (score === 1) {
    strengthBar.className = "strength-bar-weak";
    strengthBar.style.width = ""; // Reset inline width if score was 0
    statusText.textContent = "Weak";
    statusText.className = "strength-text-weak";
  } else if (score === 2) {
    strengthBar.className = "strength-bar-medium";
    strengthBar.style.width = "";
    statusText.textContent = "Medium";
    statusText.className = "strength-text-medium";
  } else if (score === 3) {
    strengthBar.className = "strength-bar-strong";
    strengthBar.style.width = "";
    statusText.textContent = "Strong";
    statusText.className = "strength-text-strong";
  }
}

function togglePassword(button) {
  const targetId = button.dataset.target;
  const input = document.getElementById(targetId);
  const eyeOpen = button.querySelector(".eye-open");
  const eyeClosed = button.querySelector(".eye-closed");

  if (input.type === "password") {
    input.type = "text";
    eyeOpen.classList.add("hidden");
    eyeClosed.classList.remove("hidden");
  } else {
    input.type = "password";
    eyeOpen.classList.remove("hidden");
    eyeClosed.classList.add("hidden");
  }
}

// ==========================================================================
// SECTOR: PROFILE RENDER & EDIT ACTIONS
// ==========================================================================

function renderProfile() {
  if (!currentUser) return;

  const initials = getInitials(currentUser.name);
  
  // Set Left Col Profile Info
  const avatarDiv = document.getElementById("profile-avatar-img");
  avatarDiv.textContent = initials;
  if (currentUser.avatar) {
    avatarDiv.style.backgroundImage = `url(${currentUser.avatar})`;
    avatarDiv.textContent = "";
  } else {
    avatarDiv.style.backgroundImage = "";
  }

  document.getElementById("profile-detail-name").textContent = currentUser.name;
  document.getElementById("profile-detail-email").textContent = currentUser.email;
  document.getElementById("profile-detail-goal").textContent = currentUser.studyGoal || "Not configured";
  document.getElementById("profile-detail-hours").textContent = currentUser.dailyStudyHours + (currentUser.dailyStudyHours === "5+" ? " Hours" : " Hours");
  document.getElementById("profile-detail-date").textContent = currentUser.createdAt || "August 9, 2026";

  // Set Right Col Session Info
  const session = JSON.parse(sessionStorage.getItem("studyPlannerSession") || "{}");
  document.getElementById("session-email-val").textContent = currentUser.email;
  document.getElementById("session-type-badge").textContent = session.rememberMe ? "Remembered" : "Temporary";
  
  if (session.loginTime) {
    const d = new Date(session.loginTime);
    document.getElementById("session-login-time").textContent = d.toLocaleString();
  }
}

function editProfile() {
  document.getElementById("profile-view-section").classList.add("hidden");
  const editSection = document.getElementById("profile-edit-section");
  editSection.classList.remove("hidden");
  clearInputErrors("edit-profile-form");

  // Load values
  document.getElementById("edit-name").value = currentUser.name;
  document.getElementById("edit-email").value = currentUser.email;
  document.getElementById("edit-goal").value = currentUser.studyGoal || "";
  document.getElementById("edit-hours").value = currentUser.dailyStudyHours || 2;
}

function updateProfile() {
  const editForm = document.getElementById("edit-profile-form");
  const nameVal = document.getElementById("edit-name").value.trim();
  const emailVal = document.getElementById("edit-email").value.trim();
  const goalVal = document.getElementById("edit-goal").value.trim();
  const hoursVal = document.getElementById("edit-hours").value;

  let isValid = true;
  clearInputErrors("edit-profile-form");

  if (!nameVal) {
    setError(document.getElementById("edit-name"), "edit-name-error", "Full Name is required.");
    isValid = false;
  }

  if (!emailVal) {
    setError(document.getElementById("edit-email"), "edit-email-error", "Email Address is required.");
    isValid = false;
  } else if (!isValidEmail(emailVal)) {
    setError(document.getElementById("edit-email"), "edit-email-error", "Invalid Email Format.");
    isValid = false;
  }

  if (!isValid) return;

  const users = JSON.parse(localStorage.getItem("studyPlannerUsers") || "[]");
  
  // Verify email duplicate (excluding self)
  const duplicate = users.some(u => u.email.toLowerCase() === emailVal.toLowerCase() && u.id !== currentUser.id);
  if (duplicate) {
    setError(document.getElementById("edit-email"), "edit-email-error", "Email already in use by another user.");
    showToast("Email address is already in use.", "error");
    return;
  }

  // Update object
  currentUser.name = nameVal;
  currentUser.email = emailVal;
  currentUser.studyGoal = goalVal;
  currentUser.dailyStudyHours = hoursVal;

  saveUser(currentUser);
  
  // Update header/dashboards
  document.getElementById("dash-display-name").textContent = currentUser.name;
  document.getElementById("dash-study-hours").textContent = currentUser.dailyStudyHours + (currentUser.dailyStudyHours === "5+" ? " Hours" : " Hours");
  document.getElementById("dash-study-goal").textContent = currentUser.studyGoal || "Define your Study Goal in Profile";
  
  updateUIUserElements();
  renderProfile();
  
  // Switch back to view Mode
  document.getElementById("profile-edit-section").classList.add("hidden");
  document.getElementById("profile-view-section").classList.remove("hidden");
  
  showToast("Profile updated successfully.", "success");
}

function saveUser(user) {
  const users = JSON.parse(localStorage.getItem("studyPlannerUsers") || "[]");
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
    localStorage.setItem("studyPlannerUsers", JSON.stringify(users));
  }
}

function changePassword() {
  const curPass = document.getElementById("cp-current").value;
  const newPass = document.getElementById("cp-new").value;
  const confPass = document.getElementById("cp-confirm").value;

  let isValid = true;
  clearInputErrors("change-password-form");

  if (!curPass) {
    setError(document.getElementById("cp-current"), "cp-current-error", "Current password is required.");
    isValid = false;
  } else if (curPass !== currentUser.password) {
    setError(document.getElementById("cp-current"), "cp-current-error", "Incorrect password.");
    isValid = false;
  }

  if (!newPass) {
    setError(document.getElementById("cp-new"), "cp-new-error", "New password is required.");
    isValid = false;
  } else if (newPass.length < 6) {
    setError(document.getElementById("cp-new"), "cp-new-error", "Must be at least 6 characters.");
    isValid = false;
  }

  if (!confPass) {
    setError(document.getElementById("cp-confirm"), "cp-confirm-error", "Confirm new password.");
    isValid = false;
  } else if (newPass !== confPass) {
    setError(document.getElementById("cp-confirm"), "cp-confirm-error", "Passwords do not match.");
    isValid = false;
  }

  if (!isValid) return;

  currentUser.password = newPass;
  saveUser(currentUser);

  showToast("Password updated successfully.", "success");
  document.getElementById("change-password-form").reset();
}

// Helper: dynamic initials generator
function getInitials(nameString) {
  if (!nameString) return "U";
  const tokens = nameString.split(" ");
  if (tokens.length >= 2) {
    return (tokens[0][0] + tokens[1][0]).toUpperCase();
  }
  return nameString.substr(0, 2).toUpperCase();
}

function updateUIUserElements() {
  if (!currentUser) return;
  
  const initials = getInitials(currentUser.name);
  const headerAvatar = document.getElementById("header-avatar");
  headerAvatar.textContent = initials;
  
  if (currentUser.avatar) {
    headerAvatar.style.backgroundImage = `url(${currentUser.avatar})`;
    headerAvatar.textContent = "";
  } else {
    headerAvatar.style.backgroundImage = "";
  }
  
  document.getElementById("header-username").textContent = currentUser.name;
}

// ==========================================================================
// SECTOR: AVATAR MEDIA FILE UPLOAD (BASE64 STORAGE)
// ==========================================================================

function handleAvatarUpload(file) {
  // Validate File type
  const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.webp)$/i;
  if (!allowedExtensions.exec(file.name)) {
    showToast("Invalid image upload. Allowed: JPG, PNG, WEBP.", "error");
    return;
  }

  // Size limit validation (frontend demo limit: 1.5MB for local storage storage limits)
  if (file.size > 1500000) {
    showToast("Image size must be less than 1.5MB.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    
    // Save to user object
    currentUser.avatar = base64Data;
    saveUser(currentUser);
    
    // Render immediate UI update
    renderProfile();
    updateUIUserElements();
    showToast("Avatar image updated.", "success");
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// SECTOR: SETTINGS CONFIGURATIONS SYSTEM (DARK MODE AND PREFERENCES)
// ==========================================================================

function loadSettings() {
  let settingsRaw = localStorage.getItem("studyPlannerSettings");
  let settings = {
    emailNotifications: true,
    studyReminders: true,
    darkMode: false,
    language: "en"
  };

  if (settingsRaw) {
    settings = JSON.parse(settingsRaw);
  } else {
    localStorage.setItem("studyPlannerSettings", JSON.stringify(settings));
  }

  // Update Settings Form views
  document.getElementById("settings-email-notifications").checked = settings.emailNotifications;
  document.getElementById("settings-study-reminders").checked = settings.studyReminders;
  document.getElementById("settings-dark-mode").checked = settings.darkMode;
  document.getElementById("settings-language").value = settings.language;

  // Apply Theme Toggle immediately
  if (settings.darkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }

  // Apply Localization
  applyLanguage(settings.language);
}

function saveSettings() {
  const emailNotif = document.getElementById("settings-email-notifications").checked;
  const studyRemind = document.getElementById("settings-study-reminders").checked;
  const dMode = document.getElementById("settings-dark-mode").checked;
  const lang = document.getElementById("settings-language").value;

  const settings = {
    emailNotifications: emailNotif,
    studyReminders: studyRemind,
    darkMode: dMode,
    language: lang
  };

  localStorage.setItem("studyPlannerSettings", JSON.stringify(settings));

  // Apply Theme
  if (dMode) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }

  // Apply Localization
  applyLanguage(lang);

  closeModal("settings-modal");
  showToast(lang === "ta" ? "அமைப்புகள் சேமிக்கப்பட்டன." : "Settings saved.", "success");
}

// ==========================================================================
// SECTOR: REUSABLE CUSTOM MODAL AND TOAST SYSTEMS
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (modalId === "settings-modal") {
      loadSettings();
    } else if (modalId === "profile-modal") {
      renderProfile();
      // Reset edit sections back to view mode if left dirty
      document.getElementById("profile-edit-section").classList.add("hidden");
      document.getElementById("profile-view-section").classList.remove("hidden");
    }
    modal.classList.add("active");
    // Accessibility hook: focus first input or close button
    const firstInput = modal.querySelector("input, select, button");
    if (firstInput) firstInput.focus();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    if (modalId === "settings-modal") {
      // Rollback theme and checkbox settings to saved values if user closed without saving
      loadSettings();
    }
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="toast-body">${message}</div>
    <button type="button" class="toast-close-btn" aria-label="Dismiss toast">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Trigger slide-in animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Auto-dismiss after 4 seconds
  const dismissTimer = setTimeout(() => {
    dismissToast(toast);
  }, 4000);

  // Manual close listener
  toast.querySelector(".toast-close-btn").addEventListener("click", () => {
    clearTimeout(dismissTimer);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  toast.classList.remove("show");
  toast.classList.add("hide");
  // Remove element after transition finishes
  toast.addEventListener("transitionend", () => {
    toast.remove();
  });
}

// ==========================================================================
// SECTOR: DEMO USER DATA SEEDER
// ==========================================================================

function initializeDemoUser() {
  const users = localStorage.getItem("studyPlannerUsers");
  if (!users) {
    // Seed initial Student account
    const demoStudent = {
      id: 99999, // Static ID for demo purposes
      name: "Demo Student",
      email: "student@example.com",
      password: "student123",
      avatar: "",
      studyGoal: "Become a Full Stack Developer",
      dailyStudyHours: 4,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    
    localStorage.setItem("studyPlannerUsers", JSON.stringify([demoStudent]));
  }
}
