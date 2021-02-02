'use strict';

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Joe Gumball',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-01-20T17:01:17.194Z',
    '2021-01-30T23:36:17.929Z',
    '2021-01-31T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function(date) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if ( daysPassed === 0 ) return 'Today';
  if ( daysPassed === 1 ) return 'Yesterday';
  if ( daysPassed <= 7 ) return `${daysPassed} days ago`;

    const day = `${date.getDate()}`.padStart(2,0);
    const month = `${date.getMonth() + 1}`.padStart(2,0);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const displayMovements = function(acc, sort = false) {
  containerMovements.innerHTML = '';
  // .textContent = 0

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function(mov,i){
    const type = mov > 0 ? 'deposit' : 'withdrawal'

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${mov.toFixed(2)} GB</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

// const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
// displayMovements(account1.movements)

const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)} GumBalls`;
};
// calcDisplayBalance(account1.movements);

const calcDisplaySummary = function(acc) {
  const incomes = acc.movements.filter(mov => mov > 0).reduce((acc,mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)} GB`;

  const out = acc.movements
  .filter(mov => mov < 0)
  .reduce((acc,mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)} GB`;

  const interest = acc.movements
  .filter(mov => mov > 0)
  .map(deposit => deposit * acc.interestRate/100)
  .filter((int, i, arr) => {
    // console.log(arr);
    return int >= 1;
  })
  .reduce((acc,int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)} GB`;
}
// calcDisplaySummary(account1.movements);

const createUsernames = function (accs) {
  accs.forEach(function(acc) {
    acc.username =
    acc.owner.toLowerCase().split(' ').map(word => word[0]).join('');
  });
};

createUsernames(accounts);
// console.log(accounts);

const updateUI = function (acc) {
  displayMovements(acc);
    //Display balance
  calcDisplayBalance(acc);
    //display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function() {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2,0);
    const sec = String(time % 60).padStart(2,0);
    // Print remaining time each call
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 stop timer and log out
    if(time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login in to get started`;
      containerApp.style.opacity = 0;
    }
    // decrease -1
    time--;
  };


  // set time to 2 min
  let time = 120;
  // Call timer every second
  tick();
  const timer = setInterval(tick,1000);
  return timer;
};

// Events handler
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Label Date below Current Balance
const now = new Date();
const day = `${now.getDate()}`.padStart(2,0);
const month = `${now.getMonth() + 1}`.padStart(2,0);
const year = now.getFullYear();
const hour = now.getHours();
const min = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

// LOGIN Handler
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  // console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();


    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // console.log('LOGIN');
    // Display Movements
    updateUI(currentAccount);
  };
});

// Transfer Handler
btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  // console.log(amount, receiverAcc);

  if (amount >0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username) {
    // transfer
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
    // Add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());
  };
  inputTransferTo.value = inputTransferTo.value = '';
  inputTransferAmount.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();

  // Update UI
  updateUI(currentAccount);

  // Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

// Loan handler
btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function() {
    // Add movement
    currentAccount.movements.push(amount);
    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    // reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

// Account close Handler
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if(currentAccount.username === inputCloseUsername.value && currentAccount.pin === +inputClosePin.value){
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    // console.log(index);
    // delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';

});

// Sort logic Gate
let sorted = false;
btnSort.addEventListener('click', function(e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// Ball background animation
const colors = ["#DE2EA1", "#EEEA0D", "#EE1919", "#3385F1"];

const numBalls = 15;
const balls = [];

for (let i = 0; i < numBalls; i++) {
  let ball = document.createElement("div");
  ball.classList.add("ball");
  ball.style.background = colors[Math.floor(Math.random() * colors.length)];
  ball.style.left = `${Math.floor(Math.random() * 100)}vw`;
  ball.style.top = `${Math.floor(Math.random() * 100)}vh`;
  ball.style.transform = `scale(${Math.random()})`;
  ball.style.width = `${Math.random() * 10}rem`;
  ball.style.height = ball.style.width;

  balls.push(ball);
  document.body.append(ball);
}

// Keyframes
balls.forEach((el, i, ra) => {
  let to = {
    x: Math.random() * (i % 2 === 0 ? -11 : 11),
    y: Math.random() * 12
  };

  let anim = el.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${to.x}rem, ${to.y}rem)` }
    ],
    {
      duration: (Math.random() + 1) * 2000, // random duration
      direction: "alternate",
      fill: "both",
      iterations: Infinity,
      easing: "ease-in-out"
    }
  );
});










