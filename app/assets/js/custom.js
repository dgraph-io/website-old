////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// jQuery
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var $carouselPresentation = $(".carousel-presentation");
var $carouselPresentationImage = $(".carousel-presentation-image");
var $heroSliderImage = $('.carousel-hero-slider .image img');
var navigationPosition;
var navigationHasBackground;
var mainNavigation = $(".main-navigation");
var countDown = $(".count-down");
var blockWrapper = $('.block-wrapper');
var numbers = $(".numbers");
var body = $("body");

$(document).ready(function($) {
    "use strict";

//  Preloading

    Pace.on('done', function() {
        body.addClass("loading-done");
        $.each( $(".hero-slider .animate"), function (i) {
            var $this = $(this);
            $this.addClass("idle");
        });
    });

//  Initialize functions

    initializeReadMore();
    initializeOwl();

    centerSlider();

    if( mainNavigation.hasClass("bg-dark") || mainNavigation.hasClass("bg-white") ){
        navigationHasBackground = 1;
    }
    else {
        navigationHasBackground = 0;
    }

//  Read More

    $('a[data-toggle="tab"], a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
        initializeReadMore();
    });

    if( mainNavigation.length ){
        navigationPosition = Math.round( $('.main-navigation').offset().top );
    }

//  Count Down

    if(countDown.length ) {
        //var $this = countDown;
        var day = countDown.attr("data-day");
        var month = countDown.attr("data-month");
        var year = countDown.attr("data-year");
        var date = year+'/'+month+'/'+day;
        countDown.countdown(date, function(event) {
            $(".count-down .days").text( event.strftime('%D') );
            $(".count-down .hours").text( event.strftime('%H') );
            $(".count-down .minutes").text( event.strftime('%M') );
            $(".count-down .seconds").text( event.strftime('%S') );
        });
    }

    blockWrapper.addClass("show");

    $('#bio_detail').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget) // Button that triggered the modal
      var name = button.find('h3').text()
      var position = button.find('h5').text()
      var imageSource = button.find('img').attr('src')
      var description = button.siblings('p').html()
      var twitterHref = button.siblings('.social').find('.twitter').attr('href')
      var linkedinHref = button.siblings('.social').find('.linkedin').attr('href')
      var modal = $(this)

      $(this).find('.pic img').attr('src', imageSource)
      $(this).find('.name h1').text(name)
      $(this).find('.position h3').text(position)
      $(this).find('.description').html(description)
      $(this).find('.twitter').attr('href', twitterHref)
      $(this).find('.linkedin').attr('href', linkedinHref)

    })
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// On Scroll
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(window).scroll(function () {
    var scrollAmount = $(window).scrollTop() / 4;
    scrollAmount = Math.round(scrollAmount);

    if ($(window).width() > 768) {
        if($('.hero-slider').hasClass('has-parallax')){
            $(".carousel-hero-slider").css('top', scrollAmount + 'px');
        }
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// On Resize
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(window).on('resize', function(){
    centerSlider();
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initializeCounterUp(){
    $('.number figure').countTo({
        speed: 8000,
        refreshInterval: 50
    });
}

function initializeOwl(){

    $(".carousel-simple").owlCarousel({
        items: 1,
        nav: true,
        navText: ["",""]
    });

    $(".carousel-hero-slider").owlCarousel({
        items: 1,
        autoplay: false,
        autoplayTimeout: 5000,
        loop:true
    });

    $(".carousel-testimonials").owlCarousel({
        items: 1,
        nav: true,
        navText: ["",""],
        autoHeight: true
    });
    $(".carousel-gallery").owlCarousel({
        items: 4,
        margin: 20,
        responsive:{
            0:{
                items:1
            },
            767:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });
    var carouselFullwidth = $(".carousel-full-width");

    if( carouselFullwidth.length ){
        var dataItems = carouselFullwidth.attr("data-items");
        var items;
        var imgArray = [];
        if( dataItems ){
            items = dataItems;
        }
        else {
            items = 3;
        }

        carouselFullwidth.owlCarousel({
            margin: 0,
            items: items,
            responsive:{
                0:{
                    items:1
                },
                767:{
                    items:2
                },
                1200:{
                    items:items
                }
            }
        });
        $(".carousel-full-width .owl-item").each(function (i) {
            imgArray.push($(this).height());
        });
        $(".carousel-full-width .owl-item .image").each(function (i) {
            var maxHeight = Math.max.apply(Math, imgArray);
            if( $(this).parent().height() < maxHeight ){
                $(this).addClass("smaller");
                $(this).find("img").height( maxHeight );
            }
        });

    }

    $(".carousel-presentation-description").owlCarousel({
        items: 1,
        nav: true,
        navText: ["",""],
        mouseDrag: false,
        responsiveBaseElement: ".block"
    });

    $('.carousel-presentation-description .owl-next').on("click", function() {
        $(".carousel-presentation-image").trigger('next.owl.carousel');
    });
    $('.carousel-presentation-description .owl-prev').on("click", function() {
        $(".carousel-presentation-image").trigger('prev.owl.carousel');
    });
}

function centerSlider(){
    $('.carousel-hero-slider .image img').each(function() {

        var _this = $('.carousel-hero-slider .image img');

        var theImage = new Image();
        theImage.src = $heroSliderImage.attr("src");
        var imageWidth = theImage.width;
        var imageHeight = theImage.height;

        var ratio = imageWidth / imageHeight;

        var carouselHeroSlider = $('.carousel-hero-slider');
        $('.carousel-hero-slider .image').css('height', '');
        carouselHeroSlider.css('height', '');

        var viewPortWidth = $(window).width();
        var viewPortHeight = $(window).height();

        if( _this.width() > viewPortWidth && _this.height() >  viewPortHeight ){
            _this.css("width", viewPortHeight * ratio);
            _this.css("height", viewPortHeight );
        }
        else if( _this.width() < viewPortWidth && _this.height() >  viewPortHeight ){
            _this.css("width", viewPortWidth);
            _this.css("height", viewPortWidth / ratio );
        }
        else if( _this.width() > viewPortWidth && _this.height() <  viewPortHeight ){
            _this.css("width", viewPortHeight * ratio);
            _this.css("height", viewPortHeight );
        }
        else if( _this.width() < viewPortWidth && _this.height() <  viewPortHeight ){
            _this.css("width", viewPortWidth);
            _this.css("height", viewPortWidth / ratio );
        }
        else if( _this.width() < viewPortWidth && _this.height() ==  viewPortHeight ){
            _this.css("width", viewPortWidth);
            _this.css("height", viewPortWidth / ratio );
        }


    });
}


function initializeReadMore(){
    var collapseHeight;
    var $readMore = $(".read-more");
    if( $readMore.attr("data-collapse-height") ){
        collapseHeight =  parseInt( $readMore.attr("data-collapse-height"), 10 );
    }else {
        collapseHeight = 55;
    }
    $readMore.readmore({
        speed: 500,
        collapsedHeight: collapseHeight,
        blockCSS: 'display: inline-block; width: auto; min-width: 120px;',
        moreLink: '<a href="#" class="btn btn-default btn-framed btn-rounded">Show More<i class="icon_plus"></i></a>',
        lessLink: '<a href="#" class="btn btn-default btn-framed btn-rounded">Show Less<i class="icon_minus-06"></i></a>'
    });
}