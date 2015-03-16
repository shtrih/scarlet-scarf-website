// jquery.parallax.js
// @weblinc, @jsantell, (c) 2012

;(function( $ ) {
    $.fn.parallax = function ( userSettings ) {
        var options = $.extend( {}, $.fn.parallax.defaults, userSettings );

        return this.each(function () {
            var $this   = $(this),
                isX     = options.axis === 'x',
                origPos = ( $this.css( 'background-position' ) || '' ).split(' '),
                origX   = $this.css( 'background-position-x' ) || origPos[ 0 ],
                origY   = $this.css( 'background-position-y' ) || origPos[ 1 ],
                dist    = function () {
                    return -$( window )[ isX ? 'scrollLeft' : 'scrollTop' ]();
                },
                elpos = function() {
                    return $this.offsetParent().offset()[isX ? 'left' : 'top'];
                }
            ;
            $this
                .css( 'background-attachment', 'fixed' )
                .addClass( 'inview' );

            $this.bind('inview', function ( e, visible ) {
                $this[ visible ? 'addClass' : 'removeClass' ]( 'inview' );
            });

            $( window ).bind( 'scroll', function () {
                if ( !$this.hasClass( 'inview' )) { return; }

                var scrollPos = Math.abs(dist())
                    , startPos = (options.start === 'elstart' ? elpos() : options.start) + options.threshold
                    , stopPos  = options.stop === 'elend' ? startPos + $this.height() : options.stop
                ;
                if (scrollPos <= startPos && !scrollPos <= stopPos) {
                    return;
                }
                var xPos = isX ? ( dist() * options.speed ) + 'px' : origX,
                    yPos = isX ? origY : ( dist() * options.speed ) + 'px';
                $this.css( 'background-position', xPos + ' ' + yPos );
            });
        });
    };

    $.fn.parallax.defaults = {
        start: 0,
        stop: $( document ).height(),
        threshold: -100,
        speed: 1,
        axis: 'x'
    };

})( jQuery );
