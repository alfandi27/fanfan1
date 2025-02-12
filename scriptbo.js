   function showSuccessMessage(message) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Fungsi untuk menampilkan pesan error
  function showErrorMessage(message) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message
    });
  }

// Fungsi untuk memperbarui daftar transaksi
    function renderTransactions() {
  transactionList.innerHTML = transactions.map((t, index) => {
    const typeText = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    const categoryLabel = getCategoryLabel(t.type, t.category); // 🔹 Ambil label kategori
    return `
      <tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="toggleDetails(${index}, event)">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(t.date)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-3 py-1 text-xs font-medium rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
            ${typeText} <!-- 🔹 Ganti dari t.type menjadi typeText -->
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${categoryLabel}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'} font-medium">
          ${formatCurrency(t.amount)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <button onclick="deleteTransaction(${index})" class="text-red-600 hover:text-red-900 transition-colors">Delete</button>
        </td>
      </tr>
      <tr id="details-${index}" class="hidden bg-gray-50">
        <td colspan="5" class="px-6 py-4">
          <div class="text-sm space-y-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="font-medium text-gray-700">Transaction Details:</p>
                <p class="text-gray-600">Date: ${formatDate(t.date)}</p>
                <p class="text-gray-600">Category: ${t.category}</p>
                <p class="text-gray-600">Amount: ${formatCurrency(t.amount)}</p>
              </div>
              <div>
                <p class="font-medium text-gray-700">Notes:</p>
                <p class="text-gray-600">${t.notes || 'No notes added'}</p>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  updateTransactionCount();
}

function renderBudgetProgress() {
  const { totalBudget, totalSpent, percentage } = calculateTotalBudgetProgress();
  const isOverBudget = totalSpent > totalBudget;

  const progressContainer = document.getElementById('total-budget-progress');
  progressContainer.innerHTML = `
    <div>
      <h4 class="text-lg font-semibold text-gray-700">Maksimal Anggaran</h4>
      <p class="text-sm text-gray-600">
        ${formatCurrency(totalSpent)} / ${formatCurrency(totalBudget)} 
        (${percentage.toFixed(1)}%)
      </p>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div class="h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}"
             style="width: ${Math.min(percentage, 100)}%;"></div>
      </div>
    </div>
  `;
}

// Update transaction count badge
    function updateTransactionCount() {
      const count = transactions.length;
      document.getElementById('transaction-count').textContent = `${count} Transaksi${count !== 1 ? '' : ''}`;
    }

    // Fungsi untuk memperbarui opsi kategori
    function updateCategories() {
      const typeSelect = document.getElementById('type');
      const categorySelect = document.getElementById('category');
      const selectedType = typeSelect.value;

      categories = JSON.parse(localStorage.getItem("categories")) || { income: [], expense: [] };

      if (!categories.income.length || !categories.expense.length) {
    showErrorMessage("Kategori belum tersedia. Silakan klik 'Perbarui Kategori' terlebih dahulu.");
    return;
  }  
  categorySelect.innerHTML = ''; 
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Pilih Kategori --';
      categorySelect.appendChild(defaultOption);
      
      categories[selectedType].forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        categorySelect.appendChild(option);
      });
    }

    function getCategoryLabel(type, value) {
  const categories = JSON.parse(localStorage.getItem("categories")) || { income: [], expense: [] };

  // 🔹 Cari kategori berdasarkan value
  const category = categories[type]?.find(cat => cat.value === value);
  return category ? category.label : value; // Jika tidak ditemukan, tampilkan value asli
}

   function formatCurrency(amount) {
      return `Rp${amount.toLocaleString('id-ID')}`;
    }

    // Fungsi format date
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    // Fungsi untuk toggle detail transaksi
    function toggleDetails(index, event) {
      if (event.target.tagName === 'BUTTON') {
        return;
      }
      const detailsRow = document.getElementById(`details-${index}`);
      if (detailsRow) {
        detailsRow.classList.toggle('hidden');
      }
    }

// Fungsi untuk merender daftar budget
function renderBudgetList() {
  const budgetList = document.getElementById('budget-list');
  const monthlyExpenses = calculateBudgetUsage();
  const sortType = document.getElementById('budget-sort').value;
  
  // Buat array dari entries budget dengan informasi persentase
  let budgetEntries = Object.entries(budgets).map(([category, budget]) => {
    const spent = monthlyExpenses[category] || 0;
    const percentage = budget > 0 ? (spent / budget * 100) : 0;
    const categoryLabel = categories.expense.find(c => c.value === category)?.label;
    
    return {
      category,
      categoryLabel,
      budget,
      spent,
      percentage
    };
  });
  
  // Urutkan berdasarkan pilihan user
  switch(sortType) {
    case 'highest':
      budgetEntries.sort((a, b) => b.percentage - a.percentage);
      break;
    case 'lowest':
      budgetEntries.sort((a, b) => a.percentage - b.percentage);
      break;
    default:
      // Biarkan urutan default (berdasarkan urutan input)
      break;
  }
  
  // Render daftar yang sudah diurutkan
  budgetList.innerHTML = budgetEntries
    .map(({ category, categoryLabel, budget, spent, percentage }) => {
      const isOverBudget = percentage > 100;
      
      return `
        <div class="border rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <div>
              <h3 class="font-medium text-gray-900">${categoryLabel}</h3>
              <p class="text-sm text-gray-500">
                ${formatCurrency(spent)} dari ${formatCurrency(budget)}
                <span class="ml-2 px-2 py-1 text-xs font-medium rounded-full 
                  ${isOverBudget ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                  ${percentage.toFixed(1)}%
                </span>
              </p>
            </div>
            <button onclick="deleteBudget('${category}')" class="text-red-600 hover:text-red-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}"
                 style="width: ${Math.min(percentage, 100)}%">
            </div>
          </div>
        </div>
      `;
    })
    .join('');
    renderBudgetProgress();
}

function switchTab(tabName) {
  // Sembunyikan semua konten tab
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  // Tampilkan konten tab yang dipilih
  document.getElementById(tabName).classList.remove('hidden');
  
  // Update status aktif pada tombol tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active-tab');
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active-tab');
    }
  });

  // Jika tab transaction dipilih, perbarui chart
  if (tabName === 'transaction') {
    updateVisualization(document.getElementById('chart-period').value);
  }

  // Simpan tab yang aktif ke localStorage
  localStorage.setItem('activeTab', tabName);
}

// Fungsi untuk memuat tab terakhir yang aktif
function loadLastActiveTab() {
  const lastActiveTab = localStorage.getItem('activeTab') || 'summary';
  switchTab(lastActiveTab);
}

function showFilterModal() {
  Swal.fire({
    title: '<h2 class="text-xl font-bold text-gray-700 mb-4">Filter Transaksi</h2>',
      html: `
        <div class="grid gap-4 text-left">
          <!-- Filter Tanggal -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input type="date" id="filter-date-start" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input type="date" id="filter-date-end" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
          </div>

          <!-- Filter Tipe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select id="filter-type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          <!-- Filter Kategori -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select id="filter-category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Semua</option>
            </select>
          </div>
        </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: 'Terapkan',
    denyButtonText: 'Reset',
    cancelButtonText: 'Tutup',
    didOpen: () => {
      // Update opsi kategori saat modal dibuka
      const filterCategory = document.getElementById('filter-category');
      filterCategory.innerHTML = '<option value="">Semua</option>';
      
      // Tambahkan kategori income
      categories.income.forEach(category => {
        const option = document.createElement('option');
        option.value = `income-${category.value}`;
        option.textContent = `Income - ${category.label}`;
        filterCategory.appendChild(option);
      });
      
      // Tambahkan kategori expense
      categories.expense.forEach(category => {
        const option = document.createElement('option');
        option.value = `expense-${category.value}`;
        option.textContent = `Expense - ${category.label}`;
        filterCategory.appendChild(option);
      });

      // Set nilai-nilai filter yang sudah ada (jika ada)
      if (currentFilters) {
        document.getElementById('filter-date-start').value = currentFilters.dateStart || '';
        document.getElementById('filter-date-end').value = currentFilters.dateEnd || '';
        document.getElementById('filter-type').value = currentFilters.type || '';
        document.getElementById('filter-category').value = currentFilters.category || '';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Terapkan filter
      applyFilters();
    } else if (result.isDenied) {
      // Reset filter
      resetFilters();
    }
  });
}

// Menyimpan filter yang aktif
let currentFilters = null;

// Fungsi untuk menerapkan filter
function applyFilters() {
  const dateStart = document.getElementById('filter-date-start').value;
  const dateEnd = document.getElementById('filter-date-end').value;
  const type = document.getElementById('filter-type').value;
  const categoryValue = document.getElementById('filter-category').value;
  
  // Simpan filter yang aktif
  currentFilters = {
    dateStart,
    dateEnd,
    type,
    category: categoryValue
  };
  
  let filteredTransactions = [...transactions];
  
  // Filter berdasarkan tanggal
  if (dateStart) {
    filteredTransactions = filteredTransactions.filter(t => 
      new Date(t.date) >= new Date(dateStart)
    );
  }
  if (dateEnd) {
    filteredTransactions = filteredTransactions.filter(t => 
      new Date(t.date) <= new Date(dateEnd)
    );
  }
  
  // Filter berdasarkan tipe
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }
  
  // Filter berdasarkan kategori
  if (categoryValue) {
    const [filterType, filterCategory] = categoryValue.split('-');
    filteredTransactions = filteredTransactions.filter(t => {
      const categoryLabel = categories[filterType].find(c => c.value === filterCategory)?.label;
      return t.type === filterType && t.category === categoryLabel;
    });
  }
  
  // Update tampilan
  renderFilteredTransactions(filteredTransactions);
  
  // Tampilkan badge filter aktif jika ada filter yang diterapkan
  updateFilterBadge();
}

// Fungsi untuk mereset filter
function resetFilters() {
  currentFilters = null;
  renderTransactions();
  updateFilterBadge();
}

// Fungsi untuk memperbarui badge filter
function updateFilterBadge() {
  const filterButton = document.querySelector('button[onclick="showFilterModal()"]');
  const filterText = filterButton.querySelector('span');
  
  if (currentFilters && (currentFilters.dateStart || currentFilters.dateEnd || currentFilters.type || currentFilters.category)) {
    filterText.textContent = 'Filter Aktif';
    filterButton.classList.add('bg-blue-100', 'text-blue-600');
    filterButton.classList.remove('bg-gray-100', 'text-gray-600');
  } else {
    filterText.textContent = 'Filter';
    filterButton.classList.remove('bg-blue-100', 'text-blue-600');
    filterButton.classList.add('bg-gray-100', 'text-gray-600');
  }
}

// Fungsi untuk merender transaksi yang sudah difilter
function renderFilteredTransactions(filteredTransactions) {
  const transactionList = document.getElementById('transaction-list');
  
  // Update jumlah transaksi yang ditampilkan
  document.getElementById('transaction-count').textContent = 
    `${filteredTransactions.length} Transaction${filteredTransactions.length !== 1 ? 's' : ''}`;
  
  // Render transaksi yang sudah difilter
  transactionList.innerHTML = filteredTransactions.map((t, index) => `
    <tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="toggleDetails(${index}, event)">
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(t.date)}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-3 py-1 text-xs font-medium rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${t.type}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${t.category}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'} font-medium">
        ${formatCurrency(t.amount)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm">
        <button onclick="deleteTransaction(${index})" class="text-red-600 hover:text-red-900 transition-colors">Delete</button>
      </td>
    </tr>
    <tr id="details-${index}" class="hidden bg-gray-50">
      <td colspan="5" class="px-6 py-4">
        <div class="text-sm space-y-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-medium text-gray-700">Transaction Details:</p>
              <p class="text-gray-600">Date: ${formatDate(t.date)}</p>
              <p class="text-gray-600">Category: ${t.category}</p>
              <p class="text-gray-600">Amount: ${formatCurrency(t.amount)}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">Notes:</p>
              <p class="text-gray-600">${t.notes || 'No notes added'}</p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('');
  
  // Update ringkasan untuk transaksi yang difilter
  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  // Update tampilan ringkasan
  document.getElementById('total-income').textContent = formatCurrency(income);
  document.getElementById('total-expense').textContent = formatCurrency(expense);
  document.getElementById('net-balance').textContent = formatCurrency(balance);

  // Update visualisasi jika ada
  const chartPeriod = document.getElementById('chart-period').value;
  updateVisualization(chartPeriod);
}

// Modifikasi fungsi applyFilters
function applyFilters() {
  const dateStart = document.getElementById('filter-date-start').value;
  const dateEnd = document.getElementById('filter-date-end').value;
  const type = document.getElementById('filter-type').value;
  const categoryValue = document.getElementById('filter-category').value;
  
  // Simpan filter yang aktif
  currentFilters = {
    dateStart,
    dateEnd,
    type,
    category: categoryValue
  };
  
  let filteredTransactions = [...transactions];
  
  // Filter berdasarkan tanggal
  if (dateStart) {
    filteredTransactions = filteredTransactions.filter(t => 
      new Date(t.date).setHours(0,0,0,0) >= new Date(dateStart).setHours(0,0,0,0)
    );
  }
  if (dateEnd) {
    filteredTransactions = filteredTransactions.filter(t => 
      new Date(t.date).setHours(0,0,0,0) <= new Date(dateEnd).setHours(0,0,0,0)
    );
  }
  
  // Filter berdasarkan tipe
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }
  
  // Filter berdasarkan kategori
  if (categoryValue) {
    const [filterType, filterCategory] = categoryValue.split('-');
    filteredTransactions = filteredTransactions.filter(t => {
      const categoryLabel = categories[filterType].find(c => c.value === filterCategory)?.label;
      return t.type === filterType && t.category === categoryLabel;
    });
  }
  
  // Render transaksi yang sudah difilter
  renderFilteredTransactions(filteredTransactions);
  
  // Tampilkan badge filter aktif
  updateFilterBadge();
}
