/**
 * Load a captcha image into the specified element. 
 * @param captchaId
 */
function loadCaptcha() {
	rjQuery.ajax({
			url: '/core/ajaxserver.php',
			type: 'GET',
			cache: false,
			data: {
				'req' : 'getCaptcha'
			},
			headers: {
				'Cache-Control' : 'no-store, no-cache, must-revalidate'			
			},
			dataType: 'json',
			success: function(data, status, xhr) {
				var $captchaContainers = rjQuery(".captcha_container");
				
				rjQuery.each($captchaContainers, function() {
					var id = rjQuery(this).attr("id");
					var captchaId = id.substring("captcha_".length);
					
					var captchaImg = '<img class="captcha-image" src="' + data.imgURL + '"/>';
					rjQuery("#captchaRandom_" + captchaId).val(data.random);
					rjQuery("#captchaImgDiv_" + captchaId).html(captchaImg);		
					rjQuery("#captchaAudio_" + captchaId).attr("href", data.captchaAudio);
				});
				
				//in the case the image errors out, load it from the backup server
				rjQuery(".captcha-image").on("error", function(){
					rjQuery(this).attr("src", rjQuery(this).attr("src").replace(/^https:\/\/image\.captchas\.net/, 'https://image.backup.captchas.net'));
				});
			}
	});
}
rjQuery(document).ready(function() {
	loadCaptcha();
});
