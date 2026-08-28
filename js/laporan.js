const URL_API = "https://script.google.com/macros/s/AKfycbyXWf7YwOqywAxNb28oS2_fSsfqnd9ooz6pEKs-YKbTnRNBE2_i8X8xUmpbVn-PVxyc/exec";

function formatRp(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
}

// Fungsi mengubah YYYY-MM-DD jadi tanggal lokal yang enak dibaca
function formatTanggalLokal(tglString) {
    const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(tglString).toLocaleDateString('id-ID', opsi);
}

document.getElementById('btnCariLaporan').addEventListener('click', async () => {
    const tanggal = document.getElementById('inputTanggal').value;
    if (!tanggal) return alert("Pilih tanggal terlebih dahulu!");

    document.getElementById('btnCariLaporan').innerHTML = "Mencari...";

    try {
        // Kita bisa pakai fungsi get_dashboard karena sudah mengambil data per tanggal
        const respon = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({ action: "get_dashboard", date: tanggal })
        });
        
        const hasil = await respon.json();

        if (hasil.status === "success") {
            const data = hasil.data;
            document.getElementById('labelTanggalLaporan').innerText = formatTanggalLokal(tanggal);

            let htmlTruk = "";
            let htmlKeluar = "";

            // Pisahkan transaksi Truk dan Pengeluaran
            data.transaksi.forEach(trx => {
                if (trx.jenis === "Pemasukan" && trx.subjenis === "Truk Bayar") {
                    let detailSplit = trx.detail.split(" - "); // Memecah: Nopol - Sopir - Material
                    htmlTruk += `<tr>
                        <td>${detailSplit[0] || '-'}</td>
                        <td>${detailSplit[1] || '-'}</td>
                        <td>${detailSplit[2] || '-'}</td>
                        <td>${trx.pembayaran}</td>
                        <td class="text-end">${formatRp(trx.nominal)}</td>
                    </tr>`;
                } else if (trx.jenis === "Pengeluaran") {
                    htmlKeluar += `<tr>
                        <td>${trx.detail}</td>
                        <td>${trx.pj}</td>
                        <td class="text-end">${formatRp(trx.nominal)}</td>
                    </tr>`;
                }
            });

            document.getElementById('tabelLapTruk').innerHTML = htmlTruk || `<tr><td colspan="5" class="text-center">Tidak ada pemasukan truk</td></tr>`;
            document.getElementById('tabelLapPengeluaran').innerHTML = htmlKeluar || `<tr><td colspan="3" class="text-center">Tidak ada pengeluaran</td></tr>`;

            // Rekap Akhir
            document.getElementById('lapRit').innerText = data.total_rit + " Rit";
            document.getElementById('lapMasuk').innerText = formatRp(data.total_pemasukan);
            document.getElementById('lapKeluar').innerText = formatRp(data.total_pengeluaran);
            document.getElementById('lapSaldo').innerText = formatRp(data.saldo);

        }
    } catch (e) {
        alert("Gagal koneksi ke server.");
    }

    document.getElementById('btnCariLaporan').innerHTML = "Tampilkan Laporan";
});

// Set default tanggal hari ini
window.addEventListener('DOMContentLoaded', () => {
    let today = new Date().toISOString().split('T')[0];
    document.getElementById('inputTanggal').value = today;
    document.getElementById('btnCariLaporan').click();
});
