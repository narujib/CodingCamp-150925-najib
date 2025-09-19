// ===== VARIABEL GLOBAL =====
let todos = JSON.parse(localStorage.getItem("todos")) || []; // Menyimpan semua tugas
let currentFilter = "all"; // Filter aktif: all, active, completed
let currentDeleteId = null; // ID tugas yang akan dihapus
let currentSort = "newest"; // Metode sorting default
let isEditMode = false; // Status mode edit

// ===== INISIALISASI ELEMEN DOM =====
const btn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;
const themeText = document.querySelector(".theme-text");
const addTaskBtn = document.getElementById("add-task-btn");
const addTaskModal = document.getElementById("add-task-modal");
const modalTitle = document.getElementById("modal-title");
const closeModalBtn = document.getElementById("close-modal");
const cancelFormBtn = document.getElementById("cancel-form");
const todoForm = document.getElementById("todo-form");
const editIdField = document.getElementById("edit-id");
const todoTitle = document.getElementById("todo-title");
const todoDate = document.getElementById("todo-date");
const todoCategory = document.getElementById("todo-category");
const todoPriority = document.getElementById("todo-priority");
const todoNotes = document.getElementById("todo-notes");
const titleError = document.getElementById("title-error");
const dateError = document.getElementById("date-error");
const categoryError = document.getElementById("category-error");
const notesError = document.getElementById("notes-error");
const submitButtonText = document.getElementById("submit-button-text");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sort-select");
const clearCompletedBtn = document.getElementById("clear-completed");
const activeCountElement = document.getElementById("active-count");
const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const confirmDeleteBtn = document.getElementById("confirm-delete");

// ===== FUNGSI THEME/DARK MODE =====
// Fungsi untuk toggle theme
function toggleTheme() {
  if (htmlElement.classList.contains("dark")) {
    htmlElement.classList.remove("dark");
    htmlElement.classList.add("light");
    localStorage.setItem("theme", "light");
    themeText.textContent = "Mode Gelap";
  } else {
    htmlElement.classList.remove("light");
    htmlElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    themeText.textContent = "Mode Terang";
  }
}

// ===== FUNGSI MANAJEMEN MODAL =====
// Buka modal tambah tugas
addTaskBtn.addEventListener("click", () => {
  isEditMode = false;
  modalTitle.textContent = "Tambah Tugas Baru";
  submitButtonText.textContent = "Tambah Tugas";
  addTaskModal.classList.add("active");
});

// Tutup modal
closeModalBtn.addEventListener("click", () => {
  addTaskModal.classList.remove("active");
  resetForm();
});

// Batal dari form
cancelFormBtn.addEventListener("click", () => {
  addTaskModal.classList.remove("active");
  resetForm();
});

// Batal hapus
cancelDeleteBtn.addEventListener("click", () => {
  deleteConfirmModal.classList.remove("active");
  currentDeleteId = null;
});

// Tutup modal saat klik di luar
window.addEventListener("click", (e) => {
  if (e.target === addTaskModal) {
    addTaskModal.classList.remove("active");
    resetForm();
  }
  if (e.target === deleteConfirmModal) {
    deleteConfirmModal.classList.remove("active");
    currentDeleteId = null;
  }
});

// ===== FUNGSI SORTING =====
// Event listener untuk perubahan sorting
sortSelect.addEventListener("change", function () {
  currentSort = this.value;
  renderTodos();
});

// ===== FUNGSI FORM TUGAS =====
// Handle submit form (tambah/edit tugas)
todoForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Validasi form
  if (!validateForm()) return;

  if (isEditMode) {
    // Update tugas yang sudah ada
    updateTodo();
  } else {
    // Tambah tugas baru
    addNewTodo();
  }

  // Simpan, render ulang, dan reset form
  saveTodos();
  renderTodos();
  updateStats();
  addTaskModal.classList.remove("active");
  resetForm();
});

// Validasi form
function validateForm() {
  // Reset error messages
  titleError.classList.add("hidden");
  dateError.classList.add("hidden");
  categoryError.classList.add("hidden");
  notesError.classList.add("hidden");
  todoTitle.classList.remove("border-red-500");
  todoDate.classList.remove("border-red-500");
  todoCategory.classList.remove("border-red-500");
  todoNotes.classList.remove("border-red-500");

  let isValid = true;

  // Validasi judul
  if (!todoTitle.value.trim()) {
    titleError.classList.remove("hidden");
    todoTitle.classList.add("border-red-500");
    isValid = false;
  }

  // Validasi tanggal
  if (!todoDate.value) {
    dateError.classList.remove("hidden");
    todoDate.classList.add("border-red-500");
    isValid = false;
  }

  // Validasi kategori
  if (!todoCategory.value) {
    categoryError.classList.remove("hidden");
    todoCategory.classList.add("border-red-500");
    isValid = false;
  }

  // Validasi catatan
  if (!todoNotes.value.trim()) {
    notesError.classList.remove("hidden");
    todoNotes.classList.add("border-red-500");
    isValid = false;
  }

  return isValid;
}

