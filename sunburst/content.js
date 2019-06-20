//content.js
console.log('inject')
class Content {
    constructor() {
        this.storage = STORAGE;
        this.initStorage();
        this.onStorageChanged();
    }

    initStorage() {
        chrome.storage.local.get(this.storage, storage => {
            this.storage = storage;
            this.run();
        });
    }

    saveStorage() {
        chrome.storage.local.set(this.storage);
    }

    run() {
        this.injectShader();
        this.checkTime();
    }

    checkTime() {
        if(this.storage.schedule === 'sunset_to_sunrise') {
            const mustBeOn = this.checkCustomTime('22:00', '07:00');

            if(this.storage.state !== mustBeOn) {
                this.storage.state = mustBeOn;
                this.saveStorage();
            }

        } else if(this.storage.schedule === 'custom') {
            const mustBeOn = this.checkCustomTime(this.storage.timeFrom, this.storage.timeTo);

            if(this.storage.state !== mustBeOn) {
                this.storage.state = mustBeOn;
                this.saveStorage();
            }
        }
    }

    checkCustomTime(from, to) {
        const fromArr = from.split(':');
        const fromHours = fromArr[0] || 0;
        const fromMinutes = fromArr[1] || 0;

        const toArr = to.split(':');
        const toHours = toArr[0] || 0;
        const toMinutes = toArr[1] || 0;

        const time1 = moment().startOf('day').add(fromHours, 'h').add(fromMinutes, 'm');
        const time2 = moment().startOf('day').add(toHours, 'h').add(toMinutes, 'm');

        if(time2.isBefore(time1)) time2.add(1, 'd');

        return moment().isBetween(time1, time2);
    }

    injectShader() {
        const div = document.createElement('div');
        div.id = 'screen-shader';
        div.setAttribute('style', this.styles);
        if(!document.getElementById('screen-shader')) {
            document.documentElement.appendChild(div);
        }
    }

    get styles() {
        return `
            transition: opacity 0.1s ease 0s; 
            z-index: 2147483647;
            margin: 0; 
            border-radius: 0; 
            padding: 0; 
            background: ${this.storage.color}; 
            pointer-events: none; 
            position: fixed; 
            top: -10%; 
            right: -10%; 
            width: 120%; 
            height: 120%; 
            opacity: ${(this.storage.range * 0.008 + 0.2).toFixed(4)};
            mix-blend-mode: multiply; 
            display: ${this.storage.state ? 'block' : 'none'};
        `;
    }

    onStorageChanged() {
        chrome.storage.onChanged.addListener(changes => {
            for(let key in changes) {
                this.storage[key] = changes[key].newValue;
            }
            document.getElementById('screen-shader').setAttribute('style', this.styles);
        });
    }
}

// noinspection JSUnusedGlobalSymbols
const c = new Content();
