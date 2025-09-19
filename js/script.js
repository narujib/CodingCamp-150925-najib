// Data dan State Management
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";
let currentSort = "newest";
let editingId = null;
let deletingId = null;

// DOM Elements
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const activeCount = document.getElementById("active-count");
const addTaskBtn = document.getElementById("add-task-btn");
const addTaskModal = document.getElementById("add-task-modal");
const closeModal = document.getElementById("close-modal");
const todoForm = document.getElementById("todo-form");
const cancelForm = document.getElementById("cancel-form");
const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const cancelDelete = document.getElementById("cancel-delete");
const confirmDelete = document.getElementById("confirm-delete");
const clearCompletedBtn = document.getElementById("clear-completed");
const themeToggle = document.getElementById("theme-toggle");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sort-select");

// Inisialisasi aplikasi
function initApp() {
  renderTodos();
  updateActiveCount();
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  // Tombol tema
  themeToggle.addEventListener("click", toggleTheme);

  // Modal tugas
  addTaskBtn.addEventListener("click", () => openModal());
  closeModal.addEventListener("click", closeModalHandler);
  cancelForm.addEventListener("click", closeModalHandler);
  todoForm.addEventListener("submit", handleFormSubmit);

  // Modal konfirmasi hapus
  cancelDelete.addEventListener("click", closeDeleteModal);
  confirmDelete.addEventListener("click", confirmDeleteHandler);

  // Tombol filter - PERBAIKAN BUG DI SINI
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Hapus kelas active dari semua tombol filter
      filterButtons.forEach((b) =>
        b.classList.remove(
          "active",
          "bg-custom-primary",
          "text-white",
          "dark:bg-purple-700"
        )
      );

      // Tambahkan kelas active ke tombol yang diklik
      e.currentTarget.classList.add(
        "active",
        "bg-custom-primary",
        "text-white",
        "dark:bg-purple-700"
      );

      // Set filter yang dipilih
      currentFilter = e.currentTarget.dataset.filter;
      renderTodos();
    });
  });

  // Dropdown sorting
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderTodos();
  });

  // Tombol hapus yang selesai
  clearCompletedBtn.addEventListener("click", clearCompletedTodos);

  // Klik di luar modal untuk menutup
  window.addEventListener("click", (e) => {
    if (e.target === addTaskModal) closeModalHandler();
    if (e.target === deleteConfirmModal) closeDeleteModal();
  });
}

// Toggle tema (terang/gelap)
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");

  if (isDark) {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
    document.querySelector(".theme-text").textContent = "Mode Gelap";
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
    document.querySelector(".theme-text").textContent = "Mode Terang";
  }
}

// Buka modal untuk menambah/mengedit tugas
function openModal(id = null) {
  editingId = id;
  const modalTitle = document.getElementById("modal-title");
  const submitButtonText = document.getElementById("submit-button-text");

  if (id) {
    // Mode edit
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      document.getElementById("edit-id").value = todo.id;
      document.getElementById("todo-title").value = todo.title;
      document.getElementById("todo-date").value = todo.date;
      document.getElementById("todo-category").value = todo.category;
      document.getElementById("todo-priority").value = todo.priority;
      document.getElementById("todo-notes").value = todo.notes;

      modalTitle.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Tugas
            `;
      submitButtonText.textContent = "Simpan Perubahan";
    }
  } else {
    // Mode tambah
    todoForm.reset();
    document.getElementById("edit-id").value = "";

    modalTitle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Tambah Tugas Baru
          `;
    submitButtonText.textContent = "Tambah Tugas";
  }

  addTaskModal.classList.add("active");
}

// Tutup modal
function closeModalHandler() {
  addTaskModal.classList.remove("active");
  resetValidationErrors();
}

// Reset pesan error validasi
function resetValidationErrors() {
  document.getElementById("title-error").classList.add("hidden");
  document.getElementById("date-error").classList.add("hidden");
  document.getElementById("category-error").classList.add("hidden");
  document.getElementById("notes-error").classList.add("hidden");
}

