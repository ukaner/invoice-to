var currency = $("#currency").text();
var baseURL = window.location.origin;
var invoiceID;
var flag = false;
var idExists = false;
var invCurr;


// A quick hack to stop elements to flicker
document.write('<style type="text/css">body{display:none}</style>');
jQuery(function ($) {
    $('body').css('display', 'block');
});

/* Global vars */
var rowCount = simpleStorage.get("rowCount");
if (!rowCount)
    var rowCount = 1;
var staticDataFields = ["invBy",
                        "invDateTop",
                        "invDate",
                        "invToTop",
                        "invTo",
                        "invFor",
                        "invByName",
                        "invNumber",
                        "dueDateTop",
                        "dueDate",
                        "invRef",
                        "payDetails",
                        "invTerms",
                        "paid",
                        "paymentDate",
                        "currency",
                        "vatp"
                       ];


$(document).ready(function () {

    $("#delete1").hide();

    page('/about', about);
    page('', main);
    page('/index.php', main);
    page('/stripe_connect.php', main);
    page('/charge.php', charge);
    page('/:id', getInvoice);

    page();

    // Before loading the page
    if (!simpleStorage.get("#invDateTop"))
        $("#invDateTop").html(getToday(0));
    if (!simpleStorage.get("#dueDateTop"))
        $("#dueDateTop").html(getToday(14));
    if (!simpleStorage.get("#invDate"))
        $("#invDate").html(getToday(0));
    if (!simpleStorage.get("#dueDate"))
        $("#dueDate").html(getToday(14));
    //

    // Load static data
    for (var i = 0; i < staticDataFields.length; i++) {
        loadData(staticDataFields[i]);
    }

    // Sync double fields

    // Load table
    var loadCount = rowCount;
    if (rowCount > 1) {
        rowCount = 1;
        loadTable(loadCount);
    }
    renderTable();
    $(".openPopupLink").magnificPopup({
        callbacks: {
            close: function() {
                /* Fixes FF regression issue */
                $(".menu-wrap").hide();
                setTimeout(function() {
                    $(".menu-wrap").show();
                }, 100);
            }
        }
    });

    $(".textHighlight").on('click', function () {
        $(this).removeClass();
    });

    // Limit numeric fields
    $("#itemHour1").numeric({negative: false});
    $("#itemPrice1").numeric({negative: false});

    $("#invByName").focus();

    console.log("currency-1 -> "+currency);
    console.log("currency-1 -> "+currency);
});

window.onbeforeunload = function () {
    //simpleStorage.flush();
};

function getInvoice(ctx) {
    console.log("Flushing");
    simpleStorage.flush();

    var id = ctx.params.id;
    if (id) {
        idExists = true;
    }
    loadFromMongo(id);
    renderButtons();

    // Change the document title
    document.title = "Invoice";

    // Replace indes with noindex meta tag
    $('meta[name=robots]').attr('content', 'noindex');
}

function main() {
    console.log("main page");
    renderButtons();
}

function connect() {
    console.log("Connect");
    window.location.href = baseURL;
}

function renderButtons() {
    $("#stripeButtons").show();

    if (simpleStorage.get("paid") == "true") {
        $("#stripeButtonSpan").hide();
        $("#connectButtonSpan").hide();

        // Render paidButton
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        timestamp = simpleStorage.get("paymentDate");
        var jsDate = new Date(timestamp * 1000);
        $('#paidButton').html("<i class=\"fa fa-check-circle\"></i>" + "  Paid on " + months[jsDate.getMonth()] + " " + jsDate.getDate() + " " + jsDate.getFullYear());

        $(".invDue").css("color", "#CCCCCC");

        $("#paidButtonSpan").show();
        $("#stripeButtons").show();
    } else if (simpleStorage.get("spk") == "" || simpleStorage.get("spk") == undefined) {
        console.log("Show Connect Button");
        $("#stripeButtonSpan").hide();
        $("#paidButtonSpan").hide();
        $("#connectButtonSpan").show();
        $("#stripeButtons").show();
        if (idExists) {
            console.log("Hide Connect Button");
            $("#stripeButtons").hide();
        }
    } else {
        console.log("Show Pay Button");
        $("#connectButtonSpan").hide();
        $("#paidButtonSpan").hide();
        $("#stripeButtonSpan").show();
        $("#stripeButtons").show();
    }


}

