// Mengatur tampilan form dinamis
function toggleForm() {
    const jenis = document.getElementById("jenis").value;
    const subjenis = document.getElementById("subjenis").value;
    
    const divSubjenis = document.getElementById("divSubjenis");
    const formTruk = document.getElementById("formTruk");
    const formUmum = document.getElementById("formUmum");
    const btnSubmit = document.getElementById("btnSubmit");

    // Reset status tampilan
    divSubjenis.classList.add("d-none");
    formTruk.classList.add("d-none");
    formUmum.classList.add("d-none");
    btnSubmit.disabled = true;

    if (jenis === "Pemasukan") {
        divSubjenis.classList.remove("d-none");
        formUmum.classList.remove("d-none");
        btnSubmit.disabled = false;
        
        if (subjenis === "Truk Bayar") {
            formTruk.classList.remove("d-none");
            document.getElementById("rincian").value = "Pembayaran Truk"; // Default text
        }
    } else if (jenis === "Pengeluaran") {
        formUmum.classList.remove("d-none");
        btnSubmit.disabled = false;
        document.getElementById("rincian").value = ""; 
    }
}

// Menangani Submit
document.getElementById("formTransaksi").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Ambil user dari localStorage
    const user = JSON.parse(localStorage.getItem("user_tambang") || '{"nama":"Anonim"}');
    
    // Siapkan Form Data
    const formData = new FormData(this);
    formData.append("action", "save_transaksi");
    formData.append("user", user.nama);

    // Validasi tambahan
    if(formData.get("jenis") === "Pemasukan" && formData.get("subjenis") === "Truk Bayar") {
        if(!formData.get("nopol") || !formData.get("sopir")) {
            Swal.fire('Error', 'Nopol dan Sopir wajib diisi untuk transaksi truk!', 'error');
            return;
        }
    }

    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false });
    Swal.showLoading();

    try {
        const response = await fetch(API_URL, { method: "POST", body: formData });
        const result = await response.json();

        if (result.status === "success") {
            Swal.fire('Berhasil!', result.message, 'success').then(() => {
                this.reset();
                toggleForm();
            });
        } else {
            Swal.fire('Gagal!', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error!', 'Koneksi ke server gagal.', 'error');
    }
});
