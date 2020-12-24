/**
 * Holds the methods and properties pertaining to date utilization.
 */
const DateUtil = {

  /**
   * Gets the array of weekdays starting with Sunday.
   *
   * @returns {string[]} the array of weekday strings starting with Sunday
   */
  getWeekdayStrings() {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
  },

  /**
   * Generates an array of strings representing time slots. Each time slot
   * will be the length of time indicated by the given `numHours`. The time
   * slots start with midnight.
   *
   * @param {Number} numHours the number of hours to increment for each
   * time string
   * @returns {string[]} the completed set of time strings
   */
  generateTimeStrings(numHours) {
    let current24Hour = 0;
    const timeStrings = [];
    while (current24Hour + numHours <= 24) {
      const startHour = current24Hour;
      const endHour = current24Hour + numHours;
      timeStrings.push(`${this.getAmPmTimeFrom24Hour(startHour)} - `
      + `${this.getAmPmTimeFrom24Hour(endHour)}`);
      current24Hour += numHours;
    }
    return timeStrings;
  },

  /**
   * Generates the set of strings representing different times that a student
   * could be available to meet.
   *
   * @returns {string[]} the set of strings representing availability over a
   * week timeframe
   */
  generateAvailabilityStrings() {
    const weekDays = this.getWeekdayStrings();

    const availabilityStrings = [];

    // Arbitrary Sunday to start from
    const currentDate = new Date('December 20, 2020 00:00:00');
    while (currentDate.getDate() !== 27) {
      const hour = currentDate.getHours();
      availabilityStrings.push(`${weekDays[currentDate.getDay()]}, ${hour}:00 `
        + `${this.getAmPmFromHour(hour)} - ${hour + 3}:00 `
        + `${this.getAmPmFromHour(hour + 3)}`);
      this.addHoursToDate(currentDate, 3);
    }
    return availabilityStrings;
  },

  /**
   * Gets the UTC time zones strings. For example `UTC +8`.
   *
   * @returns {string[]} the completed set of UTC time zones strings
   */
  getUTCTimeZoneStrings() {
    if (dateUtilHelper.utcTimeZoneStrings !== null) {
      return dateUtilHelper.utcTimeZoneStrings;
    }
    dateUtilHelper.utcTimeZoneStrings = [];
    for (let i = -11; i <= 12; i++) {
      dateUtilHelper.utcTimeZoneStrings.push(`UTC ${i < 0 ? '' : '+'}${i}`);
    }
    return dateUtilHelper.utcTimeZoneStrings;
  },

  /**
   * Gets a random UTC time zone string.
   *
   * @returns {string}
   */
  getRandomUTCTimeZone() {
    const timeZoneStrings = this.getUTCTimeZoneStrings();
    const index = Util.getRandomInt(timeZoneStrings.length);
    return timeZoneStrings[index];
  },

  /**
   * Adds the given amount of hours to the given date.
   *
   * @param {Date} date the date to add hours to
   * @param {Number} hours the number of hours to add
   */
  addHoursToDate(date, hours) {
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    return date;
  },

  /**
   * Returns a string of either `AM` or `PM` depending on the given hour.
   *
   * @param {Number} hour the hour to get AM or PM for
   * @returns {string}
   */
  getAmPmFromHour(hour) {
    return hour >= 12 ? 'PM' : 'AM';
  },

  /**
   * Gets the time string for the given 24 hour. For example, `14` would return
   * `2:00 PM`.
   *
   * @param {Number} hour the hour to get the time string from.
   * @returns {string} the time string such as `2:00 PM`
   */
  getAmPmTimeFrom24Hour(hour) {
    let adjustedHour = hour;
    if (hour > 12) {
      adjustedHour = hour - 12;
    }
    return `${adjustedHour}:00 ${this.getAmPmFromHour(hour)}`;
  },
};

const dateUtilHelper = {
  utcTimeZoneStrings: null,
};
