import events from "../pubsub.js";

export class TermCardModule{
    //Handles the displaying of the terms
    constructor(){
        this.termCards = [];

        this.bindEvents()
    }

    createNewTermCard(term){
        let newTermCard = new TermCard(term.index);
        newTermCard.updateContent(term)

        this.termCards.push(newTermCard)
        
    }

    updateTermCard(term){
        let index = term.index;

        this.termCards[index].updateContent(term)
    }

    
    deleteTermAtIndex(index){
        //Remove element from DOM
        this.termCards[index].cacheDOM.termCard.remove();
        
        //remove element from array
        this.termCards.splice(index, 1);

        //update indices for each item
        this.updateIndices()
    }

    updateIndices(){
        this.termCards.forEach((element, index) => {
            console.log
            element.index = index;
        });
    }


    bindEvents(){
        events.on("CreateNewTermCard", this.createNewTermCard.bind(this))
        events.on("DeleteTermButton", this.deleteTermAtIndex.bind(this))
        events.on("UpdatedTerm", this.updateTermCard.bind(this))
    }
}