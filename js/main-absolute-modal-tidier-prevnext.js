$(document).ready(function(e) {
	var $infographicWrapper = $(".infographic-wrapper");
	var $infographic = $("#infographic");
	var $header = $("#page-header");
	var isSmall = false;
	var widthMaxMobile = 667;
	var mobileInitialised = false;
	var desktopInitialised = false;
	var resizeTimer;				

	function isMobile() {
		var viewportWidth = $(window).width();

		if( viewportWidth > widthMaxMobile) {
			return false;
		} else {
			return true;
		}
	}

	if( isMobile() ) {
		initMobile();
	} else {
		initDesktop();
	}

	function initDesktop() {
		initNavigation();
		//makeSmall();
		addWidthBuffer();
		initModalControls();

		$(".hotspot-trigger").off("click");

		$("#zoom-toggle").click(function() {
			if(! isSmall) {
				console.log("Going small");
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

	function initMobile() {
		$infographicWrapper.removeAttr("style"); // Remove styles added on desktop
		$infographic.removeAttr("style"); // Remove styles added by makeSmall() function
		
		// TODO: Remove redundancy with initNavigation() desktop function?
		$("#nav button").off("click").on("click", function() {
			var target = $(this).data("target");
			var targetOffset = $(target).offset().top;

			$("html, body").animate({scrollTop: targetOffset}, 300);
		});

		$(".back-to-top").click(function(e) {
			$("html, body").animate({scrollTop: 0}, 300);
			e.preventDefault();
		})

		$(".hotspot-trigger").click(function() {
			var $listItem = $(this).parent();
			var triggerHash = $(this).attr("href");
			var windowHash = window.location.hash;

			if($listItem.hasClass("active")) {
				$listItem.removeClass("active");
				window.location.hash = "overview";
				return false;
			}
		})

		mobileInitialised = true;
		desktopInitialised = false;
	}

	function initNavigation() {
		$(".infographic-section").each(function() {
			var offsetLeft = $(this).offset().left;
			$(this).data("offset", offsetLeft);
		})

		$("#nav button").off("click").on("click", function() {
			var target = $(this).data("target");
			var targetOffsetOffset = 200; // The amount of additional space to be left to the left of the targeted section
			var targetOffset = $(target).data("offset") - targetOffsetOffset;

			if(! isSmall) {
				$("html, body").animate({scrollLeft: targetOffset}, 300);
			} else {
				makeBig();
				setTimeout(function() {
					$("html, body").animate({scrollLeft: targetOffset}, 400);
				}, 300); // allow enough time for the infographic to expand
			}
		});
	}

	function addWidthBuffer() {
		var adjustedWidth;

		if($infographicWrapper.data("adjusted-width")) {
			adjustedWidth = $infographicWrapper.data("adjusted-width");

			if(! isSmall) {
			    $infographicWrapper.css({width: adjustedWidth});
			}
		} else {
			var viewportWidth = $(window).width();
			var infographicWidth = $("#infographic").width();
			var lastSectionWidth = $(".section3").width();

			var bufferWidth = viewportWidth - lastSectionWidth;
			adjustedWidth = infographicWidth + bufferWidth;

			$infographicWrapper.data("adjusted-width", adjustedWidth);

			if(! isSmall) {
				$infographicWrapper.css({width: adjustedWidth});
			}
		}
	}

	function makeSmall() {		
		var viewportWidth = $(window).width();
		var infographicWidth = 2938; // $infographic.width() returning incorrect number since jQuery upgrade
		var scaleFactor = viewportWidth / infographicWidth;
		var bodyScrollLeft = $("body").scrollLeft();
		var scrollSpeed = (bodyScrollLeft > 0) ? 250 : 0;

		$("body").animate({scrollLeft: 0}, scrollSpeed, function() {
			$infographicWrapper.css({width: "auto"});
			$infographic.css({transform : "scale(" + scaleFactor + ")"});
			$infographic.css({"webkitTransform" : "scale(" + scaleFactor + ")"});						
			$("body").addClass("small");
			isSmall = true;
		});
	}

	function makeBig() {
		isSmall = false;
		
		addWidthBuffer();
		
		$infographic.css({transform : "scale(1)"});
		$infographic.css({"webkitTransform" : "scale(1)"});

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

			if( $(this).hasClass("previous") && activeHotSpotIndex > 0 || 
			$(this).hasClass("next") && activeHotSpotIndex < $allHotspots.length) {
				newHotspotTarget = $allHotspots.eq(newHotspotIndex).find(".hotspot-trigger").attr("href");
				window.location =  newHotspotTarget;
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

		if(activeHotSpotIndex == 0) {console.log("First")
			$(".modal-controls .previous").attr("disabled", "disabled");
		} else {console.log("Not first")
			$(".modal-controls .previous").removeAttr("disabled");
		}

		if(activeHotSpotIndex == $allHotspots.length - 1) {console.log("Last")
			$(".modal-controls .next").attr("disabled", "disabled");
		} else {console.log("Not last")
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
		var modalTop = scrollTop + 120;  // modal should be 120px from the top of the visible viewport
		var modalLeft = scrollLeft + (windowWidth / 2);

		$(".modal").css({left : modalLeft, top: modalTop});

		if($target.length > 0) {
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

		$(".hotspots li").removeClass("active");
		$triggerHotspot.addClass("active");
	}

	$(window).on("hashchange", function() {
		if(window.location.hash) {
			if(window.location.hash !== "#overview") {
				if(! isMobile() ) {
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

		if( isMobile() ) {
			if(! mobileInitialised) {
				initMobile();
			}
		} else {
			//setModalBodyMaxHeight();
			if(! desktopInitialised) {
				initDesktop();
			} else {
				if(isSmall) {
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

		$modalBody.css({"max-height" : modalBodyMaxHeight});
	}

});