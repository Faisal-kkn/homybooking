let nameError = document.getElementById('username-err');
let locationErr = document.getElementById('location-err');
let phoneError = document.getElementById('front_office-err');
let passwordError = document.getElementById('password-error');
let emailError = document.getElementById('email-err');
let numberErr = document.getElementById('total_rooms-err');
let mapErr = document.getElementById('map-err');
let submitError = document.getElementById('empty_notice');

/* Commonly Used Validation Functions*/

function validateName(){
    let name = document.getElementById('username').value;
    nameError.style.color = 'red';
    if (name.length == 0) {
        nameError.innerHTML = 'Field is required';
        return false;
    }
    nameError.innerHTML = '';
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


function validatePassword(){
    let password = document.getElementById('password').value;
    document.getElementById('password-error').style.color = 'red';
    passwordError.style.color = 'red';
    if (password.length == 0) {
        passwordError.innerHTML = 'required';
        return false;
    }
   
    passwordError.innerHTML = '';
    return true;
}

/* SignUp Validation */
function validateSigninForm(event) {
    if (!validateName() || !validatePassword()) {
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


/* vendor Validation */

function validatevendorloginForm(event) {
    if (!validateEmail() || !validatePassword()) {
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

/* Hotel Validation Start*/

function HotelName(){
    let name = document.getElementById('hotel_name').value;
    let HotelNameErr = document.getElementById('hotel_name-err');
    HotelNameErr.style.color = 'red';
    if (name.length == 0) {
        HotelNameErr.innerHTML = 'Field is required';
        return false;
    }
    HotelNameErr.innerHTML = '';
    return true;
}
function Hotellocation(){
    let name = document.getElementById('location').value;
    let locationErr = document.getElementById('location-err');
    locationErr.style.color = 'red';
    if (name.length == 0) {
        locationErr.innerHTML = 'Field is required';
        return false;
    }
    locationErr.innerHTML = '';
    return true;
}


function validatefrontOffice() {
    let frontOffice = document.getElementById('front_office').value;
    let frontOfficeErr = document.getElementById('front_office-err');

    document.getElementById('front_office-err').style.color = 'red';
    if (frontOffice.length == 0) {
        frontOfficeErr.innerHTML = 'Phone is required';
        return false;
    }

    if (frontOffice.length !== 10) {
        frontOfficeErr.innerHTML = 'Phone no should be 10 digits';
        return false;
    }

    if(!frontOffice.match(/^[0-9]{10}$/)){
        frontOfficeErr.innerHTML = 'Only digits please';
        return false;
    }

    frontOfficeErr.innerHTML = '';
    return true;
}

function validateOfficeMobile() {
    let mobile = document.getElementById('mobile').value;
    let mobileErr = document.getElementById('mobile-err');

    mobileErr.style.color = 'red';
    if (mobile.length == 0) {
        mobileErr.innerHTML = 'Phone is required';
        return false;
    }

    if (mobile.length !== 10) {
        mobileErr.innerHTML = 'Phone no should be 10 digits';
        return false;
    }

    if(!mobile.match(/^[0-9]{10}$/)){
        mobileErr.innerHTML = 'Only digits please';
        return false;
    }

    mobileErr.innerHTML = '';
    return true;
}

function validateRoom() {
    let room = document.getElementById('total_rooms').value;
    let roomErr = document.getElementById('total_rooms-err');

    roomErr.style.color = 'red';
    if (room.length == 0) {
        roomErr.innerHTML = 'Field is required';
        return false;
    }

    if (room == ' ') {
        roomErr.innerHTML = 'Field is required';
        return false;
    }

    if (!room.match(/^[0-9]*$/)) {
        roomErr.innerHTML = 'Only digits please';
        return false;
    }

    roomErr.innerHTML = '';
    return true;
}

function MapLink(){
    let map = document.getElementById('map').value;
    let mapErr = document.getElementById('map-err');
    mapErr.style.color = 'red';
    if (map.length == 0) {
        mapErr.innerHTML = 'Field is required';
        return false;
    }
    mapErr.innerHTML = '';
    return true;
}


function validateAddress() {
    let Address = document.getElementById('address').value;
    let AddressErr = document.getElementById('address-err');

    AddressErr.style.color = 'red';
    if (Address.length <= 10) {
        AddressErr.innerHTML = 'Address is required';
        return false;
    }

    if(!Address.match(/^[a-zA-Z0-9\s,'-]*$/)){
        AddressErr.innerHTML = 'Enter the valid address';
        return false;
    }

    AddressErr.innerHTML = '';
    return true;
}

    function previewImages() {

        var preview = document.querySelector('#preview');

        if (this.files) {
            [].forEach.call(this.files, readAndPreview);
        }

        function readAndPreview(file) {

            // Make sure `file.name` matches our extensions criteria
            if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
                return alert(file.name + " is not an image");
            } // else...

            var reader = new FileReader();

            reader.addEventListener("load", function () {
                var image = new Image();
                image.width = 100;
                image.title = file.name;
                image.src = this.result;
                preview.appendChild(image);
            });

            reader.readAsDataURL(file);

        }

    }

    document.querySelector('#file-input').addEventListener("change", previewImages);

function validateDescription(){
    let message = document.getElementById('description').value;
    let required = 200;
    let left = required - message.length;
    let messageError = document.getElementById('description-err')
    messageError.style.color = 'red';

    if (left > 0) {
        messageError.innerHTML = left + ' More charector required';
        return false;
    }

    messageError.innerHTML = '';
    return true;
}


function validateHotel(event) {
    if (!HotelName() || !Hotellocation() || !validatefrontOffice() || !validateOfficeMobile() || !validateEmail() || !validateRoom() || !MapLink() || !validateAddress() || !validateDescription()) {
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
/* Hotel Validation End*/



/* Vendor SignUp Validation Start*/

function validateFullName(){
    let name = document.getElementById('name').value;
    let fullnameError = document.getElementById('name-err');

    fullnameError.style.color = 'red';
    if (name.length == 0) {
        fullnameError.innerHTML = 'Field is required';
        return false;
    }
    fullnameError.innerHTML = '';
    return true;
}


function validateMobile() {
    let mobile = document.getElementById('number').value;

    // let mobileError = document.getElementById('mobile-err')

    document.getElementById('mobile-err').style.color = 'red';
    if (mobile.length == 0) {
        document.getElementById('mobile-err').innerHTML = 'Phone is required';
        return false;
    }

    if (mobile.length !== 10) {
        document.getElementById('mobile-err').innerHTML = 'Phone no should be 10 digits';
        return false;
    }

    if(!mobile.match(/^[0-9]{10}$/)){
        document.getElementById('mobile-err').innerHTML = 'Only digits please';
        return false;
    }

    document.getElementById('mobile-err').innerHTML = '';
    return true;
}
// var photo = 0;
// function validateImage() {
//     let image = form.photo.files[0];
//     let fileValidationMsg = document.getElementById('fileValidationMsg');

//     if (image) {
//         if (image.type == 'image/jpeg') {

//             fileValidationMsg.textContent = "Valid File";
//             fileValidationMsg.classList.remove('text-danger');
//             fileValidationMsg.classList.add('text-success');

//             photo = 1;

//         } else {
//             fileValidationMsg.textContent = "Invalid Image Format";
//             fileValidationMsg.classList.remove('text-success');
//             fileValidationMsg.classList.add('text-danger');

//             photo = 0;
//         }
//     } else {

//     }
// }

function validateVendorSignup(event){
    if (!validateFullName() || !validateMobile() || !validateEmail() || !validatePassword() || !validateAddress()) {
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

/* Vendor SignUp Validation End*/



/* Hotel Types */

function validateHotelType(event) {
    let type = document.getElementById('hoteltypes').value;
    let typeError = document.getElementById('types-err');
    let required = 5;
    let left = required - type.length;
    typeError.style.color = 'red';
    if (type.length == 0) {
        typeError.innerHTML = 'Field is required';
        event.preventDefault();
        return false;
    }
    if (left > 0) {
        event.preventDefault();
        typeError.innerHTML = left + ' More charector required';
        return false;
    }

    typeError.innerHTML = '';
    return true;
}

/* Hotel Facility's */

function validateHotelFacility(event) {
    let facility = document.getElementById('hotel-facility').value;
    let facilityError = document.getElementById('facility-err');
    let required = 5;
    let left = required - facility.length;
    facilityError.style.color = 'red';
    if (facility.length == 0) {
        facilityError.innerHTML = 'Field is required';
        event.preventDefault();
        return false;
    }

    if (left > 0) {
        event.preventDefault();
        facilityError.innerHTML = left + ' More charector required';
        return false;
    }


    facilityError.innerHTML = '';
    return true;
}


/* Room Type */

function validateRoomType(event) {
    let type = document.getElementById('room-type').value;
    let typeError = document.getElementById('room-type-err');
    let required = 5;
    let left = required - type.length;
    typeError.style.color = 'red';
    if (type.length == 0) {
        typeError.innerHTML = 'Field is required';
        event.preventDefault();
        return false;
    }
    if (left > 0) {
        event.preventDefault();
        typeError.innerHTML = left + ' More charector required';
        return false;
    }


    typeError.innerHTML = '';
    return true;
}


/* Room Status */

function validateRoomStatus(event) {

    let status = document.getElementById('roomstatus').value;
    let statusError = document.getElementById('room-status-err');
    let required = 5;
    let left = required - status.length;
    statusError.style.color = 'red';
    if (status.length == 0) {
        statusError.innerHTML = 'Field is required';
        event.preventDefault();
        return false;
    }
    if (left > 0) {
        event.preventDefault();
        statusError.innerHTML = left + ' More charector required';
        return false;
    }



    typeError.innerHTML = '';
    return true;
}


/* Coupon Validation Start*/

function validatePercentage() {
    let percentage = document.getElementById('percentage');
    console.log(percentage);
    var percentageErr = document.getElementById('percentage-err')
    percentageErr.style.color = 'red';

    if (percentage.value.length == 0) {
        percentageErr.innerHTML = 'percentage is required';
        return false;
    }

    if (percentage.value > 99) {
        percentageErr.innerHTML = 'please enter less than 100 ';
        return false;
    }

    if (!percentage.value.match(/^[0-9]*$/)) {
        percentageErr.innerHTML = 'Only digits please';
        return false;
    }

    percentageErr.innerHTML = '';
    return true;
}


function validateCouponCode() {
    let coupon = document.getElementById('coupon-Code');
    let couponCodeErr = document.getElementById('coupon-Code-err')
    couponCodeErr.style.color = 'red';

    if (coupon.value.length == 0) {
        couponCodeErr.innerHTML = 'Coupon code is required';
        return false;
    }

    if (coupon.value.length < 5) {
        couponCodeErr.innerHTML = 'Min 5 charector required';
        return false;
    }

    if (!coupon.value.match(/^[A-Z]/)) {
        couponCodeErr.innerHTML = `Capital letters Only`;
        return false;
    }

    if (!coupon.value.match(/^[A-Z0-9_.-]*$/)) {
        couponCodeErr.innerHTML = `special character can't be entered`;
        return false;
    }

    couponCodeErr.innerHTML = '';
    return true;
}


function validateCount() {
    let count = document.getElementById('count');
    let countErr = document.getElementById('count-err')
    countErr.style.color = 'red';

    if (count.value.length == 0) {
        countErr.innerHTML = 'percentage is required';
        return false;
    }

    if (!count.value.match(/^[0-9]*$/)) {
        countErr.innerHTML = 'Only digits please';
        return false;
    }

    countErr.innerHTML = '';
    return true;
}


function validateAddCoupon(event) {
    if (!validatePercentage() || !validateCouponCode() || !validateCount()) {
        event.preventDefault();
        let subErr = document.getElementById('submit-err')
        subErr.style.display = 'block';
        subErr.innerHTML = 'Please Fill Required Fields';
        subErr.style.color = 'red';

        setTimeout(function () { subErr.style.display = 'none'; }, 3000);
        return false;
    }
    else {
        subErr.innerHTML = '';
        return true;
    }
}

/* Coupon Validation End*/


/* Room Validation Start*/


function validateRoomCount() {
    let count = document.getElementById('room-count');
    let countErr = document.getElementById('room-count-err')
    countErr.style.color = 'red';

    if (count.value.length == 0) {
        countErr.innerHTML = 'Room Count is required';
        return false;
    }

    if (!count.value.match(/^[0-9]*$/)) {
        countErr.innerHTML = 'Only digits please';
        return false;
    }

    countErr.innerHTML = '';
    return true;
}

function validateMrpPrice() {
    let mrpprice = document.getElementById('mrpprice');
    let mrppriceErr = document.getElementById('mrpprice-err')
    mrppriceErr.style.color = 'red';

    if (mrpprice.value.length == 0) {
        mrppriceErr.innerHTML = 'required';
        return false;
    }

    if (!mrpprice.value.match(/^[0-9]*$/)) {
        mrppriceErr.innerHTML = 'Only digits please';
        return false;
    }

    mrppriceErr.innerHTML = '';
    return true;
}


function validateSalesPrice() {
    let salesprice = document.getElementById('salesprice');
    let salespriceErr = document.getElementById('salesprice-err')
    let mrp = document.getElementById('mrpprice').value

    salespriceErr.style.color = 'red';

    console.log(typeof (mrp));
    console.log(typeof (salesprice.value));


    if (salesprice.value.length == 0) {
        salespriceErr.innerHTML = 'required';
        return false;
    }

    if (!salesprice.value.match(/^[0-9]*$/)) {
        salespriceErr.innerHTML = 'Only digits please';
        return false;
    }

    if (parseInt(salesprice.value) >= parseInt(mrp)) {
        salespriceErr.innerHTML = 'choose less than the MRP';
        return false;
    }

    salespriceErr.innerHTML = '';
    return true;
}


function validateRoomDescription() {
    let message = document.getElementById('description').value;
    let required = 200;
    let left = required - message.length;
    let messageError = document.getElementById('description-err')
    messageError.style.color = 'red';

    if (left > 0) {
        messageError.innerHTML = left + ' More charector required';
        return false;
    }

    messageError.innerHTML = '';
    return true;
}

function validateAddRoom(event) {
    if (!validateRoomCount() || !validateMrpPrice() || !validateSalesPrice() || !validateRoomDescription()) {
        event.preventDefault();
        let subErr = document.getElementById('submit-err')
        subErr.style.display = 'block';
        subErr.innerHTML = 'Please Fill Required Fields';
        subErr.style.color = 'red';

        setTimeout(function () { subErr.style.display = 'none'; }, 3000);
        return false;
    }
    else {
        subErr.innerHTML = '';
        return true;
    }
}

/* Room Validation End*/
