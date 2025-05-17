const db = new Dexie("AgendaDB");
db.version(1).stores({
  events: "++id,date,time,text"  
});

const monthAndYear = document.getElementById("monthAndYear");
const calendarDays = document.getElementById("calendarDays");
const dayNamesDiv = document.getElementById("dayNames");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

const weeklyViewBtn = document.getElementById("weeklyView");
const monthlyViewBtn = document.getElementById("monthlyView");

const eventModal = document.getElementById("eventModal");
const closeModal = document.getElementById("closeModal");
const cancelButton = document.getElementById("cancelButton");
const eventForm = document.getElementById("eventForm");
const eventTextInput = document.getElementById("eventText");
const startHourSelect = document.getElementById("startHour");
const startMinuteSelect = document.getElementById("startMinute");
const endHourSelect = document.getElementById("endHour");
const endMinuteSelect = document.getElementById("endMinute");
const includeEndTimeCheckbox = document.getElementById("includeEndTime");
const endTimeGroup = document.querySelector(".end-time-group");

const deleteModal = document.getElementById("deleteModal");
const deleteConfirmButton = document.getElementById("deleteConfirmButton");
const deleteCancelButton = document.getElementById("deleteCancelButton");

let today = new Date();
let weeklyDay = today.getDate();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let viewMode = "monthly";
let currentEventList = null;
let currentWeeklyEventList = null;
let currentEventDate = "";
let eventToDeleteId = null;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function populateTimeDropdowns() {
  for (let i = 0; i < 24; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = i < 10 ? "0" + i : i;
    startHourSelect.appendChild(opt.cloneNode(true));
    endHourSelect.appendChild(opt.cloneNode(true));
  }
  for (let i = 0; i < 60; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = i < 10 ? "0" + i : i;
    startMinuteSelect.appendChild(opt.cloneNode(true));
    endMinuteSelect.appendChild(opt.cloneNode(true));
  }
}
populateTimeDropdowns();

includeEndTimeCheckbox.addEventListener("change", () => {
  endTimeGroup.style.display = includeEndTimeCheckbox.checked ? "flex" : "none";
});

weeklyViewBtn.addEventListener("click", () => {
  viewMode = "weekly";
  weeklyDay = today.getDate();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  setActiveViewButton();
  renderWeeklyView();
});
monthlyViewBtn.addEventListener("click", () => {
  viewMode = "monthly";
  weeklyDay = today.getDate();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  setActiveViewButton();
  renderMonthlyView();
});

function setActiveViewButton() {
  weeklyViewBtn.classList.remove("active");
  monthlyViewBtn.classList.remove("active");
  if (viewMode === "weekly") weeklyViewBtn.classList.add("active");
  else monthlyViewBtn.classList.add("active");
}

