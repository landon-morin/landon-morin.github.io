$(".full img").on("click", function() {
  $(this).toggleClass("zoom");
});

$(document).ready(function() {
	$('body').addClass('js');
	var $menu = $('.collapse-nav'),
	$menulink = $('#nav-toggle');
  
	$menulink.click(function() {
	  $menulink.toggleClass('active');
	  $menu.toggleClass('active');

	  return false;
	});

  var boxAnimation = new $.Deferred();
  boxAnimation.done(function() {
      console.log("Done");
  });
  boxAnimation.fail(function() {
      console.log("Stopped");
  });


	if ($(".share > .twitter").length > 0) {
		var twitter = $(".share > .twitter");

    new GetShare({
			root: twitter,
			network: "twitter",
			share: {
			  url: "http://blog.FitStory.io" + twitter.attr('href'),
			  message: twitter.attr('title') + " - http://blog.FitStory.io" + twitter.attr('href')
			}
		});
	}

	if ($(".share > .facebook").length > 0) {
		var facebook = $(".share > .facebook");

		new GetShare({
			root: facebook,
			network: "facebook",
			share: {
			  url: "http://blog.FitStory.io" + facebook.attr('href'),
			  message: facebook.attr('title') + " - http://blog.FitStory.io" + facebook.attr('href')
			}
		});
	}

	if ($(".googleplus").length > 0) {
		var googleplus = $(".share > .googleplus");
		
		new GetShare({
			root: googleplus,
			network: "googleplus",
			share: {
			  url: "http://blog.FitStory.io" + googleplus,
			  message: googleplus.attr('title') + " - http://blog.FitStory.io" + googleplus.attr('href')
			}
		});
	}
});

// Global var to cache info about indicators for easy access. 
var indicators = [];

$(window).load(function(){
  if ($("#about-page").length <= 0) {
    //
    //	CREATE THE INDICATORS AND ADD TO PAGE
    //

    var rawIndicators = "";
    var $articles = $("h4");
    // Create a bubble for each article
    $articles.each(function(i) {
      var iInverse = $articles.length - i - 1;
      // Top margin is a function of the nodes before it, bottom is proportional to those after. determines stacking at top / bottom static positions
      var margins = 'margin: ' + ((i*1.5)+0.5) + 'em 0 ' + ((iInverse*1.5)+0.5) + 'em 0;'; 
      rawIndicators +=  '<a class="indicator indicator--upcoming" style="' + margins + '" href="#' + this.id + '"><span class="indicator-tooltip">' + $(this).text() + '</span></a>';
    });
    $("body").append(rawIndicators);

    // Utility function to calculate the proper top coordinate for a bubble when it's on the move (position: absolute)
    var getNodeTopPos = function(indicator, target) {
      var indMargTop = parseInt(indicator.css("margin-top").replace("px", ""));
      var targCenter =  target.outerHeight(false)/2;
      var indCenter = indicator.outerHeight(false)/2;
      return target.offset().top - indMargTop + targCenter - indCenter;
    }

    // 
    // INITIAL SET UP OF INDICATOR OBJECT
    //
    
    var calcIndicatorInfo = function(){

      indicators = []
      $(".indicator").each(function(){
        var o = {
          $indicator: $(this),
          $target: $( $(this).attr("href") ),
          $targetTitle: $( $(this).attr("href"))
        };
        // When it's abs positioned (on the move), this is the top pos
        o.absPos = getNodeTopPos(o.$indicator, o.$targetTitle); 

        // When it's abs positioned, at this scroll pos we should make the indicator fixed to the bottom
        o.absBottomStop = window.innerHeight - (o.absPos + o.$indicator.outerHeight(true));

        // Top / bottom stops for being 'viewable'
        o.viewableTopStop = o.$target.offset().top - window.innerHeight;
        o.viewableBottomStop = o.$target.offset().top + o.$target.outerHeight();
        indicators[indicators.length] = o;
        
      });
    };

    //
    // ON RESIZE FUNCTION - UPDATE THE CACHED POSITON VALUES
    //

    var initIndicators = function() {
      calcIndicatorInfo();
      // Bug fix - without timeout scroll top reports 0, even when it scrolls down the page to last page loaded position
      // http://stackoverflow.com/questions/16239520/chrome-remembers-scroll-position
      setTimeout(function(){
        var st = $(document).scrollTop();
        $(indicators).each(function(){
          if(st<=this.absPos && st>=(-1*this.absBottomStop))
            this.$indicator.removeClass("indicator--upcoming").removeClass("indicator--passed").addClass("indicator--active")
                .css({ "top" : this.absPos });
          else if(st>=(-1*this.absBottomStop)) 
            this.$indicator.removeClass("indicator--active").removeClass("indicator--upcoming").addClass("indicator--passed").css({ "top" : "" });
          else
            this.$indicator.removeClass("indicator--active").removeClass("indicator--passed").addClass("indicator--upcoming").css({ "top" : "" });
          
          if(st>=this.viewableTopStop && st<=(this.viewableBottomStop))
            this.$indicator.addClass("indicator--viewing");
          else
            this.$indicator.removeClass("indicator--viewing");
        });
      }, 0);
    }

    //
    // SCROLL FUNCTION - UPDATE ALL OF THE INDICATORS
    //

    var adjustIndicators = function() {
      var st = $(document).scrollTop();

      // The indicators that SHOULD be scrolling
      var anticipated = _.filter(indicators, function(o) { return (st<=o.absPos && st>=(-1*o.absBottomStop)) });

      // The $ elements that are indeed scrolling
      var active$ = $(".indicator--active");

      // Anything in anticipated that isn't in active should be activated ...
      var needsActivation = _.filter(anticipated, function(o) { return !_.contains(active$, o.$indicator[0]); })

      // ... And anything thats in active that isn't in anticipated needs to be stopped. 
      var anticipatedEls = _.pluck(anticipated, "$indicator");
      var needsDeactivation = _.filter(active$, function(o) { 
        return !_.find(anticipatedEls, function(e){ return e[0] == o }); 
      });

      // Do the Activation
      _.each(needsActivation, function(o) {
        o.$indicator
          .removeClass("indicator--upcoming").removeClass("indicator--passed")
          .addClass("indicator--active")
          .css({ "top" : o.absPos })
      });

      _.each(needsDeactivation, function(i$){
        var indicator = _.find(indicators, function(i) {
          return i.$indicator[0] == i$;
        });
        if(st>=indicator.absPos) {
          // Went off top. now passed. 
          indicator.$indicator.removeClass("indicator--active").addClass("indicator--passed").css({ "top" : "" });
        }
        else {
          // Went off bottom. now upcoming. 
          indicator.$indicator.removeClass("indicator--active").addClass("indicator--upcoming").css({ "top" : "" });
        }
      });

      $(indicators).each(function(){
        if(st>=this.viewableTopStop && st<=(this.viewableBottomStop))
          this.$indicator.addClass("indicator--viewing");
        else
          this.$indicator.removeClass("indicator--viewing");
      });

    }

    //
    // BIND EVENTS
    //

    $(document).scroll(function() {
      adjustIndicators();
    });
    $(window).resize(function() {
      initIndicators();
      adjustIndicators();
    });
    
    initIndicators();
    adjustIndicators();
    
    $(".indicator").click(function(){
      initIndicators();
      adjustIndicators();
    })
  }
});