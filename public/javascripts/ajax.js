// $(document).ready(function () {
//     $("#forgot").submit((event) => {
//         event.preventDefault();

//         var mobile = $("#mobile").val();

//         //////////
//         $.ajax({
//             url: "/forgot",
//             method: "POST",
//             contentType: "application/json",
//             data: JSON.stringify({ mobile: mobile }),
//             success: function (res) {
//                 res.redirect('/admin')
//             }
//         })
//     })
// })