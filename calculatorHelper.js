const calc = (function (){
    const minimumRepayments = function (inputs) {
        
        let r = inputs["loan-rate"] / inputs["payment-freq"] / 100;
        let p = inputs["loan-amount"];
        let n = inputs["payment-freq"] * inputs["loan-term"];


        let M = p * (r * Math.pow((1+r),n)) / (Math.pow((1+r),n) -1)

        return M;
    }

    const freqToNumber = function(string){
        if(string === "monthly") return 12;
        if(string === "weekly") return 52;
        if(string === "fortnightly") return 26;
    }

    return {minimumRepayments, freqToNumber}

})();

export default calc;