document.addEventListener("DOMContentLoaded", () => {
  const userTableBody = document
    .getElementById("userTable")
    .getElementsByTagName("tbody")[0];
  const userFormContainer = document.getElementById("userFormContainer");
  const userForm = document.getElementById("userForm");
  const addUserBtn = document.getElementById("addUserBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const formTitle = document.getElementById("formTitle");
  const userIdInput = document.getElementById("userId");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const departmentInput = document.getElementById("department");

  const apiUrl = "https://jsonplaceholder.typicode.com/users";

  // Add a local users array to maintain state
  let users = [];

  // Fetch and display users
  async function fetchUsers() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      users = await response.json(); // Store users in our local array
      displayUsers(users);
    } catch (error) {
      showError(error.message);
    }
  }

  function displayUsers(usersToDisplay) {
    userTableBody.innerHTML = "";
    usersToDisplay.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name.split(" ")[0]}</td>
                <td>${user.name.split(" ")[1] || ""}</td>
                <td>${user.email}</td>
                <td>${user.company?.name || ""}</td>
                <td>
                    <button onclick="editUser(${user.id})">Edit</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
      userTableBody.appendChild(row);
    });
  }

  // Add user
  async function addUser(user) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        throw new Error("Failed to add user");
      }
      const newUser = await response.json();
      // Add the new user to our local array with a new ID
      newUser.id =
        users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      users.push(newUser);
      displayUsers(users);
      userForm.reset();
      userFormContainer.style.display = "none";
    } catch (error) {
      showError(error.message);
    }
  }

  // Edit user
  window.editUser = async function (userId) {
    const user = users.find((u) => u.id === userId);
    if (user) {
      userIdInput.value = user.id;
      firstNameInput.value = user.name.split(" ")[0];
      lastNameInput.value = user.name.split(" ")[1] || "";
      emailInput.value = user.email;
      departmentInput.value = user.company?.name || "";
      formTitle.textContent = "Edit User";
      userFormContainer.style.display = "block";
    }
  };

  async function updateUser(userId, updatedUser) {
    try {
      const response = await fetch(`${apiUrl}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      // Update user in our local array
      const index = users.findIndex((u) => u.id === parseInt(userId));
      if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        displayUsers(users);
        userForm.reset();
        userFormContainer.style.display = "none";
      }
    } catch (error) {
      showError(error.message);
    }
  }

  // Delete user
  window.deleteUser = async function (userId) {
    try {
      const response = await fetch(`${apiUrl}/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      // Remove user from our local array
      users = users.filter((user) => user.id !== userId);
      displayUsers(users);
    } catch (error) {
      showError(error.message);
    }
  };

  function showError(message) {
    alert(message);
  }

  // Handle form submission
  userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = {
      name: `${firstNameInput.value} ${lastNameInput.value}`.trim(),
      email: emailInput.value,
      company: {
        name: departmentInput.value,
      },
    };
    const userId = userIdInput.value;
    if (userId) {
      updateUser(userId, user);
    } else {
      addUser(user);
    }
  });

  // Handle add user button click
  addUserBtn.addEventListener("click", () => {
    userIdInput.value = "";
    userForm.reset();
    formTitle.textContent = "Add User";
    userFormContainer.style.display = "block";
  });

  // Handle cancel button click
  cancelBtn.addEventListener("click", () => {
    userForm.reset();
    userFormContainer.style.display = "none";
  });

  // Initial fetch of users
  fetchUsers();
});
