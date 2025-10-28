
document.addEventListener('DOMContentLoaded', () => {

    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netBalanceEl = document.getElementById('net-balance');
    const transactionForm = document.getElementById('transaction-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeInput = document.getElementById('type');
    const transactionList = document.getElementById('transaction-list');
    const addBtn = document.getElementById('add-btn');
    const resetBtn = document.getElementById('reset-btn');
    const editIdInput = document.getElementById('edit-id');
    
    const filterRadios = document.querySelectorAll('input[name="filter"]');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    let isEditing = false;

   
    function generateID() {
        return Date.now() + Math.random();
    }

   
    function saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

   
    function resetForm() {
        
        descriptionInput.value = '';
        amountInput.value = '';
        typeInput.value = 'Income';
        editIdInput.value = '';
        
        isEditing = false;
        addBtn.textContent = 'Add Transaction';
        
        descriptionInput.focus();
    }


    function updateSummary() {
    
        const totalIncome = transactions
            .filter(tx => tx.type === 'Income')
            .reduce((acc, tx) => acc + tx.amount, 0);

        
        const totalExpense = transactions
            .filter(tx => tx.type === 'Expense')
            .reduce((acc, tx) => acc + tx.amount, 0);

        
        const netBalance = totalIncome - totalExpense;

       
        totalIncomeEl.textContent = `₹${totalIncome.toFixed(2)}`;
        totalExpenseEl.textContent = `₹${totalExpense.toFixed(2)}`;
        netBalanceEl.textContent = `₹${netBalance.toFixed(2)}`;

        netBalanceEl.classList.remove('positive', 'negative');
        if (netBalance > 0) {
            netBalanceEl.classList.add('positive');
        } else if (netBalance < 0) {
            netBalanceEl.classList.add('negative');
        }
    }


    function addTransactionToDOM(transaction) {
        const { id, description, amount, type } = transaction;
        
        const item = document.createElement('li');
        
        item.classList.add(type.toLowerCase());
        
        item.innerHTML = `
            <span>${description}</span>
            <span>₹${amount.toFixed(2)}</span>
            <div class="btn-container">
                <button class="edit-btn" data-id="${id}">Edit</button>
                <button class="delete-btn" data-id="${id}">Delete</button>
            </div>
        `;
        
        transactionList.appendChild(item);
    }


    function getActiveFilter() {
        let activeFilter = 'all';
        filterRadios.forEach(radio => {
            if (radio.checked) {
                activeFilter = radio.value;
            }
        });
        return activeFilter;
    }


    function renderTransactions() {
        transactionList.innerHTML = '';
        
        const activeFilter = getActiveFilter();

        const filteredTransactions = transactions.filter(tx => {
            if (activeFilter === 'all') {
                return true;
            }
            return tx.type === activeFilter;
        });

        filteredTransactions.forEach(addTransactionToDOM);
    }

    function updateUI() {
        updateSummary();
        renderTransactions();
    }

    function addTransaction(description, amount, type) {
        const newTransaction = {
            id: generateID(),
            description,
            amount,
            type
        };
        
        transactions.push(newTransaction);
        console.log('Transaction Added:', newTransaction);
    }

    function updateTransaction(id, description, amount, type) {
        const index = transactions.findIndex(tx => tx.id === id);

        if (index !== -1) {
            transactions[index] = { id, description, amount, type };
            console.log('Transaction Updated:', transactions[index]);
        }
    }

    function deleteTransaction(id) {
        transactions = transactions.filter(tx => tx.id !== id);
        console.log('Transaction Deleted:', id);
    }

    function startEditTransaction(id) {
        const transaction = transactions.find(tx => tx.id === id);
        if (!transaction) return;

        isEditing = true;
        
        editIdInput.value = id;
        descriptionInput.value = transaction.description;
        amountInput.value = transaction.amount;
        typeInput.value = transaction.type;

        addBtn.textContent = 'Update Transaction';
        
        transactionForm.scrollIntoView({ behavior: 'smooth' });
        descriptionInput.focus();
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;
        const id = parseFloat(editIdInput.value);

        if (description === '' || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid description and amount.');
            return;
        }

        if (type === 'Expense') {
            const totalIncome = transactions
                .filter(tx => tx.type === 'Income')
                .reduce((acc, tx) => acc + tx.amount, 0);

            const totalExpense = transactions
                .filter(tx => tx.type === 'Expense')
                .reduce((acc, tx) => acc + tx.amount, 0);

            let availableBalance = totalIncome - totalExpense;

            if (isEditing) {
                const originalTransaction = transactions.find(tx => tx.id === id);
                if (originalTransaction) {
                    if (originalTransaction.type === 'Income') {
                        availableBalance -= originalTransaction.amount;
                    } else {
                        availableBalance += originalTransaction.amount;
                    }
                }
            }

            if (amount > availableBalance) {
                alert(`Insufficient balance. You cannot spend more than your available balance of ₹${availableBalance.toFixed(2)}.`);
                return;
            }
        }

        if (isEditing) {

            updateTransaction(id, description, amount, type);
        } else {

            addTransaction(description, amount, type);
        }

        saveToLocalStorage();
        
        resetForm();
        updateUI();
    }

    function handleListClick(e) {
        if (e.target.classList.contains('delete-btn')) {
            // Get the 'data-id' attribute
            const id = parseFloat(e.target.dataset.id);
            
            if (confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(id);
                saveToLocalStorage();
                updateUI();
            }
        }

        if (e.target.classList.contains('edit-btn')) {
            const id = parseFloat(e.target.dataset.id);
            startEditTransaction(id);
        }
    }

    function handleFilterChange() {
        console.log('Filter changed to:', getActiveFilter());
        renderTransactions(); 
    }
    
    transactionForm.addEventListener('submit', handleFormSubmit);

    resetBtn.addEventListener('click', resetForm);
    
    transactionList.addEventListener('click', handleListClick);

    filterRadios.forEach(radio => {
        radio.addEventListener('change', handleFilterChange);
    });

    function init() {
        console.log('Application Initialized');
        updateUI();
        descriptionInput.focus();
    }

    init();
});