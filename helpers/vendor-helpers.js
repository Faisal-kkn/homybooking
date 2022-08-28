const { response } = require('../app');
var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
var bcrypt = require('bcrypt');
const app = require('../app');
const { ObjectID } = require('bson');

module.exports = {
    vendorLogin: (vendorData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ email: vendorData.email })

            if (vendor) {
                bcrypt.compare(vendorData.password, vendor.password).then((status) => {
                    if (status) {
                        response.status = true;
                        if (vendor.request) {
                            response.request = true;
                            if (vendor.status) {
                                console.log('Login success');
                                response.vendor = vendor;
                                resolve(response)
                            } else {
                                response.blockStatus = 'your Accounts is blocked';
                                resolve(response)
                            }
                        } else {
                            console.log('Login Failedaa');
                            response.request = false;
                            resolve(response)
                        }


                    } else {
                        console.log('Login Faileds');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('Login Failed');
                resolve({ status: false })
            }

        })


    },
    vendorSignup: (vendorData) => {

        return new Promise(async (resolve, reject) => {
            let vendorSignup = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ mobile: vendorData.mobile })
            let vendoremail = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ email: vendorData.email })
            let signupData = {}
            if (vendorSignup) {
                signupData.err = 'Mobile Number is alredy used'
                resolve(signupData)
            } else if (vendoremail) {
                signupData.err = 'Mail id is alredy used'
                resolve(signupData)
            } else {
                vendorData.password = await bcrypt.hash(vendorData.password, 10)
                vendorData.status = true
                vendorData.wallet = 0
                vendorData.request = false
                vendorData.hotels = []

                signupData.status = true
                signupData.request = false
                db.get().collection(collection.VENDOR_COLLECTION).insertOne(vendorData).then((data) => {
                    signupData.id = data.insertedId
                    resolve(signupData)
                })
            }
        })


    },
    getAllHotels: (vendorId) => {

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
                        as: 'hotelIteams'
                    }
                }
            ]).toArray()
            resolve(hotels[0].hotelIteams)
        })


    },
    addHotel: (hotelData, vendorId) => {

        console.log(hotelData);
        console.log(vendorId);
        return new Promise((resolve, reject) => {
            hotelData.rooms = []

            db.get().collection(collection.HOTEL_COLLECTION).insertOne(hotelData).then(async (data) => {
                db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) }, {
                    $push: { hotels: objectId(data.insertedId) }
                }).then(() => {
                    resolve()
                })

            })
        })


    },
    getHotelData: (editHotel) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.HOTEL_COLLECTION).findOne({ _id: objectId(editHotel) }).then((hotelData) => {
                resolve(hotelData)
            })
        })


    },
    updateHotel: (editHotel, hotelData) => {

        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.HOTEL_COLLECTION).updateOne({ _id: objectId(editHotel) }, {
                $set: {
                    hotel_name: hotelData.hotel_name,
                    location: hotelData.location,
                    front_office: hotelData.front_office,
                    mobile: hotelData.mobile,
                    email: hotelData.email,
                    type: hotelData.type,
                    total_rooms: hotelData.total_rooms,
                    map: hotelData.map,
                    facility: hotelData.facility,
                    address: hotelData.address,
                    description: hotelData.description,
                    image: hotelData.image,
                }
            }).then((response) => {
                resolve()
            })

        })



    },
    hotelType: () => {

        return new Promise(async (resolve, reject) => {
            let hotelData = {}
            let hotelTypes = await db.get().collection(collection.HOTEL_TYPE_COLLECTION).find().toArray()
            let hotelFacility = await db.get().collection(collection.HOTEL_FACILITY_COLLECTION).find().toArray()
            hotelData.hotelTypes = hotelTypes
            hotelData.hotelFacility = hotelFacility
            resolve(hotelData)
        })


    },
    roomTypes: () => {

        return new Promise(async (resolve, reject) => {
            let roomData = {}
            let roomTypes = await db.get().collection(collection.ROOM_TYPE_COLLECTION).find().toArray()
            let roomstatus = await db.get().collection(collection.ROOM_STATUS_COLLECTION).find().toArray()
            roomData.roomTypes = roomTypes
            roomData.roomstatus = roomstatus
            resolve(roomData)
        })


    },
    getRoomTypes: () => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ROOM_TYPE_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })

    },
    getRoomStatus: () => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ROOM_STATUS_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })

    },
    getAllRooms: (hotelId) => {

        return new Promise(async (resolve, reject) => {
            let hotelStatus = await db.get().collection(collection.HOTEL_COLLECTION).findOne({ _id: objectId(hotelId) })
            let response = {};
            if (hotelStatus.status) {
                let rooms = await db.get().collection(collection.HOTEL_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(hotelId) }
                    },
                    {
                        $lookup: {
                            from: collection.ROOMS_COLLECTION,
                            let: { roomlist: '$rooms' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', "$$roomlist"]
                                        }
                                    }
                                }
                            ],
                            as: 'roomIteams'
                        }
                    }
                ]).toArray()
                response.rooms = rooms[0].roomIteams
                response.status = true;
                resolve(response)
            } else {
                response.status = false
                resolve(response)
            }

        })



    },
    addRoom: (roomData, hotelId) => {

        return new Promise((resolve, reject) => {
            roomData.room_count = parseInt(roomData.room_count)
            db.get().collection(collection.ROOMS_COLLECTION).insertOne(roomData).then(async (data) => {
                db.get().collection(collection.HOTEL_COLLECTION).updateOne({ _id: ObjectID(hotelId) }, {
                    $push: { rooms: objectId(data.insertedId) }
                }).then(() => {
                    resolve()
                })
            })
        })


    },
    getRoomData: (editRoom) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ROOMS_COLLECTION).findOne({ _id: objectId(editRoom) }).then((roomData) => {
                resolve(roomData)
            })
        })


    },
    updateRoom: (editRoom, roomData) => {

        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.ROOMS_COLLECTION).updateOne({ _id: objectId(editRoom) }, {
                $set: {
                    room_no: roomData.room_no,
                    type: roomData.type,
                    roomstatus: roomData.roomstatus,
                    mrpprice: roomData.mrpprice,
                    salesprice: roomData.salesprice,
                    images: roomData.images,
                    description: roomData.description
                }
            }).then((response) => {
                resolve()
            })

        })



    },
    // deleteRoom: (roomId,hotelId) => {
    //     
    //         return new Promise((resolve, reject) => {
    //             db.get().collection(collection.ROOMS_COLLECTION).deleteOne({ _id: objectId(roomId) }).then(async (response) => {
    //                 // let hotelRooms =await db.get().collection(collection.HOTEL_COLLECTION).findOne({_id:objectId(hotelId)})
    //                 // let roomsIds = hotelRooms.indexOf({rooms:[ObjectID(roomId)]})
    //                 // console.log(roomsIds);
    //                 resolve(response)
    //             })
    //         })
    //     } catch (err) {
    //         console.log(err);
    //     }

    // },
    getAllBookings: (vendorId) => {

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },

            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });

                let bookings = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $sort: { currentDate: -1 }
                    }
                ]).toArray()

                resolve(bookings)
            })
        })


    },
    todayBookings: (vendorId) => {


        return new Promise((resolve, reject) => {
            function getPreviousDay(date = new Date()) {
                const previous = new Date(date.getTime());
                previous.setDate(date.getDate() - 1);

                return previous;
            }

            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },

            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });

                let bookings = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms },
                            currentDate: { $gt: getPreviousDay() }
                        }
                    },
                    {
                        $sort: { currentDate: -1 }
                    }
                ]).toArray()

                resolve(bookings)
            })
        })

    },
    lastWeekBookings: (vendorId) => {


        return new Promise((resolve, reject) => {
            function getPreviousDay(date = new Date()) {
                const previous = new Date(date.getTime());
                previous.setDate(date.getDate() - 7);

                return previous;
            }

            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },

            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });

                let bookings = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms },
                            currentDate: { $gt: getPreviousDay() }
                        }
                    },
                    {
                        $sort: { currentDate: -1 }
                    }
                ]).toArray()

                resolve(bookings)
            })
        })

    },
    lastMonthBookings: (vendorId) => {

        return new Promise((resolve, reject) => {
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

            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },

            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });

                let bookings = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms },
                            currentDate: { $gt: getPreviousDay() }
                        }
                    },
                    {
                        $sort: { currentDate: -1 }
                    }
                ]).toArray()

                resolve(bookings)
            })
        })


    },
    customBookings: (vendorId, dates) => {

        let from = new Date(dates.from)
        let to = new Date(dates.to)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },

            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });

                let bookings = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms },
                            currentDate: { $gte: from, $lte: to }
                        }
                    },
                    {
                        $sort: { currentDate: -1 }
                    }
                ]).toArray()

                resolve(bookings)
            })
        })


    },
    getHotelBookings: (hotelId) => {

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
                ]).sort({ currentDate: -1 }).toArray()

                for (var i = 0; i < Bookedrooms.rooms.length; i++) {
                    if (new Date() >= Bookedrooms.rooms[i].checkOutDate) {
                        Bookedrooms.rooms[i].checkout_Status = true
                    }
                }
                const date = new Date();
                date.setHours(0, 0, 0, 0);
                function padTo2Digits(num) {
                    return num.toString().padStart(2, '0');
                }
                function formatDate(date) {
                    return [
                        date.getFullYear(),
                        padTo2Digits(date.getMonth() + 1),
                        padTo2Digits(date.getDate()),
                    ].join('-');
                }

                let checkinDate = formatDate(new Date())

                for (var i = 0; i < Bookedrooms.rooms.length; i++) {
                    if (new Date(checkinDate).toString() == Bookedrooms.rooms[i].Date[0].toString() && Bookedrooms.rooms[i].CheckInStatus != "CheckIned") {
                        Bookedrooms.rooms[i].checkIn_Status = true;
                        continue;
                    } else {
                        Bookedrooms.rooms[i].checkIn_Status = false;
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
                console.log('Bookedroomsssssssssssssssssssssssss');
                console.log(Bookedrooms);
                console.log(new Date());
                resolve(Bookedrooms)
            })

        })

    },
    checkoutRoom: (bookId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(bookId) }, {
                $set: {
                    CheckOutStatus: "CheckOuted"
                }
            }).then((response) => {
                resolve()
            })
        })

    },
    checkInRoom: (bookId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_COLLECTION).updateOne({ _id: objectId(bookId) }, {
                $set: {
                    CheckInStatus: "CheckIned"
                }
            }).then((response) => {
                resolve()
            })
        })

    },
    chartAmount: (vendorId) => {

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },

            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });
                let totalAmount = {}

                totalAmount.razorpay = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
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

                totalAmount.Wallet = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $match: {
                            paymentMethod: "Wallet",
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
                console.log(totalAmount.Wallet);

                totalAmount.paypal = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
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

                totalAmount.booked = await db.get().collection(collection.BOOKING_COLLECTION).find({
                    "room._id": { $in: rooms }, bookingStatus: "success"
                }).count()

                totalAmount.room = await rooms.length
                let vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ _id: objectId(vendorId) })
                totalAmount.hotel = await vendor.hotels.length
                if (totalAmount.razorpay.length == 0) {
                    totalAmount.razorpay = [{ total: 0 }]
                }
                if (totalAmount.paypal.length == 0) {
                    totalAmount.paypal = [{ total: 0 }]
                }

                if (totalAmount.Wallet.length == 0) {
                    totalAmount.Wallet = [{ total: 0 }]
                }
                totalAmount.total = totalAmount.razorpay[0].total + totalAmount.paypal[0].total + totalAmount.Wallet[0].total
                console.log(totalAmount);

                resolve(totalAmount)
            })

        })

    },
    transactions: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },


            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });
                let totalAmount = {}

                totalAmount.razorpay = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
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
                            Withdraw: false,
                            CheckOutStatus: "CheckOuted"
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
                console.log('totalAmount.razorpay');
                console.log(totalAmount.razorpay);

                totalAmount.wallet = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $match: {
                            paymentMethod: "Wallet",
                            paymentStatus: "success",
                            bookingStatus: "success",
                            Withdraw: true,
                            CheckOutStatus: "Checkouted"
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
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $match: {
                            paymentMethod: "paypal",
                            paymentStatus: "success",
                            bookingStatus: "success",
                            Withdraw: true,
                            CheckOutStatus: "CheckOuted"
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

                let vendorTransaction = await db.get().collection(collection.TRANSACTION_COLLECTION).findOne({ vendor: objectId(vendorId) })
                if (vendorTransaction) {
                    totalAmount.transaction = vendorTransaction
                }

                if (totalAmount.razorpay.length == 0) {
                    totalAmount.razorpay = [{ total: 0 }]
                }
                if (totalAmount.wallet.length == 0) {
                    totalAmount.wallet = [{ total: 0 }]
                }
                if (totalAmount.paypal.length == 0) {
                    totalAmount.paypal = [{ total: 0 }]
                }
                totalAmount.total = totalAmount.razorpay[0].total + totalAmount.paypal[0].total + totalAmount.wallet[0].total
                totalAmount.subTotal = (totalAmount.razorpay[0].total + totalAmount.paypal[0].total + totalAmount.wallet[0].total) / 2

                totalAmount.transaction = await db.get().collection(collection.TRANSACTION_COLLECTION).findOne({ vendor: objectId(vendorId) })
                if (totalAmount.transaction) {
                    totalAmount.transaction.Transactions = totalAmount.transaction.Transactions.sort(
                        (objA, objB) => Number(objB.date) - Number(objA.date),
                    );
                }


                console.log('totalAmount.transaction');
                console.log(totalAmount);
                resolve(totalAmount)
            })
        })
    },
    WithdrawAmount: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            let vendor = await db.get().collection(collection.TRANSACTION_COLLECTION).findOne({ vendor: objectId(vendorId) })
            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },
            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });


                var totalAmount = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $match: {
                            paymentStatus: "success",
                            bookingStatus: "success",
                            Withdraw: false,

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
                await db.get().collection(collection.BOOKING_COLLECTION).updateMany({ "room._id": { $in: rooms } }, {
                    $set: {
                        Withdraw: true
                    }
                })
                console.log('rooms');
                console.log(rooms);
                console.log('totalAmount');
                console.log(totalAmount);

                if (vendor) {

                    db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) }, {
                        $set: {
                            totalAmount: totalAmount[0].total / 2,
                        }
                    }).then(async () => {
                        resolve(response)

                        db.get().collection(collection.TRANSACTION_COLLECTION).updateOne({ vendor: objectId(vendorId) }, {
                            $push: {
                                Transactions: {
                                    date: new Date(),
                                    amount: totalAmount[0].total / 2,
                                    status: false
                                }
                            }
                        }).then(() => {
                            resolve()
                        })
                    })


                } else {
                    let TransactionHistory = {
                        vendor: objectId(vendorId),
                        Transactions: [{
                            date: new Date(),
                            amount: totalAmount[0].total / 2,
                            status: false
                        }]
                    }
                    db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: objectId(vendorId) }, {
                        $set: {
                            totalAmount: totalAmount[0].total / 2,
                        }
                    }).then(async () => {
                        db.get().collection(collection.TRANSACTION_COLLECTION).insertOne(TransactionHistory).then(() => {
                            resolve()
                        })
                    })
                }

            })
        })
    },
    checkWallet: (vendorId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {
                    $match: {
                        _id: objectId(vendorId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        hotels: 1
                    }
                },
                {
                    $unwind: "$hotels"
                },
                {
                    $lookup: {
                        from: collection.HOTEL_COLLECTION,
                        localField: 'hotels',
                        foreignField: '_id',
                        as: 'rooms'
                    }
                },
                {
                    $unwind: "$rooms"
                },
                {
                    $project: {
                        _id: 0,
                        rooms: "$rooms.rooms",
                    }
                },
                {
                    $unwind: "$rooms"
                },
            ]).toArray().then(async (response) => {
                let rooms = response.map(function (rooms) {
                    return rooms.rooms
                });

                let AllAmounts = {}
                AllAmounts.fullTotalAmount = await db.get().collection(collection.BOOKING_COLLECTION).aggregate([
                    {
                        $match: {
                            "room._id": { $in: rooms }
                        }
                    },
                    {
                        $match: {
                            paymentStatus: "success",
                            bookingStatus: "success",
                            CheckOutStatus: "CheckOuted"
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
                if (AllAmounts.fullTotalAmount.length == 0) {
                    AllAmounts.fullTotalAmount = 0
                } else {
                    AllAmounts.fullTotalAmount = AllAmounts.fullTotalAmount[0].total / 2
                }
                db.get().collection(collection.VENDOR_COLLECTION).findOne({ _id: objectId(vendorId) }).then((response) => {
                    AllAmounts.wallet = response.wallet
                    AllAmounts.totalAmount = response.totalAmount
                    AllAmounts.Withdraw = AllAmounts.fullTotalAmount - AllAmounts.wallet
                    console.log('AllAmountssssssssssssssss');
                    console.log(AllAmounts);
                    resolve(AllAmounts)
                })



            })

        })
    }
}