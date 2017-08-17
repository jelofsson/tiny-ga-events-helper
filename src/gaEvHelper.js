"use strict";

function AnalyticsEventHelper(events) {
    this.events = events;
    this._mandatoryKeys = ["domEvent", "el", "eventCategory", "eventAction"];
    this._availableKeysForEvent = ["eventCategory", "eventAction", "eventLabel", "eventValue"];

    console.group("Received events: ");
    console.log(this.events);
    console.groupEnd();

    if (this._isValidConfig()) {
        this.addEvents(this.events);
    } else {
        throw "Invalid configuration exception.";
    }
}

AnalyticsEventHelper.prototype._isValidConfig = function() {
    if (this.events instanceof Array &&
        this.events.length > 0) {
        console.info('Configuration is Array and bigger than zero.');
        for(var i = 0; i < this.events.length; i++) {
            var currentEvent = this.events[i];
            for(var j = 0; j < this._mandatoryKeys.length; j++) {
                var currentMandatoryKey = this._mandatoryKeys[j];
                console.info('Checking if configuration has mandatory key "' + currentMandatoryKey + '"');
                if (
                    ! currentEvent.hasOwnProperty(currentMandatoryKey) ||
                    currentEvent[currentMandatoryKey] === null
                ) {
                    console.error('The configuration at position ' + j + ' doesn\'t have the mandatory key "' +
                        currentMandatoryKey + '" or it\'s null.');
                    return false
                }
            }
        }
        return true;
    }

    return false;
};

AnalyticsEventHelper.prototype.addEvents = function(events) {
    for(var i = 0; i < events.length; i++) {
        console.info('Adding event "' + events[i].eventCategory + '".');
        this.addEvent(events[i]);
    }
};

AnalyticsEventHelper.prototype._extractValuesFromEvent = function(event, el) {
    var keys = Object.keys(event);
    var values = {};
    console.group('Extracting values from event:');
    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (this._availableKeysForEvent.indexOf(key) == -1) {
            console.log('Invalid key for GA event:"' + key + '".');
            continue;
        }

        var value = event[key];
        if (typeof value === 'function') {
            console.info('Return type of the event key "' + key + '" is a function.');
            values[key] = value.apply(el);
        } else {
            console.info('Return type of the event key "' + key + '" is a literal "' + value + '".');
            values[key] = value;
        }
    }
    console.group("Values:");
    console.log(values);
    console.groupEnd();
    console.groupEnd();
    return values;
};

AnalyticsEventHelper.prototype.addEvent = function(event) {
    var instance = this;
    function extend (target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] === 'object') {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    document.addEventListener('DOMContentLoaded', function() {
        var el = document.querySelectorAll(event.el);
        for(var i = 0; i < el.length; i++) {
            el[i].addEventListener(event.domEvent, function() {
                ga('send',
                    extend(
                        {hitType: 'event'},
                        instance._extractValuesFromEvent(event, this)
                    )
                );
            });
        }
    });
};