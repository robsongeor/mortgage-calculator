import events from "../pubsub.js";

export class AppModule {
    //Handle DOM for the App
    constructor() {
        this.cacheDOM();
        this.bindEventListeners();
    }

    cacheDOM() {
        this.buttons = {
            createNew: document.querySelector(".create"),
        };
    }

    bindEventListeners() {

        if (this.buttons.createNew) {
            this.buttons.createNew.addEventListener("click", () => {
                events.emit("form:open", true);
                //events.emit("isCreate", true);
            });
        }
    }
}