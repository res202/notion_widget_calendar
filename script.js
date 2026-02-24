
 const $ = (...q) => $$(...q)?.[0] || null;

 const $$ = (...q) =>
  !q.length
    ? []
    : Array.isArray(q[0])
    ? $$(q[0].reduce((r, s, i) => ((r += (i ? q[i] : '') + s), r), ''))
    : q.reduce(
        (r, s) =>
          !r
            ? []
            : s instanceof Node
            ? [s]
            : s instanceof NodeList
            ? [...s]
            : Array.isArray(s) && s.every(e => e instanceof Node)
            ? s
            : [...new Set(r.map(p => [...p.querySelectorAll(s)]).flat())],
        [document]
      );

 const _ = (x, ref) => {

  if (Array.isArray(x)) {
    return x.map(v => _(v));
  }

  if (x instanceof HTMLElement || x instanceof HTMLCollection) {
    return x;
  }

  if (typeof x != 'object') {
    throw new TypeError('Not an object: ' + typeof x);
  }

  if ((x._k = Object.keys(x)).length == 1) {
    switch (x._k[0]) {
      case 'html':
        //return new DOMParser().parseFromString(x.html, 'text/html');
        let t = document.createElement('span');
        t.innerHTML = x[x._k[0]];
        return t;
      case 'text':
        return document.createTextNode(x.text);
      case 'comment':
        return document.createComment(x.comment);
      case 'cdata':
        return document.createCDATASection(x.cdata);
    }
  }

  let ns = x?.ns || ref?.ns || _?.default?.ns || void 0;
  let doc = x?.doc || ref?.doc || document;
  let tag = x.tag || _?.default?.tag || 'div';

  x._el =
    x.use instanceof Element
      ? x.use
      : typeof x.use == 'string'
      ? $(x.use)
      : x.clone instanceof Element
      ? x.clone.cloneNode(true)
      : ns
      ? doc?.createElementNS(ns, tag)
      : doc?.createElement(tag);


  if (!x._el) {
    throw new Error('Something went wrong');
  }

  if (x?.attr || x?.attrs) _.forEachEntry(x.attr || x.attrs, (k, v) => x._el.setAttribute(k, v));
  if (x?._attr || x?._attrs) _.oneOrMany(x._attr || x._attrs, k => x._el.removeAttribute(k));
   
   if (x?.id) x._el.setAttribute('id', x.id);
   if (x?._id) x._el.removeAttribute('id');
   
   if(x?.data) _.forEachEntry(x.data, (k, v) => x._el.setAttribute(`data-${k}`, v));
  if (x?._data) _.oneOrMany(x._data, k => x._el.removeAttribute(`data-${k}`));

  if (x?.cls) _.oneOrMany(x.cls, c => x._el.classList.add(c));
  if (x?._cls) _.oneOrMany(x._cls, c => x._el.classList.remove(c));

  if (x?.prop) Object.assign(x._el, x.prop);
  if (x?._prop) _.oneOrMany(x._prop, k => delete x._el[k]);

  if (x?.style || x?.css) _.forEachEntry(x?.style || x?.css, (prop, value) => (x._el.style[prop] = value));
  if (x?._style || x?._css) _.oneOrMany(x?._style || x?._css, prop => (x._el.style[prop] = 'unset'));
   
  if (x?.var || x?.vars) _.forEachEntry(x?.var || x?.vars, (k, v) => x._el.style.setProperty(`--${k}`, v));
  if (x?._var || x?._vars) _.oneOrMany(x?.var || x?.vars, k => x._el.style.removeProperty(`--${k}`));

  if (x?.evt) _.forEachEntry(x.evt, (...evt) => _.on(x._el, ...evt));
  if (x?._evt) _.forEachEntry(x._evt, (...evt) => _.off(x._el, ...evt));
  
  if (x?.on) _.forEachEntry(x.on, (...evt) => _.on(x._el, ...evt));
  if (x?._on) _.forEachEntry(x._on, (...evt) => _.off(x._el, ...evt));
  if (x?.off) _.forEachEntry(x.on, (...evt) => _.off(x._el, ...evt));
  if (x?._off) _.forEachEntry(x.on, (...evt) => _.on(x._el, ...evt));
  if (x?.once) _.forEachEntry(x.on, (...evt) => _.once(x._el, ...evt));
  if (x?._once) _.forEachEntry(x._on, (...evt) => _.off(x._el, ...evt));

  ['before', 'after', 'append', 'prepend', 'replaceWith'].map(v => x?.[v]?.[v]?.(x._el));

  ['html', 'text', 'comment', 'cdata'].map(v => {
    if (x[v]) x._el.appendChild(_({ [v]: x[v] }));
  });

  if (x?.insertTo) $(x.insertTo).insertAdjacentElement(_.place(x.insertPlace), x._el);
  if (x?.appendTo) $(x.appendTo).appendChild(x._el);
  if(x?.replace) $(x.replace).replaceWith(x._el);


  if (x?.attach) {
    _.oneOrMany(x?.attach, w =>
      x._el['insertAdjacent' + (w instanceof Element ? 'Element' : 'HTML')](_.place(x.attachPlace), w)
    );
  }

  if (x?.children) {
    x._ch = [x._el];
    const add = sub => {
      x?._ch?.push?.(sub);
      ref?._ch?.push?.(sub);
      x._el.appendChild(sub);
    };
    [...x._el.childNodes].forEach(el => el.remove());
    _.oneOrMany(_(x.children, x), sub =>
      sub instanceof Document ? [...(sub ? sub.body : sub.documentElement).childNodes].map(add) : add(sub)
    );
  }
   
  return x?.flat === true && x._ch ? x._ch : x._el;
};

