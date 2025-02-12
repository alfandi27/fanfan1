 function showSuccessMessage(message) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

 function showErrorMessage(message) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message
    });
  }

// Fungsi format currency
    function formatCurrency(amount) {
      return `Rp${amount.toLocaleString('id-ID')}`;
    }

    // Fungsi format date
    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    }

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

// Inisialisasi variabel dan elemen
    const transactionForm = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netBalanceEl = document.getElementById('net-balance');
    const refreshChartBtn = document.getElementById('refresh-chart');
    const chartPeriodSelect = document.getElementById('chart-period');

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

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

    // Fungsi untuk toggle transaction history
    function toggleTransactionHistory() {
      const container = document.getElementById('transaction-container');
      const icon = document.getElementById('toggle-icon');
      container.classList.toggle('hidden');
      icon.querySelector('svg').style.transform = container.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
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

// Fungsi untuk memperbarui visualisasi
    function updateVisualization(period = 'all') {
  const chartContainer = document.getElementById('charts-container');
  const chartType = document.getElementById('chart-type').value;

  // Reset chart container
  chartContainer.innerHTML = '<canvas id="overview-chart"></canvas>';

  // Ambil data transaksi dari localStorage
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const data = groupTransactionsByCategory(transactions, period);

  let chartData;
  let chartOptions;

  // Fungsi helper untuk mendapatkan warna berdasarkan value kategori
  function getCategoryColor(categoryValue, type) {
    const categoryList = categories[type];
    if (!categoryList) return '#cccccc'; // Warna default jika kategori tidak ditemukan
    const matchedCategory = categoryList.find((cat) => cat.value === categoryValue);
    return matchedCategory ? matchedCategory.color : '#cccccc'; // Warna default jika tidak ditemukan
  }

  if (chartType === 'all') {
    // Visualisasi Income vs Expense
    chartData = {
      labels: ['Pemasukan', 'Pengeluaran'],
      datasets: [{
        data: [data.totals.income, data.totals.expense],
        backgroundColor: ['#4CAF50', '#F44336'], // Warna tetap untuk income dan expense
        borderWidth: 1,
        borderColor: '#fff'
      }]
    };
    chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: `Saldo: ${formatCurrency(data.totals.income - data.totals.expense)}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = data.totals.income + data.totals.expense;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    };
  } else if (chartType === 'income') {
    // Visualisasi Income by Category
    const categoryLabels = Object.keys(data.categories.income);
    const values = categoryLabels.map((cat) => data.categories.income[cat]);

    chartData = {
      labels: categoryLabels,
      datasets: [{
        data: values,
        backgroundColor: categoryLabels.map((cat) => getCategoryColor(cat, 'income')),
        borderWidth: 1,
        borderColor: '#fff'
      }]
    };
    chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: `Total Pemasukan: ${formatCurrency(data.totals.income)}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const percentage = ((value / data.totals.income) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    };
  } else {
    // Visualisasi Expense by Category
    const categoryLabels = Object.keys(data.categories.expense);
    const values = categoryLabels.map((cat) => data.categories.expense[cat]);

    chartData = {
      labels: categoryLabels,
      datasets: [{
        data: values,
        backgroundColor: categoryLabels.map((cat) => getCategoryColor(cat, 'expense')),
        borderWidth: 1,
        borderColor: '#fff'
      }]
    };
    chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: `Total Pengeluaran: ${formatCurrency(data.totals.expense)}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const percentage = ((value / data.totals.expense) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  // Render chart
  new Chart(document.getElementById('overview-chart'), {
    type: 'pie', // Bisa diubah ke 'bar', 'line', dll.
    data: chartData,
    options: chartOptions
  });
}

  // Fungsi untuk mengelompokkan transaksi berdasarkan kategori
function groupTransactionsByCategory(transactions, period = 'all', type = 'all') {
  let filteredTransactions = [...transactions];
  
  if (period !== 'all') {
    const now = new Date();
    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const cutoffDate = new Date(now.setDate(now.getDate() - periodDays));
    filteredTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate);
  }

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Mengelompokkan berdasarkan kategori
  const incomeByCategory = {};
  const expenseByCategory = {};
  
  filteredTransactions.forEach(t => {
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  return {
    totals: {
      income: totalIncome,
      expense: totalExpense
    },
    categories: {
      income: incomeByCategory,
      expense: expenseByCategory
    }
  };
}

function calculateTotalBudgetProgress() {
  const totalBudget = parseInt(localStorage.getItem('totalBudget'), 10) || 0;
  const totalSpent = transactions
    .filter(t => t.type === 'expense' && budgets[t.category]) // Hanya transaksi dari kategori yang diset budget
    .reduce((acc, t) => acc + t.amount, 0);

  return {
    totalBudget,
    totalSpent,
    percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
  };
}

function updateBudgetCategories() {
  const budgetCategorySelect = document.getElementById('budget-category');
  budgetCategorySelect.innerHTML = '<option value="">-- Pilih Kategori --</option>';

  categories = JSON.parse(localStorage.getItem("categories")) || { income: [], expense: [] };
  
  categories.expense.forEach(category => {
    const option = document.createElement('option');
    option.value = category.value;
    option.textContent = category.label;
    budgetCategorySelect.appendChild(option);
  });
}
function calculateBudgetUsage() {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const monthlyExpenses = {};

  // Hitung total pengeluaran bulan ini per kategori
  transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= firstDayOfMonth) // Filter hanya pengeluaran
    .forEach(t => {
      const categoryValue = t.category; // Gunakan kategori dari transaksi langsung
      if (categoryValue) {
        monthlyExpenses[categoryValue] = (monthlyExpenses[categoryValue] || 0) + t.amount;
      }
    });

  return monthlyExpenses;
}
