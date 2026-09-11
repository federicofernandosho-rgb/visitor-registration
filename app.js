const SESSION_KEY = "inmate-profile-api-token";
const LEGACY_RECORDS_KEY = "intel-inmate-profileing-records";

const emptyRecord = () => ({
  inmateId: "",
  vVisitorsId: null,
  linkedInmateNo: "",
  visitorNumber: "",
  registrationDate: "",
  firstName: "",
  middleName: "",
  lastName: "",
  alias: "",
  dob: "",
  age: "",
  address: "",
  phone: "",
  nationalId: "",
  affiliation: "",
  comment: "",
  gangAffiliation: "",
  personName: "",
  inPrison: false,
  admissionDate: "",
  dischargeDate: "",
  statusHistory: [],
  images: {
    frontFace: "",
    rightFace: "",
    leftFace: "",
    tattoos: []
  }
});

function generateVisitorNumber() {
  return "";
}

let records = [];
let currentIndex = 0;
let isNewRecord = false;
let isEditingRecord = false;
let currentUser = null;
let authToken = sessionStorage.getItem(SESSION_KEY) || "";

const loginShell = document.querySelector("#loginShell");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const firstUserForm = document.querySelector("#firstUserForm");
const loginIntro = document.querySelector("#loginIntro");
const loginMessage = document.querySelector("#loginMessage");
const sessionStatus = document.querySelector("#sessionStatus");
const manageUsersButton = document.querySelector("#manageUsers");
const logoutButton = document.querySelector("#logoutButton");
const message = document.querySelector("#message");
const recordStatus = document.querySelector("#recordStatus");
const fields = {
  inmateId: document.querySelector("#inmateId"),
  firstName: document.querySelector("#firstName"),
  middleName: document.querySelector("#middleName"),
  lastName: document.querySelector("#lastName"),
  alias: document.querySelector("#alias"),
  dob: document.querySelector("#dob"),
  age: document.querySelector("#age"),
  address: document.querySelector("#address"),
  affiliation: document.querySelector("#affiliation"),
  comment: document.querySelector("#comment"),
  incarcerationIn: document.querySelector("#incarcerationIn"),
  incarcerationOut: document.querySelector("#incarcerationOut"),
  statusDate: document.querySelector("#statusDate")
};

const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");

// Visitor specific fields & link elements
const visitorPhone = document.querySelector("#visitorPhone");
const visitorIdInput = document.querySelector("#visitorId");
const visitNotes = document.querySelector("#visitNotes");
const vVisitorsId = document.querySelector("#vVisitorsId");
const linkedInmateNo = document.querySelector("#linkedInmateNo");
const inmateLinkBanner = document.querySelector("#inmateLinkBanner");
const linkInmateNoDisplay = document.querySelector("#linkInmateNoDisplay");
const linkInmateNameDisplay = document.querySelector("#linkInmateNameDisplay");
const unlinkInmateBtn = document.querySelector("#unlinkInmateBtn");

// Assigned Visitors Modal elements
const assignedVisitorsModal = document.querySelector("#assignedVisitorsModal");
const closeAssignedVisitorsModal = document.querySelector("#closeAssignedVisitorsModal");
const avCancelBtn = document.querySelector("#avCancelBtn");
const avApplyBtn = document.querySelector("#avApplyBtn");
const avNewVisitorForInmateBtn = document.querySelector("#avNewVisitorForInmateBtn");
const avInmateNo = document.querySelector("#avInmateNo");
const avInmateName = document.querySelector("#avInmateName");
const avInmateStatus = document.querySelector("#avInmateStatus");
const avVisitorsCount = document.querySelector("#avVisitorsCount");
const assignedVisitorsList = document.querySelector("#assignedVisitorsList");
const avSelectAllFieldsBtn = document.querySelector("#avSelectAllFieldsBtn");
const avDeselectAllFieldsBtn = document.querySelector("#avDeselectAllFieldsBtn");

// Tab selectors in Assigned Visitors Modal
const avTabRegular = document.querySelector("#avTabRegular");
const avTabFamily = document.querySelector("#avTabFamily");
const avCountRegular = document.querySelector("#avCountRegular");
const avCountFamily = document.querySelector("#avCountFamily");
let currentVisitorTab = "regular"; // "regular" | "family"

// Field checkboxes in modal
const fieldCheckFirstName = document.querySelector("#fieldCheckFirstName");
const fieldCheckMiddleName = document.querySelector("#fieldCheckMiddleName");
const fieldCheckLastName = document.querySelector("#fieldCheckLastName");
const fieldCheckDob = document.querySelector("#fieldCheckDob");
const fieldCheckPhone = document.querySelector("#fieldCheckPhone");
const fieldCheckNationalId = document.querySelector("#fieldCheckNationalId");
const fieldCheckPhoto = document.querySelector("#fieldCheckPhoto");
const fieldCheckNotes = document.querySelector("#fieldCheckNotes");

let currentInmateMatch = null;
let selectedVisitorRecord = null;

// Clear form & Edit cancellation buttons
const clearFormBtn = document.querySelector("#clearFormBtn");
const cancelEditBtn = document.querySelector("#cancelEditBtn");

// Registered Visitors Datagrid elements
const inmateDatagridCard = document.querySelector("#inmateDatagridCard");
const datagridTableWrap = document.querySelector("#datagridTableWrap");
const registeredVisitorsTable = document.querySelector("#registeredVisitorsTable");
const registeredVisitorsTbody = document.querySelector("#registeredVisitorsTbody");
const datagridInmateBadge = document.querySelector("#datagridInmateBadge");
const datagridCountBadge = document.querySelector("#datagridCountBadge");
const datagridEmptyNotice = document.querySelector("#datagridEmptyNotice");
const datagridEmptyText = document.querySelector("#datagridEmptyText");
const datagridRegisterNewBtn = document.querySelector("#datagridRegisterNewBtn");

// Pagination & filter state
let pageSize = 10;
let currentPage = 1;
let filteredRecords = [];
let activeFilters = { status: "all", affiliation: "", gang: "", dateFrom: "", dateTo: "" };

const intelDialog = document.querySelector("#intelDialog");
const mainHistoryTimeline = document.querySelector("#mainHistoryTimeline");
const mainPreview = document.querySelector("#mainPreview");
const mainPreviewText = document.querySelector("#mainPreviewText");
const frontFacePreview = document.querySelector("#frontFacePreview");
const rightFacePreview = document.querySelector("#rightFacePreview");
const leftFacePreview = document.querySelector("#leftFacePreview");
const tattooList = document.querySelector("#tattooList");
const reportTemplate = document.querySelector("#reportTemplate");
const usersDialog = document.querySelector("#usersDialog");
const userList = document.querySelector("#userList");
const userMessage = document.querySelector("#userMessage");
const admissionDialog = document.querySelector("#admissionDialog");
const dischargeDialog = document.querySelector("#dischargeDialog");
const admissionForm = document.querySelector("#admissionForm");
const dischargeForm = document.querySelector("#dischargeForm");
const historyDialog = document.querySelector("#historyDialog");
let pendingStatusEvent = null;

// Tattoo Zoom State Management
let currentZoomLevel = 1;
const ZOOM_STEP = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.5;
let panX = 0;
let panY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;
let wheelTimeout;

// Initialize Core Operational Hooks & Event Listeners
loginForm.addEventListener("submit", handleLogin);
firstUserForm.addEventListener("submit", handleFirstUserCreate);
manageUsersButton.addEventListener("click", openUsersModal);
if (logoutButton) {
  logoutButton.addEventListener("click", (e) => {
    if (e) e.preventDefault();
    logout();
  });
}
document.querySelector("#closeUsersModal").addEventListener("click", () => usersDialog.close());
document.querySelector("#createUserForm").addEventListener("submit", handleCreateUser);
document.querySelector("#previousRecord").addEventListener("click", showPreviousRecord);
document.querySelector("#nextRecord").addEventListener("click", showNextRecord);
document.querySelector("#newRecord").addEventListener("click", createNewRecord);
document.querySelector("#saveRecord").addEventListener("click", saveNewRecord);
const cancelBtn = document.querySelector("#cancelRecord");
if (cancelBtn) cancelBtn.addEventListener("click", cancelNewRecord);
if (clearFormBtn) clearFormBtn.addEventListener("click", clearForm);
if (cancelEditBtn) cancelEditBtn.addEventListener("click", cancelEdit);
if (datagridRegisterNewBtn) {
  datagridRegisterNewBtn.addEventListener("click", () => {
    if (isNewRecord) {
      showMessage("A visitor registration is currently in progress. Please save the current record or click 'Clear Form' before registering another visitor.", "info");
      return;
    }
    if (currentInmateMatch) {
      openAssignedVisitorsModal(currentInmateMatch);
    } else {
      showMessage("Please search an inmate first before registering a new visitor.", "info");
    }
  });
}
document.querySelector("#updateRecord").addEventListener("click", updateCurrentRecord);
document.querySelector("#deleteRecord").addEventListener("click", deleteRecord);
document.querySelector("#generatePdf").addEventListener("click", generatePdfReport);
document.querySelector("#viewHistory").addEventListener("click", () => {
  const record = records[currentIndex];
  renderMainHistoryTimeline(record ? (record.statusHistory || []) : []);
  historyDialog.showModal();
});
document.querySelector("#closeHistoryModal").addEventListener("click", () => historyDialog.close());
document.querySelector("#openIntelModal").addEventListener("click", openIntelModal);
document.querySelector("#closeModal").addEventListener("click", () => intelDialog.close());

// Dark mode
document.querySelector("#darkModeToggle").addEventListener("click", toggleDarkMode);
if (localStorage.getItem("darkMode") === "1") applyDarkMode(true);

// Export CSV
document.querySelector("#exportCsvButton").addEventListener("click", exportCsv);

// Audit log
document.querySelector("#auditLogButton").addEventListener("click", openAuditLog);
document.querySelector("#closeAuditModal").addEventListener("click", () => document.querySelector("#auditDialog").close());
document.querySelector("#auditApplyFilter").addEventListener("click", renderAuditList);

// Filters
document.querySelector("#applyFilter").addEventListener("click", applyRecordFilters);
document.querySelector("#clearFilter").addEventListener("click", clearRecordFilters);

document.querySelector("#saveIntel").addEventListener("click", saveIntelDetails);
document.querySelectorAll(".remove-image").forEach(button => {
  button.addEventListener("click", () => removeFaceImage(button.dataset.imageKey));
});
document.querySelector("#frontFaceUpload").addEventListener("change", event => setImage(event, "frontFace"));

// Photo lightbox
(function() {
  const lightbox    = document.querySelector("#photoLightbox");
  const lbImg       = document.querySelector("#photoLightboxImg");
  const lbClose     = document.querySelector("#photoLightboxClose");
  const lbX         = document.querySelector("#photoLightboxX");
  const photoFrame  = document.querySelector("#vrPhotoFrame");

  photoFrame.addEventListener("click", () => {
    const src = mainPreview.src;
    if (!src || src === window.location.href) return;
    lbImg.src = src;
    lightbox.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  function closeLightbox() {
    lightbox.classList.add("hidden");
    lbImg.src = "";
    document.body.style.overflow = "";
  }
  lbClose.addEventListener("click", closeLightbox);
  lbX.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
})();

// Admin dropdown menu
(function() {
  const wrap     = document.querySelector("#adminMenuWrap");
  const btn      = document.querySelector("#adminMenuBtn");
  const dropdown = document.querySelector("#adminMenuDropdown");

  function openMenu() {
    dropdown.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    dropdown.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.contains("open") ? closeMenu() : openMenu();
  });

  // Wire each item to the original hidden button / function
  document.querySelector("#adminMenuUsers").addEventListener("click",  () => { closeMenu(); document.querySelector("#manageUsers").click(); });
  document.querySelector("#adminMenuAudit").addEventListener("click",  () => { closeMenu(); document.querySelector("#auditLogButton").click(); });
  document.querySelector("#adminMenuExport").addEventListener("click", () => { closeMenu(); document.querySelector("#exportCsvButton").click(); });
  const editMenuItem = document.querySelector("#adminMenuEdit");
  if (editMenuItem) {
    editMenuItem.addEventListener("click", () => { closeMenu(); startEditingRecord(); });
  }
  const logoutMenuItem = document.querySelector("#adminMenuLogout");
  if (logoutMenuItem) {
    logoutMenuItem.addEventListener("click", () => { closeMenu(); logout(); });
  }

  // Close on outside click
  document.addEventListener("click", () => closeMenu());
})();

// Edit Visitor Record handler for admins
function startEditingRecord() {
  if (!canManageUsers()) {
    showMessage("Only administrators can edit visitor records.", "error");
    return;
  }
  isEditingRecord = true;
  isNewRecord = false;
  renderCurrentRecord();

  Object.values(fields).forEach(field => {
    field.disabled = false;
  });
  fields.age.disabled = true;
  if (visitorPhone) visitorPhone.disabled = false;
  if (visitorIdInput) visitorIdInput.disabled = false;
  if (visitNotes) visitNotes.disabled = false;
  document.querySelectorAll('input[type="file"]').forEach(input => {
    input.disabled = false;
  });

  fields.firstName.focus();
  showMessage("Edit mode enabled: You can modify this visitor record and click Update Record to save changes.", "info");
}

const editRecordBtn = document.querySelector("#editRecord");
if (editRecordBtn) {
  editRecordBtn.addEventListener("click", startEditingRecord);
}

fields.incarcerationIn.addEventListener("click", handleIncarcerationClick);
fields.incarcerationOut.addEventListener("click", handleIncarcerationClick);

function handleIncarcerationClick(e) {
  if (!canEdit()) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  const targetId = e.target.id;
  const rec = records[currentIndex] || emptyRecord();

  if (targetId === "incarcerationIn") {
    admissionForm.reset();
    if (rec.inPrison) {
      document.querySelector("#modalAdmissionDate").value = rec.admissionDate || "";
      const lastEvent = rec.statusHistory && rec.statusHistory.slice().reverse().find(ev => ev.type === "Admitted");
      if (lastEvent) {
        if (lastEvent.charge) {
          document.querySelector("#modalAdmissionCharge").value = lastEvent.charge;
        }
        if (lastEvent.convictionStatus) {
          document.querySelector("#modalAdmissionConvictionStatus").value = lastEvent.convictionStatus;
        }
        if (lastEvent.location) {
          const [location, cellNumber] = splitLocationAndCell(lastEvent.location);
          document.querySelector("#modalAdmissionLocation").value = location;
          document.querySelector("#modalAdmissionCellNumber").value = cellNumber;
        }
      }
    }
    admissionDialog.showModal();
  } else {
    dischargeForm.reset();
    if (!rec.inPrison) {
      document.querySelector("#modalDischargeDate").value = rec.dischargeDate || "";
      const lastEvent = rec.statusHistory && rec.statusHistory.slice().reverse().find(ev => ev.type === "Discharged");
      if (lastEvent) {
        if (lastEvent.charge) document.querySelector("#modalDischargeCharge").value = lastEvent.charge;
        if (lastEvent.dischargeStatus) document.querySelector("#modalDischargeStatus").value = lastEvent.dischargeStatus;
        if (lastEvent.location) {
          const [location, cellNumber] = splitLocationAndCell(lastEvent.location);
          document.querySelector("#modalDischargeLocation").value = location;
          document.querySelector("#modalDischargeCellNumber").value = cellNumber;
        }
      }
    }
    dischargeDialog.showModal();
  }
}

function splitLocationAndCell(locationValue) {
  if (!locationValue) return ["", ""];
  const trimmed = String(locationValue).trim();
  const match = trimmed.match(/^(.*?)(?:\s+Cell\s+No\.?\s*[:#-]?\s*(.*)|\s+\[(.*)\]|\s+\((.*)\))?$/i);
  if (!match) return [trimmed, ""];

  const rawLocation = match[1] || "";
  const cellNumber = (match[2] || match[3] || match[4] || "").trim();
  return [rawLocation.trim(), cellNumber];
}

function buildLocationValue(location, cellNumber) {
  const cleanLocation = (location || "").trim();
  const cleanCell = (cellNumber || "").trim();
  if (!cleanLocation) return "";
  if (!cleanCell) return cleanLocation;
  return `${cleanLocation} Cell No: ${cleanCell}`;
}

document.querySelector("#closeAdmissionModal").addEventListener("click", () => admissionDialog.close());
document.querySelector("#admissionCancelBtn").addEventListener("click", () => admissionDialog.close());
admissionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fields.incarcerationIn.checked = true;
  fields.incarcerationOut.checked = false;

  pendingStatusEvent = {
    type: "Admitted",
    date: document.querySelector("#modalAdmissionDate").value,
    charge: document.querySelector("#modalAdmissionCharge").value,
    convictionStatus: document.querySelector("#modalAdmissionConvictionStatus").value,
    location: buildLocationValue(
      document.querySelector("#modalAdmissionLocation").value,
      document.querySelector("#modalAdmissionCellNumber").value
    ),
    timestamp: new Date().toISOString(),
    username: currentUser?.username || "system"
  };

  fields.statusDate.value = pendingStatusEvent.date;
  updateStatusDateVisibility();
  admissionDialog.close();
});

document.querySelector("#closeDischargeModal").addEventListener("click", () => document.querySelector("#dischargeDialog").close());
document.querySelector("#dischargeCancelBtn").addEventListener("click", () => document.querySelector("#dischargeDialog").close());
dischargeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fields.incarcerationIn.checked = false;
  fields.incarcerationOut.checked = true;

  pendingStatusEvent = {
    type: "Discharged",
    date: document.querySelector("#modalDischargeDate").value,
    charge: document.querySelector("#modalDischargeCharge").value,
    dischargeStatus: document.querySelector("#modalDischargeStatus").value,
    location: buildLocationValue(
      document.querySelector("#modalDischargeLocation").value,
      document.querySelector("#modalDischargeCellNumber").value
    ),
    timestamp: new Date().toISOString(),
    username: currentUser?.username || "system"
  };

  fields.statusDate.value = pendingStatusEvent.date;
  updateStatusDateVisibility();
  dischargeDialog.close();
});