_.default =
  document.documentElement.tagName == 'HTML'
    ? {
        doc: document,
        ns: 'http://www.w3.org/1999/xhtml',
        tag: 'div',
      }
    : (_.default = {
        doc: document,
        ns: 'http://www.w3.org/2000/svg',
        tag: 'path',
      });

_.forEachEntry = (object, callback) => Object.entries(object).map(([k, v]) => callback(k, v));
_.oneOrMany = (object, callback) =>
  (Array.isArray(object) ? object : object instanceof NodeList ? [...object] : [object]).map(callback);

_.place = place =>
  /^[ab][be]$/.test(place)
    ? place.replace(
        /./g,
        (c, i) =>
          [
            { a: 'after', b: 'before' },
            { b: 'begin', e: 'end' },
          ][i][c]
      )
    : place || 'beforeend';

_._namespaces = Symbol('_namespaces');
_._events = Symbol('_events');
_._listeners = Symbol('_listeners');
_.on = (el, evt, cb, pr) => {
  let wrap = (...args) => cb.call(wrap, ...args);
  Object.assign(wrap, { cb, pr, type: 'on' });
  el.addEventListener(evt, wrap, pr);
  if (!el[_._listeners]) el[_._listeners] = [];
  if (!el[_._listeners][evt]) el[_._listeners][evt] = [];
  el[_._listeners][evt].push(wrap);
  return wrap;
};



