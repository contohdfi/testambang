const URL_API = "https://script.google.com/macros/s/GANTI_DENGAN_ID_DEPLOY_ANDA/exec";

// 1. Cek Hak Akses (Role)
window.addEventListener('DOMContentLoaded', () => {
    const userData = sessionStorage.getItem('user');
    
    if (!userData) {
        window.location.href = 'index.html'; // Usir jika belum login
        return;
    }

    const user = JSON.parse(userData);
    
    if (user.role === "ADMIN") {
        document.getElementById('panelAdmin').classList.remove('d-none');
    } else {
        document.getElementById('alertAkses').classList.remove('d-none');
    }
});

// 2. Logika Checkbox
document.getElementById('cekYakin').addEventListener('change', function() {
    document.getElementById('btnTutupPeriode').disabled = !this.checked;
});

// 3. Proses Tutup Periode
document.getElementById('btnTutupPeriode').addEventListener('click', async () => {
    let konfirmasi = confirm("PERINGATAN!\n\nSeluruh data transaksi di dashboard akan dikosongkan dan dipindah ke arsip (Spreadsheet). Lanjutkan?");
    
    if (!konfirmasi) return;

    const btn = document.getElementById('btnTutupPeriode');
    btn.innerHTML = "Memproses Arsip..."; btn.disabled = true;

    const user = JSON.parse(sessionStorage.getItem('user'));

    try {
        const respon = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ 
                action: "close_period", 
                userRole: user.role // Backend akan menolak jika role bukan ADMIN
            })
        });

        const hasil = await respon.json();

        if (hasil.status === "success") {
            alert("✅ Berhasil! " + hasil.message);
            // Uncheck box
            document.getElementById('cekYakin').checked = false;
            btn.innerHTML = "Tutup Periode Sekarang";
        } else {
            alert("❌ Gagal: " + hasil.message);
            btn.innerHTML = "Tutup Periode Sekarang"; btn.disabled = false;
        }
    } catch (e) {
        alert("Terjadi kesalahan koneksi.");
        btn.innerHTML = "Tutup Periode Sekarang"; btn.disabled = false;
    }
});
