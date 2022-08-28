// // User Login Start 

let phoneError = document.getElementById('phone-error');
let passwordError = document.getElementById('password-error');
let msgSuccess = document.getElementById('alert-success');
let nameError = document.getElementById('signupnameerr');
let emailError = document.getElementById('emailError');
let submitError = document.getElementById('empty_notice');
let otpError = document.getElementById('otperror');



function validateName(){
    let name = document.getElementById('signupname').value;
    document.getElementById('signupnameerr').style.color = 'red';
    if (name.length == 0) {
        nameError.innerHTML = 'username is required';
        return false;
    }

    if (name.match(' '+' ')) {
        nameError.innerHTML = 'space is two';
        return false;
    }

    if (!name.match(/^[a-zA-Z]+ [a-zA-Z]+$/)) {
        nameError.innerHTML = 'Write full name';
        return false;
    }

    nameError.innerHTML = '';
    return true;
}


function validatePhone() {
    let phone = document.getElementById('usermobile').value;

    document.getElementById('phone-error').style.color = 'red';
    if (phone.length == 0) {
        phoneError.innerHTML = 'Phone is required';
        return false;
    }

    if (phone.length !== 10) {
        phoneError.innerHTML = 'Phone no should be 10 digits';
        return false;
    }

    if(!phone.match(/^[0-9]{10}$/)){
        phoneError.innerHTML = 'Only digits please';
        return false;
    }

    phoneError.innerHTML = '';
    return true;
}


function validateEmail(){
    let email = document.getElementById('email').value;
    emailError.style.color = 'red';
    if (email.length == 0) {
        emailError.innerHTML = 'Email is required';
        return false;
    }

    if (email == 'info@homy.com') {
        emailError.innerHTML = 'you can\'t use this email';
        return false;
    }

    if (!email.match(/^([a-z0-9_\.\-])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+$/)) {
        emailError.innerHTML = 'Email invalid';
        return false;
    }

    emailError.innerHTML = '';    
    return true;
}

function validatePassword(){
    let password = document.getElementById('userpassword').value;
    let required = 5;
    let left = required - password.length;
    document.getElementById('password-error').style.color = 'red';

    if (left > 0) {
        passwordError.innerHTML = 'Min 5 charector required';
        return false;
    }

    passwordError.innerHTML = '';
    return true;
}

function validateOtp(){
    let otp = document.getElementById('otp').value;
    let required = 4;
    let left = required - otp.length;
    otpError.style.color = 'red';

    if (left != 0) {
        otpError.innerHTML = `OTP is 4 digit's`;
        return false;
    }

    otpError.innerHTML = '';
    return true;
}

function validateOtpForm(event) {
    if (!validateOtp()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function () { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
    }
}

function validatemobileForm(event) {
    if (!validatePhone()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function () { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
    }
}

// Login Varification
function validateForm(event) {
    if (!validatePhone()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function () { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
    }
}


function validateSigninForm(event) {
    if (!validateName() || !validateEmail() || !validatePhone() || !validatePassword()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function () { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
        return true;

    }
}

    //   let date = document.getElementById('t-input-check-in').value
function myFunction(event) {
    // let checIn = document.getElementById("t-input-check-in").required = true;
    let checIn = document.getElementById("t-input-check-in").required = true;
    let checOut = document.getElementById("t-input-check-out").required = true;
    if(checIn == true || checOut == true){
        document.getElementById('dateErr').innerHTML = '';
        document.getElementById("t-input-check-in").value = date['t-start'];
        document.getElementById("t-input-check-out").value = date['t-end'];
        document.getElementById("t-input-check-in").value = getSavedValue("t-input-check-in");    // set the value to this input
        document.getElementById("t-input-check-out").value = getSavedValue("t-input-check-out");   // set the value to this input
        /* Here you can add more inputs to set value. if it's saved */

        //Save the value function - save it to localStorage as (ID, VALUE)
        function saveValue(e) {
            var id = e.id;  // get the sender's id to save it . 
            var val = e.value; // get the value. 
            localStorage.setItem(id, val);// Every time user writing something, the localStorage's value will override . 
        }

        //get the saved value function - return the value of "v" from localStorage. 
        function getSavedValue(v) {
            if (!localStorage.getItem(v)) {
                return "";// You can change this to your defualt value. 
            }
            return localStorage.getItem(v);
        }

        return true
    }else{
        event.preventDefault()

        document.getElementById('dateErr').innerHTML = 'Please Fill Required Fields';
        return false

    }

    

}


/* Booking Validation */

function validateBookingName() {
    let bookingName = document.getElementById('booking-name');
    var bookingNameErr = document.getElementById('booking-name-error');
    if (bookingName.length == 0 || bookingName.value.match(' ' + ' ')) {
        bookingNameErr.innerHTML = 'Name is required';
        return false;
    }

    if (!bookingName.value.match(/^[a-zA-Z]+ [a-zA-Z]+$/)) {
        bookingNameErr.innerHTML = 'Write full name';
        return false;
    }

    bookingNameErr.innerHTML = '';
    return true;
}

function bookingValidation(event) {
    if (!validateBookingName() || !validateEmail() || !validatePhone()) {
        event.preventDefault();
        submitError.style.display = 'block';
        submitError.innerHTML = 'Please Fill Required Fields';
        submitError.style.color = 'red';

        setTimeout(function () { submitError.style.display = 'none'; }, 3000);
        return false;
    } else {
        msgSuccess.style.display = 'block';
        msgSuccess.innerHTML = 'This is a success alert—check it out!';
        return true;

    }
}