const CalUtils = {
  MILLISECONDS_PER_DAY: 86400000,
  MILLISECONDS_PER_HOUR: 3600000,
  SECONDS_PER_DAY: 86400,
  J1970: 2440588,
  J2000: 2451545,
  FIRST_DAY_OF_WEEK: 0,

  convertYmdToJd: (year, month, day) => {
    [year, month] = month < 3 ? [year - 1, month + 12] : [year, month];
    return (
      2 -
      (0 | (year / 100)) +
      (0 | (year / 400)) +
      day +
      (0 | (365.25 * (year + 4716))) +
      (0 | (30.6001 * (month + 1))) -
      1524
    );
  },

  convertJdToYmd: jd => {
    let A = Math.ceil(jd) + 32044;
    let B = 0 | ((4 * A + 3) / 146097);
    let C = A - (0 | ((B * 146097) / 4));
    let D = 0 | ((4 * C + 3) / 1461);
    let E = C - (0 | ((1461 * D) / 4));
    let M = 0 | ((5 * E + 2) / 153);
    let day = E - (0 | ((153 * M + 2) / 5)) + 1;
    let month = M + 3 - 12 * (0 | (M / 10));
    let year = B * 100 + D - 4800 + (0 | (M / 10));
    return [year, month, day];
  },

  getLocaleTimezoneOffset: () => new Date().getTimezoneOffset(),

  convertHmsToJdOffset: (hours = 0, min = 0, sec = 0) => (hours * 36e2 + min * 60 + sec) / CalUtils.SECONDS_PER_DAY,

  convertTimestampToJd: ts => CalUtils.J1970 - 0.5 + ts / CalUtils.MILLISECONDS_PER_DAY,

  convertJdToTimestamp: jd => (jd + 0.5 - CalUtils.J1970) * CalUtils.MILLISECONDS_PER_DAY,

  getWeekNumForYmd: (y, m, d) => {
    let J = CalUtils.convertYmdToJd(y, m, d);
    let d4 = (((J + 31741 - (J % 7)) % 146097) % 36524) % 1461;
    let L = 0 | (d4 / 1460);
    let d1 = ((d4 - L) % 365) + L;
    return (0 | (d1 / 7)) + 1;
  },

  getLastWeekNumInYear: year => CalUtils.getWeekNumForYmd(year, 12, 28),

  getWeekDaysByWeekNum: (year, weekNumber) => {
    let jd0 = CalUtils.convertYmdToJd(year, 1, 1);
    let jd1 = jd0 - (0 | jd0 % 7) + (weekNumber - 1) * 7;
    return new Array(7).fill(0).map((_, i) => CalUtils.convertJdToYmd(jd1 + i));
  },

  getWeekDayForYmd: (year, month, day) =>
    ((day += month < 3 ? year-- : year - 2),
    (0 | ((23 * month) / 9)) + day + 4 + (0 | (year / 4)) - (0 | (year / 1e2)) + (0 | (year / 4e2))) % 7 ||
    7 * CalUtils.FIRST_DAY_OF_WEEK,
//  getWeekDayForYmd: (y, m, d) => {
//     const jd = CalUtils.convertYmdToJd(y, m, d);
//     return ((jd + 2 - CalUtils.FIRST_DAY_OF_WEEK) % 7) || 7 * CalUtils.FIRST_DAY_OF_WEEK;
//   },

  getMonthCalendar: (y, m) => {
    let [r, d, w, n] = [[], 1, 0, CalUtils.getDaysInMonth(y, m)],
      c =
        ((0 | ((23 * m) / 9)) + (m < 3 ? y-- : y - 2) + 5 + (0 | (y / 4)) - (0 | (y / 1e2)) + (0 | (y / 4e2))) % 7 ||
        7 * CalUtils.FIRST_DAY_OF_WEEK;
    for (; d <= n; ++d, c = ++c % 7 || 7 * CalUtils.FIRST_DAY_OF_WEEK, w += !(c - CalUtils.FIRST_DAY_OF_WEEK))
      (r[w] || (r[w] = new Array(7).fill(null)))[c - CalUtils.FIRST_DAY_OF_WEEK] = d;
    return r;
  },

  isLeapYear: y => !(y % 4) - !(y % 1e2) + !(y % 4e2),

  getDaysInMonth: (y, m) => {
    if (isNaN(m)) m = 1;
    while (m < 1) {
      m += 12;
      y--;
    }
    while (m > 12) {
      m -= 12;
      y++;
    }
    return  28 + (((0x3bbeecc + 16 * (!(y % 4) - !(y % 1e2) + !(y % 4e2))) >> (m ** 2)) & 3);
  },

  convertDateToYmd: date => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return [y, m, d];
  },

  convertYmdToDate: (y, m, d, tz) => {
    if (isNaN(tz)) {
      tz = CalUtils.getLocaleTimezoneOffset();
    }
    let pad2 = v => (v < 10 ? `0${v}` : v);
    return new Date(`${y}-${pad2(m)}-${pad2(d)}T00:00:00${CalUtils.convertTimezoneOffsetToString(tz)}`);
  },

  convertYmdStrToDate: (ymd, tz = CalUtils.getLocaleTimezoneOffset()) =>
    new Date(`${ymd}T00:00:00${CalUtils.convertTimezoneOffsetToString(tz)}`),

  convertTimezoneOffsetToString: tz => {
    let pad2 = v => (v < 10 ? `0${v}` : v);
    let tzHours = Math.abs(0 | (tz / 60));
    let tzSign = tz > 0 ? '-' : `+`;
    let tzMinutes = (Math.abs(tz) - tzHours * 60) | 0;
    return `${tzSign}${pad2(tzHours)}${pad2(tzMinutes)}`;
  },

  getLocaleDateInfo: () => {
    const locale = navigator.language;
    const localeData = new Intl.Locale(locale);

    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });

    const sunday = new Date(2024, 0, 7); // 7 january 2024 - sunday

    // Get week days locale names
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      return {
        long: weekdayFormatter.format(date),
        short: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
        narrow: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date),
      };
    });

    // Get month names
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2024, i, 1);
      return {
        long: monthFormatter.format(date),
        short: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
        narrow: new Intl.DateTimeFormat(locale, { month: 'narrow' }).format(date),
      };
    });

    // detect first day of week
    const firstDayOfWeek = localeData.weekInfo?.firstDay ?? 7;

    return {
      locale,
      language: localeData.language,
      region: localeData.region,
      weekend: localeData.weekInfo?.weekend ?? [6],
      firstDayOfWeek,
      weekDays,
      months,
      getMonthName: (monthIndex, format = 'long') => months[monthIndex][format],
      getWeekdayName: (dayIndex, format = 'long') => weekDays[dayIndex][format],
    };
  },
};

