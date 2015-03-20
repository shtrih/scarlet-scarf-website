$(function () {
    $.localScroll({
        hash: true
    });

    $('.carousel ul').anoSlide({
        items: 1,
        speed: 1000,
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
