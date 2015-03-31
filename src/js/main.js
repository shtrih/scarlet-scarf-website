$(function () {
    $.localScroll({
        hash: true,
        easing:'easeInOutCirc'
    });

    if (!($(document).width() < 1024 || $(document).height() < 640)) {
        $.stellar({
            // horizontalOffset: 40,
            // verticalOffset: 0
            hideDistantElements: true,
            horizontalScrolling: false,
            responsive: true
        });
    }

    var navigationBlock = $('#cd-vertical-nav'),
        contentSections = $('article'),
        navigationItems = $('a', navigationBlock)
    ;

    function updateNavigation() {
        contentSections.each(function () {
            var $this = $(this),
                anchor = $('a[name]', $this),
                activeSection = $('a[href="#' + anchor.attr('name') + '"]', navigationBlock).data('number') - 1
            ;

            if (($this.offset().top - $(window).height() / 2 < $(window).scrollTop()) && ($this.offset().top + $this.height() - $(window).height() / 2 > $(window).scrollTop())) {
                navigationItems.eq(activeSection).addClass('is-selected');
            } else {
                navigationItems.eq(activeSection).removeClass('is-selected');
            }
        });
    }

    updateNavigation();
    $(window).on('scroll', function() {
        updateNavigation();
    });

    // open-close navigation on touch devices
    $('.touch .cd-nav-trigger').on('click', function () {
        $('.touch #cd-vertical-nav').toggleClass('open');

    });
    // close navigation on touch devices when selectin an elemnt from the list
    $('.touch #cd-vertical-nav a').on('click', function () {
        $('.touch #cd-vertical-nav').removeClass('open');
    });

    $('.carousel ul').anoSlide({
        items: 1,
        speed: 500,
        prev: 'a.prev',
        next: 'a.next',
        // lazy: true,
        // auto: 4000,
        onConstruct: function(instance) {
            var paging = $('<div/>').addClass('paging fix').css({
                position: 'absolute',
                top: 1,
                left:50 + '%',
                width: instance.slides.length * 40,
                marginLeft: -(instance.slides.length * 40) / 2
            });

            /* Build paging */
            var onPagingClick = function () {
                instance.stop().go($(this).data('index'));
            };
            for (var i = 0, l = instance.slides.length; i < l; i++) {
                var a = $('<a/>').data('index', i).appendTo(paging).on('click', onPagingClick);

                if (i === instance.current) {
                    a.addClass('current');
                }
            }

            instance.element.parent().append(paging);
        },
        onStart: function (ui) {
            var paging = $('.paging');

            paging.find('a').eq(ui.instance.current).addClass('current').siblings().removeClass('current');
        }
    });
});