class InfiniteCalendar {
  container;
  actor;
  header;
  $title;
  tbody;
  strut;
  front;

  weekNumLabel = 'WN';

  weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  nearMonthsRendered = 1;
  nearMonthsSpaceRendered = 18;

  firstWeekDay = 0;
  weekend = [0, 6];
  enableKeyboardNavigation = true;
  language = 'en';
  region = 'US';
  locale = 'en-US';
  latlon = [0, 0];
  timezone = 'UTC';
  timezoneOffset = 0;
  currentMonthId;
  selectedDate;

  dateFormat = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  constructor(props) {
    Object.assign(this, props);
    let state = this.loadState();
    if (state) {
      Object.assign(this, state);
    } else {
      this.initState();
    }
    if (this.firstWeekDay == 1) {
      this.weekDayLabels.push(this.weekDayLabels.shift());
    }
    this.actor = _({ cls: 'infinite-calendar', append: this.container });
    this.header = _({ cls: 'header', append: this.actor });
    this.$title = _({ cls: 'title', append: this.header });
    this.thead = _({
      cls: 'thead',
      append: this.header,
      children: [this.weekNumLabel, ...this.weekDayLabels].map((v, i) =>
        _({ cls: ['cell', ...(this.weekend.includes(i) ? ['weekend'] : [])], html: v })
      ),
    });
    this.tbody = _({
      cls: 'tbody',
      append: this.actor,
      evt: {
        scroll: e => this.onScroll(e),
        scrollend: e => this.onScrollEnd(e),
      },
    });
    //_({ tag: 'button', cls: 'prev', append: this.header, on: { click: () => this.scrollToPrevMonth() } });
    //_({ tag: 'button', cls: 'next', append: this.header, on: { click: () => this.scrollToNextMonth() } });

    let id = this.currentMonthId;

    let monthEl = this.createMonth(id);

    this.createNeighbors(id);

    this.currentMonthId = id;

    this.monthHeight = $(this.tbody, '.month').getBoundingClientRect().height;

    monthEl.scrollIntoViewIfNeeded();

    this.renderMonth(id);
    this.renderNeighbors(id);

    this.setTitle(id);

    if (this.enableKeyboardNavigation) {
      document.addEventListener('keydown', e => this.onKeyDown(e));
    }
  }

  get title() {
    return this.$title.innerHTML;
  }

  set title(value) {
    this.$title.innerHTML = value;
  }

  get monthIdMin() {
    return $$(this.tbody, '.month')
      .map(el => +el.getAttribute('data-id'))
      .sort((a, b) => a - b)[0];
  }

  get monthIdMax() {
    return $$(this.tbody, '.month')
      .map(el => +el.getAttribute('data-id'))
      .sort((a, b) => b - a)[0];
  }

