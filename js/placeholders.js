var placeholders = [["invBy",       "Your Company"],
                    ["invDateTop",  "Jan 1, 2015"],
                    ["invDate",     "Jan 1, 2015"],
                    ["invToTop",    "Client Company"],
                    ["invTo",       "Client Company"],
                    ["invFor",      "Project description"],
                    ["invByName",   "by Your Company"],
                    ["invNumber",   "######"],
                    ["dueDateTop",  "Feb 14, 2015"],
                    ["dueDate",     "Feb 14, 2015"],
                    ["invRef",      "######"],
                    ["payDetails",  "Bank information"],
                    ["invTerms",    "14 days of notice"],
                    ["currency",    "$"],
                    ["vatp",        "10"]
                   ];

$(document).ready(function () {
    for (var i=0; i<placeholders.length; i++) {
        $("#"+placeholders[i][0]).attr("placeholder", placeholders[i][1]);    
    }
});