// Ganti URL ini dengan URL Web App Google Apps Script Anda
const URL_API = "https://script.google.com/macros/s/AKfycbyXWf7YwOqywAxNb28oS2_fSsfqnd9ooz6pEKs-YKbTnRNBE2_i8X8xUmpbVn-PVxyc/exec";

// 1. MENGATUR FORM DINAMIS (Tampil/Sembunyikan Field)
const selectJenis = document.getElementById('jenisTransaksi');
const selectSubJenis = document.getElementById('subJenisTransaksi');

const wadahSubJenis = document.getElementById('wadahSubJenis');
const wadahFormTruk = document.getElementById('wadahFormTruk');
const wadahFormUmum = document.getElementById('wadahFormUmum');

// Ketika "Jenis Transaksi" diubah
selectJenis.addEventListener('change', function() {
    let jenis = this.value;
    
    // Reset semua form setiap kali jenis berubah
    wadahSubJenis.classList.add('d-none');
    wadahFormTruk.classList.add('d-none');
    wadahFormUmum.classList.add('d-none');
    selectSubJenis.value = ""; 
    document.getElementById('formTransaksi').reset();
    this.value = jenis; // Kembalikan nilai jenis yang baru dipilih

    if (jenis === 'Pemasukan') {
        wadahSubJenis.classList.remove('d-none');
    } else if (jenis === 'Pengeluaran') {
        wadahFormUmum.classList.remove('d-none');
        document.getElementById('rincian').value = ""; // Dikosongkan untuk diketik manual
    }
});

// Ketika "Kategori Pemasukan" diubah
selectSubJenis.addEventListener('change', function() {
    let subJenis = this.value;

    if (subJenis === 'Truk Bayar') {
        wadahFormTruk.classList.remove('d-none');
        wadahFormUmum.classList.remove('d-none');
        
        // Auto-isi rincian agar petugas tidak repot ngetik
        document.getElementById('rincian').value = "Pembayaran Truk (Rit)";
        
        // Buat input truk menjadi wajib diisi (required)
        document.getElementById('nopol').required = true;
        document.getElementById('material').required = true;
        document.getElementById('pembayaran').required = true;
    } 
    else if (subJenis === 'Pemasukan Biasa') {
        wadahFormTruk.classList.add('d-none');
        wadahFormUmum.classList.remove('d-none');
        
        document.getElementById('rincian').value = ""; // Dikosongkan
        
        // Hapus wajib isi (required) pada form truk
        document.getElementById('nopol').required = false;
        document.getElementById('material').required = false;
        document.getElementById('pembayaran').required = false;
    } else {
        wadahFormTruk.classList.add('d-none');
        wadahFormUmum.classList.add('d-none');
    }
});

// 2. MENGIRIM DATA KE SERVER SAAT DISIMPAN
document.getElementById('formTransaksi').addEventListener('submit', async function(e) {
    e.preventDefault(); // Mencegah halaman refresh
    
    const btnSimpan = document.getElementById('btnSimpan');
    btnSimpan.innerHTML = "⏳ Sedang Menyimpan...";
    btnSimpan.disabled = true;

    // Ambil data User dari sistem login (SessionStorage)
    let userData = sessionStorage.getItem('user');
    let username = "Anonim";
    if (userData) {
        let user = JSON.parse(userData);
        username = user.username;
    }

    // Cek apakah ini transaksi truk
    let isTruk = !wadahFormTruk.classList.contains('d-none');

    // Susun data (Payload) yang akan dikirim ke Spreadsheet
    const payload = {
        jenis: document.getElementById('jenisTransaksi').value,
        subjenis: selectJenis.value === 'Pemasukan' ? selectSubJenis.value : "-",
        rincian: document.getElementById('rincian').value,
        nominal: document.getElementById('nominal').value,
        pj: document.getElementById('pj').value,
        keterangan: document.getElementById('keterangan').value,
        // Data truk (Jika bukan truk, otomatis isi tanda strip "-")
        nopol: isTruk ? document.getElementById('nopol').value : "-",
        sopir: isTruk ? document.getElementById('sopir').value : "-",
        material: isTruk ? document.getElementById('material').value : "-",
        pembayaran: isTruk ? document.getElementById('pembayaran').value : "-"
    };

    try {
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ 
                action: "save_transaction", 
                payload: payload, 
                user: username 
            })
        });

        const data = await response.json();

        if (data.status === "success") {
            alert("✅ Transaksi Berhasil Disimpan!");
            
            // Reset form kembali seperti awal
            this.reset();
            wadahSubJenis.classList.add('d-none');
            wadahFormTruk.classList.add('d-none');
            wadahFormUmum.classList.add('d-none');
        } else {
            alert("❌ Gagal menyimpan: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Terjadi kesalahan! Cek koneksi internet Anda.");
    }

    // Kembalikan tombol ke keadaan semula
    btnSimpan.innerHTML = "💾 Simpan Transaksi";
    btnSimpan.disabled = false;
});
