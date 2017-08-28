/**
 * @author Kudakwashe Chambwe & Andreas Kolsto
 */

const __debug = false;
// __debug = true, to see log printout..

$(document).ready(function() {
  var $infographicWrapper = $(".infographic-wrapper");
  var $infographic = $("#infographic");
  var $header = $("#page-header");
  var isSmall = false;
  var widthMaxMobile = 667;
  var mobileInitialised = false;
  var desktopInitialised = false;
  var resizeTimer;
  var zoomedIn = false;
  var zoomedSectionID;

  /**
   * Disables the standard vertical scroll and activates horizontal instead.
   * @param e - event parameter
   */
  function horizonScroll(e) {
      e = window.event || e;
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      document.documentElement.scrollLeft -= (delta*40);
      document.body.scrollLeft -= (delta*40);
      e.preventDefault();
  }


  /**
   * Eventlisteners for the different browsers to ensure full browser support.
   */
  if (window.addEventListener) {
      /** IE9, Chrome, Safari, Opera */
      window.addEventListener("mousewheel", horizonScroll, false);
      /** Firefox */
      window.addEventListener("DOMMouseScroll", horizonScroll, false);
  } else {
      /** IE 6/7/8 */
      window.attachEvent("onmousewheel", horizonScroll);
  }


  /**
   * Checks the width of the screen to determine the device-in-use is a mobile or not.
   * @returns {boolean}
   */
  function isMobile() {
    var viewportWidth = $(window).width();


    return viewportWidth <= widthMaxMobile;

  }

  /** Checking what type of device is currently in use. */
  isMobile() ? initMobile() : initDesktop();

  /**
   * Initializes the content to be viewed optimally for desktop screens and other non-mobile screens. s
   */
  function initDesktop() {
    initDesktopNavigation();
    // makeSmall();
    // ^^ This function call determines the viewing mode once website is loaded.
    addWidthBuffer();
    initModalControls();


    $(".hotspot-trigger").off("click");

    $("#zoom-toggle").click(function() {
      if (!isSmall) {
        console.log("Going small");

        if(zoomedIn) _decreaseSection();
        makeSmall();

      } else {
        console.log("Going big");
        makeBig();
      }
    });

    $(".modal-overlay").click(closeModal);

    mobileInitialised = false;
    desktopInitialised = true;
  }


  /**
   *  Initialises the specific content to be viewed on mobile devices.
   */
  function initMobile() {
    $infographicWrapper.removeAttr("style"); // Remove styles added on desktop
    $infographic.removeAttr("style"); // Remove styles added by makeSmall() function

    $("#nav button").off("click").on("click", function() {
      var target = $(this).data("target");
      var targetOffset = $(target).offset().top;

      $("html, body").animate({
        scrollTop: targetOffset
      }, 300);
    });

    $(".back-to-top").click(function(e) {
      $("html, body").animate({
        scrollTop: 0
      }, 300);
      e.preventDefault();
    });
    $(".hotspot-trigger").click(function() {
      var $listItem = $(this).parent();
      var triggerHash = $(this).attr("href");
      var windowHash = window.location.hash;

      if ($listItem.hasClass("active")) {
        $listItem.removeClass("active");
        $listItem.find(".hotspot-content").removeAttr("style"); // Remove computed max-height
        window.location.hash = "overview";
        return false;
      }
    });

    mobileInitialised = true;
    desktopInitialised = false;
  }


  /**
   * Initialises the navigation of the different sections of the desktop version.
   */
  function initDesktopNavigation() {

    /** Determines the offset values for boundaries of the different sections */
    $(".infographic-section").each(function() {
      var offsetLeft = $(this).offset().left;
      var offsetDown = $(this).offset().top;

      $(this).data("offset", offsetLeft);
      $(this).data("topOffset", offsetDown);
    });

    /** Handles the click of the navigation buttons and triggers the necessary functions  */
    $("#nav button").off("click").on("click", function() {
      var target = $(this).data("target");
      var targetOffsetOffset = 0; // The amount of additional space to be left to the left of the targeted section

      var scaleVal = _calculateScaleFactor();
      // The value for how much we scale/zoom into the targeted section.

      var targetOffset = ($(target).data("offset") - targetOffsetOffset)* scaleVal;
      var targetOffsetDown = $(target).data("topOffset")*scaleVal;


      closeModal();

      if (isSmall) makeBig();

      $("html, body").animate({
        scrollLeft: targetOffset,
        scrollTop: targetOffsetDown
      }, 300);

      if(zoomedIn) {

        if(zoomedSectionID === this.id) {
          /** OPTION 1: User has clicked zoom twice on one section, so we zoom out. */
          _decreaseSection();

        } else {
          /** OPTION 2: User is zoomed on a section, but clicks "zoom in" on another section */
          $("#"+ zoomedSectionID).removeClass("zoomed");
          if (__debug) console.warn(">> Removed zoomed class for " + zoomedSectionID);

          _increaseSection(this.id, scaleVal);
        }

      } else {

        /** OPTION 3: User is not zoomed in and clicks zoom in. */
        zoomedIn = true;
        _increaseSection(this.id, scaleVal);

      }


    });
  }


  /**
   * Helper function that zooms into the section clicked.
   * @param sId - the id of the section to be increased/zoomed-in.
   * @param scaleValue - the scale factor/value determining how muc scaling is suffient for the current screen size.
   * @private
   */

  function _increaseSection(sId, scaleValue) {
    if (isSmall) makeBig();
    if (__debug) console.info(" Zooming into section -- " + sId);


    $(".infographic").css({
      transition: 'transform 0.01s ease-in-out',
      transform: "scale(" + scaleValue + ")"
    });

    zoomedSectionID = sId;
    $("#"+ sId).addClass("zoomed");
  }

  /**
   * Helper function that zooms out of the section clicked.
   * @private
   */
  function _decreaseSection() {

    if (__debug) console.info("Zooming out of current section --" + zoomedSectionID);
    zoomedIn = false;


    $(".infographic").css({
      transition: 'transform 0.01s ease-in-out',
      transform: "scale(1)",
      transformOrigin: "0 0"
    });


    $('#' + zoomedSectionID).removeClass("zoomed");
    if (__debug) console.warn(">> Removed zoomed class for " + zoomedSectionID);
    zoomedSectionID = "";

  }

  /**
   * Calculates the scaleFactor, which determines how much the different sections should zoom in/out upon click.
   * @returns {number}
   * @private
   */
  function _calculateScaleFactor() {

    var scaleFactor = 1.80;
    /** This is the initial scale for the standard Lenovo 13" laptop window size. */

    var hScale = window.innerHeight; // current window innerHeight
    var wScale = window.innerWidth; // current window innerWidth

    var config_height = 794; /** The innerHeight window size of the config screen */
    var config_width = 1600; /** The innerWidth window size of the config screen */

    if (hScale > config_height || wScale > config_width) {
      /** This means the current screen is bigger than config screen */
       scaleFactor = scaleFactor + ((Math.abs(wScale - hScale)/hScale));

    }

    if (__debug) console.log(hScale);
    if (__debug) console.log(wScale);
    if (__debug) console.log("ScaleFactor " + scaleFactor);

    return scaleFactor;

  }

  /**
   *  Adjusts the window width optimally for the current screen size.
   *  Helper function for making zoom in/out of sections.
   */
  function addWidthBuffer() {
    var adjustedWidth;


    if ($infographicWrapper.data("adjusted-width")) {
      adjustedWidth = $infographicWrapper.data("adjusted-width");

      if (!isSmall) {
        $infographicWrapper.css({
          width: adjustedWidth
        });
      }
    } else {

      /** var viewportWidth = $(window).width(); */
      var infographicWidth = $("#infographic").width();

      /** var lastSectionWidth = $(".section4").width(); */
      /** var bufferWidth = viewportWidth - lastSectionWidth; */

      adjustedWidth = infographicWidth;
      /** Original code had --> "adjustedWidth = infographicWidth + bufferWidth" */

      /** Bufferwidth is adding unwanted scroll space */

      $infographicWrapper.data("adjusted-width", adjustedWidth);

      if (!isSmall) {
        $infographicWrapper.css({
          width: adjustedWidth
        });
      }
    }
  }

  /**
   * Scales down the page to make a "zoom out" effect.
   * Toggles a class "small" to indicate current size.
   */
  function makeSmall() {

    var viewportWidth = $(window).width();
    var infographicWidth = 1786; /** Fixed value depending on background width size*/
    /** $infographic.width() returning incorrect number since jQuery upgrade */
    var scaleFactor = viewportWidth / infographicWidth;


    var bodyScrollLeft = $("body").scrollLeft();
    console.log("var = " + bodyScrollLeft);
    var scrollSpeed = (bodyScrollLeft > 0) ? 250 : 0;


    $("body").animate(scrollSpeed, function() {
      $infographicWrapper.css({
        width: "auto"
      });
      $infographic.css({
        transform: "scale(" + scaleFactor + ")",
        "webkitTransform": "scale(" + scaleFactor + ")"
      });
      $("body").addClass("small");
      isSmall = true;
    });

  }

  /**
   * Scales up the entire page to create a slightly zoomed effect of the entire page.
   * Uses the helper function addWidthBuffer() to zoom properly.
   */
  function makeBig() {
    isSmall = false;

    addWidthBuffer();

    $infographic.css({
      transform: "scale(1.5)",
      "webkitTransform": "scale(1.5)"
    });

    $("body").removeClass("small");
  }

  function initModalControls() {
    var $allHotspots = $(".hotspots > li");
    var $activeHotspot;
    var activeHotSpotIndex;
    var newHotspotIndex;
    var newHotspotTarget;

    $(".modal-controls .previous, .modal-controls .next").click(function() {
      $activeHotspot = $(".hotspots li.active");
      activeHotSpotIndex = $allHotspots.index($activeHotspot);
      newHotspotIndex = $(this).hasClass("previous") ? activeHotSpotIndex - 1 : activeHotSpotIndex + 1;

      if ($(this).hasClass("previous") && activeHotSpotIndex > 0 ||
          $(this).hasClass("next") && activeHotSpotIndex < $allHotspots.length) {
        newHotspotTarget = $allHotspots.eq(newHotspotIndex).find(".hotspot-trigger").attr("href");
        window.location = newHotspotTarget;
        disableEnablePrevNext($activeHotspot);
      }
    });

    $(".modal .close").click(function() {
      closeModal();
    });
  }

  function disableEnablePrevNext($activeHotspot) {
    var $allHotspots = $(".hotspots > li");
    activeHotSpotIndex = $allHotspots.index($activeHotspot);

    if (activeHotSpotIndex === 0) {
      if (__debug) console.log("First");
      $(".modal-controls .previous").attr("disabled", "disabled");
    } else {
      if (__debug) console.log("Not first");
      $(".modal-controls .previous").removeAttr("disabled");
    }

    if (activeHotSpotIndex === $allHotspots.length - 1) {
      if (__debug) console.log("Last");
      $(".modal-controls .next").attr("disabled", "disabled");
    } else {
      if (__debug) console.log("Not last");
      $(".modal-controls .next").removeAttr("disabled");
    }
  }

  function showModal(target) {
    var $trigger = $(".hotspots a[href='" + target + "']");
    var $triggerHotspot = $trigger.parent("li");
    var $target = $(target);
    var content = $target.html();

    var modalWidth = $(".modal").width();
    var scrollLeft = $(window).scrollLeft();
    var scrollTop = $(window).scrollTop();
    var windowWidth = $(window).width();
    var modalTop = scrollTop + 120; // modal should be 120px from the top of the visible viewport
    var modalLeft = scrollLeft + (windowWidth / 2) - (modalWidth / 2);

    $(".modal").css({
      left: modalLeft,
      top: modalTop
    });

    if ($target.length > 0) {
      $(".modal-content").html(content);
      $("body").addClass("modal-is-active");
      $(".hotspots li").removeClass("active");
      $triggerHotspot.addClass("active");

      disableEnablePrevNext($triggerHotspot);
    }
  }


  function closeModal() {
    $("body").removeClass("modal-is-active");
    $(".hotspots li").removeClass("active");
    window.location.hash = "overview";
    setTimeout(function() {
      $(".modal-content").empty(); // Empty the modal content after the modal's had time to transition out
    }, 200);
  }

  function expandContent(target) {
    var $trigger = $(".hotspots a[href='" + target + "']");
    var $triggerHotspot = $trigger.parent("li");
    var $hotspotContent = $(target);
    var contentHeight = $hotspotContent[0].scrollHeight;

    $(".hotspots li").removeClass("active");
    $(".hotspot-content").removeAttr("style"); // Close other panels by reverting their max-height back to 0
    $hotspotContent.css({
      "max-height": contentHeight
    });
    $triggerHotspot.addClass("active");
  }

  $(window).on("hashchange", function() {
    if (window.location.hash) {
      if (window.location.hash !== "#overview") {
        if (!isMobile()) {
          showModal(window.location.hash);
        } else {
          expandContent(window.location.hash);
        }
      } else {
        closeModal();
      }
    }
  }).trigger("hashchange");

  $(window).resize(function() {

    if (isMobile()) {
      if (!mobileInitialised) {
        initMobile();
      }
    } else {
      //setModalBodyMaxHeight();
      if (!desktopInitialised) {
        initDesktop();
      } else {
        if (isSmall) {
          makeSmall();
        }
      }
    }

    // When finished resizing, trigger hashchange to bring up modal if going from mobile to desktop
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      $(window).trigger("hashchange");
    }, 250);

  });

  // Doesn't work :(
  function setModalBodyMaxHeight() {
    var viewportHeight = $(window).height();
    var $modal = $(".modal");
    var $modalBody = $modal.find(".modal-body");
    var modalBodyTop = $modalBody.offset().top;
    var modalBodyMaxHeight = viewportHeight - modalBodyTop;

    $modalBody.css({
      "max-height": modalBodyMaxHeight
    });
  }

document.querySelector(".animation-substation").addEventListener("click", function() {
    this.classList.toggle("open");
    document.querySelector(".hotspot-4-1").classList.toggle("animate");
    document.querySelector(".hotspot-4-2").classList.toggle("animate");
    document.querySelector(".hotspot-4-3").classList.toggle("animate");
});

});
