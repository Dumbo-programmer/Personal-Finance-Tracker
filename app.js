// app.js

document.addEventListener("DOMContentLoaded", function() {
    // Initialize all components
    init();

    // Event listeners for forms and actions
    document.getElementById("transaction-form").addEventListener("submit", addTransaction);
    document.getElementById("category-form").addEventListener("submit", addCategory);
    document.getElementById("budget-form").addEventListener("submit", setBudget);

    loadCategories();
    loadTransactions();
    loadBudgets();
});

function init() {
    if (!localStorage.getItem("transactions")) {
        localStorage.setItem("transactions", JSON.stringify([]));
    }
    if (!localStorage.getItem("categories")) {
        localStorage.setItem("categories", JSON.stringify([]));
    }
    if (!localStorage.getItem("budgets")) {
        localStorage.setItem("budgets", JSON.stringify([]));
    }
}

function addTransaction(event) {
    event.preventDefault();

    const name = document.getElementById("transaction-name").value;
    const amount = parseFloat(document.getElementById("transaction-amount").value);
    const category = document.getElementById("transaction-category").value;
    const type = document.getElementById("transaction-type").value;

    const transactions = JSON.parse(localStorage.getItem("transactions"));
    transactions.push({ name, amount, category, type, date: new Date().toISOString() });
    localStorage.setItem("transactions", JSON.stringify(transactions));

    document.getElementById("transaction-form").reset();
    loadTransactions();
    updateDashboard();
}

function addCategory(event) {
    event.preventDefault();

    const name = document.getElementById("category-name").value;

    const categories = JSON.parse(localStorage.getItem("categories"));
    categories.push(name);
    localStorage.setItem("categories", JSON.stringify(categories));

    document.getElementById("category-form").reset();
    loadCategories();
}

function setBudget(event) {
    event.preventDefault();

    const category = document.getElementById("budget-category").value;
    const amount = parseFloat(document.getElementById("budget-amount").value);

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

    categorySelect.innerHTML = "";
    budgetCategorySelect.innerHTML = "";
    categoriesList.innerHTML = "";

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;

        categorySelect.appendChild(option);
        budgetCategorySelect.appendChild(option.cloneNode(true));

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
            <td>${transaction.amount}</td>
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
            <td>${budget.amount}</td>
            <td>${spent}</td>
            <td>${remaining}</td>
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
        return `${budget.category}: ${spent} / ${budget.amount} (${budget.amount - spent} remaining)`;
    }).join("<br>");

    document.getElementById("total-balance").innerHTML = `Balance: ${totalBalance}`;
    document.getElementById("total-income").innerHTML = `Income: ${totalIncome}`;
    document.getElementById("total-expenses").innerHTML = `Expenses: ${totalExpenses}`;
    document.getElementById("budget-status").innerHTML = `Budget Status:<br>${budgetStatus}`;
}
