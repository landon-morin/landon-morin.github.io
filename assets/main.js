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