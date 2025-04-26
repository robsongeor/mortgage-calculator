const calc = (function () {
    const minimumRepayments = function (inputs) {

        let r = inputs["loan-rate"] / inputs["payment-freq"] / 100;
        let p = inputs["loan-amount"];
        let n = inputs["payment-freq"] * inputs["loan-term"];


        let M = p * (r * Math.pow((1 + r), n)) / (Math.pow((1 + r), n) - 1)

        return M;
    }

    const calculateBalance = function (inputs) {
        let balance = inputs["loan-amount"];

        let dailyInterest = getDailyInterest(
            new Date().getFullYear(),
            inputs["loan-rate"],
            inputs["loan-amount"]
        );

        let currentDate = new Date();
        let currentDay = 1//currentDate.getDate();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear(); 

        for (let y = currentYear; y < currentYear + inputs["loan-term"]; y++) {
            let accruedInterest = 0;
            for (let m = currentMonth; m < currentMonth + 12; m++) {
                //Add the accrued interest to the total balance
                balance += accruedInterest;
    
                //Reset accrued interest
                accruedInterest = 0;

                for (currentDay; currentDay <= getTotalDaysInMonth(m, y); currentDay++) {
                    //add the daily interest amount THIS IS NOT CORRECT YET
                    accruedInterest += getDailyInterest(y, inputs["loan-rate"], balance);

                    //Make payment towards principle at freq
                    if (isPaymentDate(inputs["payment-freq"], { y, m, currentDay }, currentDate.getDay()-1)) {
                        balance -= inputs["payment-amt"];   
                    }

                }
                currentDay = 1;
            }
        }
        return(balance)
        



    }

    const isPaymentDate = function (freq, date, startDay) {
        let d = new Date(date.y, date.m, date.currentDay);

        if (freq === 12) {
            return date.currentDay === 1;
        }

        if (freq === 52) {
            return d.getDay() === startDay;
        }

        if (freq === 26) {
            return false;
        }
    }



    const getTotalDaysInMonth = function (month, year) {
        //+1 to interpret as 0th days of next month => last day of current month
        return new Date(year, month + 1, 0).getDate()

    }

    const getDailyInterest = function (startYear, rate, loanAmount) {
        let dailyInterestRate = rate / 100 / getTotalDaysInYear(startYear)
        let dailyInterest = loanAmount * dailyInterestRate;

        return dailyInterest;
    }

    const getTotalDaysInYear = function (year) {
        return isLeapYear ? 366 : 365;
    }

    const isLeapYear = (year) => {
        return ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))
    }

    const freqToNumber = function (string) {
        if (string === "monthly") return 12;
        if (string === "weekly") return 52;
        if (string === "fortnightly") return 26;
    }


    return { minimumRepayments, freqToNumber, calculateBalance }

})();

export default calc;