document.querySelector("#rightFaceUpload").addEventListener("change", event => setImage(event, "rightFace"));
document.querySelector("#leftFaceUpload").addEventListener("change", event => setImage(event, "leftFace"));
document.querySelector("#tattooUpload").addEventListener("change", addTattooImages);
document.querySelector("#tattooModalClose").addEventListener("click", closeTattooModal);
document.querySelector("#zoomInBtn").addEventListener("click", () => zoomTattoo("in"));
document.querySelector("#zoomOutBtn").addEventListener("click", () => zoomTattoo("out"));
document.querySelector("#zoomResetBtn").addEventListener("click", resetTattooZoom);
document.querySelector("#tattooModal").addEventListener("click", (e) => {
  if (e.target.id === "tattooModal") closeTattooModal();
});

const tattooWrapper = document.querySelector(".tattoo-modal-img-wrapper");
const tattooImg = document.getElementById("tattooModalImg");

if (tattooWrapper && tattooImg) {
  tattooWrapper.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isPanning = true;
    tattooWrapper.classList.add("panning");
    tattooImg.style.transition = "none";
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTattooTransform();
  });

  window.addEventListener("mouseup", () => {
    if (isPanning) {
      isPanning = false;
      tattooWrapper.classList.remove("panning");
      tattooImg.style.transition = "transform 0.15s ease";
    }
  });

  tattooWrapper.addEventListener("wheel", (e) => {
    e.preventDefault();
    tattooImg.style.transition = "none";
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      if (currentZoomLevel < MAX_ZOOM) {
        currentZoomLevel = Math.min(MAX_ZOOM, currentZoomLevel + zoomFactor);
      }
    } else {
      if (currentZoomLevel > MIN_ZOOM) {
        currentZoomLevel = Math.max(MIN_ZOOM, currentZoomLevel - zoomFactor);
      }
    }
    updateTattooTransform();
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      tattooImg.style.transition = "transform 0.15s ease";
    }, 150);
  });

  tattooWrapper.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      tattooImg.style.transition = "none";
      startX = e.touches[0].clientX - panX;
      startY = e.touches[0].clientY - panY;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    panX = e.touches[0].clientX - startX;
    panY = e.touches[0].clientY - startY;
    updateTattooTransform();
  }, { passive: true });

  window.addEventListener("touchend", () => {
    if (isPanning) {
      isPanning = false;
      tattooImg.style.transition = "transform 0.15s ease";
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (document.getElementById("tattooModal").open) {
      closeTattooModal();
    } else if (isNewRecord) {
      cancelNewRecord();
    }
  }
});

searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
});

// Close search dropdown on click outside, escape, or close button
document.addEventListener("click", event => {
  if (!event.target.closest(".search-filter-wrapper")) {
    hideSearchResults();
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    hideSearchResults();
  }
});
const searchResultsCloseBtn = document.querySelector("#searchResultsClose");
if (searchResultsCloseBtn) {
  searchResultsCloseBtn.addEventListener("click", hideSearchResults);
}

fields.dob.addEventListener("change", setAgeFromDob);
fields.dob.addEventListener("input", setAgeFromDob);

function attachDateFieldCalendarBehavior(field) {
  field.addEventListener("focus", function() {
    if (this.value) {
      const d = new Date(this.value);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        this.value = `${yyyy}-${mm}-${dd}`;
      }
    }
    this.type = "date";
  });

  field.addEventListener("blur", function() {
    if (this.value) {
      let d = new Date(this.value);
      if (this.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        d = new Date(this.value + 'T00:00:00');
      }
      if (!isNaN(d.getTime())) {
        this.type = "text";
        this.value = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        this.type = "text";
      }
    } else {
      this.type = "text";
    }
  });
}

attachDateFieldCalendarBehavior(fields.dob);
attachDateFieldCalendarBehavior(fields.statusDate);

window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing");
  reportTemplate.innerHTML = "";
  const dynamicStyle = document.getElementById("dynamic-print-style");
  if (dynamicStyle) dynamicStyle.remove();
});

// Photo hover popover hook layout configurations
const photoStrip = document.querySelector(".photo-strip");
const photoPopover = document.querySelector(".photo-views-popover");
if (photoStrip && photoPopover) {
  photoStrip.addEventListener("mouseenter", () => {
    if (!document.querySelector(".photo-frame.has-no-photos")) {
      photoPopover.classList.add("popover-visible");
    }
  });
  photoStrip.addEventListener("mouseleave", () => {
    photoPopover.classList.remove("popover-visible");
  });
}

initializeAuth();

// ── CORE BACKEND API CORE INTERFACES ──────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const isAuthRequired = options.auth !== false;
  const headers = { ...options.headers };

  if (isAuthRequired && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP Request failed with status code ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function initializeAuth() {
  try {
    const bootstrap = await apiFetch("/api/bootstrap", { auth: false });

    if (!bootstrap.hasUsers) {
      showFirstUser();
      return;
    }

    if (authToken) {
      const session = await apiFetch("/api/me");
      currentUser = session.user;
      await showApp();
      return;
    }

    showLogin();
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }
    loginShell.classList.remove("hidden");
    appShell.classList.add("hidden");
  }
}

function showFirstUser() {
  if (loginForm) loginForm.classList.add("hidden");
  if (firstUserForm) firstUserForm.classList.remove("hidden");
  if (loginIntro) loginIntro.textContent = "Create the first super admin user.";
  if (loginShell) loginShell.classList.remove("hidden");
  if (appShell) appShell.classList.add("hidden");
}

function showLogin() {
  if (loginForm) loginForm.classList.remove("hidden");
  if (firstUserForm) firstUserForm.classList.add("hidden");
  if (loginIntro) loginIntro.textContent = "Sign in to continue.";
  if (loginShell) loginShell.classList.remove("hidden");
  if (appShell) appShell.classList.add("hidden");
  currentUser = null;
  const usernameInput = document.querySelector("#loginUsername");
  if (usernameInput) usernameInput.focus();
}

async function showApp() {
  loginShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  sessionStatus.textContent = `${currentUser.username} - ${roleLabel(currentUser.role)}`;
  manageUsersButton.classList.toggle("hidden", !canManageUsers());
  document.querySelector("#deleteRecord").classList.toggle("hidden", !canManageUsers());
  document.querySelector("#generatePdf").classList.toggle("hidden", !canManageUsers());
  const editBtn = document.querySelector("#editRecord");
  if (editBtn) editBtn.classList.toggle("hidden", !canManageUsers());
  document.querySelector("#auditLogButton").classList.toggle("hidden", !canManageUsers());
  document.querySelector("#exportCsvButton").classList.toggle("hidden", !canManageUsers());
  // Show admin dropdown only for admins
  document.querySelector("#adminMenuWrap").classList.toggle("hidden", !canManageUsers());
  applyAccessMode();
  await loadRecordsFromBackend();
  await migrateLegacyRecordsIfNeeded();
  clearForm(true);
}

