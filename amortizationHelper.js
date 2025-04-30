function amortizationAlgorithm(
    {
        loanAmount,
        rate,
        termYears,
        termMonths,
        payments,
        paymentFreq
    }
) {
    /* Date Variables */
    const startDate = new Date();
    const endDate = addYearsAndMonths(startDate, termYears, termMonths)
    const totalPayments = getTotalPayments(paymentFreq, startDate, endDate)
    console.log(totalPayments)

    let balance = loanAmount;
    let totalInterest = 0;
    let paymentsSchedule = [];

    let currentDate = new Date(startDate);
    let currentDay = 0;

    let paymentsCounter = 0;
    let interestAccrued = 0;

    console.log(totalPayments)

    while (paymentsCounter < totalPayments) {
       

        // // Add interest at the start of each month
        if (currentDate.getDate() === 1) {
            console.log(currentDate)
            balance += interestAccrued;
            interestAccrued = 0;
            if (balance <= 0) break;
            

            if (paymentFreq === "monthly") {
                ({ balance, paymentCount } = applyPayment(balance, paymentAmount, paymentCount));
            }

            
        }
        // Weekly or Fortnightly Payments
         else if (paymentFreq === "weekly" && daysElapsed % 7 === 0) {
            ({ balance, paymentCount } = applyPayment(balance, paymentAmount, paymentCount));
        } else if (paymentFreq === "fortnightly" && daysElapsed % 14 === 0) {
            ({ balance, paymentCount } = applyPayment(balance, paymentAmount, paymentCount));
        }

        interestAccrued += getDailyInterest(rate, balance);
        currentDay++;
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+1)

    }


    return { balance }

}

function getDailyInterest(rate, balance){
 
    let dailyRate = rate / 365 / 100;
    return dailyRate * balance;
}

function getTotalPayments(paymentFreq, startDate, endDate) {
    const totalWeeks = weeksBetween(startDate, endDate);

    if (paymentFreq === "weekly") {
        return totalWeeks;
    } else if (paymentFreq === "fortnightly") {
        return Math.floor(totalWeeks / 2);
    } else {
        return monthsBetween(startDate, endDate);
    }
}

function weeksBetween(startDate, endDate) {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInMs = end - start;
    return Math.floor(diffInMs / msPerWeek);

}

function monthsBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInYears = end.getFullYear() - start.getFullYear();
    const diffInMonths = end.getMonth() - start.getMonth();

    return diffInYears * 12 + diffInMonths;
}

function addYearsAndMonths(date, years, months) {
    const newDate = new Date(date);

    let totalMonths = years * 12 + months + newDate.getMonth();

    const endDate = new Date(newDate.getFullYear(), totalMonths, newDate.getDate())

    return endDate;
}

g = {
    loanAmount: 500000,
    rate: 4.79,
    termYears: 1,
    termMonths: 0,
    payments: 650,
    paymentFreq: "weekly",
}

amortizationAlgorithm(g);
