// Ganti URL ini dengan URL Web App Google Apps Script yang sudah Anda Deploy
const URL_API = "https://script.google.com/macros/s/AKfycbyXWf7YwOqywAxNb28oS2_fSsfqnd9ooz6pEKs-YKbTnRNBE2_i8X8xUmpbVn-PVxyc/exec";

// Fungsi untuk mengubah angka menjadi format Rupiah (contoh: Rp 5.000.000)
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Fungsi utama untuk memuat data Dashboard Harian
async function muatDashboardHarian() {
    // 1. Dapatkan tanggal hari ini dengan format YYYY-MM-DD
    const hariIni = new Date().toISOString().split('T')[0]; 
    
    try {
        // 2. Minta data ke server (Google Apps Script)
        const response = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ 
                action: "get_dashboard", 
                date: hariIni 
            })
        });
        
        // 3. Ubah respon dari server menjadi objek JSON
        const hasil = await response.json();
        
        if (hasil.status === "success") {
            const data = hasil.data;

            // 4. Update Angka di Card Statistik
            document.getElementById('teksPemasukan').innerText = formatRupiah(data.total_pemasukan);
            document.getElementById('teksPengeluaran').innerText = formatRupiah(data.total_pengeluaran);
            document.getElementById('teksSaldo').innerText = formatRupiah(data.saldo);
            document.getElementById('teksRit').innerText = data.total_rit + " Rit";

            // 5. Update Tabel Transaksi
            const tabelContainer = document.getElementById('tabelTransaksi');
            tabelContainer.innerHTML = ""; // Kosongkan isi tabel sebelumnya

            // Jika tidak ada transaksi hari ini
            if(data.transaksi.length === 0) {
                tabelContainer.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Belum ada transaksi hari ini.</td></tr>`;
                return;
            }

            // Looping/Ulangi untuk setiap baris transaksi
            data.transaksi.forEach(trx => {
                // Tentukan warna teks (Pemasukan = hijau, Pengeluaran = merah)
                let warnaJenis = trx.jenis === "Pemasukan" ? "text-success fw-bold" : "text-danger fw-bold";
                
                // Tentukan warna label badge untuk Bon / Cash
                let warnaStatus = trx.pembayaran === "Bon" ? "bg-warning text-dark" : "bg-info text-dark";
                if(trx.pembayaran === "-") warnaStatus = "bg-secondary"; // Untuk pengeluaran

                // Buat struktur baris HTML (<tr>)
                let baris = `
                    <tr>
                        <td>${trx.waktu}</td>
                        <td class="${warnaJenis}">${trx.jenis}</td>
                        <td>${trx.detail}</td>
                        <td>${formatRupiah(trx.nominal)}</td>
                        <td>${trx.pj}</td>
                        <td><span class="badge ${warnaStatus}">${trx.pembayaran}</span></td>
                    </tr>
                `;
                
                // Tambahkan baris ke dalam tabel
                tabelContainer.innerHTML += baris;
            });
        } else {
            alert("Gagal memuat data: " + hasil.message);
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        alert("Gagal terhubung ke database. Pastikan koneksi internet lancar.");
    }
}

// Jalankan fungsi otomatis saat halaman pertama kali dibuka
window.addEventListener('DOMContentLoaded', () => {
    muatDashboardHarian();
});
