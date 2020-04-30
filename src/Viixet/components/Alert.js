let modalBg = 'bg-darkgrey';
const generateTemplate = (message, buttons) => `<div class="modal">
    <div class="modal__backdrop"></div>
    <div class="modal__base card-base ${ modalBg }">
        <div class="container-fluid" style="padding-top: 1em;padding-bottom: 1em;">
            <div class="row">
                <div class="col-xs" style="text-align: center;">
                    ${ message }
                </div>
            </div>
            <div class="row center-xs modal__footer">
                ${ buttons }
            </div>
        </div>
    </div>
</div>`;
const generateButton = (text, type, callback) => `<div class="col-xs">
    <button 
        class="button button-${ type } button-thick" 
        callback="${ callback }">
        <span>${ text }</span>
    </button>
</div>`

function createElement(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; 
}

function viixetAlert({ message, subMessage, buttons }) {
    const fullMessage = `<h1>${ message }</h1>${ !!subMessage ? `<h3>${ subMessage }</h3>` : '' }`;
    const buttonElems = buttons.map((button) => generateButton(button.text, button.type, button.callback));
    const modal = createElement(generateTemplate(fullMessage, buttonElems.join('')));

    document.body.appendChild(modal)

    return new Promise((resolve, reject) => {
        modal.querySelectorAll('.modal__footer .button')
            .forEach((elem) => {
                const callback = elem.getAttribute('callback');

                elem.addEventListener('click', () => {
                    modal.parentNode.removeChild(modal);
                    resolve(callback);
                })
            })
    })
}

export default {
    install(Vue, options = {}) {
        if (typeof options.modalBg === 'string') {
            modalBg = options.modalBg;
        }

        Vue.prototype.viixetAlert = viixetAlert
    }
}