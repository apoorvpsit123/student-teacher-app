// Setup default teacher list
if (!localStorage.getItem("teachers")) {
  const defaultTeachers = [
    { name: "Mr. John", subject: "Math" },
    { name: "Ms. Emily", subject: "Physics" },
    { name: "Dr. Smith", subject: "Biology" }
  ];
  localStorage.setItem("teachers", JSON.stringify(defaultTeachers));
}

// Registration
function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(u => u.username === username)) {
    alert("Username already exists.");
    return;
  }

  users.push({ username, password, role });
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify({ username, role }));
  window.location.href = "dashboard.html";
}

// Login
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
  } else {
    alert("Incorrect username or password.");
  }
}

// Logout
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Show dashboard based on user role
function showDashboard(user) {
  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = `<p>Hello, <strong>${user.username}</strong> (${user.role})</p>`;

  if (user.role === "student") {
    showStudentDashboard(user, dashboard);
  } else if (user.role === "teacher") {
    showTeacherDashboard(user, dashboard);
  } else if (user.role === "admin") {
    showAdminDashboard(dashboard);
  }
}

// STUDENT
function showStudentDashboard(user, dashboard) {
  const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
  let teacherOptions = teachers.map(t =>
    `<option value="${t.name}">${t.name} - ${t.subject}</option>`
  ).join("");

  dashboard.innerHTML += `
    <h4>Book Appointment</h4>
    <select id="apptTeacher">${teacherOptions}</select>
    <input type="text" id="apptMsg" placeholder="Your message" />
    <button onclick="bookAppointment('${user.username}')">Book</button>
    <hr/>
  `;

  const appts = JSON.parse(localStorage.getItem("appointments")) || [];
  const myAppts = appts.filter(a => a.student === user.username);

  if (myAppts.length) {
    dashboard.innerHTML += `<h4>Your Appointments</h4>`;
    myAppts.forEach(a => {
      dashboard.innerHTML += `
        <div class="appointment">
          To: ${a.teacher}<br>
          Message: ${a.message}<br>
          Status: <strong>${a.status}</strong>
        </div>
      `;
    });
  }
}

// TEACHER
function showTeacherDashboard(user, dashboard) {
  const appts = JSON.parse(localStorage.getItem("appointments")) || [];
  const myAppts = appts.map((a, i) => ({ ...a, index: i })).filter(a => a.teacher === user.username);

  if (!myAppts.length) {
    dashboard.innerHTML += "<p>No appointments yet.</p>";
    return;
  }

  dashboard.innerHTML += "<h4>Incoming Appointments</h4>";
  myAppts.forEach(a => {
    dashboard.innerHTML += `
      <div class="appointment">
        From: ${a.student}<br>
        Message: ${a.message}<br>
        Status: <strong>${a.status}</strong><br>
        ${a.status === "pending" ? `
          <button onclick="updateAppointment(${a.index}, 'approved')">Approve</button>
          <button onclick="updateAppointment(${a.index}, 'rejected')">Reject</button>
        ` : ''}
      </div>
    `;
  });
}

// ADMIN
function showAdminDashboard(dashboard) {
  const teachers = JSON.parse(localStorage.getItem("teachers")) || [];

  dashboard.innerHTML += `
    <h4>Add New Teacher</h4>
    <input type="text" id="newTeacherName" placeholder="Name" />
    <input type="text" id="newTeacherSubject" placeholder="Subject" />
    <button onclick="addTeacher()">Add</button>
    <hr/>
    <h4>Manage Teachers</h4>
  `;

  teachers.forEach((t, i) => {
    dashboard.innerHTML += `
      <div class="appointment">
        <input type="text" value="${t.name}" id="editName${i}" />
        <input type="text" value="${t.subject}" id="editSubject${i}" />
        <button onclick="updateTeacher(${i})">Update</button>
        <button onclick="deleteTeacher(${i})">Delete</button>
      </div>
    `;
  });
}

// Booking and Approvals
function bookAppointment(student) {
  const teacher = document.getElementById("apptTeacher").value;
  const message = document.getElementById("apptMsg").value.trim();
  if (!message) return alert("Message required.");

  const appts = JSON.parse(localStorage.getItem("appointments")) || [];
  appts.push({ student, teacher, message, status: "pending" });
  localStorage.setItem("appointments", JSON.stringify(appts));
  alert("Appointment sent!");
  location.reload();
}

function updateAppointment(index, status) {
  const appts = JSON.parse(localStorage.getItem("appointments")) || [];
  appts[index].status = status;
  localStorage.setItem("appointments", JSON.stringify(appts));
  location.reload();
}

// Admin Teacher Control
function addTeacher() {
  const name = document.getElementById("newTeacherName").value.trim();
  const subject = document.getElementById("newTeacherSubject").value.trim();
  if (!name || !subject) return alert("All fields required.");

  const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
  teachers.push({ name, subject });
  localStorage.setItem("teachers", JSON.stringify(teachers));
  location.reload();
}

function updateTeacher(index) {
  const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
  teachers[index].name = document.getElementById(`editName${index}`).value.trim();
  teachers[index].subject = document.getElementById(`editSubject${index}`).value.trim();
  localStorage.setItem("teachers", JSON.stringify(teachers));
  location.reload();
}

function deleteTeacher(index) {
  const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
  teachers.splice(index, 1);
  localStorage.setItem("teachers", JSON.stringify(teachers));
  location.reload();
}
