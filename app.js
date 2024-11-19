// Import Axios (Add this to your HTML)
// <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const userTableBody = document
    .getElementById("userTable")
    .getElementsByTagName("tbody")[0];
  const userFormContainer = document.getElementById("userFormContainer");
  const userForm = document.getElementById("userForm");
  const addUserBtn = document.getElementById("addUserBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const cancelBtnForm = document.getElementById("cancelBtnForm");
  const formTitle = document.getElementById("formTitle");
  const userIdInput = document.getElementById("userId");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const departmentInput = document.getElementById("department");

  // Configuration
  const apiUrl = "https://jsonplaceholder.typicode.com/users";
  const usersPerPage = 5;
  let currentPage = 1;
  let users = [];

  // Initialize Axios instance
  const api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
    timeout: 5000,
  });

  // Form Validation Rules
  const validationRules = {
    firstName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]*$/,
      message:
        "First name must be at least 2 characters and contain only letters",
    },
    lastName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]*$/,
      message:
        "Last name must be at least 2 characters and contain only letters",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    department: {
      required: true,
      minLength: 2,
      message: "Department is required and must be at least 2 characters",
    },
  };

  // Fetch Users with Pagination
  async function fetchUsers(page = 1) {
    try {
      const response = await api.get("/users");
      users = response.data;
      displayUsers(getPaginatedUsers(page));
      setupPagination();
    } catch (error) {
      showError("Failed to fetch users: " + error.message);
    }
  }

  // Get Paginated Users
  function getPaginatedUsers(page) {
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return users.slice(startIndex, endIndex);
  }

  // Setup Pagination
  function setupPagination() {
    const totalPages = Math.ceil(users.length / usersPerPage);
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "pagination";

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.innerText = i;
      pageBtn.className = `page-btn ${currentPage === i ? "active" : ""}`;
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        displayUsers(getPaginatedUsers(i));
        updatePaginationButtons();
      });
      paginationContainer.appendChild(pageBtn);
    }

    // Replace existing pagination
    const existingPagination = document.querySelector(".pagination");
    if (existingPagination) {
      existingPagination.remove();
    }
    document.querySelector(".table-container").appendChild(paginationContainer);
  }

  // Update Pagination Buttons
  function updatePaginationButtons() {
    document.querySelectorAll(".page-btn").forEach((btn) => {
      btn.classList.toggle("active", parseInt(btn.innerText) === currentPage);
    });
  }

  // Display Users
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
                    <button onclick="editUser(${user.id})" class="btn-edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteUser(${user.id})" class="btn-delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
      userTableBody.appendChild(row);
    });
  }

  // Validate Form Input
  function validateForm(formData) {
    const errors = [];
    for (const [field, value] of Object.entries(formData)) {
      const rules = validationRules[field];
      if (rules) {
        if (rules.required && !value) {
          errors.push(`${field} is required`);
        }
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(
            `${field} must be at least ${rules.minLength} characters`
          );
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(rules.message);
        }
      }
    }
    return errors;
  }

  // Add User
  async function addUser(userData) {
    try {
      const response = await api.post("/users", userData);
      const newUser = response.data;
      // Add the new user to our local array with a new ID
      newUser.id =
        users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      users.unshift(newUser);
      currentPage = 1; // Reset to first page
      displayUsers(getPaginatedUsers(currentPage));
      setupPagination();
      showSuccess("User added successfully");
    } catch (error) {
      showError("Failed to add user: " + error.message);
    }
  }

  // Edit User
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

  // Update User
  async function updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      const updatedUser = response.data;
      const index = users.findIndex((u) => u.id === parseInt(userId));
      if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        displayUsers(getPaginatedUsers(currentPage));
        showSuccess("User updated successfully");
      }
    } catch (error) {
      showError("Failed to update user: " + error.message);
    }
  }

  // Delete User
  window.deleteUser = async function (userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${userId}`);
      users = users.filter((user) => user.id !== userId);
      displayUsers(getPaginatedUsers(currentPage));
      setupPagination();
      showSuccess("User deleted successfully");
    } catch (error) {
      showError("Failed to delete user: " + error.message);
    }
  };

  // Notification Functions
  function showSuccess(message) {
    const notification = createNotification(message, "success");
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  function showError(message) {
    const notification = createNotification(message, "error");
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  function createNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    return notification;
  }

  // Form Event Listeners
  userForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      department: departmentInput.value.trim(),
    };

    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
      showError(errors.join("\n"));
      return;
    }

    const userData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      company: {
        name: formData.department,
      },
    };

    const userId = userIdInput.value;
    if (userId) {
      await updateUser(userId, userData);
    } else {
      await addUser(userData);
    }

    userForm.reset();
    userFormContainer.style.display = "none";
  });

  // Button Event Listeners
  addUserBtn.addEventListener("click", () => {
    userIdInput.value = "";
    userForm.reset();
    formTitle.textContent = "Add User";
    userFormContainer.style.display = "block";
  });

  [cancelBtn, cancelBtnForm].forEach((btn) => {
    btn.addEventListener("click", () => {
      userForm.reset();
      userFormContainer.style.display = "none";
    });
  });

  // Implement infinite scrolling (alternative to pagination)
  let isLoading = false;
  window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
      isLoading = true;
      // Load more users if available
      if (currentPage * usersPerPage < users.length) {
        currentPage++;
        displayUsers(getPaginatedUsers(currentPage));
        updatePaginationButtons();
      }
      isLoading = false;
    }
  });

  // Initial fetch of users
  fetchUsers();
});