async function handleLogin(event) {
  event.preventDefault();
  loginMessage.textContent = "";

  try {
    const result = await apiFetch("/api/login", {
      auth: false,
      method: "POST",
      body: {
        username: document.querySelector("#loginUsername").value.trim(),
        password: document.querySelector("#loginPassword").value
      }
    });
    setSession(result);
    loginForm.reset();
    await showApp();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
}

async function handleFirstUserCreate(event) {
  event.preventDefault();
  loginMessage.textContent = "";

  try {
    const result = await apiFetch("/api/users/first", {
      auth: false,
      method: "POST",
      body: {
        username: document.querySelector("#firstUsername").value.trim(),
        password: document.querySelector("#firstPassword").value
      }
    });
    setSession(result);
    firstUserForm.reset();
    await showApp();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
}

async function handleCreateUser(event) {
  event.preventDefault();
  if (!canManageUsers()) return;
  userMessage.textContent = "";

  try {
    await apiFetch("/api/users", {
      method: "POST",
      body: {
        username: document.querySelector("#newUsername").value.trim(),
        password: document.querySelector("#newPassword").value,
        role: document.querySelector("#newUserRole").value
      }
    });
    document.querySelector("#createUserForm").reset();
    userMessage.textContent = "User created.";
    await renderUserList();
  } catch (error) {
    userMessage.textContent = error.message;
  }
}

async function openUsersModal() {
  if (!canManageUsers()) return;
  userMessage.textContent = "";
  await renderUserList();
  usersDialog.showModal();
}

async function renderUserList() {
  const result = await apiFetch("/api/users");
  userList.innerHTML = "";

  result.users.forEach(user => {
    const row = document.createElement("div");
    row.className = "user-row";
    const disabled = user.id === currentUser.id && user.role === "admin" ? "disabled" : "";
    row.innerHTML = `
        <strong>${escapeHtml(user.username)}</strong>
        <label class="role-editor">
          <span>Role</span>
          <select data-user-role="${escapeHtml(user.id)}" ${disabled}>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>Super Admin</option>
            <option value="entry" ${user.role === "entry" ? "selected" : ""}>Data Entry</option>
            <option value="readonly" ${user.role === "readonly" ? "selected" : ""}>Read Only</option>
          </select>
        </label>
        <label class="disabled-toggle" title="Toggle account active status">
          <input type="checkbox" data-user-disabled="${escapeHtml(user.id)}" ${user.disabled ? "checked" : ""} ${disabled}>
          Disabled
        </label>
        <button class="change-pw" data-user-pw="${escapeHtml(user.id)}" ${disabled}>Change Password</button>
        <button class="delete-user" data-user-delete="${escapeHtml(user.id)}" ${disabled}>Delete</button>
      `;
    userList.append(row);
  });


  userList.querySelectorAll("[data-user-role]").forEach(select => {
    select.addEventListener("change", () => updateUserRole(select.dataset.userRole, select.value));
  });

  // Delete user
  userList.querySelectorAll("[data-user-delete]").forEach(btn => {
    btn.addEventListener("click", () => deleteUser(btn.dataset.userDelete));
  });

  // Change password
  userList.querySelectorAll("[data-user-pw]").forEach(btn => {
    btn.addEventListener("click", () => changeUserPassword(btn.dataset.userPw));
  });

  // Toggle disabled
  userList.querySelectorAll("[data-user-disabled]").forEach(checkbox => {
    checkbox.addEventListener("change", () => toggleUserDisabled(checkbox.dataset.userDisabled, checkbox.checked));
  });
}


async function deleteUser(userId) {
  if (!canManageUsers()) return;
  try {
    await apiFetch(`/api/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
    userMessage.textContent = "User deleted.";
    await renderUserList();
  } catch (error) {
    userMessage.textContent = error.message;
  }
}

async function changeUserPassword(userId) {
  if (!canManageUsers()) return;
  const newPassword = prompt("Enter new password for the user:");
  if (!newPassword) return;
  try {
    await apiFetch(`/api/users/${encodeURIComponent(userId)}/password`, {
      method: "PATCH",
      body: { password: newPassword }
    });
    userMessage.textContent = "Password updated.";
    await renderUserList();
  } catch (error) {
    userMessage.textContent = error.message;
  }
}

async function toggleUserDisabled(userId, disabled) {
  if (!canManageUsers()) return;
  try {
    await apiFetch(`/api/users/${encodeURIComponent(userId)}/disable`, {
      method: "PATCH",
      body: { disabled }
    });
    userMessage.textContent = "User status updated.";
    await renderUserList();
  } catch (error) {
    userMessage.textContent = error.message;
  }
}

function setSession(result) {
  authToken = result.token;
  currentUser = result.user;
  sessionStorage.setItem(SESSION_KEY, authToken);
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  authToken = "";
  currentUser = null;
  records = [];
  currentInmateMatch = null;
  selectedVisitorRecord = null;
  document.body.classList.remove("readonly-mode");
  clearForm(true);
  if (loginForm) loginForm.reset();
  if (loginMessage) {
    loginMessage.textContent = "";
    loginMessage.style.cssText = "";
  }
  showLogin();
}

// ── DATA PERSISTENCE PIPELINES ────────────────────────────────────────────────
async function loadRecordsFromBackend() {
  const result = await apiFetch("/api/records");
  records = Array.isArray(result.records) && result.records.length ? result.records : [emptyRecord()];
  applyFiltersToRecords();
  currentIndex = Math.min(currentIndex, records.length - 1);
}

async function persistRecords(auditAction, auditDetail) {
  if (!canEdit()) return;
  const result = await apiFetch("/api/records", {
    method: "PUT",
    body: { records, auditAction: auditAction || "update_records", auditDetail: auditDetail || "" }
  });
  records = result.records;
  applyFiltersToRecords();
}

async function migrateLegacyRecordsIfNeeded() {
  if (!canEdit() || records.length !== 1 || records[0].inmateId !== "2864") return;

  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_RECORDS_KEY) || "[]");
    if (Array.isArray(legacy) && legacy.length && legacy.some(record => record.inmateId !== "2864" || record.comment || record.images?.frontFace)) {
      records = legacy;
      currentIndex = 0;
      await persistRecords();
      localStorage.removeItem(LEGACY_RECORDS_KEY);
    }
  } catch {
    // Fail silently on structural anomalies
  }
}

function roleLabel(role) {
  if (role === "admin") return "Super Admin";
  return role === "readonly" ? "Read Only" : "Data Entry";
}

function canEdit() {
  return currentUser?.role === "admin" || currentUser?.role === "entry";
}

function canManageUsers() {
  return currentUser?.role === "admin";
}

function applyAccessMode() {
  const readOnly = !canEdit();
  document.body.classList.toggle("readonly-mode", readOnly);

  Object.values(fields).forEach(field => {
    field.disabled = readOnly;
  });
  fields.age.disabled = true;
  if (visitorPhone) visitorPhone.disabled = readOnly;
  if (visitorIdInput) visitorIdInput.disabled = readOnly;
  if (visitNotes) visitNotes.disabled = readOnly;

  document.querySelectorAll("[data-edit-only]").forEach(element => {
    element.disabled = readOnly;
  });

  document.querySelectorAll("[data-admin-only]").forEach(element => {
    element.classList.toggle("hidden", !canManageUsers());
  });

  document.querySelectorAll('input[type="file"]').forEach(input => {
    input.disabled = readOnly;
  });
}

// ── PROFILE UTILITIES & CALCULATORS ───────────────────────────────────────────
function getFormRecord() {
  const current = records[currentIndex] || emptyRecord();
  const dob = parseDateInput(fields.dob.value);
  const age = calculateAge(dob);
  const statusDateValue = fields.statusDate.dataset.isoValue || parseDateInput(fields.statusDate.value);
  fields.age.value = age;

  const notesVal = visitNotes ? visitNotes.value.trim() : (fields.comment ? fields.comment.value.trim() : "");

  return {
    ...current,
    inmateId: fields.inmateId.value.trim(),
    vVisitorsId: vVisitorsId && vVisitorsId.value ? Number(vVisitorsId.value) : (current.vVisitorsId || null),
    linkedInmateNo: linkedInmateNo ? linkedInmateNo.value.trim() : (current.linkedInmateNo || ""),
    visitorNumber: current.visitorNumber || "",
    registrationDate: current.registrationDate || (isNewRecord ? new Date().toISOString().slice(0, 10) : ""),
    firstName: fields.firstName.value.trim(),
    middleName: fields.middleName.value.trim(),
    lastName: fields.lastName.value.trim(),
    alias: fields.alias.value.trim(),
    dob,
    age,
    address: fields.address.value.trim(),
    phone: visitorPhone ? visitorPhone.value.trim() : (current.phone || ""),
    nationalId: visitorIdInput ? visitorIdInput.value.trim() : (current.nationalId || ""),
    affiliation: fields.affiliation.value.trim(),
    comment: notesVal,
    inPrison: fields.incarcerationIn.checked,
    images: normalizeImages(current.images),
    admissionDate: fields.incarcerationIn.checked ? statusDateValue : (current.admissionDate || ""),
    dischargeDate: fields.incarcerationOut.checked ? statusDateValue : (current.dischargeDate || "")
  };
}

function renderCurrentRecord() {
  const record = records[currentIndex] || emptyRecord();

  Object.entries(fields).forEach(([key, field]) => {
    if (key === "incarcerationIn") {
      field.checked = Boolean(record.inPrison);
    } else if (key === "incarcerationOut") {
      field.checked = !Boolean(record.inPrison);
    } else if (key === "statusDate") {
      const isoValue = record.inPrison ? record.admissionDate : (record.dischargeDate || "");
      field.dataset.isoValue = isoValue || "";
      if (isoValue) {
        field.type = "text";
        field.value = formatMediumDate(isoValue);
      } else {
        field.type = "hidden";
        field.value = "";
      }
    } else if (key === "dob") {
      if (record.dob) {
        let d = new Date(record.dob);
        if (record.dob.match(/^\d{4}-\d{2}-\d{2}$/)) d = new Date(record.dob + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          field.type = "text";
          field.value = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
          field.value = record.dob;
        }
      } else {
        field.value = "";
      }
    } else {
      field.value = record[key] || "";
    }
  });

  if (visitorPhone) visitorPhone.value = record.phone || "";
  if (visitorIdInput) visitorIdInput.value = record.nationalId || "";
  if (visitNotes) visitNotes.value = record.comment || "";
  if (vVisitorsId) vVisitorsId.value = record.vVisitorsId ? String(record.vVisitorsId) : "";
  if (linkedInmateNo) linkedInmateNo.value = record.linkedInmateNo || "";

  if (record.inmateId) {
    updateInmateLinkBanner(record.linkedInmateNo || record.inmateId, record.personName || `Inmate #${record.inmateId}`);
  } else {
    updateInmateLinkBanner("", "");
  }

  updateStatusDateVisibility();
  fields.age.value = calculateAge(record.dob);

  const regDateElem = document.querySelector("#registrationDate");
  const visIdDisplay = document.querySelector("#visitorIdDisplay");

  if (visIdDisplay) {
    visIdDisplay.textContent = record.vVisitorsId ? `#${record.vVisitorsId}` : (record.visitorNumber || "—");
  }

  if (regDateElem) {
    if (isNewRecord) {
      regDateElem.value = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (record.registrationDate) {
      // Use the stored registration date
      const d = new Date(record.registrationDate + 'T00:00:00');
      regDateElem.value = isNaN(d.getTime()) ? record.registrationDate :
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      const createdDate = record.admissionDate ? new Date(record.admissionDate) : new Date();
      if (!isNaN(createdDate.getTime())) {
        regDateElem.value = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        regDateElem.value = record.admissionDate || "";
      }
    }
  }

  const mugshot = getMainMugshot(record);
  mainPreview.src = mugshot || "";
  mainPreviewText.textContent = mugshot ? "" : "No photo";

  const images = normalizeImages(record.images);
  const hoverFront = document.querySelector("#hoverFrontPreview");
  const hoverRight = document.querySelector("#hoverRightPreview");
  const hoverLeft = document.querySelector("#hoverLeftPreview");
  if (hoverFront && hoverRight && hoverLeft) {
    hoverFront.setAttribute("src", images.frontFace || "");
    hoverRight.setAttribute("src", images.rightFace || "");
    hoverLeft.setAttribute("src", images.leftFace || "");
    toggleEmptyHoverIndicator(hoverFront, "No Front Photo");
    toggleEmptyHoverIndicator(hoverRight, "No Right Photo");
    toggleEmptyHoverIndicator(hoverLeft, "No Left Photo");
  }

  const photoFrame = document.querySelector(".photo-frame");
  if (photoFrame) {
    photoFrame.classList.toggle("has-no-photos", !mugshot);
  }

  renderMainHistoryTimeline(record.statusHistory || []);
  updateStatus();

  const editButton = document.querySelector("#editRecord");
  const updateButton = document.querySelector("#updateRecord");
  const saveButton = document.querySelector("#saveRecord");
  const nextButton = document.querySelector("#nextRecord");
  const prevButton = document.querySelector("#previousRecord");
  const newButton = document.querySelector("#newRecord");
  const cancelButton = document.querySelector("#cancelRecord");
  const intelButton = document.querySelector("#openIntelModal");
  const generatePdfButton = document.querySelector("#generatePdf");
  const deleteButton = document.querySelector("#deleteRecord");
  const filterBar = document.querySelector("#filterBar");

  if (clearFormBtn) clearFormBtn.classList.remove("hidden");

  if (isNewRecord) {
    // When selecting new visitor: ONLY show save record and clear form
    saveButton.classList.remove("hidden");
    newButton.classList.add("hidden");
    if (editButton) editButton.classList.add("hidden");
    updateButton.classList.add("hidden");
    if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
    deleteButton.classList.add("hidden");
    generatePdfButton.classList.add("hidden");
    if (cancelButton) cancelButton.classList.add("hidden");
    nextButton.classList.add("hidden");
    prevButton.classList.add("hidden");
    intelButton.classList.add("hidden");
    if (filterBar) filterBar.classList.add("hidden");
  } else if (isEditingRecord) {
    // When editing visitor in admin: show update record and cancel edit
    updateButton.classList.remove("hidden");
    if (cancelEditBtn) cancelEditBtn.classList.remove("hidden");
    saveButton.classList.add("hidden");
    newButton.classList.add("hidden");
    if (editButton) editButton.classList.add("hidden");
    deleteButton.classList.add("hidden");
    generatePdfButton.classList.add("hidden");
    if (cancelButton) cancelButton.classList.add("hidden");
    nextButton.classList.add("hidden");
    prevButton.classList.add("hidden");
    intelButton.classList.add("hidden");
    if (filterBar) filterBar.classList.remove("hidden");
  } else {
    // Normal viewing state
    saveButton.classList.add("hidden");
    updateButton.classList.add("hidden");
    if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
    newButton.classList.remove("hidden");
    const hasActiveRecord = Boolean(record && (record.firstName || record.inmateId || record.vVisitorsId || record.visitorNumber));
    if (editButton) editButton.classList.toggle("hidden", !canManageUsers() || !hasActiveRecord);
    deleteButton.classList.toggle("hidden", !canManageUsers() || !hasActiveRecord);
    generatePdfButton.classList.toggle("hidden", !canManageUsers() || !hasActiveRecord);
    if (cancelButton) cancelButton.classList.add("hidden");
    nextButton.classList.add("hidden");
    prevButton.classList.add("hidden");
    intelButton.classList.toggle("hidden", !hasActiveRecord);
    if (filterBar) filterBar.classList.remove("hidden");
  }

  // Update datagrid for currently viewed record if linked to an inmate
  if (record && (record.inmateId || record.linkedInmateNo)) {
    renderRegisteredVisitorsDatagrid(record.inmateId, record.linkedInmateNo, record.personName);
  } else if (currentInmateMatch) {
    const fullName = `${currentInmateMatch.firstName || ""} ${currentInmateMatch.lastName || ""}`.trim();
    renderRegisteredVisitorsDatagrid(currentInmateMatch.inmateId, currentInmateMatch.inmateNo, fullName);
  } else {
    renderRegisteredVisitorsDatagrid("", "", "");
  }
}

function clearForm(isInitialLoad = false) {
  // Clear all standard form fields
  Object.entries(fields).forEach(([key, field]) => {
    if (field.type === "radio" || field.type === "checkbox") {
      field.checked = false;
    } else {
      field.value = "";
    }
  });

  if (visitorPhone) visitorPhone.value = "";
  if (visitorIdInput) visitorIdInput.value = "";
  if (visitNotes) visitNotes.value = "";
  if (vVisitorsId) vVisitorsId.value = "";
  if (linkedInmateNo) linkedInmateNo.value = "";

  // Reset displays
  const visIdDisplay = document.querySelector("#visitorIdDisplay");
  if (visIdDisplay) visIdDisplay.textContent = "—";
  const regDateElem = document.querySelector("#registrationDate");
  if (regDateElem) regDateElem.value = "";

  // Reset photo previews
  mainPreview.src = "";
  mainPreviewText.textContent = "No photo";
  const photoFrame = document.querySelector(".photo-frame");
  if (photoFrame) photoFrame.classList.add("has-no-photos");

  const hoverFront = document.querySelector("#hoverFrontPreview");
  const hoverRight = document.querySelector("#hoverRightPreview");
  const hoverLeft = document.querySelector("#hoverLeftPreview");
  if (hoverFront && hoverRight && hoverLeft) {
    hoverFront.removeAttribute("src");
    hoverRight.removeAttribute("src");
    hoverLeft.removeAttribute("src");
    toggleEmptyHoverIndicator(hoverFront, "No Front Photo");
    toggleEmptyHoverIndicator(hoverRight, "No Right Photo");
    toggleEmptyHoverIndicator(hoverLeft, "No Left Photo");
  }

  // Clear timeline & status
  renderMainHistoryTimeline([]);
  if (recordStatus) {
    const total = records.filter(r => r && (r.firstName || r.lastName || r.vVisitorsId || r.visitorNumber)).length;
    recordStatus.textContent = total ? `${total} visitor record(s) on file` : "Ready";
  }

  // Reset inmate link banner
  updateInmateLinkBanner("", "");

  // Reset search
  if (searchInput) searchInput.value = "";
  hideSearchResults();

  // Reset active state flags
  isNewRecord = false;
  isEditingRecord = false;
  currentInmateMatch = null;
  selectedVisitorRecord = null;
  pendingStatusEvent = null;
  updateRegistrationLockState();

  // Buttons visibility
  const editButton = document.querySelector("#editRecord");
  const updateButton = document.querySelector("#updateRecord");
  const saveButton = document.querySelector("#saveRecord");
  const newButton = document.querySelector("#newRecord");
  const cancelButton = document.querySelector("#cancelRecord");
  const intelButton = document.querySelector("#openIntelModal");
  const generatePdfButton = document.querySelector("#generatePdf");
  const deleteButton = document.querySelector("#deleteRecord");

  if (saveButton) saveButton.classList.add("hidden");
  if (updateButton) updateButton.classList.add("hidden");
  if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
  if (clearFormBtn) clearFormBtn.classList.remove("hidden");
  if (newButton) newButton.classList.remove("hidden");
  if (editButton) editButton.classList.add("hidden");
  if (deleteButton) deleteButton.classList.add("hidden");
  if (generatePdfButton) generatePdfButton.classList.add("hidden");
  if (cancelButton) cancelButton.classList.add("hidden");
  if (intelButton) intelButton.classList.add("hidden");

  // Apply access mode so inputs follow permissions
  applyAccessMode();

  // Reset datagrid to empty prompt state
  if (datagridRegisterNewBtn) datagridRegisterNewBtn.classList.add("hidden");
  renderRegisteredVisitorsDatagrid("", "", "");

  // Focus search input
  if (searchInput) searchInput.focus();

  if (!isInitialLoad) {
    showMessage("Form cleared. Search an inmate above or click 'New Visitor' to start.", "info");
  }
}

function cancelEdit() {
  if (!isEditingRecord) return;
  isEditingRecord = false;
  renderCurrentRecord();
  applyAccessMode();
  showMessage("Edit cancelled. Form reverted to view mode.", "info");
}

function updateRegistrationLockState() {
  if (datagridRegisterNewBtn) {
    if (isNewRecord) {
      datagridRegisterNewBtn.disabled = true;
      datagridRegisterNewBtn.classList.add("disabled");
      datagridRegisterNewBtn.title = "Registration in progress. Please save the record or click 'Clear Form' first.";
    } else {
      datagridRegisterNewBtn.disabled = false;
      datagridRegisterNewBtn.classList.remove("disabled");
      datagridRegisterNewBtn.removeAttribute("title");
    }
  }

  const emptyBtn = document.querySelector("#emptyNoticeRegisterBtn");
  if (emptyBtn) {
    if (isNewRecord) {
      emptyBtn.disabled = true;
      emptyBtn.classList.add("disabled");
      emptyBtn.title = "Registration in progress. Please save the record or click 'Clear Form' first.";
    } else {
      emptyBtn.disabled = false;
      emptyBtn.classList.remove("disabled");
      emptyBtn.removeAttribute("title");
    }
  }
}

function renderRegisteredVisitorsDatagrid(targetInmateId, targetInmateNo, targetInmateName) {
  if (!registeredVisitorsTbody || !datagridInmateBadge || !datagridCountBadge) return;

  const inmateIdStr = targetInmateId ? String(targetInmateId).trim() : "";
  const inmateNoStr = targetInmateNo ? String(targetInmateNo).trim() : "";
  const inmateNameStr = targetInmateName ? String(targetInmateName).trim() : "";

  if (!inmateIdStr && !inmateNoStr) {
    if (datagridRegisterNewBtn) datagridRegisterNewBtn.classList.add("hidden");
    datagridInmateBadge.textContent = "No Inmate Selected";
    datagridCountBadge.textContent = "0 Registered";
    registeredVisitorsTbody.innerHTML = "";
    if (datagridEmptyNotice) {
      datagridEmptyNotice.classList.remove("hidden");
      if (datagridEmptyText) datagridEmptyText.textContent = "Search an inmate or select a record to see registered visitors.";
    }
    if (registeredVisitorsTable) registeredVisitorsTable.classList.add("hidden");
    return;
  }

  // Show Register New button on datagrid header when an inmate is active
  if (datagridRegisterNewBtn) datagridRegisterNewBtn.classList.remove("hidden");
  updateRegistrationLockState();

  // Set Inmate badge
  const displayLabel = inmateNoStr
    ? `Inmate #${inmateNoStr}${inmateNameStr ? " - " + inmateNameStr : ""}`
    : (inmateNameStr || `Inmate ID: ${inmateIdStr}`);
  datagridInmateBadge.textContent = displayLabel;

  // Filter records in memory for this inmate
  const matchedList = records.filter(r => {
    if (!r) return false;
    // Exclude blank placeholder records
    if (!r.firstName && !r.lastName && !r.visitorNumber && !r.vVisitorsId) return false;

    if (inmateIdStr && String(r.inmateId).trim() === inmateIdStr) return true;
    if (inmateNoStr) {
      if (r.linkedInmateNo && String(r.linkedInmateNo).trim() === inmateNoStr) return true;
      if (r.inmateId && String(r.inmateId).trim() === inmateNoStr) return true;
      if (r.comment && r.comment.includes(`#${inmateNoStr}`)) return true;
    }
    return false;
  });

  datagridCountBadge.textContent = `${matchedList.length} Registered`;

  if (matchedList.length === 0) {
    registeredVisitorsTbody.innerHTML = "";
    if (registeredVisitorsTable) registeredVisitorsTable.classList.add("hidden");
    if (datagridEmptyNotice) {
      datagridEmptyNotice.classList.remove("hidden");
      if (datagridEmptyText) {
        datagridEmptyText.innerHTML = `
          <div>No visitor demographics registered yet for <strong>${escapeHtml(displayLabel)}</strong>.</div>
          <div class="datagrid-empty-action">
            <button type="button" class="btn-register-new" id="emptyNoticeRegisterBtn">&#10133; Register New from Current Lists</button>
          </div>
        `;
        const emptyBtn = datagridEmptyNotice.querySelector("#emptyNoticeRegisterBtn");
        if (emptyBtn) {
          if (isNewRecord) {
            emptyBtn.disabled = true;
            emptyBtn.classList.add("disabled");
            emptyBtn.title = "Registration in progress. Please save the record or click 'Clear Form' first.";
          }
          emptyBtn.addEventListener("click", () => {
            if (isNewRecord) {
              showMessage("A visitor registration is currently in progress. Please save the current record or click 'Clear Form' before registering another visitor.", "info");
              return;
            }
            if (currentInmateMatch) openAssignedVisitorsModal(currentInmateMatch);
          });
        }
      }
    }
    return;
  }

  if (datagridEmptyNotice) datagridEmptyNotice.classList.add("hidden");
  if (registeredVisitorsTable) registeredVisitorsTable.classList.remove("hidden");

  registeredVisitorsTbody.innerHTML = "";

  matchedList.forEach(r => {
    const globalIdx = records.indexOf(r);
    const isSelected = globalIdx === currentIndex;
    const tr = document.createElement("tr");
    if (isSelected) tr.classList.add("selected-row");

    const mugshot = getMainMugshot(r);
    const fullName = [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ").trim() || "Unnamed Visitor";
    const visId = r.vVisitorsId ? `#${r.vVisitorsId}` : (r.visitorNumber || "—");

    // Relationship & list detection
    const isFamily = (r.comment && r.comment.toLowerCase().includes("family day"));
    const listBadge = isFamily
      ? `<span class="badge badge-tab-family">&#128106; Family Day</span>`
      : `<span class="badge badge-tab-regular">Regular</span>`;

    const relMatch = r.comment ? r.comment.match(/\(([A-Za-z\s]+)\)/) : null;
    const relText = relMatch ? relMatch[1].trim() : "VISITOR";
    const relTag = `${listBadge} <span class="badge badge-rel">${escapeHtml(relText)}</span>`;

    const phoneStr = r.phone ? escapeHtml(r.phone) : "—";
    const natIdStr = r.nationalId ? escapeHtml(r.nationalId) : "—";
    const regDateStr = r.registrationDate ? formatMediumDate(r.registrationDate) : (r.admissionDate ? formatMediumDate(r.admissionDate) : "—");

    tr.innerHTML = `
      <td>
        <div class="datagrid-photo-thumb">
          ${mugshot ? `<img src="${mugshot}" alt="${escapeHtml(fullName)}">` : `&#128100;`}
        </div>
      </td>
      <td>
        <span class="datagrid-vis-badge">${escapeHtml(visId)}</span>
      </td>
      <td>
        <div style="font-weight: 600; color: var(--ink, #0f172a);">${escapeHtml(fullName)}</div>
        ${r.alias ? `<div style="font-size: 11px; color: var(--muted, #64748b);">AKA: ${escapeHtml(r.alias)}</div>` : ""}
      </td>
      <td>${relTag}</td>
      <td style="font-size: 12px;">
        <div>&#128222; ${phoneStr}</div>
        <div style="color: var(--muted, #64748b); font-size: 11px;">&#129530; ${natIdStr}</div>
      </td>
      <td style="font-size: 12px; font-weight: 500;">${regDateStr}</td>
      <td style="text-align: center;">
        <button type="button" class="datagrid-load-btn" data-record-index="${globalIdx}">Load Record</button>
      </td>
    `;

    const loadThisRecord = () => {
      if (isNewRecord) {
        showMessage("A visitor registration is currently in progress. Please save the current record or click 'Clear Form' before loading another visitor.", "info");
        return;
      }
      currentIndex = globalIdx;
      isNewRecord = false;
      isEditingRecord = false;
      updateRegistrationLockState();
      renderCurrentRecord();
      applyAccessMode();
      registeredVisitorsTbody.querySelectorAll("tr").forEach(row => row.classList.remove("selected-row"));
      tr.classList.add("selected-row");
      showMessage(`Loaded record for ${fullName}.`, "info");
    };

    tr.querySelector(".datagrid-load-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      loadThisRecord();
    });

    tr.addEventListener("click", loadThisRecord);

    registeredVisitorsTbody.appendChild(tr);
  });
}

function getStatusChangeEvent(record, previousRecord) {
  const selectedDate = record.inPrison ? record.admissionDate : record.dischargeDate;
  if (!selectedDate) return null;

  const currentType = record.inPrison ? "Admitted" : "Discharged";
  const previousType = previousRecord?.inPrison ? "Admitted" : "Discharged";

  if (previousRecord && currentType === previousType) {
    const previousDate = record.inPrison ? previousRecord.admissionDate : previousRecord.dischargeDate;
    if (selectedDate === previousDate) return null;
  }

  return {
    type: currentType,
    date: selectedDate,
    timestamp: new Date().toISOString(),
    username: currentUser?.username || "system"
  };
}

function applyStatusHistory(record) {
  const previousRecord = records[currentIndex] || emptyRecord();

  if (pendingStatusEvent) {
    record.statusHistory = [...(previousRecord.statusHistory || []), pendingStatusEvent];
    pendingStatusEvent = null;
  } else {
    const event = getStatusChangeEvent(record, previousRecord);
    if (event) {
      record.statusHistory = [...(previousRecord.statusHistory || []), event];
    } else {
      record.statusHistory = previousRecord.statusHistory || [];
    }
  }
}

function getStatusDateLabel() {
  return fields.incarcerationIn.checked ? "Admission Date" : "Discharge Date";
}

function updateStatusDateVisibility() {
  const dateFieldWrapper = document.querySelector(".status-date-field");
  if (!dateFieldWrapper) return;
  if (!fields.incarcerationIn?.checked && !fields.incarcerationOut?.checked) {
    dateFieldWrapper.classList.add("hidden");
    return;
  }

  dateFieldWrapper.classList.remove("hidden");
  const span = dateFieldWrapper.querySelector("span");
  if (span) span.textContent = getStatusDateLabel();
}

function toggleEmptyHoverIndicator(imgElement, placeholderText) {
  if (!imgElement) return;
  const src = imgElement.getAttribute("src");
  if (!src || src.trim() === "" || src === window.location.href) {
    imgElement.style.display = "none";
    let container = imgElement.parentElement;
    let label = container.querySelector(".popover-empty-placeholder");
    if (!label) {
      label = document.createElement("div");
      label.className = "popover-empty-placeholder";
      label.style.cssText = "height:110px; display:flex; align-items:center; justify-content:center; font-size:11px; color:#94a3b8; background:rgba(0,0,0,0.2); border-radius:4px;";
      label.textContent = placeholderText;
      container.insertBefore(label, imgElement);
    }
  } else {
    imgElement.style.display = "block";
    let label = imgElement.parentElement.querySelector(".popover-empty-placeholder");
    if (label) label.remove();
  }
}

function calculateAge(dobString) {
  if (!dobString) return "";
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : "";
}

function setAgeFromDob() {
  fields.age.value = calculateAge(fields.dob.value);
}

function parseDateInput(val) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeImages(imgs) {
  if (!imgs) return { frontFace: "", rightFace: "", leftFace: "", tattoos: [] };
  return {
    frontFace: imgs.frontFace || "",
    rightFace: imgs.rightFace || "",
    leftFace: imgs.leftFace || "",
    tattoos: Array.isArray(imgs.tattoos) ? imgs.tattoos : []
  };
}

function getMainMugshot(record) {
  if (!record || !record.images) return "";
  return record.images.frontFace || record.images.rightFace || record.images.leftFace || "";
}

// ── SEARCH, PAGINATION & SEARCH FILTERS ──────────────────────────────────────
function applyFiltersToRecords() {
  filteredRecords = records.filter(r => {
    if (activeFilters.status === "in" && !r.inPrison) return false;
    if (activeFilters.status === "out" && r.inPrison) return false;
    if (activeFilters.affiliation && !String(r.affiliation || "").toLowerCase().includes(activeFilters.affiliation.toLowerCase())) return false;
    if (activeFilters.dateFrom) {
      const d = r.admissionDate || r.dischargeDate || "";
      if (!d || d < activeFilters.dateFrom) return false;
    }
    if (activeFilters.dateTo) {
      const d = r.admissionDate || r.dischargeDate || "";
      if (!d || d > activeFilters.dateTo) return false;
    }
    return true;
  });
}

function applyRecordFilters() {
  activeFilters.status = document.querySelector("#filterStatus").value;
  activeFilters.affiliation = document.querySelector("#filterAffiliation").value.trim();
  activeFilters.dateFrom = document.querySelector("#filterDateFrom").value;
  activeFilters.dateTo = document.querySelector("#filterDateTo").value;
  applyFiltersToRecords();
  currentPage = 1;
  currentIndex = filteredRecords.length ? records.indexOf(filteredRecords[0]) : 0;
  renderCurrentRecord();
  showMessage(`Filter applied. ${filteredRecords.length} record(s) found.`, "info");
}

function clearRecordFilters() {
  activeFilters = { status: "all", affiliation: "", dateFrom: "", dateTo: "" };
  document.querySelector("#filterStatus").value = "all";
  document.querySelector("#filterAffiliation").value = "";
  document.querySelector("#filterDateFrom").value = "";
  document.querySelector("#filterDateTo").value = "";
  applyFiltersToRecords();
  currentPage = 1;
  currentIndex = 0;
  renderCurrentRecord();
  showMessage("Filters cleared.", "info");
}

function updateStatus() {
  const pool = filteredRecords.length ? filteredRecords : records;
  const posInPool = pool.indexOf(records[currentIndex]);
  const displayPos = posInPool >= 0 ? posInPool + 1 : currentIndex + 1;
  const total = pool.length;
  recordStatus.textContent = total ? `Record ${displayPos} of ${total}` : "No records";
}

async function handleSearch() {
  if (isNewRecord) {
    showMessage("A visitor registration is currently in progress. Please save the current record or click 'Clear Form' before searching for another inmate.", "info");
    return;
  }
  const query = searchInput.value.trim();
  if (!query) {
    showMessage("Please enter an Inmate # or name to search.");
    hideSearchResults();
    return;
  }

  showMessage(`Searching for inmate "${query}"...`, "info");

  try {
    const data = await apiFetch(`/api/inmates/search?q=${encodeURIComponent(query)}`);
    const inmates = data?.inmates || [];

    if (inmates.length === 0) {
      hideSearchResults();
      showMessage(`No inmate records found matching "${query}".`);
      return;
    }

    if (inmates.length === 1) {
      hideSearchResults();
      const inmate = inmates[0];
      currentInmateMatch = inmate;
      selectedVisitorRecord = null;
      const fullName = `${inmate.firstName || ""} ${inmate.middleName || ""} ${inmate.lastName || ""}`.replace(/\s+/g, " ").trim();
      renderRegisteredVisitorsDatagrid(inmate.inmateId, inmate.inmateNo, fullName);
      if (datagridRegisterNewBtn) datagridRegisterNewBtn.classList.remove("hidden");
      showMessage(`Found Inmate #${inmate.inmateNo} (${fullName}). Registered visitors are displayed below. Click "Register New" to pick from current visitor lists.`, "info");
    } else {
      // Multiple inmates found: show matching inmates dropdown
      showInmateSearchResults(inmates, query);
      showMessage(`Found ${inmates.length} matching inmates. Please select one to view registered visitors.`);
    }
  } catch (err) {
    console.error("Search error:", err);
    showMessage("Failed to search inmate records: " + (err.message || "Server error"), "error");
  }
}

function showInmateSearchResults(inmates, queryStr) {
  const dropdown = document.querySelector("#searchResultsDropdown");
  const list = document.querySelector("#searchResultsList");
  const countSpan = document.querySelector("#searchResultsCount");
  if (!dropdown || !list) return;

  countSpan.textContent = `${inmates.length} inmates matching "${queryStr}":`;
  list.innerHTML = "";

  inmates.forEach(inmate => {
    const item = document.createElement("div");
    item.className = "search-result-item";
    item.setAttribute("role", "option");
    item.tabIndex = 0;

    const fullName = `${inmate.firstName || ""} ${inmate.middleName || ""} ${inmate.lastName || ""}`.replace(/\s+/g, " ").trim() || "Unnamed Inmate";
    const visitorCountText = `${inmate.visitors.length} visitor(s) on file`;
    const inmateNoBadge = `Inmate #${inmate.inmateNo}`;
    const statusText = inmate.custodyStatus ? `Status: ${inmate.custodyStatus}` : "";
    const metaParts = [inmateNoBadge, visitorCountText, statusText].filter(Boolean).join(" • ");

    item.innerHTML = `
      <div class="search-result-thumb-placeholder">&#128100;</div>
      <div class="search-result-info">
        <div class="search-result-name">${escapeHtml(fullName)}</div>
        <div class="search-result-meta">${escapeHtml(metaParts)}</div>
      </div>
      <div class="search-result-arrow">&#10132;</div>
    `;

    const selectThisInmate = () => {
      if (isNewRecord) {
        showMessage("A visitor registration is currently in progress. Please save the current record or click 'Clear Form' before selecting another inmate.", "info");
        return;
      }
      hideSearchResults();
      currentInmateMatch = inmate;
      selectedVisitorRecord = null;
      renderRegisteredVisitorsDatagrid(inmate.inmateId, inmate.inmateNo, fullName);
      if (datagridRegisterNewBtn) datagridRegisterNewBtn.classList.remove("hidden");
      showMessage(`Selected Inmate #${inmate.inmateNo} (${fullName}). Registered visitors are displayed below. Click "Register New" to pick from current visitor lists.`, "info");
    };

    item.addEventListener("click", selectThisInmate);
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectThisInmate();
      }
    });

    list.appendChild(item);
  });

  dropdown.classList.remove("hidden");
}

function hideSearchResults() {
  const dropdown = document.querySelector("#searchResultsDropdown");
  if (dropdown) dropdown.classList.add("hidden");
}

function updateTabUI() {
  if (avTabRegular) {
    const isReg = currentVisitorTab === "regular";
    avTabRegular.classList.toggle("active", isReg);
    avTabRegular.setAttribute("aria-selected", isReg ? "true" : "false");
  }
  if (avTabFamily) {
    const isFam = currentVisitorTab === "family";
    avTabFamily.classList.toggle("active", isFam);
    avTabFamily.setAttribute("aria-selected", isFam ? "true" : "false");
  }
}

function renderActiveTabVisitors() {
  if (!currentInmateMatch) return;
  const list = currentVisitorTab === "family"
    ? (currentInmateMatch.familyVisitors || (currentInmateMatch.visitors ? currentInmateMatch.visitors.filter(v => v.listType === "family") : []))
    : (currentInmateMatch.regularVisitors || (currentInmateMatch.visitors ? currentInmateMatch.visitors.filter(v => v.listType !== "family") : []));

  renderAssignedVisitorsList(list, currentVisitorTab);
}

function openAssignedVisitorsModal(inmate) {
  if (!inmate) return;

  if (isNewRecord) {
    showMessage("A visitor registration is currently in progress. Please save the current record or click 'Clear Form' before opening visitor lists.", "info");
    return;
  }

  currentInmateMatch = inmate;
  selectedVisitorRecord = null;
  hideSearchResults();

  const fullName = `${inmate.firstName || ""} ${inmate.middleName || ""} ${inmate.lastName || ""}`.replace(/\s+/g, " ").trim();
  if (avInmateNo) avInmateNo.textContent = inmate.inmateNo;
  if (avInmateName) avInmateName.textContent = fullName;
  if (avInmateStatus) {
    avInmateStatus.textContent = inmate.custodyStatus || "ACTIVE";
    avInmateStatus.className = `av-status-badge ${(inmate.custodyStatus || "active").toLowerCase()}`;
  }

  const regList = inmate.regularVisitors || (inmate.visitors ? inmate.visitors.filter(v => v.listType !== "family") : []);
  const famList = inmate.familyVisitors || (inmate.visitors ? inmate.visitors.filter(v => v.listType === "family") : []);
  const regCount = regList.length;
  const famCount = famList.length;
  const totalCount = regCount + famCount;

  if (avVisitorsCount) avVisitorsCount.textContent = String(totalCount);
  if (avCountRegular) avCountRegular.textContent = String(regCount);
  if (avCountFamily) avCountFamily.textContent = String(famCount);

  // If regular has 0 but family has records, auto switch to family tab
  if (regCount === 0 && famCount > 0) {
    currentVisitorTab = "family";
  } else {
    currentVisitorTab = "regular";
  }
  updateTabUI();

  renderActiveTabVisitors();

  // Update registered visitors datagrid below the form immediately
  renderRegisteredVisitorsDatagrid(inmate.inmateId, inmate.inmateNo, fullName);

  if (avApplyBtn) avApplyBtn.disabled = true;

  if (assignedVisitorsModal) {
    if (typeof assignedVisitorsModal.showModal === "function") {
      assignedVisitorsModal.showModal();
    } else {
      assignedVisitorsModal.classList.remove("hidden");
    }
  }
}

function isVisitorAlreadyRegistered(visitor, inmate) {
  if (!visitor || !inmate) return false;
  const inmateIdStr = String(inmate.inmateId || "").trim();
  const inmateNoStr = String(inmate.inmateNo || "").trim();

  return records.some(r => {
    if (!r) return false;
    // Exclude completely blank placeholder records
    if (!r.firstName && !r.lastName && !r.visitorNumber && !r.vVisitorsId) return false;

    // Check if this record belongs to the inmate
    const belongsToInmate =
      (inmateIdStr && String(r.inmateId || "").trim() === inmateIdStr) ||
      (inmateNoStr && (
        String(r.linkedInmateNo || "").trim() === inmateNoStr ||
        String(r.inmateId || "").trim() === inmateNoStr ||
        (r.comment && r.comment.includes(`#${inmateNoStr}`))
      ));

    if (!belongsToInmate) return false;

    // Direct ID match if vVisitorsId is tracked
    if (visitor.visitorId && r.vVisitorsId && Number(r.vVisitorsId) === Number(visitor.visitorId)) {
      return true;
    }

    // Fallback: match by first name & last name (case-insensitive)
    const vFirst = (visitor.firstName || "").trim().toLowerCase();
    const vLast = (visitor.lastName || "").trim().toLowerCase();
    const rFirst = (r.firstName || "").trim().toLowerCase();
    const rLast = (r.lastName || "").trim().toLowerCase();

    return Boolean(vFirst && vLast && rFirst && rLast && vFirst === rFirst && vLast === rLast);
  });
}

function formatGender(gender) {
  if (!gender) return "";
  const g = String(gender).trim().toUpperCase();
  if (g === "M") return "Male";
  if (g === "F") return "Female";
  return gender;
}

function renderAssignedVisitorsList(visitors, tabType) {
  if (!assignedVisitorsList) return;
  assignedVisitorsList.innerHTML = "";

  const listType = tabType || currentVisitorTab || "regular";
  const listTitle = listType === "family" ? "Family Day" : "Regular";

  if (!visitors || visitors.length === 0) {
    assignedVisitorsList.innerHTML = `
      <div class="av-empty-notice">
        <div class="av-empty-icon">&#128203;</div>
        <p><strong>No ${listTitle} visitors currently on file</strong> for Inmate #${escapeHtml(currentInmateMatch?.inmateNo || "")} in <code>visitor_list_manager</code>.</p>
        <p class="av-empty-sub">You can check the other tab or click <strong>"Register New Visitor for this Inmate"</strong> below to create a fresh demographic record.</p>
      </div>
    `;
    return;
  }

  visitors.forEach((v, index) => {
    const isAlreadyRegistered = isVisitorAlreadyRegistered(v, currentInmateMatch);
    const card = document.createElement("div");
    card.className = "av-visitor-card" + (isAlreadyRegistered ? " already-assigned-card" : "");
    card.setAttribute("role", "option");
    card.tabIndex = isAlreadyRegistered ? -1 : 0;
    card.dataset.index = index;
    if (isAlreadyRegistered) {
      card.setAttribute("aria-disabled", "true");
    }

    const fullName = `${v.firstName || ""} ${v.middleName || ""} ${v.lastName || ""}`.replace(/\s+/g, " ").trim() || "Unnamed Visitor";
    const isBanned = v.isBanned;
    const isFamily = v.listType === "family" || listType === "family";
    const originBadge = isFamily
      ? `<span class="badge badge-tab-family">&#128106; Family Day</span>`
      : `<span class="badge badge-tab-regular">Regular</span>`;
    const regBadge = isAlreadyRegistered
      ? `<span class="badge badge-already-registered">&#10003; Already Registered</span>`
      : "";

    card.innerHTML = `
      <div class="av-card-select">
        <input type="radio" name="avVisitorRadio" class="av-radio" id="avRadio_${index}" ${isAlreadyRegistered ? "disabled" : ""}>
      </div>
      <div class="av-card-thumb">
        ${v.photo ? `<img src="${v.photo}" alt="${escapeHtml(fullName)}">` : `<div class="av-thumb-placeholder">&#128100;</div>`}
      </div>
      <div class="av-card-main">
        <div class="av-card-top-row">
          <span class="av-card-name">${escapeHtml(fullName)}</span>
          ${regBadge}
          ${originBadge}
          <span class="badge badge-rel">${escapeHtml(v.relationshipName || "VISITOR")}</span>
          ${isBanned ? `<span class="badge badge-banned">&#9888; Banned: ${escapeHtml(v.bannedReason || "Restricted")}</span>` : ""}
        </div>
        <div class="av-card-meta">
          ${v.dob ? `<span>DOB: <strong>${escapeHtml(v.dob)}</strong></span>` : `<span class="av-missing">No DOB</span>`}
          ${v.phone ? `<span>Phone: <strong>${escapeHtml(v.phone)}</strong></span>` : `<span class="av-missing">No phone</span>`}
          ${v.nationalId ? `<span>ID: <strong>${escapeHtml(v.nationalId)}</strong></span>` : `<span class="av-missing">No national ID</span>`}
          ${v.gender ? `<span>Gender: <strong>${escapeHtml(formatGender(v.gender))}</strong></span>` : ""}
        </div>
      </div>
    `;

    const selectThisVisitor = () => {
      if (isAlreadyRegistered) {
        showMessage(`"${fullName}" has already been registered for Inmate #${currentInmateMatch?.inmateNo || ""}. Use "Load Record" in the grid below.`, "info");
        return;
      }

      selectedVisitorRecord = v;
      const radio = card.querySelector(".av-radio");
      if (radio) radio.checked = true;

      document.querySelectorAll(".av-visitor-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");

      // Auto check name fields and relationship notes; exclude other fields
      if (fieldCheckFirstName) fieldCheckFirstName.checked = true;
      if (fieldCheckMiddleName) fieldCheckMiddleName.checked = true;
      if (fieldCheckLastName) fieldCheckLastName.checked = true;
      if (fieldCheckNotes) fieldCheckNotes.checked = true;
      if (fieldCheckDob) fieldCheckDob.checked = false;
      if (fieldCheckPhone) fieldCheckPhone.checked = false;
      if (fieldCheckNationalId) fieldCheckNationalId.checked = false;
      if (fieldCheckPhoto) fieldCheckPhoto.checked = false;

      if (avApplyBtn) avApplyBtn.disabled = false;
    };

    card.addEventListener("click", selectThisVisitor);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectThisVisitor();
      }
    });

    assignedVisitorsList.appendChild(card);
  });
}

