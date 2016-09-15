(function() {
    var body = document.body;
    var content = document.querySelector('.content-wrap');
    var openBtn = document.getElementById('open-button');
    var closeBtn = document.getElementById('close-button');

    function init() {
        initEvents();
    }

    function initEvents() {
        openBtn.addEventListener( 'click', toggleMenu );
        if (closeBtn) {
            closeBtn.addEventListener( 'click', toggleMenu );
        }

        // Close menu after click
        $("#icon-list").children().each(function() {
            $(this).click(function() {
                toggleMenu();
            });
        });

        // close the menu element if the target it´s not the menu element or one of its descendants..
        body.addEventListener('click', function(event) {
            var target = event.target;
            if (classie.has(body, 'show-menu') && target !== openBtn) {
                toggleMenu();
            }
        });
    }

    function toggleMenu() {
        if (classie.has(body, 'show-menu')) {
            classie.remove(body, 'show-menu');
        } else {
            classie.add(body, 'show-menu');
        }
    }

    init();

})();