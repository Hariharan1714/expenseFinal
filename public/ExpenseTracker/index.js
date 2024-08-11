let currentPage = 1;
const itemsPerPage = 10;
let expenses = [];

function addNewExpense(e) {
    e.preventDefault();

    const expenseDetails = {
        expenseamount: e.target.expenseamount.value,
        description: e.target.description.value,
        category: e.target.category.value,
    };

    const token = localStorage.getItem('token');
    axios.post('http://3.26.200.238:3000/expense/addexpense', expenseDetails, { headers: {"Authorization" : token} })
        .then(response => {
            expenses.push(response.data.expense);
            displayExpenses();
        })
        .catch(err => showError(err));
}

function displayExpenses() {
    const listOfExpenses = document.getElementById('listOfExpenses');
    listOfExpenses.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentExpenses = expenses.slice(start, end);

    currentExpenses.forEach(expense => {
        const expenseElem = document.createElement('li');
        expenseElem.id = `expense-${expense.id}`;
        expenseElem.innerHTML = `
            ${expense.expenseamount} - ${expense.category} - ${expense.description}
            <button onclick='deleteExpense(event, ${expense.id})'>Delete Expense</button>
        `;
        listOfExpenses.appendChild(expenseElem);
    });

    updatePaginationInfo();
}

function updatePaginationInfo() {
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function nextPage() {
    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayExpenses();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayExpenses();
    }
}

function deleteExpense(e, expenseId) {
    const token = localStorage.getItem('token');
    axios.delete(`http://3.26.200.238:3000/expense/deleteexpense/${expenseId}`, { headers: {"Authorization" : token} })
        .then(() => {
            expenses = expenses.filter(expense => expense.id !== expenseId);
            displayExpenses();
        })
        .catch(err => showError(err));
}

function showError(err) {
    document.body.innerHTML += `<div style="color:red;">${err}</div>`;
}

function showPremiumuserMessage() {
    document.getElementById('rzp-button1').style.visibility = "hidden";
    document.getElementById('message').innerHTML = "You are a premium user";

    // Make the download button visible for premium users
    const downloadButton = document.getElementById('download-expenses');
    if (downloadButton) {
        downloadButton.style.visibility = 'visible';
    }
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);
    const ispremiumuser = decodeToken.ispremiumuser;

    if (ispremiumuser) {
        showPremiumuserMessage();
        
    }

    axios.get('http://3.26.200.238:3000/expense/getexpenses', { headers: {"Authorization" : token} })
        .then(response => {
            expenses = response.data.expenses;
            displayExpenses();
        })
        .catch(err => showError(err));
});

function showLeaderboard() {
    const inputElement = document.createElement("input");
    inputElement.type = "button";
    inputElement.value = 'Show Leaderboard';
    inputElement.onclick = async () => {
        const token = localStorage.getItem('token');
        const userLeaderBoardArray = await axios.get('http://3.26.200.238:3000/premium/showLeaderBoard', { headers: {"Authorization" : token} });

        var leaderboardElem = document.getElementById('leaderboard');
        leaderboardElem.innerHTML = '<h1> Leader Board </h1>';
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.total_cost || 0}</li>`;
        });
    };

    document.getElementById("message").appendChild(inputElement);
}

// Download Expenses Function
function downloadExpenses() {
    const expensesText = expenses.map(expense => 
        `${expense.expenseamount} - ${expense.category} - ${expense.description}`).join('\n');
    const blob = new Blob([expensesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Attach the Download Function to the Button
document.getElementById('download-expenses').addEventListener('click', downloadExpenses);

document.getElementById('rzp-button1').onclick = async function (e) {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://3.26.200.238:3000/purchase/premiummembership', { headers: {"Authorization" : token} });
    var options = {
        "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
        "order_id": response.data.order.id, // For one time payment
        "handler": async function (response) {
            const res = await axios.post('http://3.26.200.238:3000/purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: {"Authorization" : token} });
            
            alert('You are a Premium User Now');
            document.getElementById('rzp-button1').style.visibility = "hidden";
            document.getElementById('message').innerHTML = "You are a premium user";
            localStorage.setItem('token', res.data.token);
            showLeaderboard();  // Show leaderboard button after becoming premium

            // Show download button after upgrading to premium
            const downloadButton = document.getElementById('download-expenses');
            if (downloadButton) {
                downloadButton.style.visibility = 'visible';
            }
        },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function (response) {
        alert('Something went wrong');
    });
};
