document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.getElementById('userTable').getElementsByTagName('tbody')[0];
    const userFormContainer = document.getElementById('userFormContainer');
    const userForm = document.getElementById('userForm');
    const addUserBtn = document.getElementById('addUserBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');
    const userIdInput = document.getElementById('userId');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const departmentInput = document.getElementById('department');

    const apiUrl = 'https://jsonplaceholder.typicode.com/users';

    // Fetch and display users
    async function fetchUsers() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            showError(error.message);
        }
    }

    function displayUsers(users) {
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name.split(' ')[0]}</td>
                <td>${user.name.split(' ')[1]}</td>
                <td>${user.email}</td>
                <td>${user.company.name}</td>
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            if (!response.ok) {
                throw new Error('Failed to add user');
            }
            const newUser = await response.json();
            fetchUsers();
        } catch (error) {
            showError(error.message);
        }
    }

    // Edit user
    async function editUser(userId) {
        try {
            const response = await fetch(`${apiUrl}/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            const user = await response.json();
            userIdInput.value = user.id;
            firstNameInput.value = user.name.split(' ')[0];
            lastNameInput.value = user.name.split(' ')[1];
            emailInput.value = user.email;
            departmentInput.value = user.company.name;
            formTitle.textContent = 'Edit User';
            userFormContainer.style.display = 'block';
        } catch (error) {
            showError(error.message);
        }
    }

    async function updateUser(userId, user) {
        try {
            const response = await fetch(`${apiUrl}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            fetchUsers();
        } catch (error) {
            showError(error.message);
        }
    }

    // Delete user
    async function deleteUser(userId) {
        try {
            const response = await fetch(`${apiUrl}/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            fetchUsers();
        } catch (error) {
            showError(error.message);
        }
    }

    // Show error message
    function showError(message) {
        alert(message);
    }

    // Handle form submission
    userForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const user = {
            name: `${firstNameInput.value} ${lastNameInput.value}`,
            email: emailInput.value,
            company: {
                name: departmentInput.value
            }
        };
        const userId = userIdInput.value;
        if (userId) {
            updateUser(userId, user);
        } else {
            addUser(user);
        }
        userFormContainer.style.display = 'none';
    });

    // Handle add user button click
    addUserBtn.addEventListener('click', () => {
        userIdInput.value = '';
        firstNameInput.value = '';
        lastNameInput.value = '';
        emailInput.value = '';
        departmentInput.value = '';
        formTitle.textContent = 'Add User';
        userFormContainer.style.display = 'block';
    });

    // Handle cancel button click
    cancelBtn.addEventListener('click', () => {
        userFormContainer.style.display = 'none';
    });

    // Initial fetch of users
    fetchUsers();
});
