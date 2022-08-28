var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
var bcrypt = require('bcrypt');
const { response } = require('../app');

module.exports = {
    // doSuperAdminLogin: (adminData) => {
    //     return new Promise(async (resolve, reject) => {
    //         let adminLoginStatus = false;
    //         let adminResponse = {};
    //         let admin = await db.get().collection(collection.SUPER_ADMIN_COLLECTION).findOne({ username: adminData.userName })
    //         console.log(admin);
    //         if (admin) {
    //             adminData.password = await bcrypt.hash(adminData.password, 10)
    //             console.log(admin.password);
    //             console.log(adminData.password);

    //             bcrypt.compare(admin.password, adminData.password).then((status) => {
    //                 console.log(status);
    //                 if (status) {
    //                     adminResponse.admin = admin;
    //                     adminResponse.status = true;
    //                     resolve(adminResponse)
    //                     console.log('Login success');
    //                 } else {
    //                    adminResponse.status = false
    //                     resolve(adminResponse)
    //                     console.log('Login Faileddd');
    //                 }
    //             })

    //         } else {
    //             console.log('Login Failed');
    //             resolve(adminResponse.status = false)
    //         }

    //     })
    // },
    doSuperAdminLogin: (superAdminData) => {

        return new Promise(async (resolve, reject) => {
            let superAdminLoginStatus = false;
            let superAdminResponse = {};
            let superAdmin = await db.get().collection(collection.SUPER_ADMIN_COLLECTION).findOne({ username: superAdminData.username })
            if (superAdmin) {
                if (superAdmin.password == superAdminData.password) {
                    superAdminResponse.superAdmin = superAdmin;
                    superAdminResponse.status = true;
                    resolve(superAdminResponse)
                    console.log('Login success');
                } else {
                    adminResponse.status = false
                    resolve(adminResponse)
                    console.log('Login Faileddd');
                }

            } else {
                console.log('Login Failed');
                resolve(superAdminResponse.status = false)
            }

        })
    },
    chartAmount: () => {

        return new Promise(async (resolve, reject) => {
            let totalAmount = {}
            totalAmount.razorpay = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: "razorpay",
                        paymentStatus: "success",
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()

            totalAmount.paypal = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                {
                    $match: {
                        paymentMethod: "paypal",
                        paymentStatus: "success",
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ]).toArray()

            totalAmount.booked = await db.get().collection(collection.BOOKING_COLLECTION).count()
            totalAmount.room = await db.get().collection(collection.ROOMS_COLLECTION).count()
            totalAmount.hotel = await db.get().collection(collection.HOTEL_COLLECTION).count()
            if (totalAmount.razorpay.length == 0) {
                totalAmount.razorpay = [{ total: 0 }]
            }
            if (totalAmount.paypal.length == 0) {
                totalAmount.paypal = [{ total: 0 }]
            }
            totalAmount.total = totalAmount.razorpay[0].total + totalAmount.paypal[0].total
            console.log(totalAmount);

            // totalAmount.totalRoom = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
            //     {
            //         $match: {
            //             paymentMethod: "paypal",
            //             paymentStatus: "success"
            //         }
            //     },
            //     {
            //         $group: {
            //             _id: null,
            //             total: {
            //                 $sum: "$totalAmount"
            //             }
            //         }
            //     }
            // ]).toArray()
            resolve(totalAmount)
        })


    },
    vendorRequests: () => {

        return new Promise(async (resolve, reject) => {
            let vendors = await db.get().collection(collection.VENDOR_COLLECTION).find({}).toArray()
            // let a = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
            //     {
            //         $lookup: {
            //             from: collection.TRANSACTION_COLLECTION,
            //             localField: 'vendor',
            //             foreignField: '_id',
            //             as: 'transaction'
            //         }
            //     },
            //     {
            //         $project: {
            //             _id: 0,
            //             fullName: 1,
            //             mobile: 1,
            //             email: 1,
            //             address: 1,
            //             transaction: "$transaction"
            //         }
            //     }
            // ]).toArray()
            // console.log(a);
            resolve(vendors)
        })


    },
    getAllHotels: () => {

        return new Promise(async (resolve, reject) => {
            let hotels = await db.get().collection(collection.HOTEL_COLLECTION).find().toArray()
            let hotId = hotels[0]._id
            let vendorEmail = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ hotels: [hotId] })
            resolve(hotels)
        })


    },
    blockHotel: (hotelId) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.HOTEL_COLLECTION).updateOne({ _id: objectId(hotelId) }, {
                $set: {
                    status: false
                }
            })

            let hotelStatus = await db.get().collection(collection.HOTEL_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(hotelId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        rooms: 1
                    }
                },
                {
                    $unwind: "$rooms"
                },
            ]).toArray()
            var hotelRooms = hotelStatus.map(function (hotel) {
                return hotel.rooms
            });
            await db.get().collection(collection.ROOMS_COLLECTION).updateMany({ _id: { $nin: hotelRooms } }, {
                $set: {
                    hotelStatus: false
                }
            })
            console.log(hotelRooms);

            console.log('hotelStatus');
            console.log(hotelStatus);
            resolve()
        })


    },
    unblockHotel: (hotelId) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.HOTEL_COLLECTION).updateOne({ _id: objectId(hotelId) }, {
                $set: {
                    status: true
                }
            })
            let hotelStatus = await db.get().collection(collection.HOTEL_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(hotelId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        rooms: 1
                    }
                },
                {
                    $unwind: "$rooms"
                },
            ]).toArray()
            var hotelRooms = hotelStatus.map(function (hotel) {
                return hotel.rooms
            });
            await db.get().collection(collection.ROOMS_COLLECTION).updateMany({ _id: { $nin: hotelRooms } }, {
                $set: {
                    hotelStatus: true
                }
            })
            resolve()
        })


    },
    vendorSingleHotel: (vendorId) => {

        return new Promise(async (resolve, reject) => {
            let hotels = await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(vendorId) }
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        let: { hotellist: '$hotels' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', "$$hotellist"]
                                    }
                                }
                            }
                        ],
                        as: 'hotels'
                    }
                }
            ]).toArray()
            resolve(hotels[0].hotels)
        })


    },
    getSingleHotelBookings: (hotelId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.HOTEL_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(hotelId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        rooms: 1
                    }
                },
                {
                    $unwind: "$rooms"
                }
            ]).toArray().then(async (response) => {
                let Bookedrooms = {}
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });
                Bookedrooms.rooms = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    }
                ]).toArray()

                for (var i = 0; i < Bookedrooms.rooms.length; i++) {
                    if (new Date() >= Bookedrooms.rooms[i].checkOutDate) {
                        Bookedrooms.rooms[i].checkout_Status = true
                    }
                }

                Bookedrooms.razorpay = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $match: {
                            paymentMethod: "razorpay",
                            paymentStatus: "success",
                            bookingStatus: "success",

                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: "$totalAmount"
                            }
                        }
                    }
                ]).toArray()

                Bookedrooms.paypal = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $match: {
                            paymentMethod: "paypal",
                            paymentStatus: "success",
                            bookingStatus: "success",
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: "$totalAmount"
                            }
                        }
                    }
                ]).toArray()

                Bookedrooms.booked = await db.get().collection(collection.BOOKING_COLLECTION).find({
                    "room._id": { $in: rooms }, bookingStatus: "success", paymentStatus: "success"
                }).count()
                if (Bookedrooms.razorpay.length == 0) {
                    Bookedrooms.razorpay = [{ total: 0 }]
                }
                if (Bookedrooms.paypal.length == 0) {
                    Bookedrooms.paypal = [{ total: 0 }]
                }
                Bookedrooms.total = Bookedrooms.razorpay[0].total + Bookedrooms.paypal[0].total
                resolve(Bookedrooms)
            })

        })

    },
    // addHotel: (hotelData) => {

    //     return new Promise(async (resolve, reject) => {
    //         hotelData.admin_password = await bcrypt.hash(hotelData.admin_password, 10)
    //         db.get().collection(collection.HOTEL_COLLECTION).insertOne(hotelData).then((data) => {
    //             resolve()
    //         })
    //     })
    // },
    // deleteHotel: (hotelId) => {
    //     console.log(hotelId)
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.HOTEL_COLLECTION).deleteOne({_id:objectId(hotelId)}).then((response) => {
    //             resolve(response)
    //         })
    //     })
    // },
    // getHotelData: (editHotel) => {
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.HOTEL_COLLECTION).findOne({ _id: objectId(editHotel) }).then((hotelData) => {
    //             resolve(hotelData)
    //         })
    //     })
    // },
    // updateHotel: (editHotel, hotelData) => {
    //     return new Promise(async (resolve, reject) => {

    //         db.get().collection(collection.HOTEL_COLLECTION).updateOne({ _id: objectId(editHotel) }, {
    //             $set: {
    //                 hotel_name: hotelData.hotel_name,
    //                 location: hotelData.location,
    //                 front_office: hotelData.front_office,
    //                 mobile: hotelData.mobile,
    //                 email: hotelData.email,
    //                 type: hotelData.type,
    //                 total_rooms: hotelData.total_rooms,
    //                 map: hotelData.map,
    //                 air_conditioner: hotelData.air_conditioner,
    //                 swimming_pool: hotelData.swimming_pool,
    //                 wifi: hotelData.wifi,
    //                 taxi: hotelData.taxi,
    //                 test: hotelData.test,
    //                 address: hotelData.address,
    //                 description: hotelData.description,
    //                 admin_username: hotelData.admin_username,
    //                 admin_password: hotelData.admin_password,
    //                 image: [hotelData.image],
    //             }
    //         }).then((response) => {
    //             resolve()
    //         })

    //     })

    // },
    getUsers: () => {

        return new Promise(async (resolve, reject) => {
            let usersData = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(usersData)
        })


    },
    venderStatus: (userId) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    request: true
                }
            })
            resolve()
        })


    },
    blockVendor: (vendorId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) }, {
                $set: {
                    status: false
                }
            })
            resolve()
        })


    },
    unblockVendor: (vendorId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) }, {
                $set: {
                    status: true
                }
            })
            resolve()
        })


    },
    blockUser: (userId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    status: false
                }
            })
            resolve()
        })


    },
    unblockUser: (userId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    status: true
                }
            })
            resolve()
        })


    },
    hotelType: () => {

        return new Promise(async (resolve, reject) => {
            let hotelTypes = await db.get().collection(collection.HOTEL_TYPE_COLLECTION).find().toArray()
            resolve(hotelTypes)
        })


    },
    addHotelType: (HotelType) => {

        return new Promise((resolve, reject) => {
            console.log(HotelType);
            db.get().collection(collection.HOTEL_TYPE_COLLECTION).insertOne(HotelType).then((response) => {
                resolve()
            })
        })


    },
    hotelFacility: () => {

        return new Promise(async (resolve, reject) => {
            let HotelFacility = await db.get().collection(collection.HOTEL_FACILITY_COLLECTION).find().toArray()
            resolve(HotelFacility)
        })



    },
    addHotelFacility: (HotelFacility) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.HOTEL_FACILITY_COLLECTION).insertOne(HotelFacility).then((response) => {
                resolve()
            })
        })


    },
    roomTypes: () => {

        return new Promise(async (resolve, reject) => {
            let roomTypes = await db.get().collection(collection.ROOM_TYPE_COLLECTION).find().toArray()
            resolve(roomTypes)
        })


    },
    addRoomTypes: (roomTypes) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ROOM_TYPE_COLLECTION).insertOne(roomTypes).then((response) => {
                resolve()
            })
        })


    },
    roomStatus: () => {

        return new Promise(async (resolve, reject) => {
            let roomStatus = await db.get().collection(collection.ROOM_STATUS_COLLECTION).find().toArray()
            resolve(roomStatus)
        })


    },
    addRoomStatus: (roomStatus) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ROOM_STATUS_COLLECTION).insertOne(roomStatus).then((response) => {
                resolve()
            })
        })


    },
    bookings: () => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).find().sort({ currentDate: -1 }).toArray().then((bookings) => {
                resolve(bookings)
            })
        })


    },
    todayBookings: () => {

        function getPreviousDay(date = new Date()) {
            const previous = new Date(date.getTime());
            previous.setDate(date.getDate() - 1);

            return previous;
        }

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).find({ currentDate: { $gt: getPreviousDay() } }).sort({ currentDate: -1 }).toArray().then((bookings) => {
                resolve(bookings)
            })
        })

    },
    lastWeekBookings: () => {

        function getPreviousDay(date = new Date()) {
            const previous = new Date(date.getTime());
            previous.setDate(date.getDate() - 7);

            return previous;
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).find({ currentDate: { $gt: getPreviousDay() } }).sort({ currentDate: -1 }).toArray().then((bookings) => {
                resolve(bookings)
            })
        })


    },
    lastMonthBookings: () => {

        function getDaysInCurrentMonth() {
            const date = new Date();
            return new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            ).getDate();
        }
        const result = getDaysInCurrentMonth();

        function getPreviousDay(date = new Date()) {
            const previous = new Date(date.getTime());
            previous.setDate(date.getDate() - result);
            return previous;
        }

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).find({ currentDate: { $gt: getPreviousDay() } }).sort({ currentDate: -1 }).toArray().then((bookings) => {
                resolve(bookings)
            })
        })


    },
    customBookings: (dates) => {

        let from = new Date(dates.from)
        let to = new Date(dates.to)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).find({ currentDate: { $gte: from, $lte: to } }).sort({ currentDate: -1 }).toArray().then((bookings) => {
                resolve(bookings)
            })
        })


    },
    cancelBooking: (bookingId) => {

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(bookingId) }, {
                $set: {
                    bookingStatus: 'cancelled',
                }
            }).then(() => {
                db.get().collection(collection.BOOKING_COLLECTION).findOne({ _id: objectId(bookingId) }).then(async (response) => {
                    console.log(response);
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(response.user) }, {
                        $inc: { wallet: response.totalAmount }
                    })
                    let user = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: response.user })
                    if (user) {
                        db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: response.user }, {
                            $push: {
                                Transactions: {
                                    bookingId: response._id,
                                    amount: response.totalAmount,
                                    status: false
                                }
                            }
                        }).then(() => {
                            resolve()
                        })
                    } else {
                        let walletHistory = {
                            user: response.user,
                            Transactions: [{
                                bookingId: response._id,
                                amount: response.totalAmount,
                                status: false
                            }]
                        }
                        db.get().collection(collection.WALLET_COLLECTION).insertOne(walletHistory).then(() => {
                            resolve()
                        })
                    }
                })

            })
            resolve()
        })


    },
    getSlider: () => {

        return new Promise((resolve, reject) => {
            let banner = db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })


    },
    addSlider: (banner) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((response) => {
                resolve()
            })
        })


    },
    removeSlider: (bannerId) => {

        return new Promise(async (resolve, reject) => {
            let bannerLength = await db.get().collection(collection.BANNER_COLLECTION).count()
            console.log(bannerLength);
            if (bannerLength > 1) {
                db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(bannerId) }).then((response) => {
                    resolve()
                })
            } else {
                let err = 'Minimun 1 Slider Required'
                resolve(err)
            }
        })

    },
    getCoupon: () => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.OFFER_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })

    },
    getCouponUsed: (couponId) => {

        return new Promise(async (resolve, reject) => {
            let usedCoupons = await db.get().collection(collection.OFFER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(couponId)
                    }
                },
                {
                    $unwind: "$users"
                },
                {
                    $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: 'users',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: "$user"
                },
            ]).toArray()
            console.log(usedCoupons.user);
            console.log('usedCoupons.user');
            console.log(usedCoupons.user);
            resolve(usedCoupons)
            // var userId = a.map(function (coupon) {
            //     return coupon.users
            // });
            // db.get().collection(collection.OFFER_COLLECTION).find().toArray().then((coupon) => {

            //     var userId = userId.map(function (coupon) {
            //         return coupon.users
            //     });

            // userId = userId.map(function (user) {
            //         return objectId(user)
            //     });
            // console.log('userId');
            // console.log(userId);

            //     db.get().collection(collection.USER_COLLECTION).find({ _id: { $in: userId } }).toArray().then((response) => {
            //         console.log(response);
            //         for (let i = 0; i < response.length; i++) {
            //             response[i].coupon = coupon[i]
            //         }

            //         resolve(response)
            //     })
            // })
        })

    },
    addCoupon: (coupon) => {

        return new Promise((resolve, reject) => {
            coupon.expire = new Date(coupon.expire)
            coupon.count = parseInt(coupon.count)
            coupon.percentage = parseInt(coupon.percentage)
            coupon.users = []
            db.get().collection(collection.OFFER_COLLECTION).findOne({ offerCode: coupon.offerCode }).then((response) => {
                if (response) {
                    resolve({ status: false })
                } else {
                    db.get().collection(collection.OFFER_COLLECTION).insertOne(coupon).then((response) => {
                        resolve({ status: true })
                    })
                }
            })

        })

    },
    transactions: () => {
        return new Promise((resolve, reject) => {
            // db.get().collection(collection.TRANSACTION_COLLECTION).find().toArray().then((response) => {
            //     resolve(response)
            // })
            db.get().collection(collection.TRANSACTION_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.VENDOR_COLLECTION,
                        localField: 'vendor',
                        foreignField: '_id',
                        as: 'vendors'
                    },
                },
                {
                    $unwind: "$vendors",
                },
                // {
                //     $unwind: "$Transactions",
                // }
            ]).toArray().then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },
    transactionsSingle: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TRANSACTION_COLLECTION).findOne({ vendor: objectId(vendorId) }).then((response) => {
                console.log('respppppppppppponse');
                console.log(response);
                response.Transactions = response.Transactions.sort(
                    (objA, objB) => Number(objB.date) - Number(objA.date),
                );
                resolve(response)
            })
        })
    },
    withdrawAmount: (transactionId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.TRANSACTION_COLLECTION).findOne({ _id: objectId(transactionId) }).then(async (response) => {
                var len = response.Transactions.length - 1;
                var objUpdate = {};
                var updateQuery = "Transactions." + len + ".status";
                objUpdate[updateQuery] = true;
                let vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ _id: response.vendor })
                // vendor.totalAmount = vendor.totalAmount
                console.log('vendor.totalAmount');
                console.log(vendor.totalAmount);
                db.get().collection(collection.SUPER_ADMIN_COLLECTION).updateOne({ username: "superAdmin" }, {
                    $inc: { wallet: vendor.totalAmount }
                })
                db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: response.vendor }, {
                    $inc: { wallet: vendor.totalAmount },
                    $set: { totalAmount: 0 }
                }).then((response) => {
                    console.log('response');
                    console.log(response);
                })
                console.log('response.vendor');
                console.log(response.vendor);
                db.get().collection(collection.TRANSACTION_COLLECTION).updateMany({ _id: objectId(transactionId) }, { $set: objUpdate }).then((response) => {
                    resolve()
                })

            })
        })
    },
    checkWallet: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUPER_ADMIN_COLLECTION).find().toArray().then((response) => {
                console.log('aaaaaaaaaaaaresponse');
                console.log(response);
                resolve(response[0].wallet)
            })
        })
    }
}