function about() {
    console.log("about page");
}

function clearInvoice() {
    console.log("flushing");
    simpleStorage.flush();
    window.location.href = baseURL;
}

function loadData(id) {
    if (simpleStorage.get(id)) {
        var val = simpleStorage.get(id);
        var html = $.parseHTML(val);
        $("#" + id).html(html);
    }
}

/* Create new row for invoice details*/
function addNewRow() {
    console.log("adding row");
    console.log("rowCount " + rowCount);
    rowCount++;
    var newRowItem = document.createElement('div');

    // Duplicate the previous row
    newRowItem = $("#" + (rowCount - 1)).clone();
    newRowItem.attr("id", rowCount);
    newRowItem.appendTo($(".rowItemContainer"));

    // Rename new ids
    $("#" + rowCount).find("#itemDesc" + (rowCount - 1)).attr("id", "itemDesc" + rowCount);
    $("#" + rowCount).find("#itemHour" + (rowCount - 1)).attr("id", "itemHour" + rowCount);
    $("#" + rowCount).find("#itemPrice" + (rowCount - 1)).attr("id", "itemPrice" + rowCount);
    $("#" + rowCount).find("#itemSum" + (rowCount - 1)).attr("id", "itemSum" + rowCount);
    $("#" + rowCount).find("#delete" + (rowCount - 1)).attr("id", "delete" + rowCount);

    // Reset new row data
    $("#itemDesc" + rowCount).html("");
    $("#itemHour" + rowCount).text("");
    $("#itemPrice" + rowCount).text("");
    $("#itemSum" + rowCount).text("");

    // Restrict to numeric
    $("#itemHour" + rowCount).numeric({negative: false});
    $("#itemPrice" + rowCount).numeric({negative: false});

    // Adjust delete icon, show previous, hide current
    $("#delete" + (rowCount - 1)).show();
    $("#delete" + rowCount).hide();

}

function saveTable() {
    for (var i = 1; i <= rowCount; i++) {
        if (!$("#" + i).length) {
            simpleStorage.deleteKey("itemDesc" + i);
            simpleStorage.deleteKey("itemHour" + i);
            simpleStorage.deleteKey("itemPrice" + i);
            continue;
        }
        simpleStorage.set("itemDesc" + i, $("#itemDesc" + i).html());
        simpleStorage.set("itemHour" + i, $("#itemHour" + i).text());
        simpleStorage.set("itemPrice" + i, $("#itemPrice" + i).text());
    }

    simpleStorage.set("rowCount", rowCount);
}

function loadTable(count) {
    console.log("loading table of " + count + rowCount);
    for (var i = 1; i <= count; i++) {
        var desc = simpleStorage.get("itemDesc" + i);
        var hour = simpleStorage.get("itemHour" + i);
        var price = simpleStorage.get("itemPrice" + i);

        $("#itemDesc" + i).html(desc);
        $("#itemHour" + i).text(hour);
        $("#itemPrice" + i).text(price);

        if (desc || hour || price) {
            addNewRow();
        }
    }
}

function isRowEmpty(row_num) {
    var desc = $("#itemDesc" + row_num).html().length;
    var hour = $("#itemHour" + row_num).text().length;
    var price = $("#itemPrice" + row_num).text().length;
    return desc + hour + price <= 0;
}


function renderTable() {
    console.log("rendering table");
    var subtotal = 0;
    var vat = 0;
    var total = 0;
    var vatp = $("#vatp").text() * 0.01;
    var current_row = "#" + rowCount;

    currency = $("#currency").text();

    for (var i = 1; i <= rowCount; i++) {
        var row = "#" + i;

        if (!$(row).length)
            continue; // If row doesn't exist, continue

        var desc = $("#itemDesc" + i).html();
        var hour = $("#itemHour" + i).text();
        var price = $("#itemPrice" + i).text();
        var sum = hour * price;

        $("#itemSum" + i).text(currency + (sum).toFixed(2));
        $("#subtotal").text(currency + (subtotal += sum).toFixed(2));
        $("#vat").text(currency + (vat = subtotal * vatp).toFixed(2));
        $("#total").text(currency + (total = subtotal + vat).toFixed(2));
        $("#invTotal").text(currency + (total = subtotal + vat).toFixed(2));
        $("#invTotal_p").text((total = subtotal + vat).toFixed(2));

    }

    if (!isRowEmpty(rowCount)) {
        addNewRow();
    }

    saveTable();
}

