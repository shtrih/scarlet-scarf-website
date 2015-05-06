;(function($, window, document, undefined) {
    $.localScroll({
        hash: true,
        easing:'easeOutQuad',
        duration: 2000
    });

    skrollr.init({
        // skrollrBody: 'brief',
        smoothScrolling: false,
        forceHeight: false,
        // duration: 100,
        mobileDeceleration: 0.004/*,
        render: function(data) {
            // Log the current scroll position.
            // console.log(data);
            $('#info').text(data.curTop);
        }*/
    });

    /*
    $('<div/>', {
        id: 'info',
        text: 0,
        css: {
            position: 'fixed',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            padding: '20px',
            zIndex: '9999'
        }
    }).appendTo('body');
    */

    var navigationBlock = $('#cd-vertical-nav'),
        contentSections = $('article'),
        navigationItems = $('a', navigationBlock)
    ;

    if (!$('.touch').length) {
        var updateNavigation = function () {
            contentSections.each(function () {
                var $this = $(this),
                    id = $this.attr('id'),
                    activeSection = $('a[href="#' + id + '"]', navigationBlock).data('number') - 1
                ;

                if (($this.offset().top - $(window).height() / 2 < $(window).scrollTop()) && ($this.offset().top + $this.height() - $(window).height() / 2 > $(window).scrollTop())) {
                    navigationItems.eq(activeSection).addClass('is-selected');
                } else {
                    navigationItems.eq(activeSection).removeClass('is-selected');
                }
            });
        };

        updateNavigation();
        $(window).on('scroll', function() {
            updateNavigation();
        });
    }

    // open-close navigation on touch devices
    $('.touch .cd-nav-trigger').on('click', function () {
        navigationBlock.toggleClass('open');
    });
    // close navigation on touch devices when selectin an elemnt from the list
    $('.touch #cd-vertical-nav a').on('click', function () {
        navigationBlock.removeClass('open');
    });

    $('.carousel ul').anoSlide({
        items: 1,
        speed: 900,
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
}(jQuery, window, document));