// Tambah tugas baru
function addNewTodo() {
  const newTodo = {
    id: Date.now(),
    title: todoTitle.value.trim(),
    date: todoDate.value,
    category: todoCategory.value,
    priority: todoPriority.value,
    notes: todoNotes.value.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
}

// Update tugas yang sudah ada
function updateTodo() {
  const id = parseInt(editIdField.value);
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        title: todoTitle.value.trim(),
        date: todoDate.value,
        category: todoCategory.value,
        priority: todoPriority.value,
        notes: todoNotes.value.trim(),
      };
    }
    return todo;
  });
}

// Reset form ke keadaan awal
function resetForm() {
  todoForm.reset();
  editIdField.value = "";
  todoPriority.value = "medium";
  isEditMode = false;
  modalTitle.textContent = "Tambah Tugas Baru";
  submitButtonText.textContent = "Tambah Tugas";
  titleError.classList.add("hidden");
  dateError.classList.add("hidden");
  categoryError.classList.add("hidden");
  notesError.classList.add("hidden");
  todoTitle.classList.remove("border-red-500");
  todoDate.classList.remove("border-red-500");
  todoCategory.classList.remove("border-red-500");
  todoNotes.classList.remove("border-red-500");
}

// ===== FUNGSI FILTER =====
// Event listener untuk tombol filter
filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // Update filter aktif
    currentFilter = this.dataset.filter;

    // Update tampilan tombol filter
    filterButtons.forEach((btn) => {
      btn.classList.remove("bg-custom-primary", "text-white");
    });
    this.classList.add("bg-custom-primary", "text-white");

    // Render todos dengan filter baru
    renderTodos();
  });
});

// ===== FUNGSI MANAJEMEN TUGAS =====
// Hapus tugas yang sudah selesai
clearCompletedBtn.addEventListener("click", function () {
  if (todos.filter((todo) => todo.completed).length === 0) {
    alert("Tidak ada tugas yang selesai untuk dihapus!");
    return;
  }

  if (confirm("Apakah Anda yakin ingin menghapus semua tugas yang selesai?")) {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    renderTodos();
    updateStats();
  }
});

// Konfirmasi hapus tugas
confirmDeleteBtn.addEventListener("click", function () {
  if (currentDeleteId) {
    todos = todos.filter((todo) => todo.id !== currentDeleteId);
    saveTodos();
    renderTodos();
    updateStats();
    deleteConfirmModal.classList.remove("active");
    currentDeleteId = null;
  }
});

// Load todos dari localStorage
function loadTodos() {
  const storedTodos = JSON.parse(localStorage.getItem("todos"));
  if (storedTodos) {
    todos = storedTodos;
    renderTodos();
  }
}

// Simpan todos ke localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Fungsi sorting todos
function sortTodos(todos) {
  switch (currentSort) {
    case "newest":
      return todos.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case "oldest":
      return todos.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    case "az":
      return todos.sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return todos.sort((a, b) => b.title.localeCompare(a.title));
    case "due-date":
      return todos.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });
    case "priority":
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return todos.sort(
        (a, b) =>
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      );
    default:
      return todos;
  }
}