// Handle form submit (tambah/edit)
function handleFormSubmit(e) {
  e.preventDefault();
  resetValidationErrors();

  const title = document.getElementById("todo-title").value.trim();
  const date = document.getElementById("todo-date").value;
  const category = document.getElementById("todo-category").value;
  const priority = document.getElementById("todo-priority").value;
  const notes = document.getElementById("todo-notes").value.trim();
  const id = document.getElementById("edit-id").value;

  // Validasi input
  let isValid = true;

  if (!title) {
    document.getElementById("title-error").classList.remove("hidden");
    isValid = false;
  }

  if (!date) {
    document.getElementById("date-error").classList.remove("hidden");
    isValid = false;
  }

  if (!category) {
    document.getElementById("category-error").classList.remove("hidden");
    isValid = false;
  }

  if (!notes) {
    document.getElementById("notes-error").classList.remove("hidden");
    isValid = false;
  }

  if (!isValid) return;

  if (id) {
    // Edit todo yang sudah ada
    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos[index] = {
        ...todos[index],
        title,
        date,
        category,
        priority,
        notes,
      };
      showToast("Tugas berhasil diperbarui");
    }
  } else {
    // Tambah todo baru
    const newTodo = {
      id: Date.now().toString(),
      title,
      date,
      category,
      priority,
      notes,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    todos.unshift(newTodo);
    showToast("Tugas berhasil ditambahkan");
  }

  saveTodos();
  renderTodos();
  updateActiveCount();
  closeModalHandler();
}

// Buka modal konfirmasi hapus
function openDeleteModal(id) {
  deletingId = id;
  deleteConfirmModal.classList.add("active");
}

// Tutup modal konfirmasi hapus
function closeDeleteModal() {
  deletingId = null;
  deleteConfirmModal.classList.remove("active");
}

// Konfirmasi hapus tugas
function confirmDeleteHandler() {
  if (deletingId) {
    todos = todos.filter((t) => t.id !== deletingId);
    saveTodos();
    renderTodos();
    updateActiveCount();
    showToast("Tugas berhasil dihapus");
  }
  closeDeleteModal();
}

// Toggle status selesai/belum selesai
function toggleComplete(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
    updateActiveCount();

    const message = todos[index].completed
      ? "Tugas ditandai sebagai selesai"
      : "Tugas ditandai sebagai belum selesai";
    showToast(message);
  }
}

// Hapus semua tugas yang sudah selesai
function clearCompletedTodos() {
  const completedCount = todos.filter((t) => t.completed).length;
  if (completedCount === 0) {
    showToast("Tidak ada tugas yang selesai", "info");
    return;
  }

  todos = todos.filter((t) => !t.completed);
  saveTodos();
  renderTodos();
  updateActiveCount();
  showToast(`${completedCount} tugas selesai dihapus`);
}

// Simpan todos ke localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Update jumlah tugas aktif
function updateActiveCount() {
  const count = todos.filter((t) => !t.completed).length;
  activeCount.textContent = count;
}

// Tampilkan notifikasi toast
function showToast(message, type = "success") {
  // Atur warna berdasarkan tipe
  if (type === "success") {
    toast.className = toast.className.replace(/bg-\w+-\d+/, "bg-green-100");
    toast.className = toast.className.replace(/text-\w+-\d+/, "text-green-800");
    toast.className = toast.className.replace(
      /border-\w+-\d+/,
      "border-green-300"
    );
    toast.className = toast.className.replace(
      /dark:bg-\w+-\d+/,
      "dark:bg-green-900"
    );
    toast.className = toast.className.replace(
      /dark:text-\w+-\d+/,
      "dark:text-green-200"
    );
    toast.className = toast.className.replace(
      /dark:border-\w+-\d+/,
      "dark:border-green-700"
    );
  } else if (type === "error") {
    toast.className = toast.className.replace(/bg-\w+-\d+/, "bg-red-100");
    toast.className = toast.className.replace(/text-\w+-\d+/, "text-red-800");
    toast.className = toast.className.replace(
      /border-\w+-\d+/,
      "border-red-300"
    );
    toast.className = toast.className.replace(
      /dark:bg-\w+-\d+/,
      "dark:bg-red-900"
    );
    toast.className = toast.className.replace(
      /dark:text-\w+-\d+/,
      "dark:text-red-200"
    );
    toast.className = toast.className.replace(
      /dark:border-\w+-\d+/,
      "dark:border-red-700"
    );
  } else if (type === "info") {
    toast.className = toast.className.replace(/bg-\w+-\d+/, "bg-blue-100");
    toast.className = toast.className.replace(/text-\w+-\d+/, "text-blue-800");
    toast.className = toast.className.replace(
      /border-\w+-\d+/,
      "border-blue-300"
    );
    toast.className = toast.className.replace(
      /dark:bg-\w+-\d+/,
      "dark:bg-blue-900"
    );
    toast.className = toast.className.replace(
      /dark:text-\w+-\d+/,
      "dark:text-blue-200"
    );
    toast.className = toast.className.replace(
      /dark:border-\w+-\d+/,
      "dark:border-blue-700"
    );
  }

  toastMessage.textContent = message;
  toast.classList.remove("opacity-0");
  toast.classList.remove("pointer-events-none");

  setTimeout(() => {
    toast.classList.add("opacity-0");
    toast.classList.add("pointer-events-none");
  }, 3000);
}

