var express = require('express');
var router = express.Router();
const superAdminHelpers = require('../helpers/super-admin-helpers');
const multer = require('multer');
const { response } = require('../app');

let adminPage = true;

const varifySuperAdminLogin = (req, res, next) => {
  if (req.session.superAdminLogin) {
    next();
  } else {
    res.render('superAdmin/login', { adminPage, user: false, superAdminErr: req.session.superAdminLoginErr });
    req.session.superAdminLoginErr = null;
  }
}

/* home section */
router.get('/', varifySuperAdminLogin, (req, res, next) => {
  try {
    res.redirect('/super_admin/dashboard')
  } catch (error) {
    res.render('superAdmin/400')
  }
});

/* Login section */
router.post('/superadmin_login', (req, res) => {
  try {
    superAdminHelpers.doSuperAdminLogin(req.body).then((response) => {
      if (response.status) {
        req.session.superAdminLogin = true;
        req.session.superAdmin = response.superAdmin;
        res.redirect('/super_admin/dashboard')
      } else {
        req.session.superAdminLoginErr = "incorrect username or password ";
        res.redirect('/super_admin');
      }
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }
});

/* dashboard section */
router.get('/dashboard', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.checkWallet().then((wallet) => {
      superAdminHelpers.chartAmount().then((totalAmount) => {
        console.log(totalAmount.paypal[0].total);
        console.log(totalAmount.razorpay[0].total);

        res.render('superAdmin/index', { adminPage, superAdmin: true, user: false, totalAmount, wallet });
      }).catch(error => {
        res.render('superAdmin/400')
      })
    }).catch(error => {
      res.render('superAdmin/400')
    })

  } catch (error) {
    res.render('superAdmin/400')
  }

});

/* Vendors section */
router.get('/vendors', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.vendorRequests().then(async (vendors) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/vendors', { adminPage, superAdmin: true, user: false, table: true, vendors, wallet });
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

});

router.get('/vender_status/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.venderStatus(req.params.id).then(() => {
      res.redirect('/super_admin/vendors')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})