function deleteRow(row) {
    console.log("deleting row");
    var row = row.parent().parent().parent();
    row.remove();
    saveTable();
    renderTable();
}

function saveData(obj) {
    var id = obj.attr("id");
    var html = obj.html();
    var val = obj.text();

    switch (id) {
        case "invDateTop":
            $("#invDate").text(val); // sync if more than one
            simpleStorage.set(id, val); // save
            simpleStorage.set("invDate", val); // save
            break;

        case "invDate":
            $("#invDateTop").text(val); // sync if more than one
            simpleStorage.set(id, val); // save
            simpleStorage.set("invDataTop", val); // save
            break;

        case "dueDateTop":
            $("#dueDate").text(val); // sync if more than one
            simpleStorage.set(id, val); // save
            simpleStorage.set("dueDate", val); // save
            break;

        case "invToTop":
            $("#invTo").html(val); // sync if more than one
            simpleStorage.set(id, val); // save
            simpleStorage.set("invTo", val); // save
            break;

        case "invTo":
            $("#invToTop").html(val); // sync if more than one
            simpleStorage.set(id, val); // save
            simpleStorage.set("invToTop", val); // save
            break;

        case "dueDate":
            $("#dueDateTop").text(val); // sync if more than one
            simpleStorage.set(id, val); // save
            simpleStorage.set("invDataTop", val); // save
            break;

        default:
            $("#" + id).html(html); // sync if more than one
            simpleStorage.set(id, html); // save
            break;
    }
}

// Parse functions

function saveToMongo(intent) {

    /* INVOICE SAVE TO MONGO AJAX CALL */
    console.log("Saving to Mongo");

    // SHAMIM --> Set "paid" to "false". Check if correct.
    var paid = "false";

    // Prepare static data array
    var staticData = {};
    for (var i = 0; i < staticDataFields.length; i++) {
        staticData[staticDataFields[i]] = $("#" + staticDataFields[i]).html();
    }

    var totalPrice = $("#invTotal_p").text();
    var currency = $("#currency").text();
    var rowCount = simpleStorage.get("rowCount");

    // Prepare invoice table array
    var desc = [];
    var	hour = [];
    var price = [];
    for (var i = 1; i <= parseInt(rowCount); i++) {
        desc.push(simpleStorage.get("itemDesc" + i));
        hour.push(simpleStorage.get("itemHour" + i));
        price.push(simpleStorage.get("itemPrice" + i));
    }



    // Prepare Stripe data. First check if Stripe is connected.
    var spk, at, su;

    if (simpleStorage.get("spk") != "" && simpleStorage.get("at") != "") {
        spk = simpleStorage.get("spk");
        at = simpleStorage.get("at");
        su = simpleStorage.get("su");

        var saveToMongo = {
            type: 'create',
            paid: paid,
            staticData: staticData,
            desc: desc,
            hour: hour,
            price: price,
            totalPrice: totalPrice,
            currency: currency,
            rowCount: rowCount,
            spk: spk,
            at: at,
            su: su
        };
    } else {
        var saveToMongo = {
            type: 'create',
            paid: paid,
            staticData: staticData,
            desc: desc,
            hour: hour,
            price: price,
            totalPrice: totalPrice,
            currency: currency,
            rowCount: rowCount,
        };
    }


    $.ajax({
        type: "POST",
        url: baseURL + "/api.php",
        datatype: "JSON",
        data: saveToMongo,
        success: function (response) {
            console.log(response);
            var invoice = JSON.parse(response);
            if(invoice.invId){
                console.log(invoice.invId);
                invoiceID = invoice.invId;
                if(intent=="send") {
                    sendMail(invoice.invId);
                    return invoice.invId;
                } else {
                    window.location.href = baseURL + "/" + invoice.invId;
                }

            } else {
                // Error
            }
        },
        error: function (object, error) {
            console.log("Error");
        }
    });

}

