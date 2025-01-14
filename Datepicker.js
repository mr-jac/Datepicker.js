
// Comment out these lines below for basic vanilla JS implementation
module.exports = function (options) {
  if (options) {
    return new Datepicker(options);
  } else if (!options || typeof options === undefined) {
    throw "Error: Datepicker.js options object must be defined, with at least options.containerElement.";
  }
  if (options.containerElement === undefined || !options.containerElement) {
    throw "Error: you must specify a container element in the Datepicker.js options object!";
  }
};


class Datepicker {
    constructor(options) {
        // Validation
        if (!options || typeof options === undefined) {
            throw "Error: Datepicker.js options object must be defined, with at least options.containerElement.";
        }
        if (options.containerElement === undefined || !options.containerElement) {
            throw "Error: you must specify a container element in the Datepicker.js options object!";
        }
        // html element prototypal inheritance of hide/show methods for UI elements
        Element.prototype.hideDatepickerEl = function () {
            this.style.visibility = 'hidden';
        }
        Element.prototype.showDatepickerEl = function () {
            this.style.visibility = '';
        }
        // these hide/show methods specifically tailored to the elements they hide/show
        Element.prototype.hideContainer = function () {
            this.style.display = 'none';
        }
        Element.prototype.showContainer = function () {
            this.style.display = 'block';
        }
        Element.prototype.hideCalendar = function () {
            this.style.display = 'none';
        }
        Element.prototype.showCalendar = function () {
            this.style.display = 'grid';
        }
        Element.prototype.hidePresetMenu = function () {
            this.style.display = 'none';
        }
        Element.prototype.showPresetMenu = function () {
            this.style.display = 'flex';
        }

        // options
        /**
         * @type {object} options REQUIRED -  holds references to element objects that contain values that make up time
         * @property {HTML} options.containerElement REQUIRED - HTML element to instantiate the datepicker in
         * @property {Boolean} this.options.timePicker Optional - include time picker inputs - Defaults to false
         * @property {Boolean} this.options.presetMenu Optional - include presets such as "this week, next week, etc. - Defaults to false
         * @property {Boolean} this.options.autoClose Optional - whether or not the datepicker autocloses when selection is complete - Defaults to false
         * @property {Boolean} this.options.singleDate Optional - whether the datepicker allows single date choice, or date range - Defaults to false
         * @property {Boolean} this.options.leadingTrailingDates Optional - whether the datepicker shows leading/trailing dates on the calendar - Defaults to true
         * @property {Boolean} this.options.militaryTime Optional - 24h format for military time - Defaults to false (12h, am/pm)
         * @property {string} this.options.format Optional - Must be a Valid Moment.js format. defaults to "MM/DD/YYYY hh:mm A"
         * @property {string} this.options.startDateLabel Optional - Custom label for date/time, must be a string, defaults to "Start Date: "
         * @property {string} this.options.endDateLabel Optional - Custom label for date/time, must be a string, defaults to "End Date: "
         * @property {Date} this.options.moment Optional - Date for the calendar to initialize on, defaults to today, this month, this year
         * @property {Date} this.options.min Optional - Minimum date allowed for users to click, must be a moment date format
         * @property {Date} this.options.max Optional - Maximum date allowed for users to click, must be a moment date format
         * @property {Array of objects} this.options.menuOptions Optional - array of preset menu options [{ title: 'This Week', values: [moment(date), moment(date)] }]
         * @property {Array of Dates} this.options.defaults Optional - array of start and end dates [new Date(), new Date()] that the datepicker will default to if no dates chosen
         * @property {Function} this.options.onChange Optional - Function that invokes when dates are changed. function () { method logic }
         * @property {Function} this.options.onSubmit Optional - Function that invokes when submit "check mark" button is clicked. function () { method logic }
         * @property {Function} this.options.onClose Optional - Function that invokes whenever the calendar UI is closed. function () { method logic }
         */
        this.options = options;
        this.max = typeof this.options.max === "object" ? this.options.max : false;
        this.min = typeof this.options.min === "object" ? this.options.min : false;
        this.containerElement = options.containerElement;
        this.containerElement.classList.add('DatepickerContainer'); // ensures Datepicker styling is applied.
        this.timePicker = this.options.timePicker !== undefined ? this.options.timePicker : true;
        this.presetMenu = this.options.presetMenu !== undefined ? this.options.presetMenu : true;
        this.menuOptions = this.options.menuOptions !== undefined ? this.options.menuOptions : [];
        this.autoClose = this.options.autoClose !== undefined ? this.options.autoClose : false;
        this.singleDate = this.options.singleDate !== undefined ? this.options.singleDate : false;
        this.clearDates = this.options.clearDates !== undefined ? this.options.clearDates : false;
        this.leadingTrailingDates = this.options.leadingTrailingDates !== undefined ? this.options.leadingTrailingDates : true;
        this.militaryTime = this.options.militaryTime !== undefined ? this.options.militaryTime : false;
        this.format = this.options.format || (this.timePicker ? (this.militaryTime ? "MM/DD/YYYY HH:mm:ss" : "MM/DD/YYYY hh:mm A") : "MM/DD/YYYY");
        this.startDateLabel = !this.singleDate ? (this.options.startDateLabel !== undefined ? this.options.startDateLabel : "Start Date: ") : (this.options.startDateLabel !== undefined ? this.options.startDateLabel : "Date: ");
        this.endDateLabel = this.options.endDateLabel !== undefined ? this.options.endDateLabel : "End Date: ";
        // ensure current date is within programmed max/min
        if (this.max && moment(this.max).unix() < moment().unix()) {
            this.moment = moment(moment(this.max), this.format, true);
        } else {
            this.moment = moment(moment(), this.format, true);
        }
        if (this.min && moment(this.min).unix() > moment().unix()) {
            this.moment = moment(moment(this.min), this.format, true);
        } else {
            this.moment = moment(moment(), this.format, true);
        }
        this.onChange = this.options.onChange !== undefined ? this.options.onChange : function () {
            //  console.log('onChange', this.dates);
            return;
        };
        this.onSubmit = this.options.onSubmit !== undefined ? this.options.onSubmit : function () {
            //  console.log('onSubmit', this.dates);
            return;
        };
        this.onClose = this.options.onClose !== undefined ? this.options.onClose : function () {
            //  console.log('onClose', this.dates);
            return;
        };
        // methods bound to state context
        this.drawCalendar = this.drawCalendar.bind(this);
        this.dayClick = this.dayClick.bind(this);
        this.nextMonth = this.nextMonth.bind(this);
        this.lastMonth = this.lastMonth.bind(this);
        this.highlightDates = this.highlightDates.bind(this);
        this.toggleAMPM = this.toggleAMPM.bind(this);
        this.clickAMPM = this.clickAMPM.bind(this);
        this.inputElement = document.createElement('div');
        this.drawInputElement = this.drawInputElement.bind(this);
        this.openCalendar = this.openCalendar.bind(this);
        this.closeCalendar = this.closeCalendar.bind(this);
        this.openPresetMenu = this.openPresetMenu.bind(this);
        this.closePresetMenu = this.closePresetMenu.bind(this);
        this.resetCalendar = this.resetCalendar.bind(this);
        this.reset = this.reset.bind(this);
        this.value = this.value.bind(this);
        this.startDate = this.startDate.bind(this);
        this.endDate = this.endDate.bind(this);
        this.outsideCalendarClick = this.outsideCalendarClick.bind(this);
        this.isOutsideCalendar = this.isOutsideCalendar.bind(this);
        this.leadingTrailing = this.leadingTrailing.bind(this);
        this.defaultDatesValid = this.defaultDatesValid.bind(this);
        this.drawPresetMenu = this.drawPresetMenu.bind(this);
        this.hourChange = this.hourChange.bind(this);
        this.updDownClick = this.upDownClick.bind(this);
        this.createHourUpDown = this.createHourUpDown.bind(this);
        this.minuteBuild = this.minuteBuild.bind(this);
        this.drawStartTimePicker = this.drawStartTimePicker.bind(this);
        this.drawEndTimePicker = this.drawEndTimePicker.bind(this);
        this.snapTo = this.snapTo.bind(this);
        this.toAmPm = this.toAmPm.bind(this);
        this.timeValid = this.timeValid.bind(this);
        //  values, not typically set programmatically.
        this.dates = [];
        // default dates to be determined programmatically.
        this.defaults = this.options.defaults !== undefined ? this.options.defaults : true;
        this.defaultsValid = this.defaultDatesValid();
        if (this.defaultsValid && this.defaults) {
            this.defaults = [];
            if (this.defaults[0]) {
                this.defaults[0] = typeof this.options.defaults === 'object' && this.options.defaults.length ? moment(this.options.defaults[0]).format(this.format) : false;
            }
            if (this.defaults[0]) { this.dates[0] = this.defaults[0] };
            if (!this.singleDate) {
                this.defaults[1] = typeof this.options.defaults === 'object' && this.options.defaults.length === 2 ? moment(this.options.defaults[1]).format(this.format) : false;
                if (this.defaults[1]) { this.dates[1] = this.defaults[1] };
            }
        }
        this.timeElements = {};
        this.startHour = "12";
        this.startMinute = "00";
        this.startAmPm = "PM";
        this.endHour = "12";
        this.endMinute = "00";
        this.endAmPm = "PM";
        // initialization logic (constructor)
        this.drawCalendar();
        this.drawInputElement();
        if (this.presetMenu) { this.drawPresetMenu(); this.closePresetMenu(); };
        this.calendarPlacement();
        this.calendarElement.hideCalendar();
    }
    toggleAMPM(which) {
        let param = (which === 'startHour') ? this.startAmPm : this.endAmPm;
        let amElement = (which === 'startHour') ? this.timeElements.startam : this.timeElements.endam;
        let pmElement = (which === 'startHour') ? this.timeElements.startpm : this.timeElements.endpm;
        if (param === 'PM') {
            amElement.dispatchEvent(new Event('click'));
        } else {
            pmElement.dispatchEvent(new Event('click'));
        }
    }
    clickAMPM(event) {
        let clickedDiv = event.target;
        Array.from(clickedDiv.parentElement.children).forEach(function(div){
            if (div == clickedDiv) {
                div.setAttribute("SELECTED","true");
            } else {
                div.removeAttribute("SELECTED");
            }
        });
        if (clickedDiv.parentElement.parentElement.classList.contains('startTimeElement')) {
            this.startAmPm = (clickedDiv.classList.contains('am')) ? 'AM' : 'PM';
        } else {
            this.endAmPm = (clickedDiv.classList.contains('am')) ? 'AM' : 'PM';
        }
        this.setTime();
    }
    // draw input element displaying chosen dates/times
    drawInputElement() {
        this.inputElement.innerHTML = '';
        this.inputElement.setAttribute('class', 'launch');
        //This creates the heading elements for the start and end date titles

        //Date Time Input Element Start
        let startBlock = document.createElement('div');
        let startHead = document.createElement('div');
        let endHead = document.createElement('div');
        let endBlock = document.createElement('div');
        let startDate = document.createElement('div');
        let endDate = document.createElement('div');

        startHead.innerHTML = this.startDateLabel;

        startBlock.setAttribute("class", "startBlock");
        startHead.setAttribute("class", "heading");
        startBlock.appendChild(startHead);
        startBlock.appendChild(startDate);
        startDate.innerHTML = moment(this.dates[0]).format(this.format);
        startDate.setAttribute("class", "date");

        this.inputElement.appendChild(startBlock);

        endHead.setAttribute("class", "heading");

        if (!this.singleDate) {
            endHead.innerHTML = this.endDateLabel;
            endBlock.appendChild(endHead);
            endDate.setAttribute("class", "date");
            endBlock.appendChild(endDate);
            endBlock.setAttribute("class", "endBlock");
            this.inputElement.appendChild(endBlock);
        }

        if (this.dates[0]) {
            startDate.innerHTML = moment(this.dates[0]).format(this.format);
        } else {
            if (this.timePicker) {
                startDate.innerHTML = " --/--/----  --:-- ";
            } else {
                startDate.innerHTML = " --/--/---- ";
            }
        }
        if (!this.singleDate) {
            if (this.dates[1] && typeof this.dates[1] !== undefined) {
                endDate.innerHTML = moment(this.dates[1]).format(this.format);
            } else {
                if (this.timePicker) {
                    endDate.innerHTML = " --/--/----  --:-- ";
                } else {
                    endDate.innerHTML = " --/--/---- ";
                }
            }
        }
        this.inputElement.addEventListener('click', function (event) {
            this.openCalendar();
        }.bind(this));
        this.containerElement.appendChild(this.inputElement);
    }
    // draws calendar element for selecting dates/times
    drawCalendar() {
        // we need to first set the first and last of the month in the state
        this.firstDayOfMonth = this.moment.startOf('month').format("dddd");
        this.lastDayOfMonth = this.moment.endOf('month').format("dddd");
        // then set our callback methods so they have the proper context
        let callbackNextMonth = this.nextMonth;
        let callbackLastMonth = this.lastMonth;
        let callbackSetDate = this.dayClick;
        // Calendar UI
        let calendar = document.createElement('div');
        // add day headers (mon, tues, wed, etc.)
        let monthHeader = document.createElement('div');
        monthHeader.setAttribute('style', 'grid-column-start: 2; grid-column-end: 5;');
        let yearHeader = document.createElement('div');
        yearHeader.setAttribute('style', 'grid-column-start: 5; grid-column-end: 7;');
        // month selector to pick month from dropdown
        let monthSelect = document.createElement('select');
        monthSelect.setAttribute("name", "months");
        monthSelect.setAttribute("class", "datepicker-month-select");
        monthSelect.setAttribute("aria-label", "datepicker-month-select");
        this.moment._locale._months.forEach(function (month, index) {
            let option = document.createElement('option');
            option.innerHTML = month;
            option.value = index + 1;
            if (month === this.moment._locale._months[this.moment.month()]) {
                option.selected = true;
            }
            monthSelect.appendChild(option);
        }.bind(this));
        monthSelect.addEventListener('change', function (e) {
            this.moment.month(monthSelect.value - 1);
            this.snapTo();
        }.bind(this));
        // year selector to type custom year
        let yearInput = document.createElement('input');
        yearInput.setAttribute("type", "number");
        yearInput.setAttribute("name", "year");
        yearInput.setAttribute("class", "datepicker-year-input");
        yearInput.setAttribute("aria-label", "datepicker-year-input");
        yearInput.value = this.moment.year();
        yearInput.addEventListener('change', function (e) {
            if (parseInt(yearInput.value) < 1900 || parseInt(yearInput.value) > 2200) { // hard-coded limits for now to prevent moment from breaking
                yearInput.value = this.moment.year();
                return;
            }
            this.moment.year(yearInput.value);
            this.snapTo();
        }.bind(this));
        let yearUp = document.createElement('span');
        yearUp.innerHTML = "&#43;";
        yearUp.setAttribute('class', 'increase-year-button');
        yearUp.setAttribute('aria-label', 'Increase Year Button');
        yearUp.setAttribute('role', 'button');
        yearUp.addEventListener('click', function (e) {
            yearInput.stepUp();
            yearInput.dispatchEvent(new Event('change'));
        }.bind(this));
        let yearDown = document.createElement('span');
        yearDown.innerHTML = "&#x2212;";
        yearDown.setAttribute('class', 'decrease-year-button');
        yearDown.setAttribute('aria-label', 'Decrease Year Button');
        yearDown.setAttribute('role', 'button');
        yearDown.addEventListener('click', function (e) {
            yearInput.stepDown();
            yearInput.dispatchEvent(new Event('change'));
        }.bind(this));
        // hamburger menu icon
        this.menuIconContainer = document.createElement('div');
        this.menuIconContainer.setAttribute('style', 'grid-column-start: 1; grid-column-end: 2; background-color: transparent !important;');
        this.menuIconContainer.setAttribute('aria-label', 'Preset Menu Button');
        this.menuIconContainer.setAttribute('role', 'menu');
        if (this.presetMenu) {
            let menuIcon = document.createElement('span');
            menuIcon.innerHTML = "&#9776;"
            menuIcon.classList.add('calendarHamburger');
            this.menuIconContainer.addEventListener('click', function (event) {
                if (this.menuIconContainer.classList.contains('open')) {
                    this.closePresetMenu();
                    this.menuIconContainer.classList.remove('open');
                } else {
                    this.openPresetMenu();
                    this.menuIconContainer.classList.add('open');
                }
            }.bind(this));
            this.menuIconContainer.appendChild(menuIcon);
        }
        // left/right arrows for adjusting month
        let leftArrow = document.createElement('div');
        leftArrow.classList.add("leftArrow");
        leftArrow.setAttribute('style', 'background-color: transparent !important;');
        leftArrow.setAttribute('aria-label', 'Previous Month Button');
        leftArrow.setAttribute('role', 'navigation');
        leftArrow.innerHTML = "&#5130;";
        leftArrow.addEventListener('click', callbackLastMonth.bind(this));

        let rightArrow = document.createElement('div');
        rightArrow.classList.add("rightArrow");
        rightArrow.setAttribute('style', 'background-color: transparent !important;');
        rightArrow.setAttribute('aria-label', 'Next Month Button');
        rightArrow.setAttribute('role', 'navigation');
        rightArrow.innerHTML = "&#5125;"
        rightArrow.addEventListener('click', callbackNextMonth.bind(this));
        // month text eg. "November - 2020"
        monthHeader.appendChild(leftArrow);
        monthHeader.appendChild(monthSelect);
        monthHeader.appendChild(rightArrow);

        yearHeader.appendChild(yearDown);
        yearHeader.appendChild(yearInput);
        yearHeader.appendChild(yearUp);

        monthHeader.classList.add('monthHeader');
        yearHeader.classList.add('yearHeader');
        calendar.classList.add('grid-container');
        // close calendar icon
        let closeCalendarIconContainer = document.createElement('div');
        closeCalendarIconContainer.setAttribute('style', 'grid-column-start: 7; grid-column-end: 8; background-color: transparent !important;');
        closeCalendarIconContainer.setAttribute('aria-label', 'Preset Menu Button');
        closeCalendarIconContainer.setAttribute('role', 'button');
        let closeCalendarIcon = document.createElement('span');
        closeCalendarIcon.innerHTML = "&#10006;";
        closeCalendarIcon.classList.add('close-calendar-button');
        closeCalendarIconContainer.addEventListener('click', function (event) {
            this.closeCalendar();
        }.bind(this));
        closeCalendarIconContainer.appendChild(closeCalendarIcon);
        // add all the UI elements to the calendar
        calendar.appendChild(this.menuIconContainer);
        calendar.appendChild(monthHeader);
        calendar.appendChild(yearHeader);
        calendar.appendChild(closeCalendarIconContainer);
        //add day header elements: "mon, tues, wed etc."
        this.moment._locale._weekdaysShort.forEach(function (day) {
            let dayHeader = document.createElement('div');
            dayHeader.classList.add(day);
            dayHeader.classList.add('dayHeader');
            // adding aria-label for each day
            switch (day) {
                case 'Sun':
                    dayHeader.setAttribute('aria-label', 'Sunday');
                    break;
                case 'Mon':
                    dayHeader.setAttribute('aria-label', 'Monday');
                    break;
                case 'Tue':
                    dayHeader.setAttribute('aria-label', 'Tuesday');
                    break;
                case 'Wed':
                    dayHeader.setAttribute('aria-label', 'Wednesday');
                    break;
                case 'Thu':
                    dayHeader.setAttribute('aria-label', 'Thursday');
                    break;
                case 'Fri':
                    dayHeader.setAttribute('aria-label', 'Friday');
                    break;
                case 'Sat':
                    dayHeader.setAttribute('aria-label', 'Saturday');
                    break;
            }
            dayHeader.innerHTML = " " + day + " ";
            calendar.appendChild(dayHeader);
        });
        // add day elements (day cells) to calendar
        let daysInMonth = Array.from(Array(this.moment.daysInMonth()).keys());
        let leadingTrailing = this.leadingTrailing();
        let firstDayPos = this.moment._locale._weekdays.indexOf(this.firstDayOfMonth) + 1;
        let lastDayPos = this.moment._locale._weekdays.indexOf(this.lastDayOfMonth) + 1;
        //add last months trailing days to calendar
        if (this.leadingTrailingDates) {
            for (let i = firstDayPos - 1; i > 0; i--) {
                let dayCell = document.createElement('div');
                dayCell.classList.add("prev-month-day-" + (parseInt(leadingTrailing.trailing[i] + 1)));
                dayCell.classList.add("leading-trailing-day");
                dayCell.innerHTML = (parseInt(leadingTrailing.trailing[i]) + 1);
                dayCell.setAttribute('aria-label', (parseInt(leadingTrailing.trailing[i] + 1)) + '');
                if (i === 0) {
                    dayCell.classList.add('grid-column-start:0;');
                }
                calendar.appendChild(dayCell);
            }
        }
        let max = this.max ? moment(this.max).unix() : false;
        let min = this.min ? moment(this.min).unix() : false;
        // add this months days to calendar
        daysInMonth.forEach(function (day) {

            let dayCell = document.createElement('div');
            dayCell.classList.add("day-" + (parseInt(day) + 1));
            dayCell.classList.add("day");
            dayCell.innerHTML = parseInt(day) + 1;
            let dateString = moment(this.moment.format("MM") + "/" + parseInt(day + 1) + "/" + this.moment.format("YYYY")).format(this.format);
            dayCell.setAttribute('role', 'button');
            dayCell.setAttribute('aria-label', dateString);
            dayCell.value = dateString;

            let currentDate = moment(dayCell.value).unix();
            // if date is greater than max or less than min, disable
            if (max && currentDate > max) {
                dayCell.classList.add("disabled");
                dayCell.setAttribute('disabled', true);
            } else if (min && currentDate < min) {
                dayCell.classList.add("disabled");
                dayCell.setAttribute('disabled', true);
            } else {
                dayCell.addEventListener('click', callbackSetDate.bind(this, dayCell));
            }
            calendar.appendChild(dayCell);
        }.bind(this));
        // add next months leading days to calendar.
        if (this.leadingTrailingDates) {
            for (let i = 1; i < 8 - lastDayPos; i++) {
                let dayCell = document.createElement('div');
                dayCell.classList.add("next-month-day-" + i);
                dayCell.classList.add("leading-trailing-day");
                dayCell.innerHTML = i;
                dayCell.setAttribute('aria-label', 'day-' + i + '-next-month');
                if (i === 0) {
                    dayCell.classList.add('grid-column-start:' + lastDayPos + ';');
                }
                calendar.appendChild(dayCell);
            }
        }
        // set the first of the month to be positioned on calendar based on day of week
        let firstDayElement = calendar.querySelector('.day-1');
        let monthStartPos = 'grid-column-start: ' + firstDayPos + ';';
        // console.log(monthStartPos, firstDayElement);
        firstDayElement.setAttribute('style', monthStartPos);
        // Footer elements, contains start/end dates selected
        this.startDateElement = document.createElement('div');
        this.startDateHeader = document.createElement('div');
        this.startDateHeader.innerHTML = "<b>" + this.startDateLabel + "</b>"
        this.startDateContainer = document.createElement('div');
        this.startDateContainer.classList.add('startDateElement');

        this.endDateElement = document.createElement('div');
        this.endDateHeader = document.createElement('div');
        this.endDateHeader.innerHTML = "<b>" + this.endDateLabel + "</b>"
        this.endDateContainer = document.createElement('div');
        this.endDateContainer.classList.add('endDateElement');

        // start/end date elements based on singleDate options
        if (!this.singleDate) {
            this.startDateContainer.setAttribute('style', 'grid-column-start: 1; grid-column-end: 4;');
            if (this.timePicker) {
                this.startDateElement.innerHTML = "--/--/----  --:--";
            } else {
                this.startDateElement.innerHTML = "--/--/----";
            }
        } else {
            this.startDateContainer.setAttribute('style', 'grid-column-start: 1; grid-column-end: 8;');
            if (this.timePicker) {
                this.startDateElement.innerHTML = "--/--/----  --:--";
            } else {
                this.startDateElement.innerHTML = "--/--/----";
            }
        }
        this.startDateContainer.appendChild(this.startDateHeader);
        this.startDateContainer.appendChild(this.startDateElement);
        calendar.appendChild(this.startDateContainer);

        this.calendarElement = calendar;
        // timepicker init based on options
        if (this.timePicker) {
            this.drawStartTimePicker();
            if (!this.singleDate) {
                if (this.timePicker) {
                    this.endDateContainer.setAttribute('style', 'grid-column-start: 1; grid-column-end: 4;');
                    this.endDateElement.innerHTML = "--/--/----  --:--";
                } else {
                    this.endDateContainer.setAttribute('style', 'grid-column-start: 5; grid-column-end: 8;');
                    this.endDateElement.innerHTML = "--/--/----";
                }
                this.endDateContainer.appendChild(this.endDateHeader);
                this.endDateContainer.appendChild(this.endDateElement);
                this.calendarElement.appendChild(this.endDateContainer);
                this.drawEndTimePicker();
            }
        } else {
            if (!this.singleDate) {
                if (this.timePicker) {
                    this.endDateContainer.setAttribute('style', 'grid-column-start: 1; grid-column-end: 4;');
                    this.endDateElement.innerHTML = "--/--/----  --:--";
                } else {
                    this.endDateContainer.setAttribute('style', 'grid-column-start: 5; grid-column-end: 8;');
                    this.endDateElement.innerHTML = "--/--/----";
                }
                this.endDateContainer.appendChild(this.endDateHeader);
                this.endDateContainer.appendChild(this.endDateElement);
                this.calendarElement.appendChild(this.endDateContainer);
            }
        }
        // cancel dates button:
        let cancelButton = document.createElement('button');
        cancelButton.classList.add("cancelButton");
        cancelButton.type = 'cancel';
        cancelButton.style.gridColumnStart = 1;
        cancelButton.style.gridColumnEnd = 3;
        cancelButton.addEventListener("click", function (event) {
            if (this.clearDates) {
                this.resetCalendar();
            } else {
                this.closeCalendar();
            }
        }.bind(this));
        // TODO: Add conditional styling and text for clearDates=true, and false
        if (this.clearDates) {
            if (this.defaults === true || this.defaults.length) {
                cancelButton.innerHTML = "&#x21BA;";
            } else {
                cancelButton.innerHTML = "&#10006;";
            }
        } else {
            cancelButton.innerHTML = "&#10006;";
            cancelButton.style.backgroundColor = "grey";
        }
        calendar.appendChild(cancelButton);
        // submit dates button:
        let submitButton = document.createElement('button');
        submitButton.classList.add("submitButton");
        submitButton.innerHTML = "&#10004;";
        submitButton.type = 'submit';
        submitButton.style.gridColumnStart = 3;
        submitButton.style.gridColumnEnd = 8;
        submitButton.addEventListener('click', function (event) {
            this.onSubmit();
            this.closeCalendar();
        }.bind(this));
        calendar.appendChild(submitButton);
        // Finally, add calendar element to the containerElement assigned during initialization
        this.containerElement.appendChild(calendar);
        // add the click off method to hide calendar when user clicks off:
        document.addEventListener('click', function (event) {
            this.outsideCalendarClick(event);
        }.bind(this));

    }
    // draws preset menu and options if allowed programmatically.
    drawPresetMenu() {
        this.presetMenuContainer = document.createElement('div');
        this.presetMenuContainer.setAttribute('class', 'presetMenuContainer');
        let menuOptionsContainer = document.createElement('ul');
        let today = new Date();
        // default preset menu options
        let menuOptions = [];
        if (!this.singleDate) {
            menuOptions = [
                { title: 'This Week', values: [moment(today).startOf('week'), moment(today).endOf('week')] },
                { title: 'Next Week', values: [moment(today).add(+1, 'week').startOf('week'), moment(today).add(+1, 'week').endOf('week')] },
                { title: 'Last Week', values: [moment(today).add(-1, 'week').startOf('week'), moment(today).add(-1, 'week').endOf('week')] },
                { title: 'This Month', values: [moment(today).startOf('month'), moment(today).endOf('month')] },
                { title: 'Next Month', values: [moment(today).add(+1, 'month').startOf('month'), moment(today).add(+1, 'month').endOf('month')] },
                { title: 'Last Month', values: [moment(today).add(-1, 'month').startOf('month'), moment(today).add(-1, 'month').endOf('month')] },
                { title: 'This Year', values: [moment(today).startOf('year'), moment(today).endOf('year')] },
                { title: 'Next Year', values: [moment(today).add(+1, 'year').startOf('year'), moment(today).add(+1, 'year').endOf('year')] },
                { title: 'Last Year', values: [moment(today).add(-1, 'year').startOf('year'), moment(today).add(-1, 'year').endOf('year')] },
            ];
        } else {
            menuOptions = [
                { title: 'Yesterday', values: [moment(today).add(-1, 'day').hour(0).minute(0)] },
                { title: 'Today', values: [moment(today).hour(0).minute(0)] },
                { title: 'Tomorrow', values: [moment(today).add(1, 'day').hour(0).minute(0)] }
            ];
        }

        // adds any menu options passed into the class constructor options programmatically
        if (this.menuOptions !== undefined && this.menuOptions.length > 0) {
            let max = this.max ? moment(this.max).unix() : false;
            let min = this.min ? moment(this.min).unix() : false;

            for (let i = 0; i < this.menuOptions.length; i++) {
                let startDate = moment(this.menuOptions[i].values[0]).unix();
                let endDate = moment(this.menuOptions[i].values[1]).unix();
                if ((max && max < endDate) || (min && min > startDate)) {
                    console.warn('Datepicker.js: Preset menu option: "' + this.menuOptions[i].title + '" lies partially or entirely outside max/min allowed and was disabled.');
                } else {
                    menuOptions.push(this.menuOptions[i]);
                }
            }
        }
        // adds all options to the UI
        for (let menuOption of menuOptions) {
            let max = this.max ? moment(this.max).unix() : false;
            let min = this.min ? moment(this.min).unix() : false;
            let startDate = moment(menuOption.values[0]).unix();
            let endDate = moment(menuOption.values[1]).unix();
            if ((max && max < endDate) || (min && min > startDate)) {
                console.warn('Datepicker.js: Preset menu option: "' + menuOption.title + '" lies partially or entirely outside max/min allowed and was disabled.');
            } else {
                let menuListElement = document.createElement('li');
                menuListElement.setAttribute('class', menuOption.title + "-menu-option");
                menuListElement.innerHTML = menuOption.title;
                menuListElement.addEventListener('click', function (event) {
                    this.dates.length = 0;
                    this.highlightDates();
                    this.dates[0] = (menuOption.values[0]);
                    if (!this.singleDate) {
                        this.dates[1] = (menuOption.values[1]);
                    }
                    // invoke highlighting fn to ensure calendar UI is updated
                    let onChange = this.onChange;
                    this.onChange = function () { };
                    this.highlightDates();
                    this.snapTo(this.dates[0], true);
                    if (this.timePicker) {
                        this.setTime(true);
                    } else {
                        this.startDateElement.innerHTML = moment(this.dates[0]).format(this.format);
                        if (!this.singleDate) {
                            this.endDateElement.innerHTML = moment(this.dates[1]).format(this.format);
                        }
                    }
                    this.drawInputElement();
                    this.onChange = onChange;
                    this.onChange();
                    this.menuIconContainer.classList.remove('open');
                }.bind(this));
                menuOptionsContainer.appendChild(menuListElement);
            }
        }
        // close preset menu icon
        let closePresetIconContainer = document.createElement('div');
        closePresetIconContainer.setAttribute('style', 'background-color: transparent !important;');
        closePresetIconContainer.setAttribute('aria-label', 'Preset Menu Close Button');
        closePresetIconContainer.setAttribute('role', 'button');
        let closePresetIcon = document.createElement('span');
        closePresetIcon.innerHTML = "&#10006;";
        closePresetIcon.classList.add('close-preset-menu');
        closePresetIconContainer.addEventListener('click', function (event) {
            this.closePresetMenu();
            this.menuIconContainer.classList.remove('open');
        }.bind(this));
        closePresetIconContainer.appendChild(closePresetIcon);
        this.presetMenuContainer.appendChild(closePresetIconContainer);
        this.presetMenuContainer.appendChild(menuOptionsContainer);
        this.calendarElement.appendChild(this.presetMenuContainer);
    }
    hourChange(event) {
        let newVal = (event.target == document.querySelector('input#endHour')) ? this.timeElements.endHourValueEl.value : this.timeElements.startHourValueEl.value
        newVal = !this.militaryTime ? this.toMilitary(parseInt(newVal)) : parseInt(newVal);
        if (newVal > 23) {
            newVal = 0;
        } else if (newVal < 1) {
            newVal = 23;
        }
        if (newVal < 10 && this.militaryTime) {
            newVal = "0" + newVal;
        }
        newVal = this.militaryTime ? newVal : this.toAmPm(newVal);
        if (event.target == document.querySelector('input#endHour')) {
            this.timeElements.endHourValueEl.value = newVal;
        } else {
            this.timeElements.startHourValueEl.value = newVal;
        }
        this.setTime();
    }
    upDownClick(element,direction,increment){
        let current = element.value;
        if (!(current % increment === 0 || parseInt(current) === 0)) {
            increment = 1;
        }
        element.value = (direction == 'up') ? parseInt(current) + increment : parseInt(current) - increment;
        if (this.timeValid()) {
            element.dispatchEvent(new Event('change'));
        } else { //undo
            element.value = current;
        }
    }
    createHourUpDown(hourValueEl){
        let upDown = document.createElement("span");
        upDown.classList.add("TimeUpDown");
        upDown.innerHTML = "<div>&#9650;</div><div>&#9660;</div>";
        upDown.querySelectorAll("div")[0].onclick = function() {
            this.upDownClick(hourValueEl,'up',1);
            if (!this.militaryTime && parseInt(hourValueEl.value) === 12) {
                this.toggleAMPM(hourValueEl.id);
            }
        }.bind(this);
        upDown.querySelectorAll("div")[1].onclick = function() {
            this.upDownClick(hourValueEl,'down',1);
            if (!this.militaryTime && parseInt(hourValueEl.value) === 11) {
                this.toggleAMPM(hourValueEl.id);
            }
        }.bind(this);
        return upDown;
    }
    minuteBuild(timeElement,minuteVal) {
        let timeColon = document.createElement("div");
        timeColon.innerHTML = ":";
        timeColon.classList.add("timeColon");
        timeColon.style.gridColumn = "3 / span 1";
        timeElement.appendChild(timeColon);
        if (parseInt(minuteVal) < 10) {
            minuteVal = "0" + parseInt(minuteVal);
        }
        let minute = document.createElement("div");
        minute.classList.add("minute");
        minute.innerHTML = "<input type='number' min='1' max='59' value='" + minuteVal + "' />";
        minute.style.gridColumn = "4 / span 2";

        let minuteValueEl = minute.querySelector("input");
        if (timeElement.classList.contains('startTimeElement')) {
            this.timeElements.startMinuteValueEl = minuteValueEl;
        } else {
            this.timeElements.endMinuteValueEl = minuteValueEl;
        }
        let minuteChange = function (event) {
            let newVal = parseInt(minuteValueEl.value);
            let hourChange = null;
            if (newVal > 59) {
                newVal = 0; hourChange = 'up';
            } else if (newVal < 0) {
                newVal = 45; hourChange = 'down';
            }
            if (newVal < 10) {
                newVal = "0" + newVal;
            }
            minuteValueEl.value = newVal;
            switch (hourChange) {
                case 'up':
                    timeElement.querySelectorAll('.hour > .TimeUpDown > div')[0].dispatchEvent(new Event('click'));
                    break;
                case 'down':
                    timeElement.querySelectorAll('.hour > .TimeUpDown > div')[1].dispatchEvent(new Event('click'));
                    break;
                default:
                    this.setTime();
            }
        }.bind(this);
        minuteValueEl.addEventListener('change', minuteChange);
        minuteValueEl.addEventListener('click', function () {
            setTimeout(function () { minuteValueEl.select(); }, 100); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
        });
        let minuteUpDown = document.createElement("span");
        minuteUpDown.classList.add("TimeUpDown");
        minuteUpDown.innerHTML = "<div>&#9650;</div><div>&#9660;</div>";
        minuteUpDown.querySelectorAll("div")[0].onclick = function() { this.upDownClick(minuteValueEl,'up',15); }.bind(this);
        minuteUpDown.querySelectorAll("div")[1].onclick = function() { this.upDownClick(minuteValueEl,'down',15); }.bind(this);
        minute.appendChild(minuteUpDown);
        return minute;
    }
    ampmBuild(timeElement) {
        if (!this.militaryTime) {
            let ampm = document.createElement("div");
            ampm.classList.add("ampm");
            ampm.innerHTML = "";
            ampm.style.gridColumn = "6 / span 1";
            let currentampm;
            if (timeElement.classList.contains('startTimeElement')) {
                this.timeElements.startampm = ampm;
                currentampm = this.startAmPm;
            } else {
                this.timeElements.endampm = ampm;
                currentampm = this.endAmPm
            }

            let am = document.createElement("div");
            am.classList.add("am");
            am.innerHTML = "AM";

            am.addEventListener('click', this.clickAMPM);
            ampm.appendChild(am);

            let pm = document.createElement("div");
            pm.classList.add("pm");
            pm.innerHTML = "PM";

            pm.addEventListener('click', this.clickAMPM);
            ampm.appendChild(pm);

            if (currentampm === "PM") {
                pm.setAttribute("SELECTED", "true");
                am.removeAttribute("SELECTED");
            } else {
                am.setAttribute("SELECTED", "true");
                pm.removeAttribute("SELECTED");
            }
            if (timeElement.classList.contains('startTimeElement')) {
                this.timeElements.startam = am;
                this.timeElements.startpm = pm;
            } else {
                this.timeElements.endam = am;
                this.timeElements.endpm = pm;
            }
            timeElement.appendChild(ampm);
        }
    }
    // draws start time picker
    drawStartTimePicker() {
        let startTimeElement = document.createElement('div');
        startTimeElement.classList.add("startTimeElement");
        if (this.singleDate) {
            startTimeElement.style.gridColumnStart = 1;
            startTimeElement.style.gridColumnEnd = 8;
        } else {
            startTimeElement.style.gridColumnStart = 4;
            startTimeElement.style.gridColumnEnd = 8;
        }
        if (!this.militaryTime) {
            this.startHour = this.toAmPm(parseInt(this.startHour));
        }
        let startHour = document.createElement("div");
        startHour.classList.add("hour");
        startHour.innerHTML = "<input id='startHour' type='number' min='1' max='23' value='" + this.startHour + "' />";
        startHour.style.gridColumn = "1 / span 2";

        let startHourValueEl = startHour.querySelector("#startHour");
        this.timeElements.startHourValueEl = startHourValueEl;

        startHourValueEl.addEventListener('change', this.hourChange);
        startHourValueEl.addEventListener('click', function () {
            setTimeout(function () { startHourValueEl.select(); }, 100); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
        });
        let startHourUpDown = this.createHourUpDown(startHourValueEl);
        
        startHour.appendChild(startHourUpDown);
        startTimeElement.appendChild(startHour);

        let startMinute = this.minuteBuild(startTimeElement,this.startMinute);

        startTimeElement.appendChild(startMinute);
        // start am/pm elements if not military time
        this.ampmBuild(startTimeElement);
        this.calendarElement.appendChild(startTimeElement);
    }
    // draws end time picker if allowed programmatically.
    drawEndTimePicker() {
        if (!this.singleDate) {

            let endTimeElement = document.createElement('div');
            endTimeElement.classList.add("endTimeElement");
            endTimeElement.style.gridColumnStart = 4;
            endTimeElement.style.gridColumnEnd = 8;
            if (!this.militaryTime) {
                this.endHour = this.toAmPm(parseInt(this.endHour));
            }
            let endHour = document.createElement("div");
            endHour.classList.add("hour");
            endHour.innerHTML = "<input id='endHour' type='number' min='1' max='23' value='" + this.endHour + "' />";
            endHour.style.gridColumn = "1 / span 2";

            let endHourValueEl = endHour.querySelector("#endHour");
            this.timeElements.endHourValueEl = endHourValueEl;
            endHourValueEl.addEventListener('change', this.hourChange);
            endHourValueEl.addEventListener('click', function () {
                setTimeout(function () { endHourValueEl.select(); }, 100); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
            });
            let endHourUpDown = this.createHourUpDown(endHourValueEl);

            endHour.appendChild(endHourUpDown);
            endTimeElement.appendChild(endHour);

            let endMinute = this.minuteBuild(endTimeElement,this.endMinute);
            endTimeElement.appendChild(endMinute);
            // am/pm elements if not military time
            this.ampmBuild(endTimeElement);
            this.calendarElement.appendChild(endTimeElement);
        }
    }
    // gets leading/trailing dates for calendar UI
    leadingTrailing() {
        let month = parseInt(this.moment.month()) === 1 || parseInt(this.moment.month()) === 0 ? 12 : parseInt(this.moment.month());
        let year = parseInt(this.moment.month()) === 1 || parseInt(this.moment.month()) === 0 ? parseInt(this.moment.year()) - 1 : parseInt(this.moment.year());
        // console.log(this.moment.month(), this.moment.year(), month, year)
        let prevMonth = year + "-" + month;
        let daysInPrevMonth = parseInt(moment(prevMonth, "YYYY-MM").daysInMonth());
        let leading = [];
        let trailing = [];
        for (let i = 1; i < 8; i++) {
            trailing.push(daysInPrevMonth);
            daysInPrevMonth--;
            leading.push(i);
        }
        return new Object({ leading: leading, trailing: trailing });
    }
    // sets highlighted dates on calendar UI
    highlightDates() {
        let days = this.containerElement.querySelectorAll('.day');
        // adds calendar day highlighted styling
        if (this.dates.length > 0 && this.dates.length === 2) {
            days.forEach(function (day) {

                let indexDate = moment(day.value).format("MM/DD/YYYY");
                let firstDate = moment(this.dates[0]).format("MM/DD/YYYY");
                let secondDate = moment(this.dates[1]).format("MM/DD/YYYY");
                let indexDateX = moment(day.value).format("X");
                let firstDateX = moment(this.dates[0]).format("X");
                let secondDateX = moment(this.dates[1]).format("X");
                if (firstDate === indexDate) {
                    day.classList.add('active');
                    day.setAttribute('aria-pressed', 'true');
                }
                if (secondDate === indexDate) {
                    day.classList.add('active');
                    day.setAttribute('aria-pressed', 'true');
                }
                if (indexDateX > firstDateX && indexDateX < secondDateX) {
                    day.classList.add("highlighted");
                }
            }.bind(this));
        } else {
            days.forEach(function (day) {
                let indexDate = moment(day.value).format("MM/DD/YYYY");
                let firstDate = moment(this.dates[0]).format("MM/DD/YYYY");
                if (firstDate === indexDate) {
                    day.classList.add('active');
                    day.setAttribute('aria-pressed', 'true');
                } else {
                    if (day.classList.contains('active')) {
                        day.classList.remove('active');
                        day.setAttribute('aria-pressed', 'false');
                    }
                    if (day.classList.contains('highlighted')) {
                        day.classList.remove("highlighted");
                    }
                }
            }.bind(this));
        }
    }
    // helper method for validation
    timeValid() {
        if (this.dates.length === 2 && !this.singleDate && this.timePicker) {
            this.startHour = parseInt(this.timeElements.startHourValueEl.value);
            this.startMinute = parseInt(this.timeElements.startMinuteValueEl.value);
            this.endHour = parseInt(this.timeElements.endHourValueEl.value);
            this.endMinute = parseInt(this.timeElements.endMinuteValueEl.value);
            if (!this.militaryTime) {
                if (this.startAmPm === "PM") {
                    this.startHour = this.toMilitary(this.timeElements.startHourValueEl.value)
                }
                if (this.endAmPm === "PM") {
                    this.endHour = this.toMilitary(this.timeElements.endHourValueEl.value)
                }
                if (parseInt(this.timeElements.startHourValueEl.value) === 12 && this.startAmPm === "AM") {
                    this.startHour = 0;
                }
                if (parseInt(this.timeElements.endHourValueEl.value) === 12 && this.endAmPm === "AM") {
                    this.endHour = 0;
                }
            }
            let sameDay = moment(this.dates[0]).day() === moment(this.dates[1]).day();
            let sameMonth = moment(this.dates[0]).month() === moment(this.dates[1]).month();
            let sameYear = moment(this.dates[0]).year() === moment(this.dates[1]).year();
            if (sameDay && sameMonth && sameYear) {
                let startDate = moment(this.dates[0]).hour(this.startHour).minute(this.startMinute);
                let endDate = moment(this.dates[1]).hour(this.endHour).minute(this.endMinute);
                // console.log(startDate, endDate)
                if (startDate > endDate) {
                    this.timeElements.startMinuteValueEl.classList.add('datepicker-error');
                    this.timeElements.startHourValueEl.classList.add('datepicker-error');
                    this.timeElements.startampm.classList.add('datepicker-error');
                    setTimeout(function () {
                        this.timeElements.startMinuteValueEl.classList.remove('datepicker-error');
                        this.timeElements.startHourValueEl.classList.remove('datepicker-error');
                        this.timeElements.startampm.classList.remove('datepicker-error')
                    }.bind(this), 1000);
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
    defaultDatesValid() {
        // defaults exist
        if (typeof this.defaults === 'undefined' || !this.defaults) { return false; };
        // start date default is not above max, or below min
        if (this.max && moment(this.defaults[0]) > moment(this.max)) {
            this.defaults[0] = false;
            console.warn("Datepicker.js - WARNING: Tried to set a default start date greater than max, default start date will not be set.");
        }
        if (this.min && moment(this.defaults[0]) < moment(this.min)) {
            this.defaults[0] = false;
            console.warn("Datepicker.js - WARNING: Tried to set a default start date less than min, default start datewill not be set.");
        }
        // end date default is not above max, or below min
        if (this.max && moment(this.defaults[1]) > moment(this.max)) {
            this.defaults[1] = false;
            console.warn("Datepicker.js - WARNING: Tried to set a default end date greater than max, default end date will not be set.");
        }
        if (this.min && moment(this.defaults[1]) < moment(this.min)) {
            this.defaults[1] = false;
            console.warn("Datepicker.js - WARNING: Tried to set a default end date less than min, default end datewill not be set.");
        }
    }
    // helper method to set start/end time.
    setTime(setProgrammatically) {
        if (!setProgrammatically) {
            setProgrammatically = false;
        }
        if (this.timePicker) {
            this.startHour = parseInt(this.timeElements.startHourValueEl.value);
            this.startMinute = parseInt(this.timeElements.startMinuteValueEl.value);
            if (!this.singleDate) {
                this.endHour = parseInt(this.timeElements.endHourValueEl.value);
                this.endMinute = parseInt(this.timeElements.endMinuteValueEl.value);
            }

            // Sanitizes the UI and the state if .value() was used to set dates/times
            if (setProgrammatically) {
                let startHour = moment(this.dates[0]).hours();
                if (!startHour) {
                    startHour = 12;
                }
                let endHour = !this.singleDate ? moment(this.dates[1]).hours() : "";
                if (!endHour) {
                    endHour = 12;
                }
                this.timeElements.startHourValueEl.value = !this.militaryTime ? this.toAmPm(startHour) : startHour;
                this.timeElements.startMinuteValueEl.value = this.dates[0] ? (moment(this.dates[0]).minutes() < 10 ? moment(this.dates[0]).minutes() + "0" : moment(this.dates[0]).minutes()) : this.timeElements.startMinuteValueEl.value;
                if (!this.singleDate) {
                    this.timeElements.endHourValueEl.value = !this.militaryTime ? this.toAmPm(endHour) : endHour;
                    this.timeElements.endMinuteValueEl.value = this.dates[1] ? (moment(this.dates[1]).minutes() < 10 ? moment(this.dates[1]).minutes() + "0" : moment(this.dates[1]).minutes()) : this.timeElements.endMinuteValueEl.value;
                    this.endHour = endHour;
                    this.endMinute = parseInt(this.timeElements.endMinuteValueEl.value);
                }
                this.startHour = startHour;
                this.startMinute = parseInt(this.timeElements.startMinuteValueEl.value);
                if (!this.militaryTime) {
                    if (!this.singleDate) {
                        this.endAmPm = this.endHour > 12 ? "PM" : "AM";
                        if (this.endAmPm === "PM") {
                            setTimeout(function () { this.timeElements.endpm.click() }.bind(this), 500)
                        } else {

                            setTimeout(function () { this.timeElements.endam.click() }.bind(this), 500)
                        }
                    }
                    this.startAmPm = this.startHour > 12 ? "PM" : "AM";
                    if (this.startAmPm === "PM") {
                        setTimeout(function () { this.timeElements.startpm.click() }.bind(this), 500)
                    } else {
                        setTimeout(function () { this.timeElements.startam.click() }.bind(this), 500)
                    }
                }
            } else {
                // adjustments for 12h time since Moment only acccepts 24h
                if (!this.militaryTime) {
                    if (this.startAmPm === "PM") {
                        this.startHour = this.toMilitary(this.timeElements.startHourValueEl.value)
                    }
                    if (!this.singleDate && this.endAmPm === "PM") {
                        this.endHour = this.toMilitary(this.timeElements.endHourValueEl.value)
                    }
                    if (parseInt(this.timeElements.startHourValueEl.value) === 12 && this.startAmPm === "AM") {
                        this.startHour = 0;
                    }
                    if (!this.singleDate && parseInt(this.timeElements.endHourValueEl.value) === 12 && this.endAmPm === "AM") {
                        this.endHour = 0;
                    }
                }
            }
            // Set sanitized and formatted dates:
            let endDate = "";
            if (!this.singleDate) {
                endDate = this.dates[1];
            }
            let startDate = this.dates[0];
            this.dates = [];
            if (startDate) {
                this.dates[0] = moment(startDate).hour(this.startHour).minute(this.startMinute).format(this.format);
                this.startDateElement.innerHTML = this.dates[0]
            }
            if (endDate && !this.singleDate) {
                this.dates[1] = moment(endDate).hour(this.endHour).minute(this.endMinute).format(this.format);
                // update the UI based on the state
                this.endDateElement.innerHTML = this.dates[1];
            }
            this.onChange();
        }
    }
    // helper method to set dates if provided, return dates if not.
    value(dates, format) {
        if (!format || typeof format !== "string") {
            format = this.format;
        }
        if (typeof dates === "object") {
            this.dates = [];
            // set start date
            if (dates.length && dates[0]) {
                if (typeof dates[0] === 'string') {
                    dates[0] = this.convertStringDate(dates[0]);
                }
                this.dates[0] = moment(dates[0]).format(format);
            } else if (this.defaults && this.defaults.length) {
                this.dates[0] = moment(this.defaults[0]).format(format);
            } else {
                if (!this.singleDate) {
                    console.warn("Datepicker.js - WARNING: Use Datepicker.startDate(value) or Datepicker.endDate(value) to set single values. Your date will be set as the start date by default. ");
                }
                this.dates[0] = moment(dates).format(format);
            }
            // set end date
            if (dates.length === 2 && dates[1]) {
                if (typeof dates[1] === 'string') {
                    dates[1] = this.convertStringDate(dates[1]);
                }
                this.dates[1] = moment(dates[1]).format(format);
            } else if (this.defaults && this.defaults.length === 2) {
                this.dates[1] = moment(this.defaults[1]).format(format);
            } else {
                this.dates[1] = moment(this.dates[0]).format(format);
            }
            if (this.dates.length === 2 && moment(this.dates[0]) > moment(this.dates[1])) {
                let dates = [];
                console.warn("Datepicker.js - WARNING: Tried to set a startDate greater than endDate, your dates were swapped to be chronologically correct.");
                dates[0] = this.dates[1];
                dates[1] = this.dates[0];
                this.dates = dates;
            }

        } else if (!dates || typeof dates === undefined) {
            // no date supplied, return the dates from the Datepicker state
            if (this.dates[0]) {
                this.dates[0] = moment(this.dates[0]).format(format);
            } else if (this.defaults && this.defaults.length) {
                this.dates[0] = moment(this.defaults[0]).format(format);
            }
            if (this.dates[1]) {
                this.dates[1] = moment(this.dates[1]).format(format);
            } else if (this.defaults && this.defaults.length === 2) {
                this.dates[1] = moment(this.defaults[1]).format(format);
            }
            if (this.singleDate) {
                return (new Date(this.dates[0]) || new Date(this.defaults[0]));
            } else {
                let dates = [];
                dates[0] = new Date(this.dates[0]) || new Date(this.defaults[0]);
                dates[1] = new Date(this.dates[1]) || new Date(this.defaults[1]);
                return format ? [moment(dates[0]).format(format), moment(dates[1]).format(format)] : dates;
            }
        } else if (typeof dates === "string" || typeof dates === "number") {
            if (!this.singleDate) {
                console.warn("Datepicker.js - WARNING: Use Datepicker.startDate(value) or Datepicker.endDate(value) to set single values. Your date will be set as the start date by default. ");
            }
            this.dates[0] = moment(this.dates[1]).format(format);
            if (this.dates.length === 2 && moment(this.dates[0]) > moment(this.dates[1])) {
                let dates = [];
                console.warn("Datepicker.js - WARNING: Tried to set a startDate greater than endDate, your dates were swapped to be chronologically correct.");
                dates[0] = this.dates[1];
                dates[1] = this.dates[0];
                this.dates = dates;
            }
        }
        // ensure calendar UI is updated
        this.snapTo(this.dates[0]);
        this.onChange();
        this.highlightDates();
        this.setTime();
        this.calendarElement.hideCalendar();
        // warnings for improper usage of .value()
        if ((!dates[1] || !(new Date(dates[1]))) && !this.singleDate && (!dates[0] || !(new Date(dates[0])))) {
            console.warn("Datepicker.js - ERROR: Tried to set dates with invalid format or null values, start/end dates will be set to defaults if provided.");
        } else if ((!dates[1] || !(new Date(dates[1]))) && !this.singleDate) {
            console.warn("Datepicker.js - WARNING: No end date value provided, or tried to set [start, end] date with invalid or null end date value, end date will be set to default if provided.");
        } else if ((!dates[0] || !(new Date(dates[0]))) && !this.singleDate) {
            console.warn("Datepicker.js - WARNING: No start date value provided, or tried to set [start, end] date with invalid or null start date value, start date will be set to default if provided.");
        }
    }
    // returns start date only
    startDate(value) {
        if (value !== undefined && value !== null && value) {
            this.value([value, (this.dates[1] || this.defaults[1] || null)]);
        } else {
            return new Date(this.dates[0]);
        }
    }
    endDate(value) {
        if (value !== undefined && value !== null && value) {
            this.value([(this.dates[0] || this.defaults[0] || null), value]);
        } else {
            return new Date(this.dates[1]);
        }
    }
    // advances the calendar by one month
    nextMonth(event, positiveValue) {
        if (typeof positiveValue !== "number") {
            positiveValue = 1;
        }
        let onChange = this.onChange;
        this.onChange = function () { };
        this.containerElement.innerHTML = "";
        this.moment.add(positiveValue, 'months');
        this.drawCalendar();
        this.drawInputElement();
        if (this.presetMenu) {
            this.drawPresetMenu();
            this.closePresetMenu();
        }
        this.highlightDates();
        if (this.timePicker) {
            this.setTime();
        }
        this.openCalendar();
        this.onChange = onChange;
        this.calendarPlacement();
    }
    // moves the calendar back one month
    lastMonth(event, negativeValue) {
        if (typeof negativeValue !== "number") {
            negativeValue = -1;
        }
        let onChange = this.onChange;
        this.onChange = function () { };
        this.containerElement.innerHTML = "";
        this.moment.add(negativeValue, 'months');
        this.drawCalendar();
        this.drawInputElement();
        if (this.presetMenu) {
            this.drawPresetMenu();
            this.closePresetMenu();
        }
        this.highlightDates();
        if (this.timePicker) {
            this.setTime();
        }
        this.openCalendar();
        this.onChange = onChange;
        this.calendarPlacement();
    }
    // helper that snaps the calendar UI to a given date
    snapTo(date, isVisible) {
        if (!date) {
            date = this.moment;
        }
        let max = this.max ? moment(this.max).unix() : false;
        let min = this.min ? moment(this.min).unix() : false;
        let currentDate = moment(date).unix();
        if (max && max < currentDate) {
            date = moment(this.max);
        }
        if (min && min > currentDate) {
            date = moment(this.min);
        } else {
            date = moment(date);
        }
        this.moment = date;
        let onChange = this.onChange;
        this.onChange = function () { };
        if (this.isVisible(this.calendarElement) || isVisible) {
            this.containerElement.innerHTML = '';
            this.drawCalendar();
            this.drawInputElement();
            if (this.presetMenu) {
                this.drawPresetMenu();
                this.closePresetMenu();
            }
            if (this.timePicker) {
                this.setTime(true);
            }
            this.highlightDates();
            this.openCalendar();
        } else {
            this.containerElement.innerHTML = '';
            this.drawCalendar();
            this.drawInputElement();
            if (this.presetMenu) {
                this.drawPresetMenu();
                this.closePresetMenu();
            }
            if (this.timePicker) {
                this.setTime(true);
            }
            this.highlightDates();
            this.closeCalendar();
        }
        this.onChange = onChange;
        this.calendarPlacement();
    }
    // helpers to convert times 12h to 24h and reverse
    toAmPm(hour) {
        hour = parseInt(hour);
        return (hour === 12) ? 12 : hour % 12;
    }
    toMilitary(hour) {
        hour = parseInt(hour);
        hour = hour === 12 ? hour = 0 : hour;
        return hour < 12 ? hour + 12 : hour;
    }
    convertStringDate(date) {
        date = date.split(" ");
        let dateString = "";
        let AmPm = "";
        for (var i = 0; i < date.length; i++) {
            if (date[i].toUpperCase() === "PM") {
                AmPm = "PM";
                date.splice(i, 1);
            } else if (date[i].toUpperCase() === "AM") {
                AmPm = "AM";
                date.splice(i, 1)
            } else {
                dateString = dateString + " " + date[i];
            }
        }
        let convertedDateHours = moment(dateString).hour();
        let convertedDate = moment(dateString);
        if (AmPm === "PM" && convertedDateHours < 12) {
            convertedDate.hour(convertedDateHours + 12);
        }
        return convertedDate;
    }
    // helper method to set start/end date on each calendar day click
    dayClick(dayCell) {
        if (this.timePicker) {
            this.startHour = parseInt(this.timeElements.startHourValueEl.value);
            this.startMinute = parseInt(this.timeElements.startMinuteValueEl.value);
            if (!this.singleDate) {
                this.endHour = parseInt(this.timeElements.endHourValueEl.value);
                this.endMinute = parseInt(this.timeElements.endMinuteValueEl.value);
            }
            // adjustments for 12h time since Moment only acccepts 24h
            if (!this.militaryTime) {
                if (this.startAmPm === "PM") {
                    this.startHour = this.toMilitary(this.timeElements.startHourValueEl.value)
                }
                if (this.endAmPm === "PM" && !this.singleDate) {
                    this.endHour = this.toMilitary(this.timeElements.endHourValueEl.value)
                }
                if (parseInt(this.timeElements.startHourValueEl.value) === 12 && this.startAmPm === "AM") {
                    this.startHour = 0;
                }
                if (this.endAmPm === "AM" && !this.singleDate && parseInt(this.timeElements.endHourValueEl.value) === 12) {
                    this.endHour = 0;
                }
            }
        }
        // set the start/end date in both the UI and the class's state
        if (!this.singleDate) {
            if (this.dates.length > 1 || this.dates.length < 1) {
                this.dates = [];
                this.dates[0] = moment(dayCell.value).set({ h: this.startHour, m: this.startMinute }).format(this.format);
                if (!this.timePicker) {
                    this.startDateElement.innerHTML = this.dates[0];
                    this.endDateElement.innerHTML = "--/--/---- ";
                } else {
                    this.startDateElement.innerHTML = this.dates[0];
                    this.endDateElement.innerHTML = "--/--/----  --:--";
                }
            } else {
                let startDate = moment(this.dates[0]).set({ h: this.startHour, m: this.startMinute }).unix();
                let clickedDate = moment(dayCell.value).hour(this.endHour).minute(this.endMinute).unix();
                if (startDate > clickedDate) {
                    let largerDate = this.dates[0];
                    this.dates = [];
                    this.dates[1] = moment(largerDate).set({ h: this.endHour, m: this.endMinute }).format(this.format);
                    this.dates[0] = moment(dayCell.value).set({ h: this.startHour, m: this.startMinute }).format(this.format);
                    this.startDateElement.innerHTML = this.dates[0];
                    this.endDateElement.innerHTML = this.dates[1];
                } else {
                    this.dates[1] = moment(dayCell.value).set({ h: this.endHour, m: this.endMinute }).format(this.format);
                    this.endDateElement.innerHTML = this.dates[1];
                }
            }
        } else {
            this.dates = [];
            this.dates[0] = moment(dayCell.value).set({ h: this.startHour, m: this.startMinute }).format(this.format);
            this.startDateElement.innerHTML = this.dates[0];
        }
        if (!this.timeValid()) {
            this.startHour = parseInt(this.timeElements.endHourValueEl.value);
            this.startMinute = parseInt(this.timeElements.endMinuteValueEl.value);
            let startMinute = this.endMinute;
            let startHour = this.endHour;
            this.timeElements.startMinuteValueEl.value = startMinute < 10 ? startMinute + "0" : startMinute;
            this.timeElements.startHourValueEl.value = startHour;
            this.setTime();
        } else {
            this.onChange();
        }
        // autoClose the calendar when a single date or date range is selected 
        if (!this.singleDate && this.dates.length === 2 && this.options.autoClose) {
            setTimeout(function () {
                this.closeCalendar();
            }.bind(this), 400);
        } else if (this.singleDate && this.dates.length === 1 && this.options.autoClose) {
            setTimeout(function () {
                this.closeCalendar();
            }.bind(this), 400); // setTimeout will need to be removed eventually
        }
        // conditional highlighting prompt
        this.highlightDates();
        this.drawInputElement();
        if ((this.dates.length === 2 || this.singleDate) && this.options.autoClose) {
            setTimeout(function () {
                this.closeCalendar();
            }.bind(this), 700);
        }
    }
    // to test clicks outside calendar element to close it
    isOutsideCalendar(event) {
        return (
            !this.calendarElement.contains(event.target)
            && this.isVisible(this.calendarElement)
            && !this.inputElement.contains(event.target)
            && !event.target.classList.contains('leftArrow')
            && !event.target.classList.contains("rightArrow")
            && !event.target.classList.contains("decrease-year-button")
            && !event.target.classList.contains("increase-year-button")
        );
    }
    // closes calendar if clicks are outside boundaries
    outsideCalendarClick(event) {
        if (this.isOutsideCalendar(event)) {
            this.closeCalendar();
            this.drawInputElement();
        }
    }
    // helper to determine calendar UI placement upon opening.
    calendarPlacement() {
        let context = this;
        let calendarElement = context.containerElement.querySelector('.grid-container');
        // variables
        let calculated = {
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            calendarWidth: calendarElement.getBoundingClientRect().width,
            calendarHeight: calendarElement.getBoundingClientRect().height,
            containerHeight: context.containerElement.getBoundingClientRect().height,
            containerWidth: context.containerElement.getBoundingClientRect().width,
            datepickerTop: context.containerElement.querySelector(".date").getBoundingClientRect().top,
            datepickerRight: context.containerElement.querySelector(".date").getBoundingClientRect().right,
            datepickerLeft: context.containerElement.querySelector(".date").getBoundingClientRect().left,
            datepickerWidth: context.containerElement.querySelector(".date").getBoundingClientRect().width,
            datepickerHeight: context.containerElement.querySelector(".date").getBoundingClientRect().height
        }
        // logs
        //console.table(calculated);
        // set position
        let left;
        if ((calculated.windowWidth - calculated.datepickerRight) < (calculated.calendarWidth + 10)) {
            if (calculated.datepickerLeft < (calculated.calendarWidth + 10)) {
                calculated.datepickerRight = ((calculated.datepickerRight) - (calculated.datepickerWidth) - (calculated.calendarWidth * .5));
            } else {
                calculated.datepickerRight = calculated.datepickerLeft - calculated.calendarWidth;
            }
            left = calculated.datepickerRight;
        } else {
            left = calculated.datepickerLeft + (0.5 * calculated.datepickerWidth);
        }
        let top;
        if (calculated.calendarHeight > calculated.windowHeight - (calculated.datepickerTop + calculated.datepickerHeight)) {
            if (calculated.datepickerTop < (calculated.calendarHeight + calculated.datepickerHeight)) {
                calculated.datepickerTop = 20;
            } else {
                calculated.datepickerTop = calculated.datepickerTop - calculated.calendarHeight;
            }
            calculated.datepickerHeight = calculated.datepickerHeight * 0.5;
            top = calculated.datepickerTop;
        } else {
            top = calculated.datepickerHeight + calculated.datepickerTop + 5;
        }
        calendarElement.setAttribute('style', "position: fixed; left:" + left + "px; top: " + top + "px;");
    }
    // helpers to hide calendar when clicked off.
    isVisible(elem) {
        return !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length) && (elem.style.display === 'grid' || elem.style.display === 'block' || elem.style.visibility === "");
    }
    // helper methods to open/close calendar UI
    openCalendar() {
        this.calendarElement.showCalendar();
        this.calendarPlacement();
        this.highlightDates();
        this.calendarPlacement();
    }
    closeCalendar() {
        this.onClose();
        //if no dates chosen, autofill them both with start/end of week (if no defaults provided)
        if (!this.dates.length && this.defaults && this.defaults.length) {
            if (this.defaults[0]) {
                this.dates[0] = moment(this.defaults[0]).format(this.format);
                this.startDateElement.innerHTML = this.dates[0];
            } else {
                this.dates[0] = moment().startOf('week').format(this.format);
                this.startDateElement.innerHTML = this.dates[0];
            }
            if (this.defaults[1]) {
                if (!this.singleDate) {
                    this.dates[1] = moment(this.defaults[1]).format(this.format);
                    this.endDateElement.innerHTML = this.dates[1];
                };
            } else {
                if (!this.singleDate) {
                    this.dates[1] = moment().endOf('week').format(this.format);
                    this.endDateElement.innerHTML = this.dates[1];
                };
            }
        } else if (this.defaults && !this.dates.length) {
            if (!this.singleDate) {
                this.dates[1] = moment().endOf('week').format(this.format);
                this.endDateElement.innerHTML = this.dates[1];
            };
            this.dates[0] = moment().startOf('week').format(this.format);
            this.startDateElement.innerHTML = this.dates[0];
        }
        // if only one date is chosen, autofill second date with first (if no defaults provided)
        if (this.dates.length === 1 && this.defaults && this.defaults.length === 2 && this.defaults[1]) {
            if (!this.singleDate) { 
                this.dates[1] = moment(this.defaults[1]).format(this.format);
                this.endDateElement.innerHTML = this.dates[1];
                this.startDateElement.innerHTML = this.dates[0];
             };
        } else if (this.dates.length === 1 && this.defaults && !this.defaults[1]) {
            if (!this.singleDate) { 
                this.dates[1] = moment(this.dates[0]).format(this.format);
                this.endDateElement.innerHTML = this.dates[1];
                this.startDateElement.innerHTML = this.dates[0];
             };
        }

        // ensure calendar UI is updated
        if (this.dates.length === 2 && moment(this.dates[0]) > moment(this.dates[1])) {
            let dates = [];
            console.warn("Datepicker.js - WARNING: Tried to set a startDate greater than endDate, your dates were swapped to be chronologically correct.");
            dates[0] = this.dates[1];
            dates[1] = this.dates[0];
            this.dates = dates;
        }
        this.setTime();
        this.calendarElement.hideCalendar();
        this.drawInputElement();
    }
    // helper methods to open/close preset menu UI
    openPresetMenu() {
        this.presetMenuContainer.showPresetMenu();
    }
    closePresetMenu() {
        this.presetMenuContainer.hidePresetMenu();
    }
    // resets Calendar and Input element to their default state with no Date/Times selected, opens Calendar UI.
    resetCalendar() {
        this.reset(true);
    }
    // resets entire API to the default state, closes calendar UI.
    reset(open) {
        if (typeof open === "undefined" || !open) {
            open = false;
        }
        this.dates = [];
        this.containerElement.innerHTML = '';
        this.drawCalendar();
        this.drawInputElement();
        if (this.presetMenu) {
            this.drawPresetMenu();
            this.closePresetMenu();
        }
        this.onChange();
        this.snapTo(new Date());
        if (open) {
            setTimeout(this.openCalendar, 10);
        } else {
            this.closeCalendar();
        }
    }
}

