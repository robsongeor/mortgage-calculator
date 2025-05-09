export default class DataInput {
    constructor({name, label, type = '', value = '', options, formatter = null, valueType}){
        this.name = name;
        this.label = label;
        this.type = type;
        this.value = value;
        this.options = options;
        this.formatter = formatter;
        this.valueType = valueType;

        this.el = this._createElement();
    }

    _createElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'data-input';
    
        const labelEl = document.createElement('label');
        labelEl.textContent = this.label;
        labelEl.htmlFor = this.name;
    
        const inputEl = document.createElement('input');
        inputEl.name = this.name;
        inputEl.type = this.type;
        inputEl.value = this.value;
    
        wrapper.append(labelEl, inputEl);
        return wrapper;
      }

    getElement(){
        return this.el;
    }

    getValue() {
        const inputEl = this.el.querySelector(`[name=${this.name}]`);

        return inputEl.value;  // Default for text, number, etc.
    }
}