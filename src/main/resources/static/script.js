const form = document.querySelector("form");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const course = document.getElementById("course").value;
    const age = document.getElementById("age").value;

    if (name === "" || email === "" || course === "" || age === "") {
        alert("Please fill all fields!");
        return;
    }

    const student = {
        name: name,
        email: email,
        course: course,
        age: Number(age)
    };

    fetch("/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || "Failed to add student");
            });
        }

        return response.json();
    })
    .then(data => {
        console.log("Student added:", data);
        alert("Student added successfully!");
        form.reset();
        loadStudents();
    })
    .catch(error => {
        console.log("Error:", error);
        alert(error.message);
    });

});


function loadStudents() {

    fetch("/students")
        .then(response => response.json())
        .then(students => {

            const tableBody = document.getElementById("studentTableBody");

            tableBody.innerHTML = "";

            students.forEach(student => {

                const row = `
                    <tr>
                        <td>${student.id}</td>
                        <td>${student.name}</td>
                        <td>${student.email}</td>
                        <td>${student.course}</td>
                        <td>${student.age}</td>
                        <td>
                            <button class="update-btn" onclick="updateStudent(${student.id})">Update</button>
                            <button class="delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
                        </td>
                    </tr>
                `;

                tableBody.innerHTML += row;
            });

        })
        .catch(error => {
            console.log("Error loading students:", error);
        });
}


loadStudents();


function deleteStudent(id) {

    if (confirm("Are you sure you want to delete this student?")) {

        fetch("/students/" + id, {
            method: "DELETE"
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            loadStudents();
        })
        .catch(error => {
            console.log("Error:", error);
            alert("Something went wrong!");
        });
    }
}


function updateStudent(id) {

    fetch("/students/" + id)
        .then(response => response.json())
        .then(student => {

            const name = prompt("Enter student name:", student.name);
            const email = prompt("Enter student email:", student.email);
            const course = prompt("Enter student course:", student.course);
            const age = prompt("Enter student age:", student.age);

            if (name === null || email === null || course === null || age === null) {
                return;
            }
            if (name === "" || email === "" || course === "" || age === "") {
    alert("Please fill all fields!");
    return;
}

            const updatedStudent = {
                name: name,
                email: email,
                course: course,
                age: Number(age)
            };

            fetch("/students/" + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedStudent)
            })
            .then(response => response.json())
            .then(data => {
                alert("Student updated successfully!");
                loadStudents();
            })
            .catch(error => {
                console.log("Error:", error);
                alert("Something went wrong!");
            });

        })
        .catch(error => {
            console.log("Error:", error);
        });
}