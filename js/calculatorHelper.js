const calc = (function () {
    const minimumRepayments = function (inputs) {

        let r = inputs["loan-rate"] / inputs["payment-freq"] / 100;
        let p = inputs["loan-amount"];
        let n = inputs["payment-freq"] * inputs["loan-term"];


        let M = p * (r * Math.pow((1 + r), n)) / (Math.pow((1 + r), n) - 1)

        return M;
    }

    const betterCalculateBalance = function (inputs) {
        console.log(inputs)

        let totalMonths = inputs["loan-term"] * 12 + inputs["loan-term-months"]
        let startMonth = new Date().getMonth();
        let monthsCounter = 0 + startMonth;

        let yearsCounter = new Date().getFullYear();
        let currentYearArr = getMonthsArrFromYear();

        let startDay = new Date().getDate()
        let dayOfMonth = startDay;
        let daysInMonth = 0;
        let dayCounter = 1;

        let balance = inputs["loan-amount"];
      
        let interestAccrued = 0;

        while (monthsCounter < totalMonths + startMonth) {

            balance += interestAccrued;
            
            interestAccrued = 0;

            //Gets the current days in months arr from a year
            if (isNewYear(monthsCounter)) {
                yearsCounter++;
                currentYearArr = getMonthsArrFromYear(yearsCounter);
            };

            // handle first and last months 
            let setupDays = function () {
                if (monthsCounter === startMonth) {
                    dayOfMonth = startDay; //start counter from given date
                    daysInMonth = currentYearArr[monthsCounter % 12];

                } else if (monthsCounter + 1 === totalMonths + startMonth) {
                    dayOfMonth = 1;
                    daysInMonth = startDay;
                } else {
                    daysInMonth = 1;
                    daysInMonth = currentYearArr[monthsCounter % 12]
                }
            }();


            for (let d = 1; d <= currentYearArr[monthsCounter % 12]; d++) {
                dayCounter++;
                interestAccrued += getDailyInterest(yearsCounter, inputs["loan-rate"], balance)

                if (isPaymentDay(inputs["payment-freq"],dayCounter,d)){
                    balance -= inputs["payment-amt"];
                }
            }

            monthsCounter++
        }

        return balance;

    }

    const getDateDMY = function (date) {
        return {
            d: date.getDate(),
            m: date.getMonth(),
            y: date.getFullYear()
        }
    }

    const getMonthsArrFromYear = function (year) {
        return isLeapYear(year) ? monthsInLeapYear : monthsInYear
    }

    const isNewYear = function (currentMonth) {
        return ((currentMonth + 1) % 12 === 0)
    }

    const monthsInYear = [
        31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ]
    const monthsInLeapYear = [
        31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ]

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
                    if (isPaymentDate(inputs["payment-freq"], { y, m, currentDay }, currentDate.getDay() - 1)) {
                        balance -= inputs["payment-amt"];
                    }

                }
                currentDay = 1;
            }
        }
        return (balance)




    }

    const isPaymentDay = function (freq, currentDay, currentDayOfMonth) {
        if(freq === 52){
            return currentDay % 7 === 0;
        }
        if(freq === 26){
            return currentDay % 14 === 0;
        }
        if(freq === 12){
            return currentDayOfMonth === 1;
        }
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


    return { minimumRepayments, freqToNumber, calculateBalance, betterCalculateBalance }

})();

export default calc;