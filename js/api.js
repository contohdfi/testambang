// Ganti dengan URL Web App dari Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbyXWf7YwOqywAxNb28oS2_fSsfqnd9ooz6pEKs-YKbTnRNBE2_i8X8xUmpbVn-PVxyc/exec";

// Cek sesi login
function checkAuth() {
    const user = localStorage.getItem("user_tambang");
    if (!user && !window.location.href.includes("index.html")) {
        window.location.href = "index.html";
    }
}
