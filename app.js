// DOM Elements
const calculatorTab = document.getElementById('calculator-tab');
const historyTab = document.getElementById('history-tab');
const calculatorSection = document.getElementById('calculator');
const historySection = document.getElementById('history');
const priceForm = document.getElementById('price-form');
const resultsSection = document.getElementById('results');
const saveResultBtn = document.getElementById('save-result');
const historyList = document.getElementById('history-list');
const clearAllBtn = document.getElementById('clear-all');
const snackbar = document.getElementById('snackbar');

// Result display elements
const totalKiloElement = document.getElementById('total-kilo');
const totalQuintalElement = document.getElementById('total-quintal');
const marketValueElement = document.getElementById('market-value');
const buyAElement = document.getElementById('buy-a');
const buyBElement = document.getElementById('buy-b');
const differenceAElement = document.getElementById('difference-a');
const differenceBElement = document.getElementById('difference-b');
const tindakElement = document.getElementById('tindak');
// Fokus hasil
const totalQuintalFocus = document.getElementById('total-quintal-focus');
const buyAFocus = document.getElementById('buy-a-focus');
const buyBFocus = document.getElementById('buy-b-focus');

// Current calculation data
let currentCalculation = null;

// Tab switching
calculatorTab.addEventListener('click', () => switchTab('calculator'));
historyTab.addEventListener('click', () => {
    switchTab('history');
    loadHistory();
});

function switchTab(tabName) {
    // Update active tab
    calculatorTab.classList.remove('active');
    historyTab.classList.remove('active');
    
    // Hide all sections
    calculatorSection.classList.remove('active');
    historySection.classList.remove('active');
    
    // Show selected tab and section
    if (tabName === 'calculator') {
        calculatorTab.classList.add('active');
        calculatorSection.classList.add('active');
    } else {
        historyTab.classList.add('active');
        historySection.classList.add('active');
    }
}

// Format number to Indonesian Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format Rupiah after removing last three digits
function formatRupiahTrimLastThree(amount) {
    return formatRupiah(amount / 1000);
}

// Format general number with thousand separators and decimal comma
function formatNumberId(value, fractionDigits = 2) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(value);
}

// Shift last three digits to decimals (divide by 1000) and show 2 decimal places
function formatShiftThreeToDecimal(value) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 1000);
}

// Calculate results
function calculateResults(formData) {
    const swatLength = parseFloat(formData.swatLength);
    const ceblokPerMeter = parseFloat(formData.ceblokPerMeter);
    const swatWidth = parseFloat(formData.swatWidth);
    const totalSwat = parseFloat(formData.totalSwat);
    const marketPrice = parseFloat(formData.marketPrice);
    
    // Perform calculations
    const kilo = ceblokPerMeter * swatLength * swatWidth * totalSwat * 25;
    const quintal = kilo / 100;
    const tindak = swatLength / 2;
    const marketValue = kilo * marketPrice;
    const buyA = kilo * (marketPrice - 9000);
    const buyB = kilo * (marketPrice - 7000);
    const differenceA = kilo * 9000;
    const differenceB = kilo * 7000;
    
    return {
        name: formData.name,
        swatLength,
        ceblokPerMeter,
        swatWidth,
        totalSwat,
        marketPrice,
        kilo,
        quintal,
        tindak,
        marketValue,
        buyA,
        buyB,
        differenceA,
        differenceB,
        timestamp: new Date().toISOString()
    };
}

// Display results
function displayResults(calculation) {
    totalKiloElement.textContent = formatShiftThreeToDecimal(calculation.kilo);
    totalQuintalElement.textContent = formatShiftThreeToDecimal(calculation.quintal);
    tindakElement.textContent = formatNumberId(calculation.tindak, 2);
    marketValueElement.textContent = formatRupiahTrimLastThree(calculation.marketValue);
    buyAElement.textContent = formatRupiahTrimLastThree(calculation.buyA);
    buyBElement.textContent = formatRupiahTrimLastThree(calculation.buyB);
    differenceAElement.textContent = formatRupiahTrimLastThree(calculation.differenceA);
    differenceBElement.textContent = formatRupiahTrimLastThree(calculation.differenceB);

    // Update focus summary elements
    if (totalQuintalFocus) totalQuintalFocus.textContent = formatNumberId(calculation.quintal, 2);
    if (buyAFocus) buyAFocus.textContent = formatRupiah(calculation.buyA);
    if (buyBFocus) buyBFocus.textContent = formatRupiah(calculation.buyB);

    // Sync focus values to match main values exactly
    if (totalQuintalFocus) totalQuintalFocus.textContent = totalQuintalElement.textContent;
    if (buyAFocus) buyAFocus.textContent = buyAElement.textContent;
    if (buyBFocus) buyBFocus.textContent = buyBElement.textContent;
    
    resultsSection.classList.remove('hidden');
    currentCalculation = calculation;
}

