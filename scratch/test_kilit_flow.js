// Simulation of browser environment
const fs = require('fs');

let windowObj = {
    location: { pathname: '/sinif9.html' },
    document: {
        readyState: 'complete',
        createElement: (tag) => {
            return {
                id: '',
                className: '',
                style: {},
                attributes: {},
                innerHTML: '',
                setAttribute: function(k, v) { this.attributes[k] = v; },
                addEventListener: function(e, fn) {},
                querySelector: function(sel) { return null; },
                querySelectorAll: function(sel) { return []; },
                classList: {
                    add: function() {},
                    remove: function() {},
                    contains: function() { return false; },
                    toggle: function() {}
                }
            };
        },
        body: {
            appendChild: function(el) {}
        },
        addEventListener: function(e, fn) {},
        getElementById: function(id) { return null; }
    },
    localStorage: {
        _data: {},
        getItem: function(k) { return this._data[k] || null; },
        setItem: function(k, v) { this._data[k] = String(v); },
        removeItem: function(k) { delete this._data[k]; }
    }
};

console.log("Environment mockup created.");