function loadFromMongo(invId) {
    console.log("loading From Mongo");

    var mongoData = {
        type: 'get',
        invID: invId.toString()
    };

    $.ajax({
        type: "POST",
        url: baseURL + "/api.php",
        datatype: "JSON",
        data: mongoData,
        success: function (response) {
            console.log(response);
            if (response) {
                var invoice = JSON.parse(response);

                // Get rowCount
                rowCount = invoice["rowCount"];

                // Load static vars into fields
                for (var i = 0; i < staticDataFields.length; i++) {
                    var key = staticDataFields[i];
                    var val = invoice[key];

                    simpleStorage.set(key, val);
                    $("#" + key).removeAttr('contenteditable');
                    loadData(key);
                }

                // Load table
                for (var i = 1; i < rowCount; i++) {
                    console.log(rowCount);
                    var desc = invoice["itemDesc" + i];
                    var hour = invoice["itemHour" + i];
                    var price = invoice["itemPrice" + i];

                    simpleStorage.set("itemDesc" + i, desc);
                    simpleStorage.set("itemHour" + i, hour);
                    simpleStorage.set("itemPrice" + i, price);

                    // Clear editable items
                    $("#itemDesc" + i).removeAttr('contenteditable');
                    $("#itemHour" + i).removeAttr('contenteditable');
                    $("#itemPrice" + i).removeAttr('contenteditable');

                }

                // Load SPK
                console.log("Setting SPK from Mongo")
                simpleStorage.set("spk", invoice["spk"]);

                var loadCount = rowCount;

                if (rowCount > 1) {
                    rowCount = 1;

                    loadTable(loadCount);
                    console.log("rowCount after loading table: " + rowCount);

                    renderTable();
                    console.log("rowCount after rendering table: " + rowCount);
                }

                // Clear delete icons
                for (var i = 1; i < rowCount; i++) {
                    $("#delete" + i).remove();
                }

                $("#itemDesc" + i).removeAttr('contenteditable');
                $("#itemHour" + i).removeAttr('contenteditable');
                $("#itemPrice" + i).removeAttr('contenteditable');

                $("#vatp").removeAttr('contenteditable');
                $("#currency").removeAttr('contenteditable');

                $("#" + rowCount).remove();

                // TODO: Adjust menu
                $("#menuSendInvoice").remove();
                $("#menuGenerateInvoice").remove();

                // Leave end user functions

                renderButtons();

                flag = true;

                console.log("currency-2 -> "+currency);
                switch(currency) {
                    case "$":
                        invCurr="usd";
                        console.log("invCurr -> usd");
                        break;
                    case "\u20ac":
                        invCurr="eur";
                        console.log("invCurr -> eur");
                        break;
                    case "£":
                        invCurr="gbp";
                        console.log("invCurr -> gbp");
                        break;
                    default:
                        invCurr="";

                }

            }
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
            console.log("ID NOT FOUND");
        }
    });

}

function prepareSendView() {
    // TODO: From hint
    // TODO: To hint

    // TODO: Check if emailCopy exist in Mongo
    var emailCopy = "<p>Hi <span class=\"textHighlight\">there</span>,</p><br/>" +
        "<p>Was pleasure working with you on <span class=\"textHighlight\">" + $("#invFor").html() + "</span>. Appreciate your business and timely payment.</p><br/>" +
        // TODO: Insert invoice URL here
        "<p class=\"invLink\" id=\"invLink\">(The invoice link will be here)</p><br/>" +
        "<p>Sincerely,</p>" +
        "<p id=\"senderName\"><span class=\"textHighlight\">Jack Smith</span></p>";

    $("#emailBody").html(emailCopy);
}