  get scrollTop() {
    return this.tbody.scrollTop;
  }

  set scrollTop(value) {
    this.tbody.scrollTop = value;
  }

  get activeMonthId() {
    return +$$(this.tbody, '.month')
      .map(el => [el, Math.abs(el.getBoundingClientRect().top - this.tbody.getBoundingClientRect().top)])
      .sort(([ae, at], [be, bt]) => Math.sign(at - bt))[0][0]
      .getAttribute('data-id');
  }

  setTitle(id) {
    let [year, month] = this.getYearMonthByMonthId(id);
    this.title = `${this.monthNames[month - 1]} ${year}`;
  }

  createMonth(id, action) {
    let [year, month] = this.getYearMonthByMonthId(id);

    // if month is already rendered do nothing
    if (this.findMonthById(id)) {
      return;
    }

    if (!action) {
      action = id > this.monthIdMax ? 'append' : 'prepend';
    }

    return _({
      cls: 'month',
      data: { id, month, year, rendered: 'false' },
      [action]: this.tbody,
    });
  }

  destroyMonth(id) {
    let [year, month] = this.getYearMonthByMonthId(id);

    let monthEl = this.findMonthById(id);
    if (!monthEl) {
      return;
    }
    monthEl.remove();
  }

  createNeighbors(id) {
    let forCreate = [id];
    for (let i = 1; i <= this.nearMonthsSpaceRendered; i++) {
      forCreate.push(id - i);
      forCreate.push(id + i);
    }
    for (let monthEl of $$(this.tbody, '.month')) {
      if (!forCreate.includes(+monthEl.getAttribute('data-id'))) {
        this.destroyMonth(+monthEl.getAttribute('data-id'));
      }
    }
    for (let i = 1; i <= this.nearMonthsSpaceRendered; i++) {
      this.createMonth(id - i, 'prepend');
      this.createMonth(id + i, 'append');
    }
  }

  renderMonth(id) {
    CalUtils.FIRST_DAY_OF_WEEK = this.firstWeekDay;
    let monthEl = this.findMonthById(id);
    if (!monthEl) {
      monthEl = this.createMonth(id);
    }
    if (monthEl.matches('[data-rendered="false"]')) {
      monthEl.setAttribute('data-rendered', 'true');
    } else {
      return;
    }
    let [year, month] = this.getYearMonthByMonthId(id);
    let weeks = CalUtils.getMonthCalendar(+year, +month);
    let firstWeekDay = CalUtils.getWeekDayForYmd(+year, +month, 1);
    let cur = CalUtils.convertYmdToDate(+year, +month, 1);
    console.log(cur);
    if (firstWeekDay > this.firstWeekDay) {
      cur.setDate(cur.getDate() - firstWeekDay + this.firstWeekDay);
    }
    for (let i = 0; i < weeks.length; i++) {
      let week = CalUtils.getWeekNumForYmd(...CalUtils.convertDateToYmd(cur));
      let weekEl = _({
        cls: 'week',
        data: { year, month, week },
        append: monthEl,
      });
      for (let j = 0; j < 7; j++) {
        let cls = ['day'];
        if (cur.getMonth() < month - 1) {
          cls.push('prev');
        } else if (cur.getMonth() > month - 1) {
          cls.push('next');
        } else {
          if (this.formatDate(cur) == this.selectedDate) {
            cls.push('selected');
          }
          if (this.weekend.includes(j + this.firstWeekDay)) {
            cls.push('weekend');
          }
        }

        _({
          cls,
          data: {
            month: cur.getMonth() + 1,
            year: cur.getFullYear(),
            day: cur.getDate(),
            week: week,
            wday: cur.getDay(),
            date: this.formatDate(cur),
          },
          append: weekEl,
          children: [{ cls: 'date', text: cur.getDate() }],
          evt: {
            click: e => {
              this.onCellClick(e);
            },
          },
        });
        cur.setDate(cur.getDate() + 1);
      }
    }
  }

  freeMonth(id) {
    let monthEl = this.findMonthById(id);
    if (!monthEl) {
      console.warn('month not found', id);
      return;
    }
    $$(monthEl, '*').forEach(el => el.remove());
    monthEl.setAttribute('data-rendered', 'false');
  }

