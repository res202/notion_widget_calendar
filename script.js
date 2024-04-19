//variables
const calendarDays = document.getElementById("days");
const currentMonth = document.getElementById("month");

let currentDate = new Date();
let selectedDate = new Date();
let selectedElement;

//functions

//1. Get the number of days in a select month
function getDaysInTheMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

//2. Add all days in the month as list elements to the calendar
function addDays() {
  let daysInTheMonth = getDaysInTheMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth()
  );
  console.log(daysInTheMonth);
  for (let i = 1; i <= daysInTheMonth; i++) 
    {
      const newCalendarDays = document.createElement("li");
      newCalendarDays.innerHTML = i;
      newCalendarDays.classList.add("day");
      calendarDays.appendChild(newCalendarDays);
    }
}

//3. Clear all calendar days
function clearDays() {
  while (calendarDays.firstChild) {
    calendarDays.removeChild(calendarDays.firstChild);
  }
}
  
//4. Set the current month and year in the header
function addMonth() {
  currentMonth.innerHTML = `${selectedDate.toLocaleString("default", {
    month: "long"
  })} ${selectedDate.getFullYear()}`;
}

//5. Use prev arrow to select previous month
function selectPreviousMonth() {
  if (selectedDate.getMonth() === 0) {
    selectedDate.setFullYear(selectedDate.getFullYear() - 1);
    selectedDate.setMonth(11);
  } else {
    selectedDate.setMonth(selectedDate.getMonth() - 1);
  }
  addMonth();
  clearDays();
  addDays();
}

//6. Use next arrow to select the next month
function selectNextMonth() {
  if (selectedDate.getMonth() === 11) {
    selectedDate.setFullYear(selectedDate.getFullYear() + 1);
    selectedDate.setMonth(0);
  } else {
    selectedDate.setMonth(selectedDate.getMonth() + 1);
  }
  addMonth();
  clearDays();
  addDays();
}

//7. Set WeekDay 
function addWeekDay() {
  const weekday = ["Mäntig","Tsiischtig","Mittwuch","Dunschtig","Fritig","Samschtig","Sunntig"];

  let newWeekDay = weekday[selectedDate.getDay()];
  document.getElementById("weekDay").innerHTML = newWeekDay;
}

//8. Set selected day as dayOfMonth -- WIP
function addDayOfMonth() {
  let newDayOfMonth = selectedDate.getDate();
  document.getElementById("dayOfMonth").innerHTML = newDayOfMonth;
 /* if (newDayOfMonth == currentDate.getDate()) {
    document.getElementById("dayOfMonth").classList.add("current");
  } else { document.getElementById("dayOfMonth").style.color = "#595959"; } */
}

//9. Get ISO Week Number and set as weekOfYear
function addWeekOfYear() {
//Get the first week, which always contains January 4th
  let firstWeek = new Date(selectedDate.getFullYear(), 0, 4);
//Calculate the number of days between Jan 4th and the current date
  let numOfDays = Math.floor((selectedDate - firstWeek)/(1000*60*60*24));
//Calculate the week number
  let weekNum = Math.ceil((1 + numOfDays + selectedDate.getDay())/7);
  document.getElementById("weekOfYear").innerHTML = weekNum;
}

//10. Highlight selected dates and change text color of the current date
function selectDate(e) {
  const days = document.getElementsByClassName("day");
  for (let i = 0; i < days.length; i++) {
    days[i].classList.remove("active");
//    if (i == currentDate.getDate()) {
//      days[i-1].classList.add("current");
//    }
  }
  if (selectedElement) {
    selectedElement.classList.add("active");
    console.log(selectedElement);
    
    addWeekDay();
    addDayOfMonth();
    addWeekOfYear();
  }
}

// Add event listeners to calendar days
calendarDays.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    selectedDate.setDate(e.target.textContent);
    selectedElement = e.target;
    selectDate();
  }

  
});

addMonth();
addWeekDay();
addDayOfMonth();
addWeekOfYear();
addDays();

