
const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchInput");

let students = [];

// Display a message
function showMessage(message) {
    alert(message);
}

// Read the server response
async function readResponse(response) {
    const text = await response.text();

    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            data?.message || text || "Request failed. Please try again."
        );
    }

    return data ?? text;
}

// Add student — runs only on the Add Student page
if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const student = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            course: document.getElementById("course").value.trim(),
            age: Number(document.getElementById("age").value)
        };

        if (
            !student.name ||
            !student.email ||
            !student.course ||
            !student.age ||
            student.age < 1 ||
            student.age > 120
        ) {
            showMessage("Please enter valid details in all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
            showMessage("Please enter a valid email address.");
            return;
        }

        try {
            const response = await fetch("/students", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            });

            await readResponse(response);

            showMessage("Student added successfully!");
            form.reset();

            await loadStudents();
        } catch (error) {
            console.error("Error adding student:", error);
            showMessage(error.message);
        }
    });
}

// Load students from Spring Boot
async function loadStudents() {
    const status = document.getElementById("systemStatus");

    try {
        const response = await fetch("/students");
        const data = await readResponse(response);

        if (!Array.isArray(data)) {
            throw new Error("Unexpected student data from the server.");
        }

        students = data;

        if (status) {
            status.textContent = "Connected";
            status.style.color = "#23ad89";
        }

        updateStatistics();
        renderStudents();
    } catch (error) {
        console.error("Error loading students:", error);

        if (status) {
            status.textContent = "Offline";
            status.style.color = "#f87171";
        }

        students = [];
        updateStatistics();

        if (tableBody) {
            tableBody.replaceChildren();

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.className = "empty-state";
            cell.textContent =
                "Unable to load students. Check that your backend is running.";

            row.appendChild(cell);
            tableBody.appendChild(row);
        }
    }
}

// Update dashboard statistics
function updateStatistics() {
    const totalStudents = document.getElementById("totalStudents");
    const totalCourses = document.getElementById("totalCourses");
    const recordCount = document.getElementById("recordCount");

    if (totalStudents) {
        totalStudents.textContent = students.length;
    }

    const courses = new Set(
        students
            .map(student => student.course?.trim().toLowerCase())
            .filter(Boolean)
    );

    if (totalCourses) {
        totalCourses.textContent = courses.size;
    }

    if (recordCount) {
        recordCount.textContent =
            `${students.length} record${students.length === 1 ? "" : "s"}`;
    }
}

// Display records — runs only when the records table exists
function renderStudents() {
    if (!tableBody) {
        return;
    }

    const query = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const filteredStudents = students.filter(student => {
        return [
            student.id,
            student.name,
            student.email,
            student.course,
            student.age
        ].some(value =>
            String(value ?? "").toLowerCase().includes(query)
        );
    });

    tableBody.replaceChildren();

    if (filteredStudents.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-state";
        cell.textContent = query
            ? "No students match your search."
            : "No student records yet. Add your first student.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    filteredStudents.forEach(student => {
        const row = document.createElement("tr");

        function addCell(value, className = "") {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";

            if (className) {
                cell.className = className;
            }

            row.appendChild(cell);
            return cell;
        }

        addCell(student.id, "student-id");
        addCell(student.name, "student-name");
        addCell(student.email);

        const courseCell = addCell("");
        const courseBadge = document.createElement("span");

        courseBadge.className = "course-badge";
        courseBadge.textContent = student.course ?? "";

        courseCell.appendChild(courseBadge);

        addCell(student.age);

        const actionsCell = addCell();
        const actions = document.createElement("div");

        actions.className = "action-buttons";

        const updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.className = "update-btn";
        updateButton.textContent = "Edit";

        updateButton.addEventListener("click", () => {
            updateStudent(student.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteStudent(student.id);
        });

        actions.append(updateButton, deleteButton);
        actionsCell.appendChild(actions);
        tableBody.appendChild(row);
    });
}

// Search — runs only on the Student Records page
if (searchInput) {
    searchInput.addEventListener("input", renderStudents);
}

// Delete student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {
        const response = await fetch(`/students/${id}`, {
            method: "DELETE"
        });

        await readResponse(response);

        showMessage("Student deleted successfully!");
        await loadStudents();
    } catch (error) {
        console.error("Error deleting student:", error);
        showMessage(error.message);
    }
}

// Update student
async function updateStudent(id) {
    try {
        const response = await fetch(`/students/${id}`);
        const student = await readResponse(response);

        const name = prompt("Enter student name:", student.name);
        if (name === null) return;

        const email = prompt("Enter student email:", student.email);
        if (email === null) return;

        const course = prompt("Enter student course:", student.course);
        if (course === null) return;

        const age = prompt("Enter student age:", student.age);
        if (age === null) return;

        const updatedStudent = {
            name: name.trim(),
            email: email.trim(),
            course: course.trim(),
            age: Number(age)
        };

        if (
            !updatedStudent.name ||
            !updatedStudent.email ||
            !updatedStudent.course ||
            !updatedStudent.age ||
            updatedStudent.age < 1 ||
            updatedStudent.age > 120
        ) {
            showMessage("Please enter valid details in all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedStudent.email)) {
            showMessage("Please enter a valid email address.");
            return;
        }

        const updateResponse = await fetch(`/students/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedStudent)
        });

        await readResponse(updateResponse);

        showMessage("Student updated successfully!");
        await loadStudents();
    } catch (error) {
        console.error("Error updating student:", error);
        showMessage(error.message);
    }
}

// Initial page load
loadStudents();
