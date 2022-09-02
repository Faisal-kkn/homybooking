//  function addToWishlist(roomId) {
//      $.ajax({
//          url: '/add-to-wishlist/' + roomId,
//          method: 'get',
//          success: (response) => {
//              if (response.status) {
//                  // alert('asas')
//                  $("#roomId").style("color", "red");
//              }
//          }
//      })
//  }

function walletCheck(amount) {
    $.ajax({
        url: '/check-wallet-amount/' + amount,
        method: 'get',
        success: (response) => {
            const cb = document.querySelector('#wallet');
            console.log(cb.checked); // false
            console.log(response);
            if (cb.checked) {
                if (response.status) {
                    document.getElementById('walletgrater').style.display = "none"
                } else {
                    document.getElementById('walletgrater').style.display = "block"
                }
            } else {
                document.getElementById('walletgrater').style.display = "block"
            }


        }
    })
}

 //  function searchRoom() {
 //     event.preventDefault()
 //     $.ajax({
 //         url: '/availability',
 //         method: 'get',
 //         success: (response) => {
 //             alert('asas')
 //             console.log(response);
 //         }
 //     })
 // }

/* Coupon Offer section */

$("#offer_coupon").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/room/coupon',
        method: 'post',
        data: $("#offer_coupon").serialize(),
        success: (response) => {
            console.log(response);
            if (response.status) {
                document.getElementById('couponErr').style.border = '2px solid green'
                document.getElementById('offerAmount').innerHTML = '₹' + response.offerAmount
                document.getElementById('total-amount').innerHTML = '₹' + response.totalAmount
            } else {
                document.getElementById('couponErr').style.border = '2px solid red'
                document.getElementById('offerAmount').innerHTML = '₹0'
                document.getElementById('total-amount').innerHTML = '₹' + response.totalAmount
                // document.getElementById('couponErr').innerHTML = 'Enter a Valid Coupon'
            }
            console.log(response);
        }
    })
}) 


/* Booking payment section */
$("#booking_form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/room/booked',
        method: 'post',
        data: $("#booking_form").serialize(),
        success: (response) => {
            console.log(response);
            if (response.razorpay == true) {
                razorpayPayment(response)
            } else if (response.wallet) {
                console.log('sadas');
                location.href = '/order-success'
            } else if (response.payer.payment_method == 'paypal') {
                 alert('response')
                 alert(response)
                console.log(response);
                for (let i = 0; i < response.links.length; i++) {
                    if (response.links[i].rel === 'approval_url') {
                        location.href = response.links[i].href
                    }
                }
            }
        }
    })
})

function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_I6CxDb2KIEklHi", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Homy Room Booking",
        "description": "Test Transaction",
        "image": "http://localhost:3000/images/main-logo.png",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
    });
    rzp1.open();
}

function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/order-success'
                alert('order Success')
            } else {

            }
        }
    })
}