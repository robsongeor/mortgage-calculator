import events from "../pubsub.js";

export class TermCardModule {
    constructor() {
        this.container = document.querySelector(".terms-container");
    }

    createCard(term, index) {

        const template = document.querySelector("#template-term-card").content.cloneNode(true);
        const card = template.querySelector(".term-card");

        card.dataset.index = index; // store index for reference

        this.populateCardFields(card, term);

        // Add event listeners
        card.querySelector(".edit").addEventListener("click", () => {
            events.emit("term:requestEdit", Number(card.dataset.index)); // Ask AppController to provide fresh data

        });

        card.querySelector(".delete").addEventListener("click", () => {
            events.emit("term:requestDelete", Number(card.dataset.index));
        });

        return card;
    }

    addCard(term, index) {
        const card = this.createCard(term, index);

        //Layout here


        this.container.appendChild(card);
    }

    renderCards(terms) {
        //Remove all cards,
        this.container.innerHTML = ""

        //append all cards - deleted 
        if (Array.isArray(terms) || terms.length) {
            terms.forEach((term, index) => this.addCard(term, index));
        }


    }

    layoutCards(terms) {
        //Sort cards first
        let sorted = terms.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

        console.table(sorted)

        let rows = [[]]

        //Add fisrt element to first row array.
        if (terms.length > 0) {
            rows[0] = Array.from(sorted);
        }
        
        currentIndex = 0;
        nextIndex = 1;

        //Compare curr to next
        //if stays, nextIndex++
        

        for (let row = 0; row < rows.length; row++) {
            for (let i = 0; i < rows[row].length - 1;) {
                let nextIndex = 1;

                let currRow = rows[row];


                const aStart = new Date(currRow[i].startDate);
                const bStart = new Date(currRow[i + 1].startDate);

                const aEnd = this.getEndDate(currRow[i]);
                const bEnd = this.getEndDate(currRow[i + 1]);

                console.log(i);

                if (bStart > aStart && bEnd > aEnd) {
                   console.log(`${bStart} is > ${aStart} && ${bEnd} is > ${aEnd}`)
                    i++
                }
                else {
                    //console.log(`${[i]} inside of ${[i+1]}` )

                    if (!Array.isArray(rows[row + 1])) {
                        rows.push([])
                    }
                    
                    rows[row + 1].push(currRow[i + 1])
                    currRow.splice((i + 1), 1);
                    rows[row].splice(i+1, 1)

                    
                }


            }
        }

        console.table(rows)

    }

    groupByNonOverlappingDates(terms) {
        const rows = [];
      
        // Sort by startDate first for consistency
        const sorted = [...terms].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
        sorted.forEach(term => {
          const termStart = new Date(term.startDate);
          const termEnd = this.getEndDate(term);
          console.log(termEnd)
      
          let placed = false;
      
          // Try to place term into an existing row
          for (const row of rows) {
            const hasOverlap = row.some(existing => {
              const existingStart = new Date(existing.startDate);
              const existingEnd = this.getEndDate(existing);
              return termStart < existingEnd && existingStart < termEnd;
            });
      
            if (!hasOverlap) {
              row.push(term);
              placed = true;
              break;
            }
          }
      
          // If it couldn't be placed, make a new row
          if (!placed) {
            rows.push([term]);
          }
        });
        console.log(rows)
        return rows;
      }


    formatTermDuration(term) {


        const months = Number(term.termMonths) !== 0 ? `${term.termMonths} months` : "";
        const years = Number(term.termYears) === 1 ? "year" : "years";
        return `${term.termYears} ${years} ${months}`;
    }

    populateCardFields(card, term) {
        card.querySelector(".loan-title").textContent = this.getTitleString(term)
        card.querySelector(".loan-dates").textContent = this.getLoanDatesString(term)

        card.querySelector(".interest-paid").textContent = `Interest Paid: $${term.interestPaid}`;
        card.querySelector(".principle-paid").textContent = `Principle Paid: $${term.principlePaid}`;
        card.querySelector(".total-paid").textContent = `Total Paid: $${term.totalPaid}`;
        card.querySelector(".balance").textContent = `Balance: $${term.balance}`;
    }

    getEndDate(term) {
        const startDate = new Date(term.startDate);

        const years = Number(term.termYears);
        const months = Number(term.termMonths);

        return new Date(
            startDate.getFullYear() + years,
            startDate.getMonth() + months,
            startDate.getDate()
        )


    }

    getLoanDatesString(term) {

        const startDate = new Date(term.startDate);

        const endDate = this.getEndDate(term);

        const options = {
            year: "numeric",
            month: "long",
            day: "numeric"
        }

        return `From ${startDate.toLocaleDateString(undefined, options)} till ${endDate.toLocaleDateString(undefined, options)}`
    }

    getTitleString(term) {
        const amountNumeric = parseInt(term.amount, 10);

        const formattedAmount = amountNumeric.toLocaleString("en-NZ", {
            style: "currency",
            currency: "NZD",
            minimumFractionDigits: 0
        });

        const duration = this.formatTermDuration(term);

        return `${formattedAmount} fixed at ${term.rate}% for ${duration}`
    }

}