// Form submission
priceForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const swatLength = parseFloat(document.getElementById('swat-length').value);
    const ceblokPerMeter = parseFloat(document.getElementById('ceblok-per-meter').value);
    const swatWidth = parseFloat(document.getElementById('swat-width').value);
    const totalSwat = parseFloat(document.getElementById('total-swat').value);
    const marketPrice = parseFloat(document.getElementById('market-price').value);

    if (!name || ![swatLength, ceblokPerMeter, swatWidth, totalSwat, marketPrice].every(v => Number.isFinite(v) && v > 0)) {
        showSnackbar('Isi semua input dengan nilai lebih dari 0');
        return;
    }
    
    const formData = { name, swatLength, ceblokPerMeter, swatWidth, totalSwat, marketPrice };
    const calculation = calculateResults(formData);
    displayResults(calculation);
});

// Save result to localStorage
saveResultBtn.addEventListener('click', () => {
    if (!currentCalculation) {
        showSnackbar('Tidak ada hasil untuk disimpan');
        return;
    }
    
    // Get existing history or initialize empty array
    const history = JSON.parse(localStorage.getItem('onionPriceHistory')) || [];
    
    // Add current calculation to history
    history.push(currentCalculation);
    
    // Save back to localStorage
    localStorage.setItem('onionPriceHistory', JSON.stringify(history));
    
    showSnackbar('Hasil berhasil disimpan');
    
    // Switch to history tab
    switchTab('history');
    loadHistory();
});

// Load history from localStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('onionPriceHistory')) || [];
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-item"><p>Tidak ada riwayat perhitungan</p></div>';
        return;
    }
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <div class="history-row">
                <div class="history-info">
                    <div class="history-name">${item.name}</div>
                    <div class="history-date">${new Date(item.timestamp).toLocaleString('id-ID')}</div>
                </div>
                <div class="history-value">${formatShiftThreeToDecimal(item.quintal)} kuintal</div>
                <button class="btn-delete" data-index="${index}">Hapus</button>
            </div>
            <div class="history-group">
                <div class="history-group-title">Data Input</div>
                <div class="history-details">
                    <div>Nama: ${item.name}</div>
                    <div>Panjang Swat (m): ${item.swatLength}</div>
                    <div>Ceblok Per Meter: ${item.ceblokPerMeter}</div>
                    <div>Lebar Swat: ${item.swatWidth}</div>
                    <div>Total Swat: ${item.totalSwat}</div>
                    <div>Harga Pasar Saat Ini: ${formatRupiah(item.marketPrice)}</div>
                </div>
            </div>
            <div class="history-group">
                <div class="history-group-title">Hasil Analisa</div>
                <div class="history-details">
                    <div>Total Kilogram: ${formatShiftThreeToDecimal(item.kilo)} kg</div>
                    <div class="text-blue">Total Kuintal: ${formatShiftThreeToDecimal(item.quintal)} kuintal</div>
                    <div>Tindak: ${formatNumberId(item.tindak, 2)}</div>
                    <div>Nilai Berdasarkan Harga Pasar: ${formatRupiahTrimLastThree(item.marketValue)}</div>
                    <div class="text-green">Harga Beli Kategori A: ${formatRupiahTrimLastThree(item.buyA)}</div>
                    <div class="text-yellow">Harga Beli Kategori B: ${formatRupiahTrimLastThree(item.buyB)}</div>
                    <div>Selisih Harga Kategori A: ${formatRupiahTrimLastThree(item.differenceA)}</div>
                    <div>Selisih Harga Kategori B: ${formatRupiahTrimLastThree(item.differenceB)}</div>
                </div>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            deleteHistoryItem(index);
        });
    });
}

// Delete single history item
function deleteHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('onionPriceHistory')) || [];
    
    if (index >= 0 && index < history.length) {
        if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
        history.splice(index, 1);
        localStorage.setItem('onionPriceHistory', JSON.stringify(history));
        loadHistory();
        showSnackbar('Item dihapus');
    }
}

// Show snackbar notification
function showSnackbar(message) {
    snackbar.textContent = message;
    snackbar.classList.add('show');
    
    setTimeout(() => {
        snackbar.classList.remove('show');
    }, 3000);
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show custom install button or notification
    setTimeout(() => {
        if (confirm('Ingin menginstal aplikasi ini untuk pengalaman yang lebih baik?')) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        }
    }, 3000);
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize the app
loadHistory();