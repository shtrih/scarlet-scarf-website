;(function($, window, document, undefined) {
    // Плавная прокрутка страницы по якорям, но не для ссылок .prev, .next, на которые обработчик вешается ниже
    $.localScroll({
        filter: ':not(.prev,.next)',
        hash: true,
        easing:'easeOutQuad',
        duration: 2000
    });

    // Плавная прокрутка персонажей по якорям по горизонтали + css3-анимации
    var characters = $('#characters'),
        slideIndex = 0,
        getSlideIndex = function (el) {
            return Math.round(el.scrollLeft / $(window).width());
        },
        characterList = [],
        charactersContent = $('.content', characters)
    ;

    $('li', characters).each(function () {
        characterList.push($(this).find('.bg').last());
    });

    $('ul', characters).localScroll({
        target: '#characters ul',
        axis: 'x',
        hash: true,
        easing:'easeOutSine',
        duration: 900,
        done: function () {
            characterList[ slideIndex ].removeClass('animation-char-start');
            charactersContent.eq(slideIndex).removeClass('animation-content-start');

            slideIndex = getSlideIndex(this);
        }
    });

    // Стартуем css3-анимации, путём добавления соответствующих классов
    $('.prev,.next', characters).on('click', function () {
        var nextSlide = $(this).hasClass('prev') ? slideIndex - 1 : slideIndex + 1;

        characterList[ nextSlide ].addClass('animation-char-start');
        charactersContent.eq(nextSlide).addClass('animation-content-start');

        return false;
    });

    // Инициализация плагина для создания эффекта «парралакса»
    /* globals skrollr */
    skrollr.init({
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

    // Меню навигации
    var navigationBlock = $('#cd-vertical-nav'),
        contentSections = $('article'),
        navigationItems = $('a', navigationBlock)
    ;

    if (!$('.touch').length) {
        var updateNavigation = function () {
            contentSections.each(function () {
                var $this = $(this),
                    id = $this.attr('id'),
                    anchorSuffix = '-anchor',
                    activeSection = $('a[href="#' + id + '"], a[href="#' + id + anchorSuffix + '"]', navigationBlock).data('number') - 1
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
}(jQuery, window, document));