function applySelectedFieldsToForm() {
  if (!currentInmateMatch) return;

  if (isNewRecord) {
    showMessage("A visitor registration is currently in progress. Please save the current record or click 'Clear Form' first.", "info");
    return;
  }

  if (selectedVisitorRecord && isVisitorAlreadyRegistered(selectedVisitorRecord, currentInmateMatch)) {
    const fullName = `${selectedVisitorRecord.firstName || ""} ${selectedVisitorRecord.lastName || ""}`.trim();
    showMessage(`"${fullName}" is already registered for this inmate and cannot be added as a duplicate.`, "error");
    return;
  }

  isNewRecord = true;
  isEditingRecord = false;
  updateRegistrationLockState();

  const currentRegDate = new Date().toISOString().slice(0, 10);

  // Clear existing form fields first
  Object.values(fields).forEach(f => {
    if (f.type === "radio") f.checked = false;
    else if (f.type !== "hidden") f.value = "";
  });
  if (fields.age) fields.age.value = "";
  if (visitorPhone) visitorPhone.value = "";
  if (visitorIdInput) visitorIdInput.value = "";
  if (visitNotes) visitNotes.value = "";
  mainPreview.src = "";
  mainPreviewText.textContent = "No photo";

  // Set link fields
  fields.inmateId.value = String(currentInmateMatch.inmateId || "");
  if (vVisitorsId) vVisitorsId.value = selectedVisitorRecord ? String(selectedVisitorRecord.visitorId || "") : "";
  if (linkedInmateNo) linkedInmateNo.value = String(currentInmateMatch.inmateNo || "");

  const inmateFullName = `${currentInmateMatch.firstName || ""} ${currentInmateMatch.lastName || ""}`.trim();

  // Populate checked fields from selected visitor
  if (selectedVisitorRecord) {
    if (fieldCheckFirstName && fieldCheckFirstName.checked) {
      fields.firstName.value = selectedVisitorRecord.firstName || "";
    }
    if (fieldCheckMiddleName && fieldCheckMiddleName.checked) {
      fields.middleName.value = selectedVisitorRecord.middleName || "";
    }
    if (fieldCheckLastName && fieldCheckLastName.checked) {
      fields.lastName.value = selectedVisitorRecord.lastName || "";
    }
    if (fieldCheckDob && fieldCheckDob.checked && selectedVisitorRecord.dob) {
      fields.dob.value = selectedVisitorRecord.dob;
      fields.age.value = calculateAge(selectedVisitorRecord.dob);
    }
    if (fieldCheckPhone && fieldCheckPhone.checked && visitorPhone) {
      visitorPhone.value = selectedVisitorRecord.phone || "";
    }
    if (fieldCheckNationalId && fieldCheckNationalId.checked && visitorIdInput) {
      visitorIdInput.value = selectedVisitorRecord.nationalId || "";
    }
    if (fieldCheckPhoto && fieldCheckPhoto.checked && selectedVisitorRecord.photo) {
      mainPreview.src = selectedVisitorRecord.photo;
      mainPreviewText.textContent = "";
    }
    if (fieldCheckNotes && fieldCheckNotes.checked && visitNotes) {
      const isFam = selectedVisitorRecord.listType === "family" || currentVisitorTab === "family";
      const listLabel = isFam ? "Family Day Visitor" : "Visitor";
      const rel = selectedVisitorRecord.relationshipName ? ` (${selectedVisitorRecord.relationshipName})` : "";
      visitNotes.value = `${listLabel} for Inmate #${currentInmateMatch.inmateNo} - ${inmateFullName}${rel}`;
    }
  } else {
    // New visitor for inmate without a pre-existing visitor record
    if (visitNotes) {
      const isFam = currentVisitorTab === "family";
      const listLabel = isFam ? "Family Day Visitor" : "Visitor";
      visitNotes.value = `${listLabel} for Inmate #${currentInmateMatch.inmateNo} - ${inmateFullName}`;
    }
  }

  // Update Inmate Link Banner
  updateInmateLinkBanner(currentInmateMatch.inmateNo, inmateFullName);
  renderRegisteredVisitorsDatagrid(currentInmateMatch.inmateId, currentInmateMatch.inmateNo, inmateFullName);

  // Update Visitor ID & Reg Date displays
  const visIdDisplay = document.querySelector("#visitorIdDisplay");
  if (visIdDisplay) visIdDisplay.textContent = selectedVisitorRecord?.visitorId ? `#${selectedVisitorRecord.visitorId}` : "—";
  const regDateElem = document.querySelector("#registrationDate");
  if (regDateElem) regDateElem.value = formatMediumDate(currentRegDate) || currentRegDate;

  // Unlock all form fields for manual entry
  Object.values(fields).forEach(f => { f.disabled = false; });
  if (fields.age) fields.age.disabled = true;
  if (visitorPhone) visitorPhone.disabled = false;
  if (visitorIdInput) visitorIdInput.disabled = false;
  if (visitNotes) visitNotes.disabled = false;
  document.querySelectorAll('input[type="file"]').forEach(i => { i.disabled = false; });

  // Update buttons state
  const saveButton = document.querySelector("#saveRecord");
  const newButton = document.querySelector("#newRecord");
  const updateButton = document.querySelector("#updateRecord");
  const editButton = document.querySelector("#editRecord");
  const deleteButton = document.querySelector("#deleteRecord");
  if (saveButton) saveButton.classList.remove("hidden");
  if (newButton) newButton.classList.add("hidden");
  if (updateButton) updateButton.classList.add("hidden");
  if (editButton) editButton.classList.add("hidden");
  if (deleteButton) deleteButton.classList.add("hidden");
  if (clearFormBtn) clearFormBtn.classList.remove("hidden");
  if (cancelEditBtn) cancelEditBtn.classList.add("hidden");

  // Close modal
  if (assignedVisitorsModal) {
    if (typeof assignedVisitorsModal.close === "function") assignedVisitorsModal.close();
    else assignedVisitorsModal.classList.add("hidden");
  }

  // Focus address or first empty required field
  if (!fields.firstName.value) fields.firstName.focus();
  else if (!fields.lastName.value) fields.lastName.focus();
  else fields.address.focus();

  const name = selectedVisitorRecord ? `${selectedVisitorRecord.firstName} ${selectedVisitorRecord.lastName}`.trim() : "new visitor";
  showMessage(`Demographics loaded for "${name}". Please complete remaining fields (Address, Photo, Remarks) and click Save Record.`, "success");
}

