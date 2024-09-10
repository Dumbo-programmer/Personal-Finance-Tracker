document.addEventListener("DOMContentLoaded", function() {
    // Initialize local storage and load data
    init();
    loadCategories();
    loadTransactions();
    loadBudgets();
    updateDashboard();

    // Event listeners
    document.getElementById("transaction-form").addEventListener("submit", addTransaction);
    document.getElementById("category-form").addEventListener("submit", addCategory);
    document.getElementById("budget-form").addEventListener("submit", setBudget);
});

function init() {
    // Ensure localStorage is set up
    const defaultData = {
        transactions: [],
        categories: [],
        budgets: []
    };

    for (const [key, value] of Object.entries(defaultData)) {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
}

function addTransaction(event) {
    event.preventDefault();

    const name = document.getElementById("transaction-name").value.trim();
    const amount = parseFloat(document.getElementById("transaction-amount").value);
    const category = document.getElementById("transaction-category").value;
    const type = document.getElementById("transaction-type").value;

    if (!name || isNaN(amount) || !category || !type) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const transactions = JSON.parse(localStorage.getItem("transactions"));
    transactions.push({ name, amount, category, type, date: new Date().toISOString() });
    localStorage.setItem("transactions", JSON.stringify(transactions));

    document.getElementById("transaction-form").reset();
    loadTransactions();
    updateDashboard();
}

function addCategory(event) {
    event.preventDefault();

    const name = document.getElementById("category-name").value.trim();
    if (!name) {
        alert("Category name cannot be empty.");
        return;
    }

    const categories = JSON.parse(localStorage.getItem("categories"));
    if (categories.includes(name)) {
        alert("Category already exists.");
        return;
    }

    categories.push(name);
    localStorage.setItem("categories", JSON.stringify(categories));

    document.getElementById("category-form").reset();
    loadCategories();
}

function setBudget(event) {
    event.preventDefault();

    const category = document.getElementById("budget-category").value;
    const amount = parseFloat(document.getElementById("budget-amount").value);

    if (!category || isNaN(amount)) {
        alert("Please select a category and enter a valid amount.");
        return;
    }

    const budgets = JSON.parse(localStorage.getItem("budgets"));
    const existingBudget = budgets.find(budget => budget.category === category);

    if (existingBudget) {
        existingBudget.amount = amount;
    } else {
        budgets.push({ category, amount });
    }

    localStorage.setItem("budgets", JSON.stringify(budgets));

    document.getElementById("budget-form").reset();
    loadBudgets();
    updateDashboard();
}

function loadCategories() {
    const categories = JSON.parse(localStorage.getItem("categories"));
    const categorySelect = document.getElementById("transaction-category");
    const budgetCategorySelect = document.getElementById("budget-category");
    const categoriesList = document.getElementById("categories-list");

    categorySelect.innerHTML = "<option value=''>Select Category</option>";
    budgetCategorySelect.innerHTML = "<option value=''>Select Category</option>";
    categoriesList.innerHTML = "";

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);

        const budgetOption = option.cloneNode(true);
        budgetCategorySelect.appendChild(budgetOption);

        const listItem = document.createElement("li");
        listItem.textContent = category;
        categoriesList.appendChild(listItem);
    });
}

function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem("transactions"));
    const transactionsTableBody = document.querySelector("#transactions-table tbody");

    transactionsTableBody.innerHTML = "";

    transactions.forEach(transaction => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${transaction.name}</td>
            <td>${transaction.amount.toFixed(2)}</td>
            <td>${transaction.category}</td>
            <td>${transaction.type}</td>
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td><button onclick="deleteTransaction('${transaction.name}', '${transaction.date}')">Delete</button></td>
        `;

        transactionsTableBody.appendChild(row);
    });
}

function loadBudgets() {
    const budgets = JSON.parse(localStorage.getItem("budgets"));
    const budgetsTableBody = document.querySelector("#budgets-table tbody");

    budgetsTableBody.innerHTML = "";

    budgets.forEach(budget => {
        const spent = calculateSpentAmount(budget.category);
        const remaining = budget.amount - spent;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${budget.category}</td>
            <td>${budget.amount.toFixed(2)}</td>
            <td>${spent.toFixed(2)}</td>
            <td>${remaining.toFixed(2)}</td>
            <td><button onclick="deleteBudget('${budget.category}')">Delete</button></td>
        `;

        budgetsTableBody.appendChild(row);
    });
}

function calculateSpentAmount(category) {
    const transactions = JSON.parse(localStorage.getItem("transactions"));
    return transactions
        .filter(transaction => transaction.category === category && transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function deleteTransaction(name, date) {
    let transactions = JSON.parse(localStorage.getItem("transactions"));
    transactions = transactions.filter(transaction => transaction.name !== name || transaction.date !== date);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    loadTransactions();
    updateDashboard();
}

function deleteBudget(category) {
    let budgets = JSON.parse(localStorage.getItem("budgets"));
    budgets = budgets.filter(budget => budget.category !== category);
    localStorage.setItem("budgets", JSON.stringify(budgets));

    loadBudgets();
    updateDashboard();
}

function updateDashboard() {
    const transactions = JSON.parse(localStorage.getItem("transactions"));
    const budgets = JSON.parse(localStorage.getItem("budgets"));

    const totalIncome = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalBalance = totalIncome - totalExpenses;

    const budgetStatus = budgets.map(budget => {
        const spent = calculateSpentAmount(budget.category);
        return `${budget.category}: ${spent.toFixed(2)} / ${budget.amount.toFixed(2)} (${(budget.amount - spent).toFixed(2)} remaining)`;
    }).join("<br>");

    document.getElementById("total-balance").innerHTML = `Balance: $${totalBalance.toFixed(2)}`;
    document.getElementById("total-income").innerHTML = `Income: $${totalIncome.toFixed(2)}`;
    document.getElementById("total-expenses").innerHTML = `Expenses: $${totalExpenses.toFixed(2)}`;
    document.getElementById("budget-status").innerHTML = `Budget Status:<br>${budgetStatus}`;
}

function initializeCharts() {
    const ctx = document.createElement('canvas');
    document.getElementById('report-charts').appendChild(ctx);

    const transactions = JSON.parse(localStorage.getItem("transactions"));
    const categories = JSON.parse(localStorage.getItem("categories"));

    const spendingData = {
        labels: categories,
        datasets: [{
            label: 'Spending by Category',
            data: categories.map(cat => calculateSpentAmount(cat)),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: spendingData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const label = tooltipItem.label || '';
                            const value = tooltipItem.raw || 0;
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize charts on document ready
document.addEventListener("DOMContentLoaded", initializeCharts);
