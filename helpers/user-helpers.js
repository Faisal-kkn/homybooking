let db = require('../config/connection');
let collection = require('../config/collection');
const client = require('twilio')(process.env.ACCOUNTSSID, process.env.AUTHTOKEN);
var bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const { response, all } = require('../app');
const { ObjectID, ObjectId } = require('bson');
const { resolve } = require('path');
var objectId = require('mongodb').ObjectId
var instance = new Razorpay({ key_id: 'rzp_test_I6CxDb2KIEklHi', key_secret: 'bCo42BwPq4h8qiGbRq5VqSSv' });
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Ad1xUsyOvUwOBGuJhSgDnbDzjHhdWqQjrtI29y957Ab-aRZmsW4AGvdJ3XtRCXSMttyYcOV66da8D_Ju',
    'client_secret': 'EN9n1F_l8_lqjrsPOYOSfSdie3rcSiCjkskIDadmkOlHSozza5MmMX8lrTNnN_RQ3lt-XElOxmo1o5Og'
});

module.exports = {
    homePage: () => {
        return new Promise(async (resolve, reject) => {
            let homePage = {}
            homePage.banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            homePage.hotel = await db.get().collection(collection.HOTEL_COLLECTION).find().limit(3).toArray()

            resolve(homePage)
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
            if (user) {
                if (!user.status) {
                    response.err = 'Your Accound is Blocked'
                    response.status = false
                    resolve(response)
                } else {
                      client.verify.services(process.env.SERVICEID).verifications.create({
                      to: `+91${userData.mobile}`,
                      channel: 'sms',
                    })
                    .then((data) => {
                      res.status(200).send(data)
                    })
                    response.user = user
                    response.status = true
                    resolve(response)
                }
            } else {
                console.log('Login Failed')
                resolve({ status: false })

            }
        })
    },
    loginOtp: (loginOtp, userDetails) => {
        console.log(userDetails.mobile);
        return new Promise((resolve, reject) => {
            let response = {}
            client.verify.services(process.env.SERVICEID).verificationChecks.create({
                to: `+91${userDetails.mobile}`,
                code: loginOtp.otp,
              }).then((verification_check) => {
                if (verification_check.status == 'approved') {
            console.log('hereee');
            response.user = userDetails
            response.status = true
            resolve(response)
              } else {
                  response.status = false
                  response.err = 'Otp Is Not Valid'
                  resolve(response)
              }
            })
        })

    },
    userSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let userSignup = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })
            let useremail = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            let signupData = {}
            if (userSignup) {
                signupData.err = 'Mobile Number is alredy used'
                resolve(signupData)
            } else if (useremail) {
                signupData.err = 'Mail id is alredy used'
                resolve(signupData)
            } else {
                userData.status = true
                userData.bookedRooms = []
                userData.wallet = 0
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve()
                })
                
                resolve(signupData)
            }
        })

    },
    // signupOtp: (userData, userDetails) => {
    //     try {
    //         return new Promise((resolve, reject) => {
    //             let response = {}
    //             client.verify
    //                 .services(process.env.SERVICEID)
    //                 .verificationChecks.create({
    //                     to: `+91${userDetails.mobile}`,
    //                     code: userData.otp,
    //                 })
    //                 .then((verification_check) => {
    //                     console.log(verification_check)
    //                     if (verification_check.status == 'approved') {
    //                         db.get()
    //                             .collection(collection.USER_COLLECTION)
    //                             .insertOne(userDetails)
    //                             .then((data) => {
    //                                 resolve(userDetails)
    //                             })
    //                     } else {
    //                         response.err = 'Otp Is Not Valid'
    //                         console.log(response)
    //                         resolve(response)
    //                     }
    //                 })
    //         })
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },

    // userforgot: (userForgot) => {
    //     try {
    //         return new Promise(async (resolve, reject) => {
    //             let response = {}
    //             let forgot = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userForgot.mobile })
    //             let forgotData = {}
    //             if (forgot) {
    //                 forgotData.status = true
    //                 forgotData.user = forgot
    //                 client.verify
    //                     .services(process.env.SERVICEID)
    //                     .verifications.create({
    //                         to: `+91${forgot.mobile}`,
    //                         channel: 'sms',
    //                     })
    //                     .then((data) => {
    //                         res.status(200).send(data)
    //                     })
    //                 resolve(forgotData)
    //             } else {
    //                 forgotData.err = 'This mobile does not exists.'
    //                 resolve(forgotData)
    //             };
    //         })
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },

    // userForgotPass: (userForgot, userDetail) => {
    //     try {
    //         return new Promise((resolve, reject) => {
    //             let response = {}
    //             client.verify
    //                 .services(process.env.SERVICEID)
    //                 .verificationChecks.create({
    //                     to: `+91${userDetail.mobile}`,
    //                     code: userForgot.otp,
    //                 })
    //                 .then(async (verification_check) => {
    //                     console.log('ssssssssssssssssssssssss');
    //                     console.log(verification_check)
    //                     if (verification_check.status == 'approved') {
    //                         console.log(userForgot.password);
    //                         userForgot.password = await bcrypt.hash(userForgot.password, 10)
    //                         db.get().collection(collection.USER_COLLECTION).updateOne({ _id: userDetail._id }, {
    //                             $set: {
    //                                 password: userForgot.password,
    //                             }
    //                         })
    //                     } else {
    //                         response.err = 'Otp Is Not Valid'
    //                         console.log(response)
    //                         resolve(response)
    //                     }
    //                 })
    //         })
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },
    getAllHotels: () => {
        return new Promise(async (resolve, reject) => {
            hotels = await db.get().collection(collection.HOTEL_COLLECTION).find().toArray()
            resolve(hotels)
        })

    },
    getSingleHotel: (hotelId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.HOTEL_COLLECTION).findOne({ _id: objectId(hotelId) }).then((hotelData) => {
                resolve(hotelData)
            })
        })

    },
    getSingleRoom: (roomId) => {
        return new Promise(async (resolve, reject) => {
            console.log(roomId);
            db.get().collection(collection.ROOMS_COLLECTION).findOne({ _id: objectId(roomId) }).then(async (roomData) => {
                let hotelRoom = await db.get().collection(collection.HOTEL_COLLECTION).findOne({ rooms: { $in: [objectId(roomId)] } })
                roomData.hotel = hotelRoom
                console.log('hotelRoom');
                console.log(hotelRoom);
                resolve(roomData)
            })

        })

    },
    getAllRooms: (user) => {
        return new Promise(async (resolve, reject) => {
            // rooms = await db.get().collection(collection.ROOMS_COLLECTION).find().toArray()
            if (user) {
                var userwishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(user._id) })
                // var roomId = rooms.map(function (room) {
                //     return room._id.toString()
                // });
                // var wish = userwishlist.rooms.map(function (rooms) {
                //     return rooms.toString()
                // });
                // let intersection = roomId.filter(x => wish.includes(x));
                resolve(userwishlist)
            } else {
                resolve()
            }
        })

    },
    getAllTypes: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ROOM_TYPE_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })


    },
    seachType: (roomType, dates) => {
        return new Promise(async (resolve, reject) => {
            let booking = await db.get().collection(collection.BOOKING_COLLECTION).find({ $and: [{ Date: { $gte: new Date(dates['t-start']), $lte: new Date(dates['t-end']) } }], $or: [{ bookingStatus: "success" }, { bookingStatus: "pending" }] }).toArray()
            let bookingId = booking.map(function (room) {
                return room.room._id
            });
            if (roomType == 'all') {
                db.get().collection(collection.ROOMS_COLLECTION).find({
                    _id: {
                        $nin: bookingId
                    }
                }).toArray().then((response) => {
                    resolve(response)
                })
            } else {
                db.get().collection(collection.ROOMS_COLLECTION).find({
                    _id: {
                        $nin: bookingId
                    },
                    type: roomType
                }).toArray().then((response) => {
                    resolve(response)
                })
            }

        })

    },
    addToWishlist: (roomId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userWishlist) {
                let roomExist = userWishlist.rooms.findIndex(rooms => rooms == roomId)
                if (roomExist == -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) }, {
                        $push: { rooms: objectId(roomId) }
                    }).then((response) => {
                        resolve()
                    })
                }
                console.log(roomExist);

            } else {
                let wishlistObj = {
                    user: objectId(userId),
                    rooms: [objectId(roomId)]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                    resolve()
                })
            }
        })


    },
    getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlistIteam = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([{
                $match: { user: objectId(userId) }
            },
            {
                $lookup: {
                    from: collection.ROOMS_COLLECTION,
                    let: { roomList: '$rooms' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $in: ['$_id', "$$roomList"]
                            }
                        }
                    }],
                    as: 'wishlistIteam'
                }
            }
            ]).toArray()
            console.log(wishlistIteam);

            resolve(wishlistIteam[0].wishlistIteam)
        })


    },
    removeWishlist: (roomId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) }, {
                $pull: { rooms: objectId(roomId) }
            }).then(() => {
                resolve()
            })

        })


    },
    bookingHistory: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).find({ user: userId }).sort({ 'currentDate': -1 }).toArray().then(async (response) => {

                const date = new Date();
                date.setHours(0, 0, 0, 0);
                function padTo2Digits(num) {
                    return num.toString().padStart(2, '0');
                }

                function formatDate(date) {
                    return [
                        padTo2Digits(date.getDate()),
                        padTo2Digits(date.getMonth() + 1),
                        date.getFullYear(),
                    ].join('-');
                }

                for (var i = 0; i < response.length; i++) {
                    response[i].cancelStatus = false;
                    response[i].currentDate = formatDate(new Date(response[i].currentDate.toString()))
                    response[i].Date[0] = formatDate(new Date(response[i].Date[0].toString()))
                    response[i].checkOutDate = formatDate(new Date(response[i].checkOutDate.toString()))
                }

                function getPreviousDay(date = new Date()) {
                    const previous = new Date(date.getTime());
                    previous.setDate(date.getDate() - 1);

                    return previous;
                }


                for (var i = 0; i < response.length; i++) {
                    if (getPreviousDay() >= response[i].Date[0]) {
                        console.log('asa');
                        response[i].cancelStatus = true
                    }
                }
                resolve(response)
            })
        })
    },
    Booking: (roomId, dates, userId) => {
        return new Promise(async (resolve, reject) => {
            let allData = {}
            const getDatesRange = (startDate, endDate) => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const date = new Date(start)
                let list = [];

                while (date <= end) {
                    list.push(new Date(date))
                    date.setDate(date.getDate() + 1)
                }
                return list.length
            }
            const dateLength = getDatesRange(dates['t-start'], dates['t-end'])

            db.get().collection(collection.ROOMS_COLLECTION).findOne({ _id: objectId(roomId) }).then(async (roomData) => {
                allData.roomData = roomData
                allData.dateLength = dateLength - 1
                allData.FUlltotal = (dateLength - 1) * roomData.salesprice
                allData.total = ((dateLength - 1) * roomData.salesprice) * 30 / 100

                allData.hotel = await db.get().collection(collection.HOTEL_COLLECTION).findOne({ rooms: objectId(roomId) })
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                allData.wallet = user.wallet
                resolve(allData)
            })
        })

    },
    roomBooked: (bookingDetails, userId, roomId, dates) => {
        const getDatesRange = (startDate, endDate) => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const date = new Date(start)
            let list = [];

            while (date <= end) {
                list.push(new Date(date))
                date.setDate(date.getDate() + 1)
            }

            return list
        }
        const allDates = getDatesRange(dates['t-start'], dates['t-end'])
        return new Promise(async (resolve, reject) => {
            let roomData = await db.get().collection(collection.ROOMS_COLLECTION).findOne({ _id: objectId(roomId) })

            // if (bookingDetails.wallet == 'true') {
            //   bookingDetails.totalAmount = (allDates.length * roomData.salesprice) - userData.wallet
            // }
            let totalAmount = parseInt((bookingDetails.totalAmount * 30) / 100)
            let balanceAmount = bookingDetails.totalAmount - totalAmount
            console.log('balanceAmount');
            console.log(balanceAmount);
            // Math.abs(totalAmount)

            let checkOutDates = allDates[allDates.length - 1];
            let bookedDetails = {
                name: bookingDetails['booking-name'],
                email: bookingDetails['booking-email'],
                mobile: bookingDetails['booking-phone'],
                Date: allDates,
                currentDate: new Date(),
                paymentMethod: bookingDetails.payment,
                paymentStatus: 'pending',
                bookingStatus: 'pending',
                room: roomData,
                user: userId,
                checkOutDate: checkOutDates,
                pendingAmount: balanceAmount,
                totalAmount: totalAmount,
                fulltotal: totalAmount + balanceAmount,
                CheckOutStatus: null,
                CheckInStatus: null,
                Withdraw: false
            }

            db.get().collection(collection.BOOKING_COLLECTION).insertOne(bookedDetails).then(async (data) => {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                    $push: {
                        bookedRooms: data.insertedId
                    }
                }).then(async () => {
                    let user = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: userId })
                    let userWallet = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                    console.log(user);
                    if (bookingDetails.wallet) {
                        let walletAmount;
                        if (userWallet.wallet > totalAmount) {
                            walletAmount = totalAmount
                        } else {
                            walletAmount = userWallet.wallet
                        }


                        if (user) {
                            db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: userId }, {
                                $push: {
                                    Transactions: {
                                        bookingId: data.insertedId,
                                        amount: walletAmount,
                                        status: false
                                    }
                                }
                            }).then(() => {
                                resolve()
                            })
                        } else {
                            let walletHistory = {
                                user: userId,
                                Transactions: [{
                                    bookingId: data.insertedId,
                                    amount: walletAmount,
                                    status: false
                                }]
                            }
                            db.get().collection(collection.WALLET_COLLECTION).insertOne(walletHistory).then(() => {
                                resolve()
                            })
                        }
                    }

                })
                let bookingDetail = { insertedId: data.insertedId, totalAmount: bookedDetails.totalAmount }
                console.log(bookedDetails);
                resolve(bookingDetail)
            })
        })


    },
    reduceWallet: (userId, totalAmount) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $inc: {
                    wallet: -totalAmount
                }
            }).then((response) => {

                resolve()
            })
        })

    },
    updateStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    bookingStatus: "success",
                    paymentStatus: "success",
                    paymentMethod: "Wallet"
                }
            }).then(() => {
                resolve()
            })
        })

    },
    getBookedRoom: (roomId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ROOMS_COLLECTION).findOne({ _id: objectId(roomId) }).then((response) => {
                resolve(response)
            })
        })

    },
    cancelBooking: (bookingId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(bookingId) }, {
                $set: {
                    bookingStatus: 'cancelled',
                }
            }).then(() => {
                db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(bookingId) }).then(async (response) => {
                    if (response.paymentStatus == "success") {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                            $inc: { wallet: response.totalAmount }
                        })
                        let user = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: userId })
                        console.log(user);
                        if (user) {
                            db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: userId }, {
                                $push: {
                                    Transactions: {
                                        bookingId: objectId(bookingId),
                                        amount: response.totalAmount,
                                        status: true
                                    }
                                }
                            }).then(() => {
                                resolve()
                            })
                        } else {
                            let walletHistory = {
                                user: userId,
                                Transactions: [{
                                    bookingId: objectId(bookingId),
                                    amount: response.totalAmount,
                                    status: true
                                }]
                            }
                            db.get().collection(collection.WALLET_COLLECTION).insertOne(walletHistory).then(() => {
                                resolve()
                            })
                        }
                    }

                })
            })
        })
    },
    generateRazorpay: (bookingId, total) => {
        let totalAmount = parseInt(total)
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: totalAmount * 100,
                currency: "INR",
                receipt: "" + bookingId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }).then((order) => {
                resolve(order)
            })

        })


    },
    updateWalleStatus: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    wallet: 0
                }
            })
            resolve()
        })

    },
    generatePaypal: (bookingId, total) => {
        // let totalAmount = parseInt(total)
        return new Promise((resolve, reject) => {
            // var dollars = total / 79.85;
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "Hat for the best team ever"
                }]

            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    payment.bookingId = "" + bookingId,
                        resolve(payment)
                }
            });
        })


    },
    getAvailability: (dates) => {
        return new Promise(async (resolve, response) => {

            let booking = await db.get().collection(collection.BOOKING_COLLECTION).find({ $and: [{ Date: { $gte: new Date(dates['t-start']), $lt: new Date(dates['t-end']) } }], $or: [{ bookingStatus: "success" }, { bookingStatus: "pending" }] }).toArray()

            var bookingId = booking.map(function (room) {
                return room.room._id
            });
            console.log('bookingId');
            console.log(bookingId);

            let bookedId = await db.get().collection(collection.ROOMS_COLLECTION).find({
                _id: {
                    $in: bookingId
                }
            }).toArray()
            console.log('bookedId');
            console.log(bookedId);

            var ids = bookedId.map(function (id) {
                let iddd = { id: id._id.toString(), count: id.room_count }
                return iddd
            });
            console.log('ids');
            console.log(ids);


            ids.sort()

            var counts = ids.map(function (count) {
                return count.count
            });
            console.log('counts');
            console.log(counts);


            let count = {};
            bookingId.forEach(element => {
                count[element] = (count[element] || 0) + 1;
            });

            console.log('count');
            console.log(count);

            const propertyValues = Object.values(count);
            console.log('propertyValues');
            console.log(propertyValues);

            var bookingIdss = booking.map(function (room) {
                return room.room._id.toString()
            });

            console.log('bookingIdss');
            console.log(bookingIdss);

            let uniqueChars = [...new Set(bookingIdss)];
            console.log('uniqueChars');
            console.log(uniqueChars);

            var book = uniqueChars.map(function (id) {
                return objectId(id)
            });
            console.log('book');
            console.log(book);

            bookingId.sort()
            for (let i = 0; i < propertyValues.length; i++) {
                if (propertyValues[i] < counts[i]) {
                    book.splice(i, 1);
                }
            }

            db.get().collection(collection.ROOMS_COLLECTION).find({
                _id: {
                    $nin: book
                },
                roomstatus: "available",
                hotelStatus: true

            }).toArray().then((response) => {
                resolve(response)
            })
        })


    },
    // getAvailability: (dates) => {
    //     return new Promise(async (resolve, response) => {

    //         let booking = await db.get().collection(collection.BOOKING_COLLECTION).find({ $and: [{ Date: { $gte: new Date(dates['t-start']), $lt: new Date(dates['t-end']) } }], $or: [{ bookingStatus: "success" }, { bookingStatus: "pending" }] }).toArray()

    //         var bookingId = booking.map(function (room) {
    //             return room.room._id
    //         });

    //         var bookingIdssss = booking.map(function (room) {
    //             return { roomId: room.room._id, checkInDate: room.Date[0], checkOutDate: room.checkOutDate }
    //         });
    //         console.log('bookingIdssss first');
    //         console.log(bookingIdssss);

    //         for (var i = 0; i < bookingIdssss.length; i++) {
    //             for (var j = i; j < bookingIdssss.length; j++) {
    //                 if (bookingIdssss[i].checkOutDate == bookingIdssss[j].checkOutDate && bookingIdssss[i].roomId == bookingIdssss[j].roomId) {
    //                     bookingIdssss.splice(i, 1);
    //                 }
    //             }
    //         }


    //         console.log('bookingIdssss');
    //         console.log(bookingIdssss);
    //         let counttt = 0;
    //         for (var i = 0; i < bookingIdssss.length; i++) {
    //             for (var j = i; j < bookingIdssss.length; j++) {
    //                 if (bookingIdssss[j].checkInDate.toString() > bookingIdssss[i].checkOutDate.toString() && bookingIdssss[j].roomId == bookingIdssss[i].roomId) {
    //                     console.log('bookingIdssss[j].checkInDate');
    //                     console.log(bookingIdssss[j].checkInDate.toString());
    //                     console.log(bookingIdssss[i].checkOutDate.toString());
    //                     console.log('asa');
    //                     counttt++;
    //                     break
    //                 }
    //             }
    //         }
    //         console.log(counttt);
    //         console.log('bookingId');
    //         console.log(bookingId);

    //         let bookedId = await db.get().collection(collection.ROOMS_COLLECTION).find({
    //             _id: {
    //                 $in: bookingId
    //             }
    //         }).toArray()
    //         console.log('bookedId');
    //         console.log(bookedId);

    //         var ids = bookedId.map(function (id) {
    //             let iddd = { id: id._id.toString(), count: id.room_count }
    //             return iddd
    //         });
    //         console.log('ids');
    //         console.log(ids);


    //         ids.sort()

    //         var counts = ids.map(function (count) {
    //             return count.count
    //         });
    //         console.log('counts');
    //         console.log(counts);


    //         let count = {};
    //         bookingId.forEach(element => {
    //             count[element] = (count[element] || 0) + 1;
    //         });

    //         console.log('count');
    //         console.log(count);

    //         const propertyValues = Object.values(count);
    //         console.log('propertyValues');
    //         console.log(propertyValues);

    //         var bookingIdss = booking.map(function (room) {
    //             return room.room._id.toString()
    //         });

    //         console.log('bookingIdss');
    //         console.log(bookingIdss);

    //         let uniqueChars = [...new Set(bookingIdss)];
    //         console.log('uniqueChars');
    //         console.log(uniqueChars);

    //         var book = uniqueChars.map(function (id) {
    //             return objectId(id)
    //         });
    //         console.log('book');
    //         console.log(book);

    //         bookingId.sort()
    //         for (let i = 0; i < propertyValues.length; i++) {
    //             if (propertyValues[i] < counts[i]) {
    //                 book.splice(i, 1);
    //             }
    //         }

    //         db.get().collection(collection.ROOMS_COLLECTION).find({
    //             _id: {
    //                 $nin: book
    //             },
    //             roomstatus: "available",
    //             hotelStatus: true

    //         }).toArray().then((response) => {
    //             resolve(response)
    //         })
    //     })


    // },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'bCo42BwPq4h8qiGbRq5VqSSv');
            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
            hmac = hmac.digest('hex')
            if (hmac == details.payment.razorpay_signature) {
                resolve()
            } else {
                reject()
            }
        })


    },
    changePaymentStatus: (bookedId, walletStatus, walletAmount) => {
        return new Promise(async (resolve, reject) => {

            if (walletStatus) {
                let booking = await db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(bookedId) })
                var onlineAmount = booking.totalAmount - walletAmount
                db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(bookedId) }, {
                    $set: {
                        paymentStatus: "success",
                        bookingStatus: "success",
                        totalAmount: {
                            wallet: walletAmount,
                            online: onlineAmount
                        }
                    }
                }).then(() => {
                    resolve()
                })
            } else {
                db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(bookedId) }, {
                    $set: {
                        paymentStatus: "success",
                        bookingStatus: "success",
                    }
                }).then(() => {
                    resolve()
                })
            }
        })

    },
    getProfile: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })


    },
    editProfile: (userData, userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            if (user.email == userData.email) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                    $set: {
                        name: userData.name,
                        email: userData.email
                    }
                })
                resolve({ status: true })
            } else {
                db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email }).then((response) => {
                    if (response) {
                        resolve({ status: false })
                    } else {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                            $set: {
                                name: userData.name,
                                email: userData.email
                            }
                        })
                        resolve({ status: true })
                    }
                })

            }
        })

    },
    checkCoupon: (couponcode, total, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.OFFER_COLLECTION).findOne({ offerCode: couponcode.offer_coupon }).then((response) => {
                console.log(response);
                let responseData = {}
                if (response) {
                    responseData.couponId = response._id
                    console.log(response);
                    if (response.users.includes(userId)) {
                        responseData.status = false
                        responseData.totalAmount = total
                        resolve(responseData)
                    } else {
                        if (new Date() < response.expire && response.count > 0) {
                            let offerAmount = total * response.percentage / 100
                            let totalAmount = total - offerAmount
                            totalAmount = Math.trunc(totalAmount)
                            responseData.status = true;
                            responseData.offerAmount = offerAmount
                            responseData.totalAmount = totalAmount
                            resolve(responseData)
                        } else {
                            responseData.status = false
                            responseData.totalAmount = total
                            resolve(responseData)
                        }
                    }

                } else {
                    responseData.status = false
                    responseData.totalAmount = total
                    resolve(responseData)
                }
                console.log('responseData');
                console.log(responseData);
            })
        })

    },
    getWallet: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let wallet = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
            resolve(wallet)
        })

    },
    useCoupon: (couponId, userId, orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.OFFER_COLLECTION).updateOne({ _id: objectId(couponId) }, {
                $push: {
                    users: objectId(userId),
                    // Used: {
                    //     users: objectId(userId),
                    //     orderId: orderId
                    // }
                },
                $inc: { count: -1 }
            }).then(() => {
                resolve()
            })
        })

    },
    walletHistory: (userId) => {
        return new Promise(async (resolve, reject) => {
            // db.get().collection(collection.WALLET_COLLECTION).findOne({ user: userId }).then((response) => {
            // })
            db.get().collection(collection.WALLET_COLLECTION).aggregate([
                {
                    $match: {
                        user: userId
                    }
                },
                {
                    $unwind: "$Transactions"
                },
                {
                    $lookup: {
                        from: collection.BOOKING_COLLECTION,
                        localField: 'Transactions.bookingId',
                        foreignField: '_id',
                        as: 'bookings'
                    }
                },
                {
                    $unwind: "$bookings"
                },
            ]).toArray().then((response) => {
                resolve(response)
            })
        })
    },
    checkWallet: (totalAmount, userId, couponAmount) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                if (couponAmount) {
                    totalAmount = couponAmount
                }

                if (response.wallet >= totalAmount) {
                    resolve({ status: true })
                } else {
                    resolve({ status: false })
                }
            })
        })

    }
}