function updateInmateLinkBanner(inmateNo, inmateName) {
  if (!inmateLinkBanner) return;
  if (inmateNo) {
    if (linkInmateNoDisplay) linkInmateNoDisplay.textContent = inmateNo;
    if (linkInmateNameDisplay) linkInmateNameDisplay.textContent = inmateName || "Inmate";
    inmateLinkBanner.classList.remove("hidden");
  } else {
    inmateLinkBanner.classList.add("hidden");
  }
}

// Modal control listeners
if (avTabRegular) {
  avTabRegular.addEventListener("click", () => {
    if (currentVisitorTab === "regular") return;
    currentVisitorTab = "regular";
    selectedVisitorRecord = null;
    if (avApplyBtn) avApplyBtn.disabled = true;
    updateTabUI();
    renderActiveTabVisitors();
  });
}

if (avTabFamily) {
  avTabFamily.addEventListener("click", () => {
    if (currentVisitorTab === "family") return;
    currentVisitorTab = "family";
    selectedVisitorRecord = null;
    if (avApplyBtn) avApplyBtn.disabled = true;
    updateTabUI();
    renderActiveTabVisitors();
  });
}

if (avSelectAllFieldsBtn) {
  avSelectAllFieldsBtn.addEventListener("click", () => {
    [fieldCheckFirstName, fieldCheckMiddleName, fieldCheckLastName, fieldCheckDob, fieldCheckPhone, fieldCheckNationalId, fieldCheckPhoto, fieldCheckNotes].forEach(cb => {
      if (cb) cb.checked = true;
    });
  });
}

