let transactions = [];
let chart;
let limitValue = 0;

// FORMAT RUPIAH
function formatRupiah(angka) {
    return "Rp." + angka.toLocaleString("id-ID") + ",-";
}

// SET LIMIT
function setLimit() {
    const input = document.getElementById("limit").value;

    if (!input) {
        alert("Masukkan limit dulu!");
        return;
    }

    limitValue = Number(input);
    render();
}

// TAMBAH TRANSAKSI
function addTransaction() {
    const name = document.getElementById("name").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;

    if (!name || !amount || !category) {
        alert("Isi semua data!");
        return;
    }

    transactions.push({
        id: Date.now(),
        name,
        amount: parseFloat(amount),
        category,
        date: new Date()
    });

    render();

    document.getElementById("name").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
}

// DELETE
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    render();
}

// RENDER
function render() {
    const list = document.getElementById("list");
    const balance = document.getElementById("balance");
    const summary = document.getElementById("monthlySummary");
    const warning = document.getElementById("limitWarning");
    const limitInfo = document.getElementById("limitInfo");

    list.innerHTML = "";

    let total = 0;
    let monthlyTotal = 0;

    const now = new Date();

    transactions.forEach(t => {
        total += t.amount;

        const tDate = new Date(t.date);

        if (
            tDate.getMonth() === now.getMonth() &&
            tDate.getFullYear() === now.getFullYear()
        ) {
            monthlyTotal += t.amount;
        }

        const li = document.createElement("li");

        // 🔴 highlight jika melebihi limit
        if (limitValue && t.amount > limitValue) {
            li.style.background = "#ffe5e5";
            li.style.borderLeft = "6px solid red";
            li.style.fontWeight = "bold";
        }

        li.innerHTML = `
            ${t.name} - ${formatRupiah(t.amount)} (${t.category})
            <button onclick="deleteTransaction(${t.id})">Delete</button>
        `;

        list.appendChild(li);
    });

    // TOTAL
    balance.innerText = formatRupiah(total);
    summary.innerText = "Total bulan ini: " + formatRupiah(monthlyTotal);

    // LIMIT INFO
    if (limitValue) {
        const sisa = limitValue - total;

        if (sisa > 0) {
            limitInfo.innerText = "Sisa limit: " + formatRupiah(sisa);
        } else {
            limitInfo.innerText = "Limit: " + formatRupiah(limitValue);
        }
    } else {
        limitInfo.innerText = "";
    }

    // ⚠️ WARNING + KELEBIHAN
    if (limitValue && total > limitValue) {
        const selisih = total - limitValue;

        warning.innerHTML = `
            ⚠️ Total pengeluaran melebihi limit! <br>
            Kelebihan: <b>${formatRupiah(selisih)}</b>
        `;
    } else {
        warning.innerText = "";
    }

    updateChart();
}

// CHART
function updateChart() {
    const dataMap = {
        Food: 0,
        Transport: 0,
        Fun: 0
    };

    transactions.forEach(t => {
        dataMap[t.category] += t.amount;
    });

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "pie",
        data: {
            labels: Object.keys(dataMap),
            datasets: [{
                data: Object.values(dataMap),
                backgroundColor: ["#2ecc71", "#3498db", "#e67e22"]
            }]
        },
        options: {
            plugins: {
                legend: { position: "bottom" },
                datalabels: {
                    color: "#fff",
                    font: { weight: "bold", size: 14 },
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data
                            .reduce((a, b) => a + b, 0);

                        if (total === 0) return "";

                        return ((value / total) * 100).toFixed(0) + "%";
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// DARK MODE
const toggleBtn = document.getElementById("toggleTheme");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️ Light Mode";
}

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        toggleBtn.textContent = "☀️ Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        toggleBtn.textContent = "🌙 Dark Mode";
    }
});