  renderNeighbors(id) {
    let forRender = [id];
    for (let i = 1; i <= this.nearMonthsRendered; i++) {
      forRender.push(id - i);
      forRender.push(id + i);
    }
    for (let monthEl of $$(this.tbody, '.month')) {
      let monthId = +monthEl.getAttribute('data-id');
      if (!forRender.includes(monthId)) {
        this.freeMonth(+monthEl.getAttribute('data-id'));
      }
    }
    for (let i = 1; i <= this.nearMonthsRendered; i++) {
      this.renderMonth(id - i);
      this.renderMonth(id + i);
    }
  }

  scrollToNextMonth() {
    this.scrollToMonth(this.activeMonthId + 1);
  }

  scrollToPrevMonth() {
    this.scrollToMonth(this.activeMonthId - 1);
  }

  scrollToMonth(monthId) {
    let monthEl = this.findMonthById(monthId);
    if (!monthEl) {
      return;
    }
    this.tbody.scrollTo({
      top: monthEl.offsetTop,
      behavior: 'smooth',
    });
  }

  onDateSelect() {
    console.log('onDateSelect');
  }

  onDateDeselect() {
    console.log('onDateDeselect');
  }

  onCellClick(e) {
    let dayEl = e.target.closest('.day');
    let date = dayEl.getAttribute('data-date');
    let [year, month, day] = date.split('-');
    if (this.selectedDate == date) {
      this.deselectDate(this.selectedDate);
    } else {
      if (this.selectedDate) {
        this.deselectDate(this.selectedDate);
      }
      this.selectDate(date);
    }
  }

  deselectDate(date) {
    let dateEl = this.findDayByDate(date);
    dateEl?.classList.remove('selected');
    this.selectedDate = null;
    this.onDateDeselect();
  }

  selectDate(date) {
    let dayEl = this.findDayByDate(date);
    dayEl.classList.add('selected');
    let month = +dayEl.getAttribute('data-month');
    let year = +dayEl.getAttribute('data-year');
    let monthId = this.getMonthIdByYearMonth(year, month);
    if (this.activeMonthId != monthId) {
      this.scrollToMonth(monthId);
      this.currentMonthId = this.activeMonthId;
    }
    this.selectedDate = date;
    this.onDateSelect();
  }

  onMonthChange() {
    console.log('change', this.activeMonthId);
    this.currentMonthId = this.activeMonthId;
    this.renderNeighbors(this.activeMonthId);
    this.setTitle(this.activeMonthId);
  }

  onScroll(e) {
    if (this.activeMonthId != this.currentMonthId) {
      this.onMonthChange();
    }
  }

  onScrollStart(e) {}
  initState() {
    let localeInfo = CalUtils.getLocaleDateInfo();
    let now = new Date();
    let curMonth = now.getMonth() + 1;
    let curYear = now.getFullYear();
    this.currentMonthId = this.getMonthIdByYearMonth(curYear, curMonth);
    this.language = localeInfo.locale;
    this.region = localeInfo.region;
    this.weekend = localeInfo.weekend.map(d => d);
    this.monthNames = localeInfo.months.map(w => w.long.toUpperCase());
    this.weekDayLabels = localeInfo.weekDays.map(w => w.short.toUpperCase());
    this.firstWeekDay = localeInfo.firstDayOfWeek % 7;
    this.localeInfo = localeInfo;
    this.locale = localeInfo.locale;
  }

  saveState() {
    let state = {
      locale: this.locale,
      language: this.language,
      region: this.region,
      monthNames: this.monthNames,
      weekDayLabels: this.weekDayLabels,
      firstWeekDay: this.firstWeekDay,
      weekend: this.weekend,
      selectedDate: this.selectedDate,
      currentMonthId: this.currentMonthId,
    };
    localStorage.setItem('calendarState', JSON.stringify(state));
  }
  loadState() {
    let state = localStorage.getItem('calendarState');
    if (state) {
      return JSON.parse(state);
    }
    return null;
  }

  formatDate(date) {
    return this.dateFormat.format(date);
  }

  onScrollEnd(e) {
    this.createNeighbors(this.activeMonthId);
  }

