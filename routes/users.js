var express = require('express');
const session = require('express-session');
const { response } = require('../app');
var router = express.Router();
let userHelpers = require('../helpers/user-helpers')
const paypal = require('paypal-rest-sdk');
const sweetalert = require('sweetalert')


const varifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.render('user/login', { user: true, logErr: req.session.loginerr });
        req.session.loginerr = false;
    }
}


/* Home Section */
router.get('/', function (req, res, next) {
    try {
        username = req.session.user
        userHelpers.homePage().then((homePage) => {
            req.session.returnTo = req.originalUrl
            res.render('user/index', { homePage, user: true, username })
        }).catch(error => {
            res.render('user/400',)
        })
    } catch (error) {
        res.render('user/400')
    }

});

/* About Section */
router.get('/about', function (req, res, next) {

    try {
        username = req.session.user
        req.session.returnTo = req.originalUrl
        res.render('user/about', { user: true, username })
    } catch (error) {
        res.render('user/400')
    }

});

/* Contact Section */
router.get('/contact', function (req, res, next) {
    try {
        username = req.session.user
        req.session.returnTo = req.originalUrl
        res.render('user/contact', { user: true, username })
    } catch (error) {
        res.render('user/400')
    }

});

/* Login Section */
router.get('/login', varifyLogin, (req, res) => {
    try {
        res.redirect('/')
    } catch (error) {
        res.render('user/400')
    }
})
let loginOtp;
router.post('/login', (req, res) => {
    try {
        userHelpers.doLogin(req.body).then((response) => {
            if (response.err) {
                req.session.loginerr = response.err
                res.redirect('/login')
            } else {
                if (response.status) {

                    loginOtp = response.user
                    res.redirect('/loginotp')
                } else {
                    req.session.loginerr = "incorrect username or password ";
                    res.redirect('/login')
                }
            }

        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/resent', (req, res) => {
    try {
        userHelpers.doLogin(loginOtp).then((response) => {
            if (response.err) {
                req.session.loginerr = response.err
                res.redirect('/login')
            } else {
                if (response.status) {
                    loginOtp = response.user
                    res.redirect('/loginotp')
                } else {
                    req.session.loginerr = "incorrect username or password ";
                    res.redirect('/login')
                }
            }
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/loginotp', (req, res) => {
    try {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            if (!loginOtp) {
                res.redirect('/login')
            } else {
                res.render('user/loginotp', { user: true, otperr: req.session.otperr })
            }
        }
    } catch (error) {
        res.render('user/400')
    }

})
router.post('/loginotp', (req, res) => {
    try {
        userHelpers.loginOtp(req.body, loginOtp).then((response) => {
            console.log(response);
            if (response.status) {
                req.session.loggedIn = true;
                req.session.user = response.user;
                res.redirect(req.session.returnTo || '/');
                req.session.returnTo = null
        } else {
            req.session.otperr = response.err
            res.redirect('/loginOtp')
            req.session.otperr = null
        }
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

/* Signup Section */
router.get('/signup', (req, res) => {
    try {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            res.render('user/signup', { user: true, signerr: req.session.signerr })
            req.session.signerr = ''
        }
    } catch (error) {
        res.render('user/400')
    }


})

router.post('/signup', (req, res) => {
    try {
        userHelpers.userSignup(req.body).then((response) => {
            if (response.err) {
                req.session.signerr = response.err
                res.redirect('/signup')
            } else {
                res.redirect('/login')
            }
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

/* Hotel Section */
router.get('/hotels', (req, res) => {
    try {
        userHelpers.getAllHotels().then((hotels) => {
            req.session.returnTo = req.originalUrl
            res.render('user/hotels', { user: true, hotels, username: req.session.user })
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }


})

router.get('/hotels/:id', async (req, res) => {
    try {
        await userHelpers.getSingleHotel(req.params.id).then((singleHotel) => {
            req.session.returnTo = req.originalUrl
            console.log(singleHotel);
            res.render('user/hoteldetails', { user: true, singleHotel, username: req.session.user })
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

});

/* Room Section */
let availaberoom;
router.post('/availability', (req, res) => {
    try {
        req.session.dates = req.body
        console.log(req.session.dates);
        userHelpers.getAvailability(req.body).then((rooms) => {

            availaberoom = rooms
            res.redirect('/rooms')
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})
router.get('/rooms', async (req, res) => {
    try {
        userHelpers.getAllRooms(req.session.user).then(async (userwishlist) => {
            if (req.session.user) {
                if (availaberoom && userwishlist) {
                    for (var i = 0; i < availaberoom.length; i++) {
                        availaberoom[i].wishlist = false
                    }

                    for (var i = 0; i < userwishlist.rooms.length; i++) {
                        for (var j = 0; j < availaberoom.length; j++) {
                            if (userwishlist.rooms[i].toString() == availaberoom[j]._id.toString()) {
                                availaberoom[j].wishlist = true
                                break;
                            }
                        }
                    }
                }
            }
            console.log('availaberoom');
            console.log(availaberoom);
            let rooms = availaberoom
            let roomTypes = await userHelpers.getAllTypes()
            req.session.returnTo = req.originalUrl
            res.render('user/rooms', { user: true, rooms, roomTypes, username: req.session.user, dates: req.session.dates })
        }).catch(error => {
            res.render('user/400', { user: true, username: req.session.user })
        })

    } catch (error) {
        res.render('user/400')
    }


})

router.get('/rooms/:name', (req, res) => {
    try {
        userHelpers.seachType(req.params.name, req.session.dates).then((response) => {
            req.session.returnTo = req.originalUrl
            console.log(response);
            availaberoom = response
            res.redirect('/rooms')
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/room/:id', async (req, res) => {
    try {
        await userHelpers.getSingleRoom(req.params.id).then((singleRoom) => {
            console.log(singleRoom);
            req.session.returnTo = req.originalUrl
            res.render('user/roomdetails', { user: true, singleRoom, username: req.session.user, dates: req.session.dates })
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

});

/* Wishlist Section */
router.get('/wishlist', varifyLogin, async (req, res) => {
    try {
        let rooms = await userHelpers.getWishlist(req.session.user._id);
        req.session.returnTo = req.originalUrl
        console.log(rooms);
        res.render('user/wishlist', { user: true, rooms, username: req.session.user })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/add-to-wishlist/:id', varifyLogin, (req, res) => {
    try {
        userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
            res.redirect('/rooms')
            // res.json({ status: true })
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/remove-from-wishlist/:id', varifyLogin, (req, res) => {
    try {
        userHelpers.removeWishlist(req.params.id, req.session.user._id).then(() => {
            res.redirect('/wishlist')
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }


})

router.get('/remove-wishlist/:id', varifyLogin, (req, res) => {
    try {
        userHelpers.removeWishlist(req.params.id, req.session.user._id).then(() => {
            // res.redirect('/rooms')
            res.redirect('/rooms')
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }


})

/* Booking Managment */

router.get('/room/:id/booking', varifyLogin, (req, res) => {
    try {
        userHelpers.Booking(req.params.id, req.session.dates, req.session.user._id).then((allData) => {
            req.session.totalAmount = allData.total
            req.session.roomId = req.params.id;
            if (req.session.couponAmount) {
                allData.offer = allData.total - req.session.couponAmount
                allData.total = req.session.couponAmount
            }
            req.session.returnTo = req.originalUrl
            res.render('user/booking', { user: true, allData, username: req.session.user, dates: req.session.dates, couponErr: req.session.couponErr })
            req.session.couponErr = null
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

router.post('/room/booked', (req, res) => {
    try {
        userHelpers.roomBooked(req.body, req.session.user._id, req.session.roomId, req.session.dates).then(async (bookingDetail) => {
            let wallet = await userHelpers.getWallet(req.session.user._id)
            if (req.session.couponAmount) {
                bookingDetail.totalAmount = req.session.couponAmount
                req.session.orderId = bookingDetail.insertedId
            }

            if (req.body.wallet == 'true') {
                req.session.walletStatus = true;
                req.session.walletAmount = wallet.wallet;
                var grater = false;
                if (wallet.wallet > bookingDetail.totalAmount) {
                    grater = true
                } else {
                    bookingDetail.totalAmount = bookingDetail.totalAmount - wallet.wallet
                }
            }

            // if (bookingDetail.totalAmount != 0) {

            console.log('graterrrrrrrrr');
            console.log(grater);

            if (grater) {
                userHelpers.reduceWallet(req.session.user._id, bookingDetail.totalAmount).then((response) => {
                    userHelpers.updateStatus(bookingDetail.insertedId).then((response) => {
                        res.json({ wallet: true })
                    }).catch(error => {
                        res.render('user/400')
                    })
                }).catch(error => {
                    res.render('user/400')
                })
            } else {
                if (req.body.payment === 'razorpay') {
                    userHelpers.generateRazorpay(bookingDetail.insertedId, bookingDetail.totalAmount).then((order) => {
                        order.razorpay = true
                        res.json(order)
                    }).catch(error => {
                        res.render('user/400')
                    })
                } else if (req.body.payment === 'paypal') {
                    userHelpers.generatePaypal(bookingDetail.insertedId, bookingDetail.totalAmount).then((response) => {
                        req.session.bookingId = response.bookingId
                        req.session.totalAmount = bookingDetail.totalAmount

                        res.json(response)
                    }).catch(error => {
                        res.render('user/400')
                    })
                }
            }


            // } else {

            // }
            // else{
            //   // res.json()

            // }
        })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/order-success', varifyLogin, (req, res) => {
    try {
        if (req.session.couponAmount) {
            userHelpers.useCoupon(req.session.couponId, req.session.user._id, req.session.orderId).then((response) => {

            }).catch(error => {
                res.render('user/400')
            })
        }
        req.session.dates = null;
        res.render('user/orderSuccess', { user: true, username: req.session.user });
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/success', (req, res) => {
    try {
        if (req.session.walletStatus) {
            userHelpers.updateWalleStatus(req.session.user._id).then((response) => {

            }).catch(error => {
                res.render('user/400')
            })
        }

        if (req.session.couponAmount) {
            userHelpers.useCoupon(req.session.couponId, req.session.user._id, req.session.orderId).then((response) => {

            }).catch(error => {
                res.render('user/400')
            })
        }


        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": req.session.totalAmount
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            console.log('payment');
            console.log(payment);
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log(JSON.stringify(payment));
                userHelpers.changePaymentStatus(req.session.bookingId, req.session.walletStatus, req.session.walletAmount).then(() => {
                    req.session.dates = null;
                    res.render('user/orderSuccess', { user: true, username: req.session.user });
                }).catch(error => {
                    res.render('user/400')
                })
            }
        })
    } catch (error) {
        res.render('user/400')
    }

});

router.get('/cancel', (req, res) => {
    try {
        res.send('Cancelled')

    } catch (error) {
        res.render('user/400')
    }
});

router.post('/verify-payment', (req, res) => {
    try {
        userHelpers.verifyPayment(req.body).then((response) => {
            if (req.session.walletStatus) {
                userHelpers.updateWalleStatus(req.session.user._id).then((response) => { })
            }
            userHelpers.changePaymentStatus(req.body.order.receipt, req.session.walletStatus, req.session.walletAmount).then(() => {
                console.log('req.session.couponAmount');
                console.log(req.session.couponAmount);
                if (req.session.couponAmount) {
                    userHelpers.useCoupon(req.session.couponId, req.session.user._id, req.session.orderId).then((response) => { })
                    req.session.couponAmount = null
                }
                req.session.dates = null;
                res.json({ status: true })
            })
        }).catch((err) => {
            console.log(err);
            res.json({ status: 'Payment Failed' })
        })
    } catch (error) {
        res.render('user/400')
    }


})

router.get('/bookings', varifyLogin, (req, res) => {
    try {
        userHelpers.bookingHistory(req.session.user._id).then((bookings) => {
            req.session.returnTo = req.originalUrl
            res.render('user/bookings', { bookings, user: true, username: req.session.user })
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/bookedroom/:id', varifyLogin, (req, res) => {
    try {
        userHelpers.getBookedRoom(req.params.id).then((singleRoom) => {
            req.session.returnTo = req.originalUrl
            console.log(singleRoom);
            res.render('user/bookedroom', { singleRoom, user: true, username: req.session.user })
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})


router.get('/room/cancel/:id', varifyLogin, (req, res) => {
    try {
        userHelpers.cancelBooking(req.params.id, req.session.user._id).then(() => {
            res.redirect('/bookings')
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

/* Profile Section */
router.get('/profile', varifyLogin, async (req, res) => {
    try {
        let userProfile = await userHelpers.getProfile(req.session.user._id);
        req.session.returnTo = req.originalUrl
        res.render('user/profile', { user: true, userProfile, username: req.session.user })
    } catch (error) {
        res.render('user/400')
    }

})

router.get('/profile/edit', varifyLogin, async (req, res) => {
    try {
        let userProfile = await userHelpers.getProfile(req.session.user._id);
        res.render('user/edit-profile', { user: true, userProfile, username: req.session.user, profileErr: req.session.profileErr })
    } catch (error) {
        res.render('user/400')
    }

})

router.post('/updateprofile', varifyLogin, async (req, res) => {
    try {
        console.log(req.body);
        userHelpers.editProfile(req.body, req.session.user._id).then((response) => {
            console.log(response);
            if (response.status) {
                res.redirect('/profile')
            } else {
                req.session.profileErr = 'This mail id is already used'
                res.redirect('/profile/edit')
            }
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

/* coupon Section */
router.post('/room/coupon', (req, res) => {
    try {
        userHelpers.checkCoupon(req.body, req.session.totalAmount, req.session.user._id).then((response) => {
            if (response.status) {
                req.session.couponAmount = response.totalAmount
                req.session.couponId = response.couponId
                console.log('req.session.couponAmountttttttt');
                console.log(req.session.couponAmount);

                res.json(response)
            } else {
                req.session.couponAmount = null
                res.json(response)
            }
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }

})

/* Wallet Section */
router.get('/wallet', varifyLogin, (req, res) => {
    try {
        userHelpers.walletHistory(req.session.user._id).then((wallet) => {
            res.render('user/wallet', { user: true, username: req.session.user, wallet })
        }).catch(error => {
            res.render('user/400')
        })
    } catch (error) {
        res.render('user/400')
    }


})
router.get('/check-wallet-amount/:id', (req, res) => {
    try {
        userHelpers.checkWallet(req.session.totalAmount, req.session.user._id, req.session.couponAmount).then((response) => {
            res.json(response)
        })
    } catch (error) {
        res.render('user/400')
    }

})

/* Logout Section */
router.get('/logout', (req, res) => {
    try {
        req.session.user = null;
        req.session.loggedIn = null;
        req.session.dates = null;
        res.redirect('/')
    } catch (error) {
        res.render('user/400')
    }
})

module.exports = router;