if (avDeselectAllFieldsBtn) {
  avDeselectAllFieldsBtn.addEventListener("click", () => {
    [fieldCheckFirstName, fieldCheckMiddleName, fieldCheckLastName, fieldCheckDob, fieldCheckPhone, fieldCheckNationalId, fieldCheckPhoto, fieldCheckNotes].forEach(cb => {
      if (cb) cb.checked = false;
    });
  });
}

if (avNewVisitorForInmateBtn) {
  avNewVisitorForInmateBtn.addEventListener("click", () => {
    selectedVisitorRecord = null;
    applySelectedFieldsToForm();
  });
}

if (avApplyBtn) {
  avApplyBtn.addEventListener("click", applySelectedFieldsToForm);
}

if (closeAssignedVisitorsModal) {
  closeAssignedVisitorsModal.addEventListener("click", () => assignedVisitorsModal.close());
}

if (avCancelBtn) {
  avCancelBtn.addEventListener("click", () => assignedVisitorsModal.close());
}

if (unlinkInmateBtn) {
  unlinkInmateBtn.addEventListener("click", () => {
    fields.inmateId.value = "";
    if (vVisitorsId) vVisitorsId.value = "";
    if (linkedInmateNo) linkedInmateNo.value = "";
    currentInmateMatch = null;
    selectedVisitorRecord = null;
    updateInmateLinkBanner("", "");
    showMessage("Inmate link cleared for this visitor record.", "info");
  });
}


// ── DATA CHANGE HANDLERS ─────────────────────────────────────────────────────
function validateRecord(record) {
  if (!record.firstName || !record.lastName) {
    showMessage("Please enter the visitor's first name and last name.");
    return false;
  }
  return true;
}

async function silentRefreshAfterSave(savedRecord) {
  // 1. Ensure records array is refreshed from backend
  await loadRecordsFromBackend();

  // 2. Identify target inmate context
  const targetInmateId = (currentInmateMatch && currentInmateMatch.inmateId) ? currentInmateMatch.inmateId : (savedRecord?.inmateId || "");
  const targetInmateNo = (currentInmateMatch && currentInmateMatch.inmateNo) ? currentInmateMatch.inmateNo : (savedRecord?.linkedInmateNo || "");
  let targetInmateName = "";
  if (currentInmateMatch) {
    targetInmateName = `${currentInmateMatch.firstName || ""} ${currentInmateMatch.middleName || ""} ${currentInmateMatch.lastName || ""}`.replace(/\s+/g, " ").trim();
  } else if (savedRecord?.personName) {
    targetInmateName = savedRecord.personName;
  }

  // 3. Reset form fields so form is cleanly cleared for subsequent entries
  Object.entries(fields).forEach(([key, field]) => {
    if (field.type === "radio" || field.type === "checkbox") {
      field.checked = false;
    } else if (key !== "inmateId") {
      field.value = "";
    }
  });
  if (fields.inmateId) fields.inmateId.value = String(targetInmateId || "");
  if (fields.age) fields.age.value = "";
  if (visitorPhone) visitorPhone.value = "";
  if (visitorIdInput) visitorIdInput.value = "";
  if (visitNotes) visitNotes.value = "";
  if (vVisitorsId) vVisitorsId.value = "";
  if (linkedInmateNo) linkedInmateNo.value = String(targetInmateNo || "");

  // Reset displays
  const visIdDisplay = document.querySelector("#visitorIdDisplay");
  if (visIdDisplay) visIdDisplay.textContent = "—";
  const regDateElem = document.querySelector("#registrationDate");
  if (regDateElem) regDateElem.value = "";

  // Reset photo previews
  mainPreview.src = "";
  mainPreviewText.textContent = "No photo";
  const photoFrame = document.querySelector(".photo-frame");
  if (photoFrame) photoFrame.classList.add("has-no-photos");

  const hoverFront = document.querySelector("#hoverFrontPreview");
  const hoverRight = document.querySelector("#hoverRightPreview");
  const hoverLeft = document.querySelector("#hoverLeftPreview");
  if (hoverFront && hoverRight && hoverLeft) {
    hoverFront.removeAttribute("src");
    hoverRight.removeAttribute("src");
    hoverLeft.removeAttribute("src");
    toggleEmptyHoverIndicator(hoverFront, "No Front Photo");
    toggleEmptyHoverIndicator(hoverRight, "No Right Photo");
    toggleEmptyHoverIndicator(hoverLeft, "No Left Photo");
  }

  // Clear timeline
  renderMainHistoryTimeline([]);

  // 4. Preserve Inmate Link Banner if inmate is active
  if (targetInmateNo) {
    updateInmateLinkBanner(targetInmateNo, targetInmateName);
  } else {
    updateInmateLinkBanner("", "");
  }

  // 5. Release registration & editing lock
  isNewRecord = false;
  isEditingRecord = false;
  selectedVisitorRecord = null;
  pendingStatusEvent = null;
  updateRegistrationLockState();

  // 6. Reset action buttons
  const saveButton = document.querySelector("#saveRecord");
  const updateButton = document.querySelector("#updateRecord");
  const newButton = document.querySelector("#newRecord");
  const editButton = document.querySelector("#editRecord");
  const deleteButton = document.querySelector("#deleteRecord");
  const cancelButton = document.querySelector("#cancelRecord");
  const intelButton = document.querySelector("#openIntelModal");
  const generatePdfButton = document.querySelector("#generatePdf");
  const filterBar = document.querySelector("#filterBar");

  if (saveButton) saveButton.classList.add("hidden");
  if (updateButton) updateButton.classList.add("hidden");
  if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
  if (clearFormBtn) clearFormBtn.classList.remove("hidden");
  if (newButton) newButton.classList.remove("hidden");
  if (editButton) editButton.classList.add("hidden");
  if (deleteButton) deleteButton.classList.add("hidden");
  if (generatePdfButton) generatePdfButton.classList.add("hidden");
  if (cancelButton) cancelButton.classList.add("hidden");
  if (intelButton) intelButton.classList.add("hidden");
  if (filterBar) filterBar.classList.remove("hidden");

  // Re-apply access mode
  applyAccessMode();

  // 7. Update status count
  if (recordStatus) {
    const total = records.filter(r => r && (r.firstName || r.lastName || r.vVisitorsId || r.visitorNumber)).length;
    recordStatus.textContent = total ? `${total} visitor record(s) on file` : "Ready";
  }

  // 8. Re-render Registered Visitors Datagrid for this inmate
  renderRegisteredVisitorsDatagrid(targetInmateId, targetInmateNo, targetInmateName);
}

async function saveNewRecord() {
  if (!canEdit()) {
    showMessage("You do not have permission to save this record.");
    return;
  }

  const record = getFormRecord();
  if (!validateRecord(record)) return;

  // Duplicate registration check: ensure this visitor has not already been registered for the inmate
  const inmateIdVal = record.inmateId ? String(record.inmateId).trim() : "";
  const linkedNoVal = record.linkedInmateNo ? String(record.linkedInmateNo).trim() : "";
  if (inmateIdVal || linkedNoVal) {
    const isDuplicateForInmate = records.some((r, idx) => {
      if (idx === currentIndex && !isNewRecord) return false;
      if (!r.firstName && !r.lastName && !r.visitorNumber && !r.vVisitorsId) return false;

      const sameInmate =
        (inmateIdVal && String(r.inmateId || "").trim() === inmateIdVal) ||
        (linkedNoVal && (
          String(r.linkedInmateNo || "").trim() === linkedNoVal ||
          String(r.inmateId || "").trim() === linkedNoVal ||
          (r.comment && r.comment.includes(`#${linkedNoVal}`))
        ));
      if (!sameInmate) return false;

      if (record.vVisitorsId && r.vVisitorsId && Number(record.vVisitorsId) === Number(r.vVisitorsId)) {
        return true;
      }
      const rFirst = (r.firstName || "").trim().toLowerCase();
      const rLast = (r.lastName || "").trim().toLowerCase();
      const recFirst = (record.firstName || "").trim().toLowerCase();
      const recLast = (record.lastName || "").trim().toLowerCase();
      return Boolean(rFirst && rLast && recFirst && recLast && rFirst === recFirst && rLast === recLast);
    });

    if (isDuplicateForInmate) {
      const vName = [record.firstName, record.lastName].filter(Boolean).join(" ");
      showMessage(`Visitor "${vName}" has already been registered for this inmate. Duplicate registration is not permitted.`, "error");
      return;
    }
  }

  const name = [record.firstName, record.lastName].filter(Boolean).join(" ") || "this visitor";
  const visitorIdLabel = record.vVisitorsId ? `#${record.vVisitorsId}` : "";
  const confirmed = await showSaveConfirm(name, visitorIdLabel);
  if (!confirmed) return;

  applyStatusHistory(record);

  const isBlankSlot = records.length === 1 && !records[0].inmateId && !records[0].firstName;
  const currentIsBlank = !records[currentIndex]?.inmateId && !records[currentIndex]?.firstName;

  if (isBlankSlot || currentIsBlank) {
    records[currentIndex] = record;
  } else {
    records.push(record);
    currentIndex = records.length - 1;
  }

  isNewRecord = false;
  isEditingRecord = false;
  updateRegistrationLockState();
  const descriptor = record.vVisitorsId
    ? `Visitor #${record.vVisitorsId} - ${record.firstName} ${record.lastName}`
    : `${record.firstName} ${record.lastName}`;
  await persistRecords("create_record", descriptor);
  await silentRefreshAfterSave(record);
  showMessage(`Visitor record for "${name}" saved successfully. Registered visitors list updated.`, "success");
}

async function updateCurrentRecord() {
  if (!canEdit()) {
    showMessage("You do not have permission to update this record.");
    return;
  }

  const record = getFormRecord();
  if (!validateRecord(record)) return;

  const name = [record.firstName, record.lastName].filter(Boolean).join(" ") || "this visitor";
  const visitorIdLabel = record.vVisitorsId ? `#${record.vVisitorsId}` : "";
  const confirmed = await showUpdateConfirm(name, visitorIdLabel);
  if (!confirmed) return;

  applyStatusHistory(record);

  records[currentIndex] = record;
  const descriptor = record.vVisitorsId
    ? `Visitor #${record.vVisitorsId} - ${record.firstName} ${record.lastName}`
    : `${record.firstName} ${record.lastName}`;
  await persistRecords("update_records", descriptor);
  isEditingRecord = false;
  isNewRecord = false;
  await silentRefreshAfterSave(record);
  showMessage(`Visitor record for "${name}" updated successfully. Registered visitors list updated.`, "success");
}

async function deleteRecord() {
  if (!canManageUsers()) {
    showMessage("Only a Super Admin can delete a record.");
    return;
  }

  if (records.length === 0) {
    showMessage("There is no record to delete.");
    return;
  }

  const record = records[currentIndex];
  const name = [record.firstName, record.lastName].filter(Boolean).join(" ") || "Unknown";
  const id = record.vVisitorsId ? `#${record.vVisitorsId}` : (record.inmateId || "N/A");

  // Preserve active inmate context before delete
  const targetInmateId = currentInmateMatch?.inmateId || record?.inmateId || "";
  const targetInmateNo = currentInmateMatch?.inmateNo || record?.linkedInmateNo || "";
  let targetInmateName = "";
  if (currentInmateMatch) {
    targetInmateName = `${currentInmateMatch.firstName || ""} ${currentInmateMatch.lastName || ""}`.trim();
  } else if (record?.personName) {
    targetInmateName = record.personName;
  }

  const confirmed = await showDeleteConfirm(name, id);
  if (!confirmed) return;

  try {
    const result = await apiFetch("/api/records", {
      method: "DELETE",
      body: { index: currentIndex }
    });

    records = result.records;

    if (records.length === 0) {
      records = [emptyRecord()];
      currentIndex = 0;
    } else {
      currentIndex = Math.min(currentIndex, records.length - 1);
    }

    isNewRecord = false;
    isEditingRecord = false;
    applyFiltersToRecords();

    // Refresh datagrid for active inmate
    if (targetInmateId || targetInmateNo) {
      renderRegisteredVisitorsDatagrid(targetInmateId, targetInmateNo, targetInmateName);
      updateInmateLinkBanner(targetInmateNo, targetInmateName);
    } else {
      renderRegisteredVisitorsDatagrid("", "", "");
      updateInmateLinkBanner("", "");
    }

    renderCurrentRecord();
    showMessage("Record deleted successfully.", "success");
  } catch (error) {
    showMessage(error.message || "Failed to finalize database purge array mapping.", "error");
  }
}

