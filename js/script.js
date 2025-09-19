// ===== INISIALISASI ELEMEN DOM =====
const btn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;
const themeText = document.querySelector(".theme-text");

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