// Render daftar todos
function renderTodos() {
  // Filter todos berdasarkan filter aktif
  let filteredTodos = [];
  if (currentFilter === "active") {
    filteredTodos = todos.filter((todo) => !todo.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed);
  } else {
    filteredTodos = todos;
  }

  // Urutkan todos
  filteredTodos = sortTodos([...filteredTodos]);

  // Kosongkan daftar
  todoList.innerHTML = "";

  // Tampilkan pesan jika tidak ada tugas
  if (filteredTodos.length === 0) {
    const emptyText =
      currentFilter === "all"
        ? "Belum ada tugas. Tambahkan tugas untuk memulai!"
        : `Tidak ada tugas ${
            currentFilter === "active" ? "aktif" : "selesai"
          }.`;

    emptyState.textContent = emptyText;
    todoList.appendChild(emptyState);
    return;
  }

  // Hapus pesan kosong
  emptyState.remove();

  // Render setiap todo item
  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item p-4 hover:bg-gray-50 dark:hover:bg-gray-750";
    li.dataset.id = todo.id;

    // Format tanggal
    let dateText = "";
    if (todo.date) {
      const dateObj = new Date(todo.date);
      dateText = dateObj.toLocaleDateString("id-ID", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    // Teks dan warna untuk prioritas
    const priorityText = {
      high: "Tinggi",
      medium: "Sedang",
      low: "Rendah",
    };
    const priorityColor = { high: "red", medium: "yellow", low: "green" };

    // HTML untuk setiap todo item
    li.innerHTML = `
            <div class="flex items-start">
              <input type="checkbox" ${todo.completed ? "checked" : ""} 
                class="mt-1 h-5 w-5 text-custom-primary rounded focus:ring-custom-primary todo-checkbox">
              <div class="ml-3 flex-1">
                <div class="flex justify-between items-start">
                  <span class="block ${
                    todo.completed
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  }">${todo.title}</span>
                  <div class="flex space-x-2">
                    <button class="text-blue-500 hover:text-blue-700 edit-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button class="text-red-500 hover:text-red-700 delete-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                ${
                  todo.notes
                    ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${todo.notes}</p>`
                    : ""
                }
                <div class="flex flex-wrap items-center mt-2 text-xs text-gray-500 dark:text-gray-400 gap-2">
                  ${
                    todo.date
                      ? `<span class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    ${dateText}
                  </span>`
                      : ""
                  }
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${getCategoryColor(
                    todo.category
                  )}-100 text-${getCategoryColor(
      todo.category
    )}-800 dark:bg-${getCategoryColor(
      todo.category
    )}-900 dark:text-${getCategoryColor(todo.category)}-200">
                    ${getCategoryText(todo.category)}
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${
                    priorityColor[todo.priority]
                  }-100 text-${priorityColor[todo.priority]}-800 dark:bg-${
      priorityColor[todo.priority]
    }-900 dark:text-${priorityColor[todo.priority]}-200">
                    ${priorityText[todo.priority]}
                  </span>
                </div>
              </div>
            </div>
          `;

    todoList.appendChild(li);

    // Tambahkan event listener untuk setiap todo item
    const checkbox = li.querySelector(".todo-checkbox");
    const deleteBtn = li.querySelector(".delete-btn");
    const editBtn = li.querySelector(".edit-btn");

    // Toggle status selesai
    checkbox.addEventListener("change", function () {
      toggleTodoComplete(todo.id);
    });

    // Hapus tugas
    deleteBtn.addEventListener("click", function () {
      currentDeleteId = todo.id;
      deleteConfirmModal.classList.add("active");
    });

    // Edit tugas
    editBtn.addEventListener("click", function () {
      editTodo(todo.id);
    });
  });
}

// Toggle status selesai tugas
function toggleTodoComplete(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  updateStats();

  // Render ulang jika dalam mode filter
  if (currentFilter !== "all") {
    renderTodos();
  }
}

// Edit tugas - BUG TELAH DIPERBAIKI
function editTodo(id) {
  const todo = todos.find((todo) => todo.id === id);
  if (todo) {
    // Isi form dengan data tugas
    editIdField.value = todo.id;
    todoTitle.value = todo.title;
    todoDate.value = todo.date;
    todoCategory.value = todo.category;
    todoPriority.value = todo.priority;
    todoNotes.value = todo.notes;

    // Set mode edit
    isEditMode = true;
    modalTitle.textContent = "Edit Tugas";
    submitButtonText.textContent = "Simpan Perubahan";

    // Buka modal dan fokus ke judul
    addTaskModal.classList.add("active");
    todoTitle.focus();
  }
}

// Perbarui statistik
function updateStats() {
  const activeTodos = todos.filter((todo) => !todo.completed).length;
  activeCountElement.textContent = activeTodos;
}

// ===== FUNGSI UTILITAS =====
// Dapatkan warna untuk kategori
function getCategoryColor(category) {
  const colors = {
    personal: "purple",
    work: "blue",
    shopping: "green",
    health: "red",
    other: "gray",
  };
  return colors[category] || "gray";
}

// Dapatkan teks untuk kategori
function getCategoryText(category) {
  const texts = {
    personal: "Pribadi",
    work: "Pekerjaan",
    shopping: "Belanja",
    health: "Kesehatan",
    other: "Lainnya",
  };
  return texts[category] || "Lainnya";
}

// ===== INISIALISASI APLIKASI =====
// Event listener untuk toggle theme
btn.addEventListener("click", toggleTheme);

// Saat halaman dimuat
window.addEventListener("load", () => {
  // Load tema dari localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    htmlElement.classList.add("dark");
    themeText.textContent = "Mode Terang";
  } else {
    htmlElement.classList.add("light");
    themeText.textContent = "Mode Gelap";
  }

  // Gunakan preferensi sistem jika tidak ada yang disimpan
  if (!savedTheme) {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      themeText.textContent = "Mode Terang";
    } else {
      htmlElement.classList.add("light");
      localStorage.setItem("theme", "light");
      themeText.textContent = "Mode Gelap";
    }
  }

  // Load todos dan perbarui UI
  loadTodos();
  updateStats();

  // Set filter default aktif
  document
    .querySelector('[data-filter="all"]')
    .classList.add("bg-custom-primary", "text-white");
});

// Dengarkan perubahan preferensi tema sistem
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    // Hanya terapkan jika pengguna belum memilih tema secara manual
    if (!localStorage.getItem("theme")) {
      if (e.matches) {
        htmlElement.classList.add("dark");
        themeText.textContent = "Mode Terang";
      } else {
        htmlElement.classList.remove("dark");
        themeText.textContent = "Mode Gelap";
      }
    }
  });