async function updateUIWithEvents() {
  const allEvents = await db.events.toArray();
  function timeToMinutes(timeStr) {
    let parts = timeStr.split("-")[0].split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  
  if (viewMode === "monthly") {
    const cells = calendarDays.querySelectorAll(".day-cell");
    cells.forEach(cell => {
      const cellDate = cell.dataset.date;
      const list = cell.querySelector(".event-list");
      list.innerHTML = "";
      let dayEvents = allEvents.filter(ev => ev.date === cellDate);
      dayEvents.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
      dayEvents.forEach(ev => {
        const evEl = document.createElement("span");
        evEl.classList.add("event");
        evEl.textContent = ev.time + " " + ev.text;
        evEl.dataset.id = ev.id;
        evEl.addEventListener("click", function(e) {
          e.stopPropagation();
          openDeleteModal(ev.id);
        });
        list.appendChild(evEl);
      });
    });
  } else if (viewMode === "weekly") {
    const cells = calendarDays.querySelectorAll(".day-cell");
    cells.forEach(cell => {
      const cellDate = cell.dataset.date;
      const timeSlots = cell.querySelectorAll(".time-slot");
      timeSlots.forEach(slot => {
        slot.innerHTML = "";
        const slotLabel = document.createElement("span");
        slotLabel.style.position = "absolute";
        slotLabel.style.top = "2px";
        slotLabel.style.left = "2px";
        slotLabel.style.fontSize = "0.6em";
        slotLabel.style.color = "#888";
        slotLabel.textContent = slot.dataset.slot;
        slot.appendChild(slotLabel);
      });
      let dayEvents = allEvents.filter(ev => ev.date === cellDate);
      dayEvents.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
      dayEvents.forEach(ev => {
        let startHour = parseInt(ev.time.split("-")[0].split(":")[0], 10);
        let slotName = "";
        if (startHour < 6) slotName = "00-06";
        else if (startHour < 12) slotName = "06-12";
        else if (startHour < 18) slotName = "12-18";
        else slotName = "18-24";
        const targetSlot = cell.querySelector(`.time-slot[data-slot="${slotName}"]`);
        if (targetSlot) {
          const evEl = document.createElement("span");
          evEl.classList.add("event");
          evEl.textContent = ev.time + " " + ev.text;
          evEl.dataset.id = ev.id;
          evEl.addEventListener("click", function(e) {
            e.stopPropagation();
            openDeleteModal(ev.id);
          });
          targetSlot.appendChild(evEl);
        }
      });
    });
  }
}

function openDeleteModal(eventId) {
  eventToDeleteId = eventId;
  deleteModal.style.display = "block";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
  eventToDeleteId = null;
}

deleteConfirmButton.addEventListener("click", () => {
  if (eventToDeleteId) {
    db.events.delete(eventToDeleteId).then(() => {
      updateUIWithEvents();
      closeDeleteModal();
    });
  }
});
deleteCancelButton.addEventListener("click", () => {
  closeDeleteModal();
});
window.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    closeDeleteModal();
  }
});

function renderMonthlyView() {
  monthAndYear.textContent = months[currentMonth] + " " + currentYear;
  dayNamesDiv.innerHTML = "";
  calendarDays.innerHTML = "";
  document.querySelector(".calendar-body").className = "calendar-body";
  
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  names.forEach(n => {
    const div = document.createElement("div");
    div.textContent = n;
    dayNamesDiv.appendChild(div);
  });
  
  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  let startDay = firstDay === 0 ? 6 : firstDay - 1;
  let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("empty-cell");
    calendarDays.appendChild(emptyCell);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("day-cell");
    let monthStr = (currentMonth + 1).toString().padStart(2, "0");
    let dayStr = day.toString().padStart(2, "0");
    cell.dataset.date = `${currentYear}-${monthStr}-${dayStr}`;
    
    const cellContent = document.createElement("div");
    cellContent.classList.add("cell-content");
    if (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      cellContent.classList.add("today");
    }
    const dateDiv = document.createElement("div");
    dateDiv.classList.add("date-number");
    dateDiv.textContent = day;
    cellContent.appendChild(dateDiv);
    const eventList = document.createElement("div");
    eventList.classList.add("event-list");
    cellContent.appendChild(eventList);
    cell.appendChild(cellContent);
    cell.addEventListener("click", function (e) {
      e.stopPropagation();
      currentEventList = eventList;
      currentEventDate = cell.dataset.date;
      clearModalInputs();
      eventModal.style.display = "block";
    });
    calendarDays.appendChild(cell);
  }
  updateUIWithEvents();
}

