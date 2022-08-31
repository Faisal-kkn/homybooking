const { response } = require('../app');
var express = require('express');
var router = express.Router();
let vendorHelpers = require('../helpers/vendor-helpers')
const multer  = require('multer');
const { ObjectId } = require('mongodb');

let adminPage = true;
const varifyvendorLogin = (req, res, next) => {
  if (req.session.vendorLogin) {
    next();
  } else {
    res.render('vendor/login', { adminPage, user: false, adminErr: req.session.adminLoginErr });
    req.session.adminLoginErr = null;
  }
}

/* home Section */
router.get('/', varifyvendorLogin,(req, res, next)=> {
  try {
    vendorHelpers.chartAmount(req.session.vendor._id).then(async (totalAmount) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)
      res.render('vendor/index', { totalAmount, adminPage, user: false, vendorHeader: true, vendor: req.session.vendor, AllAmounts });
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

});

/* login Section */
router.post('/login', (req, res) =>{
  try {
    vendorHelpers.vendorLogin(req.body).then((response) => {
      if (response.status) {
        if (response.request) {
          if (response.blockStatus) {
            req.session.adminLoginErr = response.blockStatus
            res.redirect('/vendor')
          } else {
            console.log(response.vendor._id);
            req.session.vendorLogin = true;
            req.session.vendor = response.vendor
            res.redirect('/vendor')
          }

        } else {
          req.session.adminLoginErr = 'Your Request Is Pending'
          res.redirect('/vendor')
        }


      } else {
        console.log('response.request');
        req.session.adminLoginErr = "incorrect username or password ";
        res.redirect('/vendor');
      }
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

});

/* signup Section */
router.get('/signup',(req, res, next)=> {
  try {
    if (req.session.vendorLogin) {
      res.redirect('/vendor')
    } else {
      res.render('vendor/signup', { adminPage, user: false, signupErr: req.session.adminSignupErr, imageErr: req.session.imageErr })
      req.session.adminSignupErr = null
      req.session.imageErr = null
    }
  } catch (error) {
    res.render('vendor/400')
  }

});

 
// SET STORAGE
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/vendors')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}--${file.originalname}`)
  }
})
 
let uploadImage = multer({ storage: storage })

router.post('/signup',uploadImage.single('image'), (req, res)=> {
  try {
    if (!req.file) {
      req.session.imageErr = 'Please choose file'
      res.redirect('/vendor/signup')
    } else {
      let image = req.file
      req.body.profile = image.filename
      vendorHelpers.vendorSignup(req.body).then((response) => {
        if (response.status) {
          res.redirect('/vendor')
        } else {
          req.session.adminSignupErr = response.err;
          res.redirect('/vendor/signup');
        }
      }).catch(error => {
        res.render('vendor/400')
      })
    }
  } catch (error) {
    res.render('vendor/400')
  }

});

router.get('/dashboard',varifyvendorLogin, (req, res)=> {
  try {
    vendorHelpers.chartAmount(req.session.vendor._id).then(async (totalAmount) => {
      console.log(totalAmount);
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

      res.render('vendor/index', { totalAmount, adminPage, user: false, vendorHeader: true, vendor: req.session.vendor, AllAmounts });
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

});

/* Hotel Section */
router.get('/hotels',varifyvendorLogin,async (req, res)=> {
  try {
    let hotels = await vendorHelpers.getAllHotels(req.session.vendor._id)
    var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

    console.log(req.session.hotelErr);
    res.render('vendor/hotels', { adminPage, user: false, table: true, hotels, vendorHeader: true, vendor: req.session.vendor, hotelErr: req.session.hotelErr, AllAmounts });
  } catch (error) {
    res.render('vendor/400')
  }

});

router.get('/hotel/addhotel', varifyvendorLogin, (req, res)=> {
  try {
    vendorHelpers.hotelType().then(async (hotelData) => {
      console.log(hotelData);
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

      res.render('vendor/addhotel', { hotelData, adminPage, user: false, vendorHeader: true, vendor: req.session.vendor, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

});

// Add Hotel Section
const fileStorageEngine = multer.diskStorage({
    destination : (req,file,callback)=>{
        callback(null,'./public/uploads')
    },
    filename: (req,file,callback)=>{
        callback(null, `${Date.now()}--${file.originalname}`)
    }
})

const upload = multer({storage : fileStorageEngine})

router.post('/hotel/addhotel',upload.array('images'), (req,res)=>{
  try {
    // if (!files) {
    //   const error = new Error('Please choose files')
    //   error.httpStatusCode = 400
    //   return next(error)
    // }
    var filenames = req.files.map(function (file) {
      return file.filename;
    });
    req.body.image = filenames;
    req.body.status = true;

    // const obj = Object.assign([{}], req.body.facility);
    // req.body.facility = obj
    // var a = req.body.facilityZZ

    console.log(req.body.facility);
    vendorHelpers.addHotel(req.body, req.session.vendor._id).then((response) => {
      res.redirect('/vendor/hotels');
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})


router.get('/hotels/edit-hotel/:id',varifyvendorLogin, async (req, res) => {
  try {
    let editHotel = await vendorHelpers.getHotelData(req.params.id);
    var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

    vendorHelpers.hotelType().then((hotelData) => {

      for (var i = 0; i < hotelData.hotelTypes.length; i++) {
        if (editHotel.type == hotelData.hotelTypes[i].types) {
          hotelData.hotelTypes[i].selected = true
        }
      }
      for (var j = 0; j < hotelData.hotelFacility.length; j++) {
        hotelData.hotelFacility[j].checked = false
      }
      for (var i = 0; i < editHotel.facility.length; i++) {
        for (var j = 0; j < hotelData.hotelFacility.length; j++) {
          if (editHotel.facility[i] === hotelData.hotelFacility[j].facility) {
            hotelData.hotelFacility[j].checked = true;
            break;
          }
        }
      }
      res.render('vendor/edit-hotel', { hotelData, adminPage, editHotel, vendorHeader: true, vendor: req.session.vendor, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }


});

router.post('/hotels/edit-hotel/:id', upload.array('images'), async (req, res) => {
  try {
    if (!req.files) {
      let editHotel = await vendorHelpers.getHotelData(req.params.id);
      req.body.image = editHotel.image;
      vendorHelpers.updateHotel(req.params.id, req.body).then(() => {
        res.redirect('/vendor/hotels')
      }).catch(error => {
        res.render('vendor/400')
      })
    } else {

      var filenames = req.files.map(function (file) {
        return file.filename;
      });
      req.body.image = filenames;
      vendorHelpers.updateHotel(req.params.id, req.body).then(() => {
        res.redirect('/vendor/hotels')
      }).catch(error => {
        res.render('vendor/400')
      })
    }
  } catch (error) {
    res.render('vendor/400')
  }


})

/* Room Section */
router.get('/hotels/:id/rooms',varifyvendorLogin, (req, res) => {
  try {
    let hotelId = req.params.id
    vendorHelpers.getAllRooms(hotelId).then(async (response) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)
      console.log(response);
      if (response.status) {
        req.session.hotelId = hotelId
        let rooms = response.rooms
        req.session.vendorReturnTo = req.originalUrl
        res.render('vendor/rooms', { rooms, vendorHeader: true, adminPage, table: true, vendor: req.session.vendor, AllAmounts })
      } else {
        res.redirect('/vendor/hotels')
      }
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

});

router.get('/hotels/rooms/addroom', varifyvendorLogin, (req, res) => {
  try {
    vendorHelpers.roomTypes().then(async (roomData) => {
      console.log(roomData);
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

      res.render('vendor/addroom', { AllAmounts, roomData, adminPage, user: false, vendorHeader: true, vendor: req.session.vendor, imageErr: req.session.imageErr })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

});

// Add Room Section
const fileStorageEngine2 = multer.diskStorage({
    destination : (req,file,callback)=>{
        callback(null,'./public/uploads/rooms')
    },
    filename: (req,file,callback)=>{
        callback(null, `${Date.now()}--${file.originalname}`)
    }
})

const upload2 = multer({storage : fileStorageEngine2})

router.post('/hotel/rooms/addroom',upload2.array('images'), (req,res)=>{
  try {
    if (!req.files) {
      req.session.imageErr = 'Please choose file'
      res.redirect('/vendor/hotels/rooms/addroom')
    } else {
      var filenames = req.files.map(function (file) {
        return file.filename
      });
      req.body.image = filenames;
      req.body.status = true;
      req.body.hotelStatus = true;
      req.body.booking = [];

      console.log(req.body);
      vendorHelpers.addRoom(req.body, req.session.hotelId).then((response) => {
        res.redirect(req.session.vendorReturnTo || '/');
        req.session.vendorReturnTo = null
        res.redirect('/vendor/hotels');
      }).catch(error => {
        res.render('vendor/400')
      })
    }
  } catch (error) {
    res.render('vendor/400')
  }


})

router.get('/hotels/edit-room/:id',varifyvendorLogin, async (req, res) => {
  try {
    let editroom = await vendorHelpers.getRoomData(req.params.id);
    let roomtypes = await vendorHelpers.getRoomTypes()
    let roomstatus = await vendorHelpers.getRoomStatus()
    var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)


    for (var i = 0; i < roomtypes.length; i++) {
      if (editroom.type == roomtypes[i].type) {
        roomtypes[i].selected = true
      }
    }
    for (var i = 0; i < roomstatus.length; i++) {
      if (editroom.roomstatus == roomstatus[i].status) {
        roomstatus[i].selected = true
      }
    }

    res.render('vendor/edit-room', { adminPage, roomtypes, roomstatus, editroom, vendorHeader: true, vendor: req.session.vendor, AllAmounts })
  } catch (error) {
    res.render('vendor/400')
  }

});

router.post('/hotels/edit-room/:id', upload2.array('images'), async (req, res) => {
  try {
    if (!req.files) {
      let editroom = await vendorHelpers.getRoomData(req.params.id);
      req.body.images = editroom.image
    } else {
      var filenames = req.files.map(function (file) {
        return file.filename;
      });
      req.body.images = filenames;
    }
    console.log(req.body.images);
    vendorHelpers.updateRoom(req.params.id, req.body).then(() => {
      res.redirect('/vendor/hotels')
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.get('/hotels/delete-room/:id',varifyvendorLogin, (req, res) => {
  try {
    let roomId = req.params.id
    vendorHelpers.deleteRoom(roomId, req.session.hotelId).then((response) => {
      res.redirect('/vendor/hotels')
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

});

/* Booking Section */
router.get('/bookings', varifyvendorLogin, (req, res) => {
  try {
    vendorHelpers.getAllBookings(req.session.vendor._id).then(async (bookings) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

      res.render('vendor/bookings', { bookings, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }
})

router.get('/bookings/last-day', varifyvendorLogin, async (req, res) => {
  try {
    vendorHelpers.todayBookings(req.session.vendor._id).then(async (bookings) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

      res.render('vendor/bookings', { bookings, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.get('/bookings/week', varifyvendorLogin, async (req, res) => {
  try {
    vendorHelpers.lastWeekBookings(req.session.vendor._id).then(async (bookings) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)
      res.render('vendor/bookings', { bookings, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.get('/bookings/month', varifyvendorLogin, async (req, res) => {
  try {
    vendorHelpers.lastMonthBookings(req.session.vendor._id).then(async (bookings) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)

      res.render('vendor/bookings', { bookings, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.post('/bookings/custom', varifyvendorLogin, async (req, res) => {
  try {
    vendorHelpers.customBookings(req.session.vendor._id, req.body).then((bookings) => {
      res.render('vendor/bookings', { bookings, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.get('/hotels/bookings/:id', varifyvendorLogin, (req, res) => {
  try {
    vendorHelpers.getHotelBookings(req.params.id).then(async (bookdrooms) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)
      req.session.vendorReturnTo = req.originalUrl
      res.render('vendor/bookdrooms', { bookdrooms, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.get('/room/checkout/:id', varifyvendorLogin, (req, res) => {
  try {
    vendorHelpers.checkoutRoom(req.params.id).then(() => {
      res.redirect(req.session.vendorReturnTo || '/vendor/hotels');
      req.session.vendorReturnTo = null
      // res.redirect('/vendor/hotels')
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.get('/room/checkIn/:id', varifyvendorLogin, (req, res) => {
  try {
    vendorHelpers.checkInRoom(req.params.id).then(() => {
      res.redirect('/vendor/hotels')
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})


/* Transactions Section */

router.get('/transactions', varifyvendorLogin, (req, res) => {
  try {
    vendorHelpers.transactions(req.session.vendor._id).then(async (totalAmount) => {
      var AllAmounts = await vendorHelpers.checkWallet(req.session.vendor._id)
      res.render('vendor/transactions', { totalAmount, adminPage, vendorHeader: true, vendor: req.session.vendor, table: true, AllAmounts })
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

router.get('/Withdraw', varifyvendorLogin, (req, res) => {
  try {
    vendorHelpers.WithdrawAmount(req.session.vendor._id).then((totalAmount) => {
      res.redirect('/vendor/transactions')
    }).catch(error => {
      res.render('vendor/400')
    })
  } catch (error) {
    res.render('vendor/400')
  }

})

/* Logout Section */
router.get('/logout', varifyvendorLogin, (req, res) => {
  try {
    req.session.vendorLogin = null;
    req.session.vendor = null;
    res.redirect('/vendor')
  } catch (error) {
    res.render('vendor/400')
  }
})

module.exports = router;