// Render daftar todos
function renderTodos() {
  // Filter todos berdasarkan filter yang dipilih
  let filteredTodos = todos;
  if (currentFilter === "active") {
    filteredTodos = todos.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter((t) => t.completed);
  }

  // Sort todos berdasarkan pengurutan yang dipilih
  filteredTodos = sortTodos(filteredTodos, currentSort);

  // Tampilkan state kosong jika tidak ada todos
  if (filteredTodos.length === 0) {
    todoList.innerHTML = emptyState.outerHTML;
    return;
  }

  // Render todos
  todoList.innerHTML = "";
  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    // Format tanggal
    const formattedDate = formatDate(todo.date);

    // Tentukan kelas CSS berdasarkan prioritas
    let priorityClass = "";
    let priorityText = "";
    switch (todo.priority) {
      case "high":
        priorityClass = "text-red-600 dark:text-red-400";
        priorityText = "Tinggi";
        break;
      case "medium":
        priorityClass = "text-yellow-600 dark:text-yellow-400";
        priorityText = "Sedang";
        break;
      case "low":
        priorityClass = "text-green-600 dark:text-green-400";
        priorityText = "Rendah";
        break;
    }

    // Tentukan ikon berdasarkan kategori
    let categoryIcon = "";
    let categoryText = "";
    switch (todo.category) {
      case "personal":
        categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>`;
        categoryText = "Pribadi";
        break;
      case "work":
        categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>`;
        categoryText = "Pekerjaan";
        break;
      case "shopping":
        categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>`;
        categoryText = "Belanja";
        break;
      case "health":
        categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>`;
        categoryText = "Kesehatan";
        break;
      default:
        categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>`;
        categoryText = "Lainnya";
    }

    li.innerHTML = `
            <div class="p-4 flex items-start">
              <!-- Checkbox -->
              <div class="flex items-center h-5 mt-1 mr-4">
                <input
                  type="checkbox"
                  ${todo.completed ? "checked" : ""}
                  class="h-5 w-5 rounded border-gray-300 text-custom-primary focus:ring-custom-primary"
                  onchange="toggleComplete('${todo.id}')"
                />
              </div>
              
              <!-- Konten -->
              <div class="flex-1 min-w-0">
                <!-- Header: Judul, Prioritas, dan Tanggal -->
                <div class="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <h3 class="${
                    todo.completed
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  } font-medium text-lg break-words">
                    ${todo.title}
                  </h3>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium px-2 py-1 rounded-full ${priorityClass} bg-opacity-20 ${
      todo.priority === "high"
        ? "bg-red-100 dark:bg-red-900"
        : todo.priority === "medium"
        ? "bg-yellow-100 dark:bg-yellow-900"
        : "bg-green-100 dark:bg-green-900"
    }">
                      ${priorityText}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      ${formattedDate}
                    </span>
                  </div>
                </div>
                
                <!-- Kategori dan Catatan -->
                <div class="mb-3">
                  <span class="inline-flex items-center text-xs font-medium text-custom-neutral dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                    ${categoryIcon}
                    ${categoryText}
                  </span>
                </div>
                <p class="${
                  todo.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-600 dark:text-gray-300"
                } break-words">
                  ${todo.notes}
                </p>
              </div>
              
            <!-- Tombol Aksi -->
              <div class="ml-4 flex flex-col gap-2">
                <button
                  onclick="openModal('${todo.id}')"
                  class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onclick="openDeleteModal('${todo.id}')"
                  class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                  title="Hapus"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          `;

    todoList.appendChild(li);
  });
}

// Urutkan todos berdasarkan kriteria
function sortTodos(todos, criteria) {
  return [...todos].sort((a, b) => {
    switch (criteria) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
      case "due-date":
        return new Date(a.date) - new Date(b.date);
      case "priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return 0;
    }
  });
}

// Format tanggal untuk ditampilkan
function formatDate(dateString) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
}

// Cek tema yang disimpan di localStorage
function checkSavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
    document.querySelector(".theme-text").textContent = "Mode Terang";
  } else {
    document.documentElement.classList.remove("dark");
    document.querySelector(".theme-text").textContent = "Mode Gelap";
  }
}

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  checkSavedTheme();
  initApp();
});

// Ekspos fungsi ke global scope untuk event handler inline
window.toggleComplete = toggleComplete;
window.openModal = openModal;
window.openDeleteModal = openDeleteModal;