function showDeleteConfirm(name, id) {
  return new Promise(resolve => {
    const dialog = document.getElementById("deleteConfirmDialog");
    const msg = document.getElementById("deleteConfirmMessage");
    const confirmBtn = document.getElementById("deleteConfirmBtn");
    const cancelBtn = document.getElementById("deleteCancelBtn");

    msg.textContent = `You are about to delete the record for ${name} (ID: ${id}).`;

    const cleanup = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      dialog.removeEventListener("cancel", onCancel);
      dialog.close();
    };

    const onConfirm = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    dialog.addEventListener("cancel", onCancel);

    dialog.showModal();
  });
}

function showSaveConfirm(name, visitorId) {
  return new Promise(resolve => {
    const dialog = document.getElementById("saveConfirmDialog");
    const msg = document.getElementById("saveConfirmMessage");
    const confirmBtn = document.getElementById("saveConfirmBtn");
    const cancelBtn = document.getElementById("saveCancelBtn");

    msg.textContent = visitorId
      ? `You are about to save a new record for ${name} (Visitor ID: ${visitorId}).`
      : `You are about to save a new record for ${name}.`;

    const cleanup = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      dialog.removeEventListener("cancel", onCancel);
      dialog.close();
    };

    const onConfirm = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    dialog.addEventListener("cancel", onCancel);

    dialog.showModal();
  });
}

function showUpdateConfirm(name, id) {
  return new Promise(resolve => {
    const dialog = document.getElementById("updateConfirmDialog");
    const msg = document.getElementById("updateConfirmMessage");
    const confirmBtn = document.getElementById("updateConfirmBtn");
    const cancelBtn = document.getElementById("updateCancelBtn");

    msg.textContent = id
      ? `You are about to update the record for ${name} (Visitor ID: ${id}).`
      : `You are about to update the record for ${name}.`;

    const cleanup = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      dialog.removeEventListener("cancel", onCancel);
      dialog.close();
    };

    const onConfirm = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    dialog.addEventListener("cancel", onCancel);

    dialog.showModal();
  });
}

async function createNewRecord() {
  if (!canEdit()) {
    showMessage("You do not have permission to add a new record.");
    return;
  }

  if (isNewRecord) {
    showMessage("A visitor registration is already in progress. Please save the current record or click 'Clear Form' first.", "info");
    return;
  }

  const newRec = emptyRecord();
  newRec.visitorNumber = "";
  newRec.vVisitorsId = null;
  newRec.registrationDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  records.push(newRec);
  currentIndex = records.length - 1;
  isNewRecord = true;
  isEditingRecord = false;
  updateRegistrationLockState();
  renderCurrentRecord();
  showMessage("A new blank record is ready. Fill in the details and save.");
  fields.firstName.focus();
}

function cancelNewRecord() {
  if (!isNewRecord) return;

  records.splice(currentIndex, 1);

  if (currentIndex > 0) {
    currentIndex--;
  } else if (records.length === 0) {
    records.push(emptyRecord());
    currentIndex = 0;
  }

  isNewRecord = false;
  pendingStatusEvent = null;
  renderCurrentRecord();
  showMessage("Action cancelled.", "info");
}

function showPreviousRecord() {
  const pool = filteredRecords.length ? filteredRecords : records;
  if (pool.length < 2) return;

  let pos = pool.indexOf(records[currentIndex]);
  pos = (pos - 1 + pool.length) % pool.length;
  currentIndex = records.indexOf(pool[pos]);
  isNewRecord = false;
  renderCurrentRecord();
}

function showNextRecord() {
  const pool = filteredRecords.length ? filteredRecords : records;
  if (pool.length < 2) return;

  let pos = pool.indexOf(records[currentIndex]);
  pos = (pos + 1) % pool.length;
  currentIndex = records.indexOf(pool[pos]);
  isNewRecord = false;
  renderCurrentRecord();
}

// ── INTEL DIAGNOSTIC IMAGE MANAGEMENT & POPUPS ───────────────────────────────
function openIntelModal() {
  const record = records[currentIndex] || emptyRecord();
  const images = normalizeImages(record.images);

  frontFacePreview.src = images.frontFace || "";
  rightFacePreview.src = images.rightFace || "";
  leftFacePreview.src = images.leftFace || "";

  toggleImageTextLabel(frontFacePreview, "No Facial view photo");
  toggleImageTextLabel(rightFacePreview, "No Right Side photo");
  toggleImageTextLabel(leftFacePreview, "No Left Side photo");

  renderTattoos(images.tattoos);
  intelDialog.showModal();
}

function toggleImageTextLabel(imgElement, text) {
  const span = imgElement.nextElementSibling;
  if (imgElement.getAttribute("src")) {
    span.textContent = "";
  } else {
    span.textContent = text;
  }
}

async function persistCurrentIntelState({ silent = false, closeAfterSave = false } = {}) {
  if (!canEdit()) return false;

  const record = records[currentIndex];
  if (!record) return false;

  record.images = {
    frontFace: frontFacePreview.src || "",
    rightFace: rightFacePreview.src || "",
    leftFace: leftFacePreview.src || "",
    tattoos: Array.isArray(record.images?.tattoos) ? record.images.tattoos : []
  };

  await persistRecords("update_images", `ID ${record.inmateId} - Mugshots and tattoo libraries transformed.`);
  renderCurrentRecord();

  if (closeAfterSave) {
    intelDialog.close();
  }

  if (!silent) {
    showMessage("Photos and images saved successfully.", "success");
  }

  return true;
}

async function saveIntelDetails() {
  await persistCurrentIntelState({ closeAfterSave: true });
}

async function setImage(event, key) {
  const file = event.target.files[0];
  if (!file) return;

  const record = records[currentIndex];
  if (!record) return;
  if (!record.images) record.images = normalizeImages(null);

  const reader = new FileReader();
  reader.onload = async function (e) {
    if (key === "frontFace") {
      frontFacePreview.src = e.target.result;
      toggleImageTextLabel(frontFacePreview, "");
      record.images.frontFace = e.target.result;
      // Also update the main visitor photo preview immediately
      mainPreview.src = e.target.result;
      mainPreviewText.textContent = "";
    } else if (key === "rightFace") {
      rightFacePreview.src = e.target.result;
      toggleImageTextLabel(rightFacePreview, "");
      record.images.rightFace = e.target.result;
    } else if (key === "leftFace") {
      leftFacePreview.src = e.target.result;
      toggleImageTextLabel(leftFacePreview, "");
      record.images.leftFace = e.target.result;
    }

    await persistCurrentIntelState({ silent: true });
    event.target.value = "";
  };
  reader.readAsDataURL(file);
}

async function removeFaceImage(key) {
  if (!canEdit()) return;

  const record = records[currentIndex];
  if (!record) return;
  if (!record.images) record.images = normalizeImages(null);

  if (key === "frontFace") {
    frontFacePreview.removeAttribute("src");
    toggleImageTextLabel(frontFacePreview, "No Facial view photo");
    record.images.frontFace = "";
  } else if (key === "rightFace") {
    rightFacePreview.removeAttribute("src");
    toggleImageTextLabel(rightFacePreview, "No Right Side photo");
    record.images.rightFace = "";
  } else if (key === "leftFace") {
    leftFacePreview.removeAttribute("src");
    toggleImageTextLabel(leftFacePreview, "No Left Side photo");
    record.images.leftFace = "";
  }

  await persistCurrentIntelState({ silent: true });
}