function sendMail(invId) {
    var mailFrom = $("#sendFrom").val();
    var mailTo = $("#sendTo").val();
    //var mailCC = $("#mailCC").text();
    var mailSubject = "You've got invoice!";
    var mailBody = prepareEmailBody($("#emailBody").html().trim());

    // Message param
    var message = {
        from_email: mailFrom,
        //"from_name": "Invoice.to",  // TODO: Get name
        mailTo: mailTo,
        mailFrom: mailFrom,
        mailSubject: mailSubject,
        mailBody: mailBody
    };
    console.log("Sending");
    $.ajax({
        type: "POST",
        url: baseURL + "/sendmail.php",
        context: document.body,
        data: message,
        success: function (response) {
            console.log(response);
            if (response) {
                console.log("Message Sent");

                var mongoData = {
                    type: 'save_email',
                    invId: invId,
                    senderEmail: mailFrom,
                    receiverEmail: mailTo,
                };

                console.log("Save Emails to mongo");

                $.ajax({
                    type: "POST",
                    url: baseURL + "/api.php",
                    datatype: "JSON",
                    data: mongoData,
                    success: function (response) {
                        console.log(response);
                        if (response) {
                            console.log("Email Saved");
                            window.location.href = baseURL + "/" + invId;
                        }
                    },
                    error: function () {
                        console.log('Mail send Error');
                        alert('Mail send Error');
                    }
                });
            }
        },
        error: function () {
            console.log('Mail send Error');
            alert('Mail send Error');
        }
    });

}

function sendSummary() {
    // Prepare copy
    var summary = "This and that";

    // Setup MP
    $('.sendButton').magnificPopup({
        closeBtnInside: true
    });

    // Open new window
    $('#sendButton').click(function () {
        $('#sendSummary').click();
    });

}

function sendInvoice() {
    var from = $("#sendFrom").val();
    var to = $("#sendTo").val();
    var body = $("#emailBody").html();

    $("#sendButton").prop("disabled", true);

    if (!isValidEmailAddress(from) || !isValidEmailAddress(to) || $("#emailBody").text() == "") { // Validate form
        shake($("#sendPopup"));
        validateField($("#sendFrom"));
        validateField($("#sendTo"));
    } else {
        invoiceID = saveToMongo("send"); // Sends email here
    }

    $("#sendButton").prop("disabled", false);
}


function prepareEmailBody(html) {
    var wrapped = $("<div>" + html.trim() + "</div>");
    var paragraphs = $(wrapped).find("p");
    var result = "";

    for (var i = 0; i < paragraphs.length; i++) {
        if ($(paragraphs[i]).attr("id") == "invLink") {
            var url = baseURL + "/" + invoiceID;
            result += url;
        } else {
            var s = "<p>" + $(paragraphs[i]).text() + "</p>";
            result += s;
        }
    }

    return result;
}

function printInvoice() {
    // $(".invBody").css("min-width", "0");
    // $(".invBody").css("width", "90%");
    // $(".invContainer").css("margin", "20px auto 10px auto");

    setTimeout(function () {
        window.print();
    }, 1000);
}

function charge() {
    console.log("Charge");
}

function getToday(days) {
    var today = new Date();
    today.setDate(today.getDate() + days);

    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (mm < 10) {
        mm = '0' + mm
    }

    switch (mm) {
        case '01':
            mm = "Jan";
            break;
        case '02':
            mm = "Feb";
            break;
        case '03':
            mm = "Mar";
            break;
        case '04':
            mm = "Apr";
            break;
        case '05':
            mm = "May";
            break;
        case '06':
            mm = "Jun";
            break;
        case '07':
            mm = "Jul";
            break;
        case '08':
            mm = "Aug";
            break;
        case '09':
            mm = "Sep";
            break;
        case '10':
            mm = "Oct";
            break;
        case '11':
            mm = "Nov";
            break;
        case '12':
            mm = "Dec";
            break;
    }

    today = mm + ' ' + dd + ', ' + yyyy;
    return today;
}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
}

function shake(arg) {
    TweenMax.fromTo(arg, 0.01, {x: -2}, {x: 2, clearProps: "x", repeat: 20})
}

function validateField(field) {
    if (!isValidEmailAddress(field.val())) {
        field.removeClass("inputField");
        field.addClass("inputFieldError");
        shake(field);
    } else {
        field.addClass("inputField");
        field.removeClass("inputFieldError");
    }
}