router.get('/vendor/block/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.blockVendor(req.params.id).then(() => {
      req.session.vendorLogin = null;
      req.session.vendor = null;
      res.redirect('/super_admin/vendors')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/vendor/unblock/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.unblockVendor(req.params.id).then(() => {
      res.redirect('/super_admin/vendors')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/vendor/hotel/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.vendorSingleHotel(req.params.id).then(async (hotels) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/vendor-hotel', { adminPage, superAdmin: true, user: false, table: true, hotels, wallet });
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

});


router.get('/vendor/hotels/bookings/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.getSingleHotelBookings(req.params.id).then(async (bookdrooms) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/single-hotel-bookings', { bookdrooms, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

/* Hotel section */
router.get('/hotels', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.getAllHotels().then(async (hotels) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/hotels', { adminPage, superAdmin: true, user: false, table: true, hotels, wallet });
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

});

router.get('/hotels/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.blockHotel(req.params.id).then(() => {
      res.redirect('/super_admin/hotels')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/hotels/unblock/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.unblockHotel(req.params.id).then(() => {
      res.redirect('/super_admin/hotels')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

/* user section */
router.get('/users', varifySuperAdminLogin, (req, res, next) => {
  try {
    superAdminHelpers.getUsers().then(async (usersData) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/view-users', { usersData, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

});

router.get('/user/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.blockUser(req.params.id).then(() => {
      req.session.user = null;
      req.session.loggedIn = null;
      res.redirect('/super_admin/users')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/user/unblock/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.unblockUser(req.params.id).then(() => {
      res.redirect('/super_admin/users')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

/* Hotel Category section */
router.get('/hotel/hotel_type', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.hotelType().then(async (hotelTypes) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/hoteltype', { hotelTypes, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.post('/hotel/add_hotel_type', (req, res) => {
  try {
    superAdminHelpers.addHotelType(req.body).then((response) => {
      res.redirect('/super_admin/hotel/hotel_type');
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/hotel/hotel_facility', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.hotelFacility().then(async (hotelFacility) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/hotelfacility', { hotelFacility, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.post('/hotel/add_hotel_facility', (req, res) => {
  try {
    superAdminHelpers.addHotelFacility(req.body).then((response) => {
      res.redirect('/super_admin/hotel/hotel_facility');
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

/* Room Category section */
router.get('/room/room_type', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.roomTypes().then(async (roomTypes) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/roomtype', { roomTypes, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.post('/hotel/add_room_type', (req, res) => {
  try {
    superAdminHelpers.addRoomTypes(req.body).then((response) => {
      res.redirect('/super_admin/room/room_type');
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/room/room_status', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.roomStatus().then(async (roomStatus) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/roomstatus', { roomStatus, adminPage, superAdmin: true, table: true, wallet })

    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.post('/room/add_room_status', (req, res) => {
  try {
    superAdminHelpers.addRoomStatus(req.body).then((response) => {
      res.redirect('/super_admin/room/room_status');
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})


router.post('/room/add_room_status', (req, res) => {
  try {
    superAdminHelpers.addRoomStatus(req.body).then((response) => {
      res.redirect('/super_admin/room/room_status');
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})


/* Booking section */
router.get('/bookings', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.bookings().then(async (allBookings) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/all-bookings', { allBookings, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/bookings/last-day', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.todayBookings().then(async (allBookings) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/all-bookings', { allBookings, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/bookings/week', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.lastWeekBookings().then(async (allBookings) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/all-bookings', { allBookings, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/bookings/month', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.lastMonthBookings().then(async (allBookings) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/all-bookings', { allBookings, adminPage, superAdmin: true, table: true, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.post('/bookings/custom', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.customBookings(req.body).then((allBookings) => {
      req.session.customDate = allBookings
      res.redirect('/super_admin/bookings/custom')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})


router.get('/bookings/custom', varifySuperAdminLogin, async (req, res) => {
  try {
    allBookings = req.session.customDate
    var wallet = superAdminHelpers.checkWallet()
    res.render('superAdmin/all-bookings', { allBookings, adminPage, superAdmin: true, table: true, wallet })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/booking/cancel/:id', varifySuperAdminLogin, async (req, res) => {
  try {
    console.log(req.params.id);
    superAdminHelpers.cancelBooking(req.params.id).then(() => {
      res.redirect('/super_admin/bookings')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

/* Banner section */
router.get('/banner', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.getSlider().then(async (banner) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/banner', { banner, adminPage, superAdmin: true, table: true, imageErr: req.session.imageErr, bannerErr: req.session.bannerErr, wallet })
      req.session.imageErr = null;
      req.session.bannerErr = null;
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/banner/delete/:id', varifySuperAdminLogin, (req, res) => {
  try {
    superAdminHelpers.removeSlider(req.params.id).then((bannerErr) => {
      req.session.bannerErr = bannerErr
      console.log(bannerErr);
      res.redirect('/super_admin/banner')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})


// SET STORAGE
let fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/banner')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}--${file.originalname}`)
  }
})

let upload = multer({ storage: fileStorage })

router.post('/banner', upload.single('slider'), (req, res, next) => {
  try {
    if (!req.file) {
      req.session.imageErr = 'Please choose file'
      res.redirect('/super_admin/banner')
    } else {
      req.body.banner = req.file.filename
      console.log(req.body);
      superAdminHelpers.addSlider(req.body).then(() => {
        res.redirect('/super_admin/banner')
      }).catch(error => {
        res.render('superAdmin/400')
      })
    }
  } catch (error) {
    res.render('superAdmin/400')
  }

})


/* Offer Section */

router.get('/add-coupon', varifySuperAdminLogin, async (req, res) => {
  try {
    res.render('superAdmin/offer', { adminPage, superAdmin: true, table: true, couponErr: req.session.couponErr })
    req.session.couponErr = '';
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.post('/add-coupon', async (req, res) => {
  try {
    superAdminHelpers.addCoupon(req.body).then((response) => {
      if (response.status) {
        res.redirect('/super_admin/add-coupon')
      } else {
        req.session.couponErr = 'This Coupon is already Used';
        res.redirect('/super_admin/add-coupon')
      }
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})


router.get('/view-coupon', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.getCoupon().then(async (coupon) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/view-coupon', { adminPage, superAdmin: true, table: true, coupon, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/coupon-used/:id', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.getCouponUsed(req.params.id).then(async (users) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/coupon-used-users', { adminPage, superAdmin: true, table: true, users, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

/* Transactions Section */

router.get('/transactions', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.transactions().then(async (transaction) => {
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/transaction', { adminPage, superAdmin: true, table: true, transaction, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/transactions/:id', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.transactionsSingle(req.params.id).then(async (transaction) => {
      console.log('single-transaction');
      console.log(transaction);
      req.session.superAdminReturnTo = req.originalUrl
      var wallet = await superAdminHelpers.checkWallet()
      res.render('superAdmin/single-transaction', { adminPage, superAdmin: true, table: true, transaction, wallet })
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})

router.get('/vender_withdraw/:id', varifySuperAdminLogin, async (req, res) => {
  try {
    superAdminHelpers.withdrawAmount(req.params.id).then(() => {
      // res.redirect(req.session.superAdminReturnTo || '/super_admin/transactions');
      // req.session.superAdminReturnTo = null
      res.redirect('/super_admin/transactions')
    }).catch(error => {
      res.render('superAdmin/400')
    })
  } catch (error) {
    res.render('superAdmin/400')
  }

})


/* logout section */
router.get('/logout', varifySuperAdminLogin, (req, res) => {
  try {
    req.session.superAdminLogin = null;
    req.session.superAdmin = null;
    res.redirect('/super_admin')
  } catch (error) {
    res.render('superAdmin/400')
  }
})


module.exports = router;