async function addTattooImages(event) {
  if (!canEdit()) return;
  const files = Array.from(event.target.files);
  if (!files.length) return;

  const record = records[currentIndex];
  if (!record) return;
  if (!record.images) record.images = normalizeImages(null);
  if (!record.images.tattoos) record.images.tattoos = [];

  let processedCount = 0;

  for (const file of files) {
    const reader = new FileReader();
    await new Promise((resolve) => {
      reader.onload = async function (e) {
        openTattooDescModal(e.target.result, file.name, async (description) => {
          record.images.tattoos.push({
            src: e.target.result,
            name: file.name,
            description: description || "No descriptive indexing tags added."
          });

          processedCount++;
          if (processedCount === files.length) {
            renderTattoos(record.images.tattoos);
            await persistCurrentIntelState({ silent: true });
            event.target.value = "";
          }
          resolve();
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

function openTattooDescModal(src, filename, callback) {
  const descModal = document.getElementById("tattooDescModal");
  const preview = document.getElementById("tattooDescPreview");
  const nameLabel = document.getElementById("tattooDescFileName");
  const input = document.getElementById("tattooDescInput");
  const saveBtn = document.getElementById("tattooDescSave");
  const cancelBtn = document.getElementById("tattooDescCancel");

  preview.src = src;
  nameLabel.textContent = filename;
  input.value = "";

  const onSave = () => {
    cleanup();
    callback(input.value.trim());
  };

  const onCancel = () => {
    cleanup();
  };

  const cleanup = () => {
    saveBtn.removeEventListener("click", onSave);
    cancelBtn.removeEventListener("click", onCancel);
    descModal.close();
  };

  saveBtn.addEventListener("click", onSave);
  cancelBtn.addEventListener("click", onCancel);
  descModal.showModal();
}

function renderTattoos(tattoos) {
  tattooList.innerHTML = "";
  if (!tattoos || !tattoos.length) return;

  tattoos.forEach((tat, index) => {
    const card = document.createElement("div");
    card.className = "tattoo-card";
    card.style.cssText = "position:relative; border:1px solid var(--border-color); padding:4px; border-radius:4px; background:var(--bg-main); text-align:center; overflow:hidden;";

    card.innerHTML = `
      <img src="${tat.src}" alt="Tattoo file" style="width:100%; height:80px; object-fit:cover; border-radius:2px; cursor:pointer;">
      <div class="tattoo-desc" style="font-size:13px; font-weight:600; color:#111111; background:#ffffff; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; margin-top:4px; padding:3px 4px; border-radius:2px;">${escapeHtml(tat.description)}</div>
      <button type="button" class="danger-button" style="position:absolute; top:2px; right:2px; padding:2px 6px; font-size:9px; line-height:1;" ${canEdit() ? "" : "disabled"}>&times;</button>
    `;

    card.querySelector("img").addEventListener("click", () => openTattooModal(tat));
    card.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!canEdit()) return;
      records[currentIndex].images.tattoos.splice(index, 1);
      renderTattoos(records[currentIndex].images.tattoos);
    });

    tattooList.appendChild(card);
  });
}

function openTattooModal(tat) {
  const modal = document.getElementById("tattooModal");
  const img = document.getElementById("tattooModalImg");
  const desc = document.getElementById("tattooModalDesc");

  img.src = tat.src;
  desc.textContent = tat.description || "No classification annotations provided.";
  currentZoomLevel = 1;
  resetTattooZoom();

  modal.showModal();
}

function closeTattooModal() {
  document.getElementById("tattooModal").close();
}

function zoomTattoo(direction) {
  const img = document.getElementById("tattooModalImg");
  img.style.transition = "transform 0.15s ease";
  if (direction === "in" && currentZoomLevel < MAX_ZOOM) {
    currentZoomLevel += ZOOM_STEP;
  } else if (direction === "out" && currentZoomLevel > MIN_ZOOM) {
    currentZoomLevel -= ZOOM_STEP;
  }
  updateTattooTransform();
}

function resetTattooZoom() {
  currentZoomLevel = 1;
  panX = 0;
  panY = 0;
  const img = document.getElementById("tattooModalImg");
  img.style.transition = "transform 0.15s ease";
  updateTattooTransform();
}

function updateTattooTransform() {
  const img = document.getElementById("tattooModalImg");
  if (img) {
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoomLevel})`;
  }
}

// ── SYSTEM AUDIT LOG MODULES ──────────────────────────────────────────────────
async function openAuditLog() {
  if (!canManageUsers()) return;
  document.getElementById("auditFilterUser").value = "";
  document.getElementById("auditFilterAction").value = "";
  await renderAuditList();
  document.querySelector("#auditDialog").showModal();
}

async function renderAuditList() {
  const listContainer = document.getElementById("auditList");
  listContainer.innerHTML = "<p>Querying audit records...</p>";

  try {
    const userFilter = document.getElementById("auditFilterUser").value.trim();
    const actionFilter = document.getElementById("auditFilterAction").value;

    let queryParams = [];
    if (userFilter) queryParams.push(`user=${encodeURIComponent(userFilter)}`);
    if (actionFilter) queryParams.push(`action=${encodeURIComponent(actionFilter)}`);

    const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
    const result = await apiFetch(`/api/audit${queryString}`);

    listContainer.innerHTML = "";

    let tableHtml = `
      <table class="history-table" style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
        <thead>
          <tr>
            <th style="padding: 8px;">User</th>
            <th style="padding: 8px;">Action</th>
            <th style="padding: 8px;">Details</th>
            <th style="padding: 8px;">Date & Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!result.logs || !result.logs.length) {
      tableHtml += `
        <tr>
          <td colspan="4" style="padding: 16px; text-align: center; color: var(--text-muted); font-style: italic;">No system matching events found inside current parameter sets.</td>
        </tr>
      `;
    } else {
      result.logs.forEach(log => {
        const dateStr = new Date(log.timestamp).toLocaleString();
        tableHtml += `
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 8px; font-weight:600; color:var(--primary);">${escapeHtml(log.username)}</td>
            <td style="padding: 8px;"><strong style='color:var(--accent);'>${escapeHtml(log.action)}</strong></td>
            <td style="padding: 8px; color:var(--text-muted); font-style:italic;">${escapeHtml(log.detail || "None")}</td>
            <td style="padding: 8px; color:var(--text-muted); font-size:11px;">${dateStr}</td>
          </tr>
        `;
      });
    }

    tableHtml += `
        </tbody>
      </table>
    `;

    listContainer.innerHTML = tableHtml;
  } catch (err) {
    listContainer.innerHTML = `<p style='color:var(--danger); padding:10px;'>Audit capture failure: ${escapeHtml(err.message)}</p>`;
  }
}

// ── TIMELINE RENDERERS ────────────────────────────────────────────────────────
function formatMediumDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function renderMainHistoryTimeline(historyArray) {
  mainHistoryTimeline.innerHTML = "";

  let tableHtml = `
    <table class="history-table" style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
      <thead>
        <tr>
          <th style="padding: 8px;">Date Admission/Discharge</th>
          <th style="padding: 8px;">Status</th>
          <th style="padding: 8px;">Offence</th>
          <th style="padding: 8px;">Current Location</th>
          <th style="padding: 8px;">Prison Status</th>
          <th style="padding: 8px;">User</th>
          <th style="padding: 8px;">Date Edited</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (!historyArray || !historyArray.length) {
    tableHtml += `
      <tr>
        <td colspan="7" style="padding: 16px; text-align: center; color: var(--text-muted); font-style: italic;">No status changes recorded.</td>
      </tr>
    `;
  } else {
    historyArray.slice().reverse().forEach(evt => {
      const eventDate = formatMediumDate(evt.date);
      const editedDate = formatMediumDate(evt.timestamp);
      const charge = evt.charge ? escapeHtml(evt.charge) : "-";
      const location = evt.location ? escapeHtml(evt.location) : "-";
      const prisonStatus = evt.convictionStatus || evt.dischargeStatus || "-";

      tableHtml += `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 8px;">${escapeHtml(eventDate)}</td>
          <td style="padding: 8px;"><strong style="color:var(--primary);">${escapeHtml(evt.type)}</strong></td>
          <td style="padding: 8px; color:var(--text-muted);">${charge}</td>
          <td style="padding: 8px; color:var(--text-muted);">${location}</td>
          <td style="padding: 8px; color:var(--text-muted);">${escapeHtml(prisonStatus)}</td>
          <td style="padding: 8px;">${escapeHtml(evt.username)}</td>
          <td style="padding: 8px; color: var(--text-muted); font-size: 10px;">${escapeHtml(editedDate)}</td>
        </tr>
      `;
    });
  }

  tableHtml += `
      </tbody>
    </table>
  `;

  mainHistoryTimeline.innerHTML = tableHtml;
}

// ── EXPLOITATION SYSTEM EXPORTS (CSV) ──────────────────────────────────────────
function exportCsv() {
  if (!records || !records.length || (records.length === 1 && !records[0].inmateId)) {
    showMessage("There is no data to export yet.");
    return;
  }

  const headers = ["Inmate ID", "First Name", "Middle Name", "Last Name", "Alias", "DOB", "Age", "In Prison Status", "Admission Date", "Discharge Date", "Affiliation", "Comments"];
  const rows = records.map(r => [
    r.inmateId || "",
    r.firstName || "",
    r.middleName || "",
    r.lastName || "",
    r.alias || "",
    r.dob || "",
    calculateAge(r.dob),
    r.inPrison ? "TRUE" : "FALSE",
    r.admissionDate || "",
    r.dischargeDate || "",
    r.affiliation || "",
    r.comment || ""
  ]);

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `BZE_Central_Prison_Inmate_Intel_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showMessage("CSV file downloaded successfully.", "success");
}

// ── SECURE PRINT AND AUTOMATED REPORT MATRIX PIPELINES ────────────────────────
function generatePdfReport() {
  const record = records[currentIndex] || emptyRecord();
  const reportGeneratedDate = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const inmateId = fields.inmateId.value || 'N/A';
  const firstName = fields.firstName.value || '';
  const middleName = fields.middleName.value || '';
  const lastName = fields.lastName.value || '';
  const alias = fields.alias.value || 'None';
  const dobRaw = fields.dob.value || '';
  const age = fields.age.value || 'N/A';
  const address = fields.address.value || 'N/A';
  const affiliation = fields.affiliation.value || 'None';
  const comment = fields.comment.value || 'No institutional remarks recorded.';

  const statusText = fields.incarcerationIn.checked ? 'IN PRISON' : 'OUT OF PRISON';

  // Format DOB to Medium Date (e.g., Apr 16, 1975)
  let dobMedium = 'N/A';
  if (dobRaw) {
    const dobDate = new Date(dobRaw + 'T00:00:00');
    if (!isNaN(dobDate.getTime())) {
      dobMedium = dobDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  // Determine history date based on incarceration status
  const dateAddedRaw = fields.dateAdded ? fields.dateAdded.value : '';
  const dateDischargedRaw = fields.dateDischarged ? fields.dateDischarged.value : '';
  let historicDateRaw = dateAddedRaw;

  if (statusText === 'OUT OF PRISON' && dateDischargedRaw) {
    historicDateRaw = dateDischargedRaw;
  }

  let historicDateFormatted = 'N/A';
  if (historicDateRaw) {
    const parsedHistDate = new Date(historicDateRaw + 'T00:00:00');
    if (!isNaN(parsedHistDate.getTime())) {
      historicDateFormatted = parsedHistDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  // Primary profile picture setup
  const mainMugshotSrc = mainPreview.src;
  const standardMugshotHtml = (mainMugshotSrc && !mainMugshotSrc.endsWith('#') && !mainMugshotSrc.includes(window.location.host + '/'))
    ? `<img src="${mainMugshotSrc}" style="width:130px; height:155px; object-fit:contain; background:#f8fafc; border:2px solid #1e3a8a; border-radius:4px;" alt="Primary Mugshot">`
    : `<div style="width:130px; height:155px; border:2px dashed #cbd5e1; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:11px;">No Mugshot</div>`;

  // Safely extract and normalize images structure from the record data source
  const images = normalizeImages(record.images);

  // Dynamic Multi-Angle Facial Profiles Construction
  let facialViewsHtml = '';
  if (images.frontFace || images.rightFace || images.leftFace) {
    facialViewsHtml += `
      <div class="print-section-block">
        <div class="print-section-heading">Facial Angle Profiles</div>
        <div class="print-photos-grid">
    `;
    if (images.leftFace) {
      facialViewsHtml += `<div class="print-photo-item"><img src="${images.leftFace}"><div class="print-photo-caption">Left Profile</div></div>`;
    }
    if (images.frontFace) {
      facialViewsHtml += `<div class="print-photo-item"><img src="${images.frontFace}"><div class="print-photo-caption">Front View</div></div>`;
    }
    if (images.rightFace) {
      facialViewsHtml += `<div class="print-photo-item"><img src="${images.rightFace}"><div class="print-photo-caption">Right Profile</div></div>`;
    }
    facialViewsHtml += `</div></div>`;
  }

  // Array Distribution Logic to handle explicit pagination breaks safely
  const allTattoos = images.tattoos || [];
  const primaryBatch = allTattoos.slice(0, 8);
  const overflowBatch = allTattoos.slice(8);

  // Render Page 1 Tattoo Group (Cap at 8 items max)
  let primaryTattoosHtml = '';
  if (primaryBatch.length > 0) {
    primaryTattoosHtml += `
      <div class="print-section-block">
        <div class="print-section-heading">Registered Body Tattoos & Identifying Marks</div>
        <div class="print-tattoos-grid">
    `;
    primaryBatch.forEach((tat) => {
      primaryTattoosHtml += `
        <div class="print-tattoo-card">
          <img src="${tat.src}">
          <div class="print-tattoo-desc">${escapeHtml(tat.description || '')}</div>
        </div>
      `;
    });
    primaryTattoosHtml += `</div></div>`;
  }

  // Render Page 2 Tattoo Group with an explicit (CONTINUED) indicator markup
  let overflowPageHtml = '';
  if (overflowBatch.length > 0) {
    overflowPageHtml += `
      <div class="print-section-block print-section-continued">
        <div class="print-section-heading">Registered Body Tattoos &amp; Identifying Marks <span class="continued-label">(CONTINUED)</span></div>
        <div class="print-tattoos-grid">
    `;
    overflowBatch.forEach((tat) => {
      overflowPageHtml += `
        <div class="print-tattoo-card">
          <img src="${tat.src}">
          <div class="print-tattoo-desc">${escapeHtml(tat.description || '')}</div>
        </div>
      `;
    });
    overflowPageHtml += `</div></div>`;
  }

  // Create style element dynamically and append it to head so paged media styles (like @page) are parsed correctly
  const printStyle = document.createElement("style");
  printStyle.id = "dynamic-print-style";
  printStyle.innerHTML = `
    @media print {
      html, body {
        background: #fff;
        margin: 0 !important;
        padding: 0 !important;
        width: auto !important;
        max-width: 100% !important;
        min-height: 0 !important;
      }
      body * { 
        visibility: hidden; 
      }
      #reportTemplate, #reportTemplate * { 
        visibility: visible; 
      }
      #reportTemplate { 
        position: static !important; 
        width: 100% !important;
        max-width: 100% !important;
        margin: 0;
        padding: 0; 
        box-sizing: border-box;
        overflow: hidden;
      }
      .print-wrapper,
      .print-body-content {
        width: 100% !important;
        max-width: 100% !important;
        overflow: hidden;
      }
      @page {
        size: letter;
        margin: 0.5in !important;
      }
      .print-section-continued {
        page-break-before: always !important;
        break-before: page !important;
      }
      .print-fixed-footer {
        position: fixed;
        bottom: 0;
        left: 10mm;
        right: 10mm;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        z-index: 9999;
        box-sizing: border-box;
      }
    }

    .print-wrapper {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.4;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    .print-body-content {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    .print-profile-grid,
    .print-section-block {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      padding-left: 2mm;
      padding-right: 2mm;
    }

    .print-tattoo-card,
    .print-photo-item,
    .print-history-table tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .print-header {
      text-align: center;
      border-bottom: 3px double #1e3a8a;
      padding-bottom: 4px;
      margin-top: 0px; 
      margin-bottom: 12px;
    }
    .print-header h1 {
      font-size: 21px;
      font-weight: 800;
      text-transform: uppercase;
      color: #1e3a8a;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .print-header h2 {
      font-size: 14px;
      font-weight: 600;
      color: #4b5563;
      margin: 2px 0 0 0;
      letter-spacing: 1px;
    }

    .print-title-banner {
      background-color: #f1f5f9;
      border-left: 5px solid #1e3a8a;
      padding: 6px 10px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
    }

    .print-profile-grid {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      max-width: 100%;
      overflow: hidden;
    }
    .print-data-table {
      flex: 1;
      min-width: 0;
      border-collapse: collapse;
      width: 100%;
      max-width: 100%;
      table-layout: fixed;
    }
    .print-data-table td {
      padding: 4px 6px;
      font-size: 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
    }
    .print-data-table td.label {
      font-weight: 600;
      color: #4b5563;
      width: 28%;
      text-transform: uppercase;
      font-size: 10px;
    }

    .print-section-heading {
      font-size: 12px;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1px solid #1e3a8a;
      padding-bottom: 3px;
      margin-top: 18px;
      margin-bottom: 10px;
      text-transform: uppercase;
      break-after: avoid !important;
      page-break-after: avoid !important;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
    }

    .continued-label {
      color: #dc2626 !important;
      font-weight: 700;
      margin-left: 4px;
    }

    .print-comment-box {
      font-size: 11px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      border-radius: 4px;
      white-space: pre-wrap;
      width: auto;
      max-width: 100%;
      box-sizing: border-box;
      overflow-wrap: anywhere;
      word-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
    }

    .print-history-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .print-history-table th {
      background-color: #f1f5f9;
      color: #1e3a8a;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: left;
      padding: 6px;
      border: 1px solid #cbd5e1;
    }
    .print-history-table td {
      font-size: 11px;
      padding: 6px;
      border: 1px solid #cbd5e1;
    }

    .print-photos-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
    }
    .print-photo-item {
      flex: 1;
      border: 1px solid #e2e8f0;
      padding: 4px;
      border-radius: 4px;
      text-align: center;
      background: #f8fafc;
    }
    .print-photo-item img {
      width: 100%;
      height: 115px; 
      object-fit: contain; 
      background: #f1f5f9;
      border-radius: 2px;
    }
    .print-photo-caption {
      font-size: 9px;
      font-weight: 600;
      color: #64748b;
      margin-top: 3px;
      text-transform: uppercase;
    }

    .print-tattoos-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .print-tattoo-card {
      border: 1px solid #e2e8f0;
      padding: 4px;
      border-radius: 4px;
      background: #f8fafc;
      text-align: center;
    }
    .print-tattoo-card img {
      width: 100%;
      height: 85px;
      object-fit: contain; 
      background: #f1f5f9;
      border-radius: 2px;
    }
    .print-tattoo-desc {
      font-size: 9px;
      color: #4b5563;
      margin-top: 3px;
      text-align: left;
      line-height: 1.3;
    }

    .print-footer-text {
      font-family: "Times New Roman", Times, serif;
      font-size: 9px;
      color: #dc2626;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0;
      line-height: 1.2;
      letter-spacing: 0.2px;
      text-align: center;
    }

    .print-kolbe-aim-footer {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #4b5563;
      font-size: 10px;
      width: 100%;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
    }
    .aim-title {
      font-style: italic;
      font-weight: 700;
      text-decoration: underline;
      text-align: center;
      margin-bottom: 6px;
      font-size: 10px;
    }
    .address-columns {
      display: flex;
      justify-content: space-between;
      line-height: 1.4;
    }
    .address-col { width: 33%; }
    .address-col.center { text-align: center; }
    .address-col.right { text-align: right; }
  `;
  document.head.appendChild(printStyle);

  reportTemplate.innerHTML = `
    <div class="print-wrapper">
      <div class="print-body-content">
              <header class="print-header">
                <h1>The Belize Central Prison</h1>
                <h2>Kolbe Foundation</h2>
                <p style="margin: 4px 0 0; font-size: 11px; color: #4b5563; font-weight: 400;">
                  Generated: ${reportGeneratedDate} &nbsp;&bull;&nbsp; By: ${currentUser?.username || 'Unknown'}
                </p>
              </header>

              <div class="print-title-banner">
                <span>INMATE INTELLIGENCE RECORD</span>
                <span style="color:${statusText === 'IN PRISON' ? '#b91c1c' : '#4b5563'}">${statusText}</span>
              </div>

              <div class="print-profile-grid">
                <div class="print-mugshot-panel">
                  ${standardMugshotHtml}
                </div>
                
                <table class="print-data-table">
                  <tr>
                    <td class="label">Inmate ID</td>
                    <td style="font-weight: 700; font-size: 13px;">${inmateId}</td>
                  </tr>
                  <tr>
                    <td class="label">Full Name</td>
                    <td>${firstName} ${middleName} ${lastName}</td>
                  </tr>
                  <tr>
                    <td class="label">Alias / AKA</td>
                    <td>${alias}</td>
                  </tr>
                  <tr>
                    <td class="label">Date of Birth</td>
                    <td>${dobMedium}</td>
                  </tr>
                  <tr>
                    <td class="label">Age</td>
                    <td>${age}</td>
                  </tr>
                  <tr>
                    <td class="label">Affiliation</td>
                    <td>${affiliation}</td>
                  </tr>
                  <tr>
                    <td class="label">Last Known Address</td>
                    <td>${address}</td>
                  </tr>
                </table>
              </div>

              <div class="print-section-block">
                <div class="print-section-heading">Intelligence Case Commentary & Remarks</div>
                <div class="print-comment-box">${comment}</div>
              </div>

              ${facialViewsHtml}
              
              ${primaryTattoosHtml}

              ${overflowPageHtml}

              <div class="print-section-block">
                <div class="print-section-heading">Status & Institutional Date History</div>
                <table class="print-history-table">
                  <thead>
                    <tr>
                      <th>Current Status</th>
                      <th>Date of Admission / Discharge</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 600; color: ${statusText === 'IN PRISON' ? '#b91c1c' : '#1e3a8a'}">${statusText}</td>
                      <td>${historicDateFormatted}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
      </div>
      <div class="print-fixed-footer">
        <p class="print-footer-text">the information contained in this file is confidential and is the sole property of the belize central prison kolbe foundation. the information is not to be used without direct approval of the ceo of prison.</p>
      </div>
    </div>
  `;

  document.body.classList.add("printing");
  window.print();
}
// ── USER INTERFACE THEME ALTERATIONS ─────────────────────────────────────────
function toggleDarkMode() {
  const active = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", active ? "1" : "0");
}

function applyDarkMode(enable) {
  document.body.classList.toggle("dark-mode", enable);
}

// ── SCREEN NOTICE DECORATORS ──────────────────────────────────────────────────
function showMessage(txt, type = "error") {
  message.textContent = txt;
  message.className = "message global-notice";

  if (!txt) return;

  if (type === "success") {
    message.style.cssText = "background-color:rgba(16,185,129,0.1); border:1px solid #10b981; color:#10b981;";
  } else if (type === "info") {
    message.style.cssText = "background-color:rgba(59,130,246,0.1); border:1px solid #3b82f6; color:#3b82f6;";
  } else {
    message.style.cssText = "background-color:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#ef4444;";
  }

  setTimeout(() => {
    message.textContent = "";
    message.style.cssText = "";
  }, 6000);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}