  go(step) {
    let selected = this.getSelectedDate();
    if (!selected) {
      return this.selectRandom();
    }
    let date = CalUtils.convertYmdStrToDate(selected);
    date.setDate(date.getDate() + step);
    this.deselectDate(this.selectedDate);
    this.selectDate(this.formatDate(date));
  }

  moveUp() {
    this.go(-7);
  }

  moveDown() {
    this.go(7);
  }

  moveLeft() {
    this.go(-1);
  }

  moveRight() {
    this.go(1);
  }

  moveFirst() {
    let monthId = this.activeMonthId;
    let [year, month] = this.getYearMonthByMonthId(monthId);
    let date = CalUtils.convertYmdToDate(year, month, 1);
    if (this.selectedDate) {
      this.deselectDate(this.selectedDate);
    }
    this.selectDate(this.formatDate(date));
  }
  moveLast() {
    let monthId = this.activeMonthId;
    let [year, month] = this.getYearMonthByMonthId(monthId);
    let date = CalUtils.convertYmdToDate(year, month, CalUtils.getDaysInMonth(year, month));
    if (this.selectedDate) {
      this.deselectDate(this.selectedDate);
    }
    this.selectDate(this.formatDate(date));
  }

  movePrevMonth() {
    let monthId = this.activeMonthId;
    let [year, month] = this.getYearMonthByMonthId(monthId);
    let date = CalUtils.convertYmdToDate(year, month, 1);
    date.setMonth(date.getMonth() - 1);
    if (this.selectedDate) {
      this.deselectDate(this.selectedDate);
    }
    this.selectDate(this.formatDate(date));
  }

  moveNextMonth() {
    let monthId = this.activeMonthId;
    let [year, month] = this.getYearMonthByMonthId(monthId);
    let date = CalUtils.convertYmdToDate(year, month, 1);
    date.setMonth(date.getMonth() + 1);
    if (this.selectedDate) {
      this.deselectDate(this.selectedDate);
    }
    this.selectDate(this.formatDate(date));
  }

  selectRandom() {
    let monthId = this.activeMonthId;
    let monthEl = this.findMonthById(monthId);
    let dayEls = $$(monthEl, '.day');
    let randomDay = dayEls[(Math.random() * dayEls.length) | 0];
    this.selectDate(randomDay.getAttribute('data-date'));
  }

  getSelectedDate() {
    if (!this.selectedDate) {
      return null;
    }
    let dateEl = this.findDayByDate(this.selectedDate);
    if (!dateEl) {
      return null;
    }
    return this.selectedDate;
  }

  onKeyDown(e) {
    // console.log('onKeyDown', e);
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.moveLeft();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.moveRight();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveUp();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveDown();
        break;
      case 'Home':
        e.preventDefault();
        this.moveFirst();
        break;
      case 'End':
        e.preventDefault();
        this.moveLast();
        break;
      case 'PageUp':
        e.preventDefault();
        this.movePrevMonth();
        break;
      case 'PageDown':
        e.preventDefault();
        this.moveNextMonth();
        break;
    }
  }
  findMonthById(id) {
    return this.tbody.querySelector(`.month[data-id="${id}"]`);
  }
  findDayByDate(date) {
    return this.tbody.querySelector(`.day[data-date="${date}"]:not(.prev):not(.next)`);
  }
  getMonthIdByYearMonth(year, month) {
    return year * 12 + month - 1;
  }
  getYearMonthByMonthId(id) {
    return [0 | (id / 12), (id % 12) + 1];
  }
}

window.infiniteCalendar = new InfiniteCalendar({ container: $('.container') });

function showAnimation() {
  let finger = $('#finger');
  let svg = $('#scroll_animation');
  svg.animate([{ opacity: '0', scale: 5 }], { duration: 0 });
  svg.classList.add('visible');
  svg.animate([{ opacity: 0, scale: 5 }, { opacity: 1, scale: 1 }], { duration: 500 })
  setTimeout(() =>svg.animate([{ opacity: 1, scale: 1 },{ opacity: 0, scale: 5 }],
              { duration: 500 }),3300);
  setTimeout(() => svg.classList.remove('visible'), 3600);
}

//showAnimation(); 