function renderWeeklyView() {
  let current = new Date(currentYear, currentMonth, weeklyDay);
  let dayOfWeek = current.getDay();
  let offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  let weekStart = new Date(current);
  weekStart.setDate(current.getDate() + offset);
  let weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  monthAndYear.textContent = formatDate(weekStart) + " - " + formatDate(weekEnd);
  
  dayNamesDiv.innerHTML = "";
  calendarDays.innerHTML = "";
  document.querySelector(".calendar-body").className = "calendar-body weekly";
  
  for (let i = 0; i < 7; i++) {
    let date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const div = document.createElement("div");
    div.textContent = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] + " " + date.getDate();
    if (date.toDateString() === new Date().toDateString()) {
      div.classList.add("today");
    }
    dayNamesDiv.appendChild(div);
  }
  
  for (let i = 0; i < 7; i++) {
    let date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const cell = document.createElement("div");
    cell.classList.add("day-cell");
    let mStr = (date.getMonth() + 1).toString().padStart(2, "0");
    let dStr = date.getDate().toString().padStart(2, "0");
    cell.dataset.date = `${date.getFullYear()}-${mStr}-${dStr}`;
    
    const cellContent = document.createElement("div");
    cellContent.classList.add("cell-content");
    if (date.toDateString() === new Date().toDateString()) {
      cellContent.classList.add("today");
    }
    const dateDiv = document.createElement("div");
    dateDiv.classList.add("date-number");
    dateDiv.textContent = date.getDate();
    cellContent.appendChild(dateDiv);
    const eventList = document.createElement("div");
    eventList.classList.add("event-list");
    
    const timeSlots = ["00-06", "06-12", "12-18", "18-24"];
    timeSlots.forEach(slot => {
      const slotDiv = document.createElement("div");
      slotDiv.classList.add("time-slot");
      slotDiv.setAttribute("data-slot", slot);
      const slotLabel = document.createElement("span");
      slotLabel.style.position = "absolute";
      slotLabel.style.top = "2px";
      slotLabel.style.left = "2px";
      slotLabel.style.fontSize = "0.6em";
      slotLabel.style.color = "#888";
      slotLabel.textContent = slot;
      slotDiv.appendChild(slotLabel);
      slotDiv.addEventListener("click", function(e) {
        e.stopPropagation();
        currentWeeklyEventList = slotDiv;
        currentEventDate = cell.dataset.date;
        clearModalInputs();
        eventModal.style.display = "block";
      });
      eventList.appendChild(slotDiv);
    });
    cellContent.appendChild(eventList);
    cell.appendChild(cellContent);
    calendarDays.appendChild(cell);
    cell.addEventListener("click", function(e) {
      e.stopPropagation();
      currentWeeklyEventList = eventList;
      currentEventDate = cell.dataset.date;
      clearModalInputs();
      eventModal.style.display = "block";
    });
  }
  updateUIWithEvents();
}

function formatDate(date) {
  let d = date.getDate();
  let m = date.getMonth() + 1;
  let y = date.getFullYear();
  return (d < 10 ? "0" + d : d) + "/" + (m < 10 ? "0" + m : m) + "/" + y;
}

function clearModalInputs() {
  eventTextInput.value = "";
  startHourSelect.selectedIndex = 0;
  startMinuteSelect.selectedIndex = 0;
  includeEndTimeCheckbox.checked = false;
  endTimeGroup.style.display = "none";
  endHourSelect.selectedIndex = 0;
  endMinuteSelect.selectedIndex = 0;
}

// Close Modals
closeModal.addEventListener("click", () => { eventModal.style.display = "none"; });
cancelButton.addEventListener("click", () => { eventModal.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === eventModal) eventModal.style.display = "none"; });

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

eventForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const text = eventTextInput.value.trim();
  const sHour = parseInt(startHourSelect.value, 10);
  const sMinute = parseInt(startMinuteSelect.value, 10);
  let timeStr = "";
  const startTime = (sHour < 10 ? "0" + sHour : sHour) + ":" + (sMinute < 10 ? "0" + sMinute : sMinute);
  if (includeEndTimeCheckbox.checked) {
    const eHour = parseInt(endHourSelect.value, 10);
    const eMinute = parseInt(endMinuteSelect.value, 10);
    const endTime = (eHour < 10 ? "0" + eHour : eHour) + ":" + (eMinute < 10 ? "0" + eMinute : eMinute);
    timeStr = startTime + "-" + endTime;
  } else {
    timeStr = startTime;
  }
  const newEvent = {
    id: generateUUID(),
    date: currentEventDate,
    time: timeStr,
    text: text
  };
  db.events.add(newEvent).then(() => {
    updateUIWithEvents();
  });
  eventModal.style.display = "none";
});

prevButton.addEventListener("click", function() {
  if (viewMode === "monthly") {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderMonthlyView();
  } else if (viewMode === "weekly") {
    weeklyDay -= 7;
    renderWeeklyView();
  }
});

nextButton.addEventListener("click", function() {
  if (viewMode === "monthly") {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderMonthlyView();
  } else if (viewMode === "weekly") {
    weeklyDay += 7;
    renderWeeklyView();
  }
});

function init() {
  renderMonthlyView();
}
init();
