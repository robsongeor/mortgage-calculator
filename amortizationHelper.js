export function amortizationAlgorithm({
    amount: loanAmount,
    rate,
    termYears,
    termMonths,
    startDate: termStartDate,
    payments: initialPayment,
    paymentFreq,
    midTerms = [] // array of { date, amount }
  }) {
    const results = {
      finalBalance: 0,
      totalInterest: 0,
      totalPayments: 0,
      totalPrinciple: 0,
      paymentsMade: 0
    };
  
    const startDate = new Date(termStartDate);
    const endDate = addYearsAndMonths(startDate, termYears, termMonths);

    const segments = [];
  
    // Step 1: Build amortization segments based on paymentChanges
    const sortedChanges = [...midTerms].sort((a, b) => new Date(a.date) - new Date(b.date));
    let segmentStart = startDate;
    let currentPayment = initialPayment;
  
    for (let i = 0; i < sortedChanges.length; i++) {
      const change = sortedChanges[i];
      const changeDate = new Date(change.date);
  
      if (changeDate <= segmentStart || changeDate >= endDate) continue;
  
      segments.push({ start: segmentStart, end: changeDate, payment: currentPayment });
  
      segmentStart = changeDate;
      currentPayment = change.amount;
    }
  
    // Final segment
    segments.push({ start: segmentStart, end: endDate, payment: currentPayment });
  
    // Step 2: Calculate each segment
    let balance = loanAmount;
  
    for (const seg of segments) {
      const result = calculateTerm(balance, rate, seg.start, seg.end, seg.payment, paymentFreq);
  
      results.finalBalance = result.finalBalance;
      results.totalInterest += result.totalInterest;
      results.totalPayments += result.totalPayments;
      results.totalPrinciple += result.totalPrinciple;
      results.paymentsMade += result.paymentsMade;
  
      balance = result.finalBalance;
      if (balance <= 0) break;
    }
  
    return {
      finalBalance: roundToCents(results.finalBalance),
      totalInterest: roundToCents(results.totalInterest),
      totalPayments: roundToCents(results.totalPayments),
      totalPrinciple: roundToCents(results.totalPrinciple),
      paymentsMade: results.paymentsMade
    };
  }
  


function calculateTerm(amount, rate, startDate, endDate, payment, paymentFreq) {
    const totalPayments = getTotalPayments(paymentFreq, startDate, endDate);

    let balance = amount;
    let paymentCount = 0;

    let currentDate = new Date(startDate);
    let daysElapsed = 1;
    let interestAccrued = 0;

    let totalPaymentsAmount = 0;
    let totalInterest = 0;

    while (paymentCount < totalPayments) {
        // Accrue interest
        const dailyInterest = getDailyInterest(rate, balance);
        interestAccrued += dailyInterest;
        totalInterest += dailyInterest;


        // Add interest at the start of each month
        if (currentDate.getDate() === 1) {
            balance += interestAccrued;
            interestAccrued = 0;
            if (balance <= 0) break;

            if (paymentFreq === "monthly") {
                totalPaymentsAmount += payment;
                ({ balance, paymentCount } = applyPayment(balance, payment, paymentCount));
            }
        }
        // Weekly or Fortnightly Payments
        else if (paymentFreq === "weekly" && daysElapsed % 7 === 0) {
            totalPaymentsAmount += payment;
            ({ balance, paymentCount } = applyPayment(balance, payment, paymentCount));
        } else if (paymentFreq === "fortnightly" && daysElapsed % 14 === 0) {
            totalPaymentsAmount += payment;
            ({ balance, paymentCount } = applyPayment(balance, payment, paymentCount));
        }

        // Advance time
        daysElapsed++;
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    }


    return {
        finalBalance: Math.max(0, roundToCents(balance)),
        totalInterest: roundToCents(totalPaymentsAmount - (amount - balance)),
        totalPayments: totalPaymentsAmount,
        totalPrinciple: roundToCents(amount - balance),
        paymentsMade: paymentCount
    };
}

// --- Helper Functions ---

function applyPayment(balance, amount, count) {
    return {
        balance: balance - amount,
        paymentCount: count + 1
    };
}

function getDailyInterest(rate, balance) {
    const dailyRate = rate / 365 / 100;
    return dailyRate * balance;
}

function getTotalPayments(freq, startDate, endDate) {
    const weeks = weeksBetween(startDate, endDate);
    if (freq === "weekly") return weeks;
    if (freq === "fortnightly") return Math.floor(weeks / 2);
    return monthsBetween(startDate, endDate);
}

function weeksBetween(start, end) {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((new Date(end) - new Date(start)) / msPerWeek);
}

function monthsBetween(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
}

function addYearsAndMonths(date, years, months) {
    const d = new Date(date);
    const totalMonths = d.getMonth() + months + years * 12;
    return new Date(d.getFullYear(), totalMonths, d.getDate());
}

function roundToCents(value) {
    return Math.round(value * 100) / 100;
}

const input = {
    amount: 500000,
    rate: 5,
    termYears: 1,
    termMonths: 0,
    payments: 650,
    paymentFreq: "weekly",
};

