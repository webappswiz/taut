/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function ($) {
	 "use strict";
    $.fn.btParallax = function (options) {
        $(this).each(function () {
            var btParallax = this;
            var adv = $(this);
            this.win_height = $(window).height();
            this.win_width = $(window).width();
            this.para_height = adv.height(), this.para_width = adv.width();
            this.ePos, this.eSize, this.isThumClick = false, this.isNavClick = true, this.enableControlButton = false;
            this.eTopCurrent = adv.offset().top - $(window).scrollTop(), this.eTopCenter = ((this.win_height - this.para_height) / 2), this.eLeftCurrent = adv.offset().left;
            this.back_posY, this.back_posX;
            this.s, this.timer = null;
            this.background = adv.find('.parallax-background');
            this.background_img = adv.find('.parallax-background img');
            this.c_pos = adv.find('.parallax-content-in');
            this.itemIndex = 0;
            this.list, this.row_list, this.image_list, this.listAnimate = false;
			var videoContain = '';
			var s;
			if(options.contentType=='video'){
				
				videoContain = adv.find('.content-show-large .item-contain');
				adv.videoCache = videoContain.html();
				videoContain.find('video').each(function () 
				{ 
				   this.pause();
			    });			
				videoContain.html('');			
			}
            //initical js for module.
            this.renderParallax = function () {
                if (options.slideSize.type === 'full') {
                    adv.find('.parallax-block-content').css({'width': adv.parent().parent().width(), 'marginLeft': adv.parent().parent().offset().left});
                }
                if (options.parallaxType === 'static') {
                    adv.find('.open-btn').removeClass('open-btn').addClass('hidden');
                }

                adv.find('.open-btn').click(function () {
                    btParallax.openParallaxContent(this);
                    return false;
                });
                adv.find('.close-btn').click(function () {
                    btParallax.closeButtonClick(this);
                });
                adv.find('.nav-next').click(function () {
                    btParallax.navNextClick(this);
                });
                adv.find('.nav-prev').click(function () {
                    btParallax.navPrevClick(this);
                });
                adv.find('.thumb').on('click', function (e) {
                    btParallax.imgThumbClick(e, this);
                });
                $(window).resize(function () {
                    btParallax.responsive();
                });
            };
            //Ham xu ly khi nut bam open tren parallax duoc click de full noi dung
            this.openParallaxContent = function (e) {
                adv.css('z-index', '999999');
                //add effect text
                adv.find('.parallax-block-content h1').addClass('out-pos').removeClass('default-pos');
                adv.find('.parallax-background').addClass('in-parallax');
                adv.find('.parallax-block-content img').addClass('out-pos').removeClass('default-pos');
                adv.find('.parallax-block-content p').addClass('out-pos').removeClass('default-pos');
                adv.find('.parallax-block-content').addClass('out-pos').removeClass('default-pos');
                setTimeout(function () {
                    adv.find('.parallax-block-content h1').removeClass('out-pos').addClass('in-pos');
                    adv.find('.parallax-block-content img').removeClass('out-pos').addClass('in-pos');
                    adv.find('.parallax-block-content p').removeClass('out-pos').addClass('in-pos');
                    adv.find('.parallax-block-content').removeClass('out-pos').addClass('in-pos');
                }, 5000);
                $('body').addClass('no-scroll');
                $('html').addClass('no-scroll');
                btParallax.para_height = adv.height(), btParallax.para_width = adv.width();
                btParallax.eTopCurrent = adv.offset().top - $(window).scrollTop();
                btParallax.eTopCenter = ((btParallax.win_height - btParallax.para_height) / 2);
                btParallax.eLeftCurrent = adv.offset().left;
				
                if (btParallax.eTopCurrent > btParallax.eTopCenter) {
                    s = btParallax.eTopCurrent - btParallax.eTopCenter;
                } else {
                    s = btParallax.eTopCenter - btParallax.eTopCurrent;
                }
                btParallax.back_posY = adv.find('.parallax-background').position().top;
                btParallax.back_posX = adv.find('.parallax-background').position().left;
                if (options.slideSize.type === 'full') {
                    var cssOpen = {
                        'position': 'fixed',
                        'z-index': 99999,
                        'width': '100%',
                        'height': btParallax.para_height,
                        'top': btParallax.eTopCurrent,
                        'left': 0
                    };
                } else {
                    var cssOpen = {
                        'position': 'fixed',
                        'z-index': 99999,
                        'width': btParallax.para_width,
                        'height': btParallax.para_height,
                        'top': btParallax.eTopCurrent,
                        'left': btParallax.eLeftCurrent
                    };
                }
                var espeed = s * options.speed;
                if (espeed < 500) {
                    espeed = 500;
                }
                adv.css(cssOpen).animate({'top': btParallax.eTopCenter},
                {
                    duration: espeed,
                    step: function (now, fx) {
                        var walk = Math.round(((now - btParallax.eTopCenter) / s) * btParallax.back_posY);
                        adv.find('.parallax-background').css({left: btParallax.back_posX + 'px', top: walk + 'px'});
                    },
                    done: function () {
                        setTimeout(function () {
                            adv.animate({'top': 0, 'height': '100%'}, {
                                duration: 1000,
                                step: function (now, fx) {
                                },
                                done: function () {
                                    if (options.slideSize.type === 'full') {
                                        btParallax.openParallaxContentLoad();
                                    } else {
                                        setTimeout(function () {
                                            adv.animate({'left': 0, 'width': '100%'}, {
                                                duration: 1000,
                                                step: function (now, fx) {
                                                },
                                                done: function () {
                                                    btParallax.openParallaxContentLoad();
                                                }
                                            }, 'easeInOutQuint');
                                        }, 200);
                                    }
                                }
                            }, 'easeInOutQuint');
                        }, 200);
                    }
                },
                'easeInOutQuint');
            };
			this.setGalleryGridLayout = function setGalleryGridLayout(){
			
				options.item_height = $(window).height()-options.centerPadding*2;
				options.sub_item_size = Math.floor((options.item_height-options.spacing*2)/3+options.spacing);
				options.item_width = options.sub_item_size*5;
				
				$('.parallax-row-w1,.parallax-row.box2',adv).width(options.sub_item_size*2);
				$('.parallax-row-w2',adv).width(options.sub_item_size);
				$('.parallax-row-w3,.parallax-row.box1',adv).width(options.sub_item_size*3);
				$('.parallax-col .thumb',adv).width(options.sub_item_size-options.spacing).height(options.sub_item_size-options.spacing);
				$('.parallax-col .thumb.w2',adv).width(options.sub_item_size*2-options.spacing);
				$('.parallax-col .thumb.w3',adv).height(options.sub_item_size*2-options.spacing).width(options.sub_item_size-options.spacing);
				$('.parallax-col .thumb',adv).css('margin',options.spacing+'px '+options.spacing+'px 0 0');
				
				
                if (options.contentType === 'image') {
                    btParallax.list = adv.find('.parallax-col');
                    btParallax.list.each(function (index) {
                        $(this).find('.parallax-row').css({'height': options.item_height});
                        $(this).css({'width': options.item_width + 'px', 'margin-right': options.spacing});
                    });
                    if (btParallax.list.length > 0) {
                        btParallax.c_pos.width((options.item_width + options.spacing) * btParallax.list.length);
                    } else {
                        btParallax.c_pos.css('width', '100%');
                    }
                    btParallax.c_pos.css('height', ((options.item_height + options.spacing) * options.rows - options.spacing + 20) + 'px');
                    if (btParallax.win_height > ((options.item_height + options.spacing) * options.rows - options.spacing + 40)) {
                        btParallax.c_pos.css('margin-top', (btParallax.win_height - ((options.item_height + options.spacing) * options.rows + options.spacing)) / 2 + 'px');
                        adv.find('.button-wrap .close-btn').removeClass('has-scroll');
                        adv.find('.nav-wrap-in.next').removeClass('has-scroll');
                    } else {
                        btParallax.c_pos.css('margin-top', '20px');
                        adv.find('.button-wrap .close-btn').addClass('has-scroll');
                        adv.find('.nav-wrap-in.next').addClass('has-scroll');
                    }
                    if ((options.item_width + options.spacing) * btParallax.list.length < btParallax.win_width) {
                        btParallax.c_pos.parent().css('left', (btParallax.win_width - (options.item_width + options.spacing) * btParallax.list.length) / 2 + 'px');
                    }
                }
			
			}
            this.openParallaxContentLoad = function () {
                btParallax.enableControlButton = true;
                btParallax.image_list = adv.find('.parallax-content-in .show_box');
				btParallax.setGalleryGridLayout();
				
				$(window).resize(function(){
					btParallax.c_pos.fadeOut('slow',function(){
						btParallax.c_pos.fadeIn('slow');
					});
					btParallax.setGalleryGridLayout();
					adv.find('.content-show-large .item-contain video:first').trigger('loadedmetadata.resize');
				})
				
                if (options.contentType === 'video') {
                    btParallax.list = adv.find('.video-contain');
                    adv.find('.parallax-content-wrap').css({'overflow': 'hidden'});
                    adv.find('.content-show-large').css({'backgroundColor': '#000000'});
                }


                adv.find('.parallax-content-wrap').fadeIn(500, function () {
                    adv.find('.overlay-loading').hide();
                    if (options.contentType === 'image') {
                        adv.find('.parallax-content').removeClass('hidden').addClass('image-gallery');
                        btParallax.loadImageItems(true, function () {
                            btParallax.isThumClick = true;
                            adv.find('.control-button .button-wrap').fadeIn(1000);
                            if ((options.item_width + options.spacing) * btParallax.list.length > btParallax.win_width) {
                                adv.find('.nav-wrap').removeClass('hidden');
                                btParallax.listAnimate = true;
                                btParallax.animateStart();
                            }
                        });
                    }
                    if (options.contentType === 'video') {
                        adv.find('.parallax-content').removeClass('hidden').addClass('video-list');
                        adv.find('.content-show-large .item-contain').html(adv.videoCache);
						adv.find('.content-show-large .item-contain video:first').each(function(){
							this.play();
						})
                        adv.find('.content-show-large .item-contain .video-inner').show();
                        adv.find('.content-show-large').removeClass('hidden').fadeIn(300);
                        adv.find('.content-show-large .loading').css({'position': 'absolute', 'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)'}).fadeIn(300);
                        adv.find('.control-button .button-wrap').fadeIn(1000);
                        if (btParallax.list.length > 1) {
                            adv.find('.nav-wrap').removeClass('hidden');
                            adv.find('.nav-prev').addClass('prev-video');
                            adv.find('.nav-next').addClass('next-video');
                        }
						adv.find('.content-show-large .item-contain video:first').on('loadedmetadata.resize', function(){
							adv.find('.content-show-large .item-contain video').each(function(){
								if ($(window).width() * $(this).height()/ $(this).width() < $(window).height()) {
									$(this).css({'width':'auto','height':'100%'});
									$(this).css({'margin-left':(($(window).width()-$(this).width())/2) +'px','margin-top':0});
								}else{
									$(this).css({'width':'100%','height':'auto'});
									$(this).css({'margin-top':(($(window).height()-$(this).height())/2) +'px','margin-left':0});
								}
							});	
						});						
                    }
                    if (options.contentType === 'postContent') {
                        adv.find('.parallax-content').removeClass('hidden').addClass('post-content');
                        btParallax.loadImageItems(true, function () {
                            adv.find('.control-button .button-wrap').fadeIn(1000);
                            if ((options.item_width + options.spacing) * btParallax.list.length > btParallax.win_width) {
                                adv.find('.nav-wrap').removeClass('hidden');
                                adv.find('.nav-prev').addClass('prev-post');
                                adv.find('.nav-next').addClass('next-post');
                            }
                        });
                    }
                });
            };
            //Ham xu ly khi nun close duoc click de dong full noi dung
            this.closeButtonClick = function (e) {
                if ($(e).hasClass('close-image-info')) {
                    adv.find('.parallax-content-wrap').css('overflow-y', 'auto');
                    adv.find('.nav-prev').removeClass('prev-large');
                    adv.find('.nav-next').removeClass('next-large');
                    adv.find('.content-show-large.show').animate({'top': btParallax.ePos.top, 'left': btParallax.ePos.left, 'width': 0, 'height': 0}, 500, function () {
                        $(this).addClass('hidden').removeClass('show');
                        adv.find('.close-btn').removeClass('close-image-info');
						
                      //  adv.find('.content-show-large .item-contain').html('');
						
                        setTimeout(function () {
                            if (btParallax.listAnimate) {
                                btParallax.animateStart();
                                adv.find('.nav-wrap').removeClass('hidden');
                            } else {
                                adv.find('.nav-wrap').addClass('hidden');
                            }
                            btParallax.isThumClick = true;
                        }, 100);
                    });
                    return;
                }
                btParallax.enableControlButton = false;
                $(e).parent().fadeOut();
                adv.find('.nav-wrap').addClass('hidden');
                if (options.contentType === 'image' || options.contentType === 'postContent') {
                    btParallax.loadImageItems(false, function () {
                        btParallax.row_list.addClass('in-pos').removeClass('out-pos');
                        btParallax.closeParallaxContent();
                    });
                } else {
                    btParallax.closeParallaxContent();
                }
            };
            this.closeParallaxContent = function () {
                adv.find('.parallax-content-wrap').fadeOut(500, function () {
                    $('body').removeClass('no-scroll');
                    $('html').removeClass('no-scroll');
                    if (options.slideSize.type === 'full') {
                        btParallax.parallaxContentZoomOutHeight();
                    } else {
                        btParallax.parallaxContentZoomOutWidth(btParallax.parallaxContentZoomOutHeight());
                    }
                });
            };
            this.parallaxContentZoomOutWidth = function (callback) {
                adv.animate({'left': (btParallax.win_width - btParallax.para_width) / 2, 'width': btParallax.para_width},
                {
                    duration: 500,
                    step: function (now, fx) {
                        adv.find('.parallax-background').css({left: btParallax.back_posX + 'px', top: '0px'});
                    },
                    done: function () {
                        callback;
                    }
                },
                'easeInOutQuint');
            };
            this.parallaxContentZoomOutHeight = function () {
				if (options.contentType === 'video') {
					adv.find('.content-show-large .item-contain').html('');
				}
                if (adv.parent().hasClass('full-width')) {
                    btParallax.win_width = $(window).width();
                    adv.parent().css('width', btParallax.win_width);
                }
                adv.find('.parallax-background').css({left: btParallax.back_posX + 'px', top: '0px'});
                adv.find('.nav-wrap').addClass('hidden');
                adv.animate({'top': btParallax.eTopCenter, 'height': btParallax.para_height}, 1000, 'easeInOutQuint', function () {
                    setTimeout(function () {
                        var espeed = s * options.speed;
                        if (espeed < 500) {
                            espeed = 500;
                        }
                        var eleftC = btParallax.eLeftCurrent;
                        if (options.slideSize.type === 'full') {
                            eleftC = 0;
                        }
                        adv.animate({'top': btParallax.eTopCurrent, 'left': eleftC},
                        {
                            duration: espeed,
                            step: function (now, fx) {
                                var walk = Math.round(((now - btParallax.eTopCenter) / s) * btParallax.back_posY);
                                if (walk < 0)
                                    walk = walk * (-1);
                                adv.find('.parallax-background').css({left: btParallax.back_posX + 'px', top: '0px'});
                            },
                            done: function () {
								adv.find('.parallax-background').removeClass('in-parallax');
                                adv.find('.parallax-block-content').addClass('default-pos').removeClass('in-pos');
                                adv.find('.parallax-block-content h1').addClass('default-pos').removeClass('in-pos');
                                adv.find('.parallax-block-content img').addClass('default-pos').removeClass('in-pos');
                                adv.find('.parallax-block-content p').addClass('default-pos').removeClass('in-pos');
                                if (options.contentType === 'image') {
                                    adv.find('.parallax-content').addClass('hidden').removeClass('image-gallery');
                                    btParallax.animateStop();
                                    adv.find('.open-btn').fadeIn();
                                }
                                if (options.contentType === 'video') {
                                    adv.find('.parallax-content').addClass('hidden').removeClass('video-list');
                                    adv.find('.open-btn').fadeIn();
                                }
                                if (options.contentType === 'postContent') {
                                    adv.find('.parallax-content').addClass('hidden').removeClass('post-content');
                                    adv.find('.open-btn').fadeIn();
                                }
                                adv.attr('style', '');
								
                                //adv.find('.parallax-content-in').html('');
                               // adv.find('.item-contain').html('');
                            }
                        }, 'easeInOutQuint');
                    }, 200);
                });
            };
            //Ham xu ly khi nut next duoc click
            this.navNextClick = function (e) {
                if ($(e).hasClass('next-large')) {
                    var timeout = setTimeout(function () {
                        adv.find('.content-show-large .loading').fadeIn(100);
                    }, 100);
                    var ce = adv.find('.show_box.show');
                    var ne;
                    if (btParallax.image_list.index(ce) + 1 >= btParallax.image_list.length) {
                        ne = btParallax.image_list[0];
                    } else {
                        ne = btParallax.image_list[btParallax.image_list.index(ce) + 1];
                    }
                    var n_e = $(ne).html();
                    adv.find('.content-show-large .item-contain').append($(n_e).css('display', 'none'));
                    if (adv.find('.content-show-large .item-contain img').length > 2) {
                        adv.find('.content-show-large .item-contain img:first').remove();
                    }
                    var img = new Image();
                    $(img).load(function () {
                        adv.find('.content-show-large .item-contain img:first').fadeOut(2000);
                        adv.find('.content-show-large .item-contain img:last').fadeIn(2000, function () {
                            if (adv.find('.content-show-large .item-contain img').length > 2) {
                                adv.find('.content-show-large .item-contain img:first').remove();
                            }
                        });
                        clearTimeout(timeout);
                        adv.find('.content-show-large .loading').fadeOut(100);
                        $(ne).addClass('show');
                        ce.removeClass('show');
                    }).error(function () {
                        alert('Can\'t load image!');
                    }).attr('src', $(n_e).attr('src'));
                    return;
                } else if ($(e).hasClass('next-video')) {
                    adv.find('.content-show-large .loading').fadeIn(100);
                    var ce = adv.find('.video-contain.show');
                    var ne;
                    if (btParallax.list.index(ce) + 1 >= btParallax.list.length) {
                        ne = btParallax.list[0];
                    } else {
                        ne = btParallax.list[btParallax.list.index(ce) + 1];
                    }

                    var n_e = $(ne).val();
                    adv.find('.content-show-large .item-contain').append(n_e);
                    if (adv.find('.content-show-large .item-contain .video-inner').length > 2) {
                        adv.find('.content-show-large .item-contain .video-inner:first').remove();
                    }

                    adv.find('.content-show-large .item-contain .video-inner:first').fadeOut(2000);
                    adv.find('.content-show-large .item-contain .video-inner:last').fadeIn(2000, function () {
                        if (adv.find('.content-show-large .item-contain .video-inner').length > 2) {
                            adv.find('.content-show-large .item-contain .video-inner:first').remove();
                        }
                    });
//                    clearTimeout(timeout);
                    $(ne).addClass('show');
                    ce.removeClass('show');
                    return;
                } else if ($(e).hasClass('next-post')) {
                    if (btParallax.isNavClick === false) {
                        return;
                    }
                    btParallax.isNavClick = false;
                    var left = Math.abs(btParallax.c_pos.position().left);
                    if (left + options.next_prev_s <= btParallax.c_pos.width() - adv.find('.parallax-content.post-content').width()) {
                        btParallax.c_pos.animate({'transform': 'translateX(-' + (left + options.next_prev_s) + 'px)'}, 400, function () {
                            btParallax.isNavClick = true;
                        });
                    } else {
                        btParallax.c_pos.animate({'transform': 'translateX(0px)'}, 400, function () {
                            btParallax.isNavClick = true;
                        });
                    }
                    return;
                } else {
                    btParallax.animateStop();
                    if (btParallax.isNavClick === false) {
                        return;
                    }
                    btParallax.isNavClick = false;
                    var left = Math.abs(btParallax.c_pos.position().left);
                    if (left + options.next_prev_s > btParallax.c_pos.width() - $(window).width()) {
                        btParallax.c_pos.css('transform', 'translateX(' + (btParallax.c_pos.position().left + (options.item_width + options.spacing) * 2) + 'px)');
                        adv.find('.parallax-col:first').appendTo(btParallax.c_pos);
                        adv.find('.parallax-col:first').appendTo(btParallax.c_pos);
                    }

                    btParallax.c_pos.animate({'transform': 'translateX(' + (btParallax.c_pos.position().left - options.next_prev_s) + 'px)'}, 400, function () {
                        btParallax.isNavClick = true;
                        btParallax.animateStart();
                    });
                }
            };

            //Ham xu ly khi nut bam prev duoc click
            this.navPrevClick = function (e) {
                if ($(e).hasClass('prev-large')) {
                    var timeout = setTimeout(function () {
                        adv.find('.content-show-large .loading').fadeIn(100);
                    }, 100);
                    var ce = adv.find('.show_box.show');
                    var ne;
                    if (btParallax.image_list.index(ce) - 1 <= 0) {
                        ne = btParallax.image_list[btParallax.image_list.length - 1];
                    } else {
                        ne = btParallax.image_list[btParallax.image_list.index(ce) - 1];
                    }
                    var n_e = $(ne).html();
                    adv.find('.content-show-large .item-contain').append($(n_e).css('display', 'none'));
                    if (adv.find('.content-show-large .item-contain img').length > 2) {
                        adv.find('.content-show-large .item-contain img:first').remove();
                    }
                    var img = new Image();
                    $(img).load(function () {
                        adv.find('.content-show-large .item-contain img:first').fadeOut(3000);
                        adv.find('.content-show-large .item-contain img:last').fadeIn(3000, function () {
                            if (adv.find('.content-show-large .item-contain img').length > 2) {
                                adv.find('.content-show-large .item-contain img:first').remove();
                            }
                        });
                        clearTimeout(timeout);
                        adv.find('.content-show-large .loading').fadeOut(100);
                        $(ne).addClass('show');
                        ce.removeClass('show');
                    }).error(function () {
                        alert('Can\'t load image!');
                    }).attr('src', $(n_e).attr('src'));
                    return;
                } else if ($(e).hasClass('prev-video')) {
                    var timeout = setTimeout(function () {
                        adv.find('.content-show-large .loading').fadeIn(100);
                    }, 100);
                    var ce = adv.find('.video-contain.show');
                    var ne;
                    if (btParallax.list.index(ce) - 1 < 0) {
                        ne = btParallax.list[btParallax.list.length - 1];
                    } else {
                        ne = btParallax.list[btParallax.list.index(ce) - 1];
                    }
                    var n_e = $(ne).val();
                    adv.find('.content-show-large .item-contain').append($(n_e).css({'display': 'none'}));
                    if (adv.find('.content-show-large .item-contain .video-inner').length > 2) {
                        adv.find('.content-show-large .item-contain .video-inner:first').remove();
                    }

                    adv.find('.content-show-large .item-contain .video-inner:first').fadeOut(2000);
                    adv.find('.content-show-large .item-contain .video-inner:last').fadeIn(2000, function () {
                        if (adv.find('.content-show-large .item-contain .video-inner').length > 2) {
                            adv.find('.content-show-large .item-contain .video-inner:first').remove();
                        }
                    });
                    clearTimeout(timeout);
                    $(ne).addClass('show');
                    ce.removeClass('show');
                    return;
                } else if ($(e).hasClass('prev-post')) {
                    if (btParallax.isNavClick === false) {
                        return;
                    }
                    btParallax.isNavClick = false;
                    var left = Math.abs(btParallax.c_pos.position().left);
                    if (left - options.next_prev_s >= 0) {
                        btParallax.c_pos.animate({'transform': 'translateX(-' + (left - options.next_prev_s) + 'px)'}, 400, function () {
                            btParallax.isNavClick = true;
                        });
                    } else {
                        btParallax.c_pos.animate({'transform': 'translateX(-' + (btParallax.c_pos.width() - btParallax.c_pos.parent().width() - options.spacing) + 'px)'}, 400, function () {
                            btParallax.isNavClick = true;
                        });
                    }
                    return;
                } else {
                    btParallax.animateStop();
                    if (btParallax.isNavClick === false) {
                        return;
                    }
                    btParallax.isNavClick = false;
                    var left = Math.abs(btParallax.c_pos.position().left);
                    if (left + options.next_prev_s > 0) {
                        btParallax.c_pos.css('transform', 'translateX(' + (btParallax.c_pos.position().left - (options.item_width + options.spacing) * 2) + 'px)');
                        btParallax.c_pos.prepend(adv.find('.parallax-col:last')).prepend(adv.find('.parallax-col:last'));
                    }

                    btParallax.c_pos.animate({'transform': 'translateX(' + (btParallax.c_pos.position().left + options.next_prev_s) + 'px)'}, 400, function () {
                        btParallax.isNavClick = true;
                        btParallax.animateStart();
                    });
                }
            };
            //Ham xu ly khi anh thumbnail cua image gallery duoc click
            this.imgThumbClick = function (e, el) {
                if (btParallax.isThumClick === false) {
                    return;
                } else {
                    if (btParallax.listAnimate === true) {
                        btParallax.animateStop();
                    } else {
                        adv.find('.nav-wrap').removeClass('hidden');
                    }
                    adv.find('.parallax-content-wrap').css('overflow-y', 'hidden');
                    btParallax.ePos = {'top': e.clientY, 'left': e.clientX};
                    btParallax.eSize = {'width': $(el).width(), 'height': $(el).height()};
                    adv.find('.nav-prev').addClass('prev-large');
                    adv.find('.nav-next').addClass('next-large');
                    var show_box = $(el).parent().find('.show_box');
                    show_box.addClass('show');
                    var img = new Image();
                    $(img).load(function () {
                        adv.find('.content-show-large .item-contain').html(show_box.html());
                        adv.find('.content-show-large').removeClass('hidden').fadeIn(300);
                        adv.find('.content-show-large').css({'top': btParallax.ePos.top, 'left': btParallax.ePos.left, 'width': 0, 'height': 0}).removeClass('hidden').addClass('show').animate({'top': 0, 'left': 0, 'width': '100%', 'height': '100%'}, 500, function () {
                            adv.find('.content-show-large .loading').fadeIn(100);
                            adv.find('.content-show-large .loading').fadeOut(100);
                            adv.find('.button.close-btn').addClass('close-image-info');
                            btParallax.isThumClick = false;
                        });
                    }).error(function () {
                        alert('Can\'t load image!');
                    }).attr('src', $(show_box.html()).attr('src'));
                }
            };
            // Ham xu ly de load noi dung sau khi parallax full man hinh
            this.loadImageItems = function (in_out, callback) {
                btParallax.row_list = adv.find('.parallax-row');
                if (in_out === true) {
                    btParallax.itemAnimateIn(btParallax.row_list, callback);
                } else {
                    btParallax.itemAnimateOut(btParallax.row_list, callback);
                }
            };
            this.itemAnimateIn = function (list, callback) {
                if (btParallax.itemIndex < list.length) {
                    setTimeout(function () {
                        $(list[btParallax.itemIndex]).addClass('default-pos').removeClass('in-pos');
                        btParallax.itemIndex++;
                        btParallax.itemAnimateIn(btParallax.row_list, callback);
                    }, 100);
                } else {
                    callback();
                    btParallax.itemIndex = 0;
                }
            };
            this.itemAnimateOut = function (list, callback) {
                if (btParallax.itemIndex < list.length) {
                    setTimeout(function () {
                        $(list[btParallax.itemIndex]).addClass('out-pos').removeClass('default-pos');
                        btParallax.itemIndex++;
                        btParallax.itemAnimateOut(btParallax.row_list, callback);
                    }, 100);
                } else {
                    callback();
                    btParallax.itemIndex = 0;
                }
            };
            this.listItemAnimate = function () {
                if (options.scroll_direction === 'rtl') {

                    if (Math.abs(btParallax.c_pos.position().left) >= (((options.item_width + options.spacing) * btParallax.list.length) - btParallax.win_width - options.item_width)) {
                        btParallax.c_pos.css('transform', 'translateX(' + (btParallax.c_pos.position().left + (options.item_width + options.spacing) - 1) + 'px)');
                        adv.find('.parallax-col:first').appendTo(btParallax.c_pos);
                    } else {
                        btParallax.c_pos.css('transform', 'translateX(' + (btParallax.c_pos.position().left - 1) + 'px)');
                    }
                } else {
                    if (Math.abs(btParallax.c_pos.position().left) === 0) {
                        btParallax.c_pos.css('transform', 'translateX(' + (btParallax.c_pos.position().left - (options.item_width + options.spacing) + 1) + 'px)');
                        btParallax.c_pos.prepend(adv.find('.parallax-col:last'));
                    } else {
                        btParallax.c_pos.css('transform', 'translateX(' + (btParallax.c_pos.position().left + 1) + 'px)');
                    }
                }
            };
            this.animateStart = function () {
                btParallax.listItemAnimate();
                btParallax.timer = setTimeout(btParallax.animateStart, 8);
            };
            this.animateStop = function () {
                clearTimeout(btParallax.timer);
            };
            this.backgroundImageResize = function (h) {
                if (h) {
                    if (btParallax.background_img.height() < btParallax.background.height()) {
                        btParallax.background_img.css({'width': 'auto', 'height': btParallax.background.height()});
                    }
                } else {
                    if (btParallax.background_img.width() < btParallax.background.width()) {
                        btParallax.background_img.css({'width': btParallax.background.width(), 'height': 'auto'});
                    }
                }
            };
            this.responsive = function () {
                btParallax.win_height = $(window).height();
                btParallax.win_width = $(window).width();
                if (adv.parent().hasClass('full-width')) {
                    adv.parent().css({'width': btParallax.win_width, 'marginLeft': '-' + adv.parent().parent()[0].getBoundingClientRect().left + 'px'});
                    adv.find('.parallax-block-content').css({'width': adv.parent().parent().width(), 'marginLeft': adv.parent().parent().offset().left});
                }
                if (options.contentType === 'postContent') {
                    var item_num = Math.floor(btParallax.win_width / (options.item_width + options.spacing));
                    btParallax.c_pos.parent().width(((options.item_width + options.spacing) * item_num) - options.spacing).css('left', (btParallax.win_width - (((options.item_width + options.spacing) * item_num) - options.spacing)) / 2 + 'px');
                    if (btParallax.c_pos.width() > btParallax.win_width && btParallax.enableControlButton) {
                        adv.find('.nav-wrap').removeClass('hidden');
                    } else {
                        adv.find('.nav-wrap').addClass('hidden');
                    }
                    if (btParallax.win_height > (btParallax.c_pos.parent().height())) {
                        btParallax.c_pos.parent().css('margin-top', (btParallax.win_height - ((options.item_height + options.spacing) * options.rows - options.spacing)) / 2 + 'px');
                        adv.find('.button-wrap .close-btn').removeClass('has-scroll');
                        adv.find('.nav-wrap-in.next').removeClass('has-scroll');
                    } else {
                        btParallax.c_pos.parent().css('margin-top', '20px');
                        var item_num = Math.floor(btParallax.win_width / (options.item_width + options.spacing));
                        btParallax.c_pos.parent().width(((options.item_width + options.spacing) * item_num) - options.spacing).css('overflow', 'hidden');
                        btParallax.c_pos.parent().css('left', (btParallax.win_width - (((options.item_width + options.spacing) * item_num) - options.spacing)) / 2 + 'px');
                        adv.find('.button-wrap .close-btn').addClass('has-scroll');
                        adv.find('.nav-wrap-in.next').addClass('has-scroll');
                    }
                }
                if (options.contentType === 'image') {
                    if (btParallax.c_pos.width() > btParallax.win_width && btParallax.enableControlButton) {
                        adv.find('.nav-wrap').removeClass('hidden');
                    } else {
                        adv.find('.nav-wrap').addClass('hidden');
                    }
                    if (btParallax.win_height > ((options.item_height + options.spacing) * options.rows - options.spacing + 40)) {
                        btParallax.c_pos.css('margin-top', (btParallax.win_height - ((options.item_height + options.spacing) * options.rows - options.spacing)) / 2 + 'px');
                        adv.find('.button-wrap .close-btn').removeClass('has-scroll');
                        adv.find('.nav-wrap-in.next').removeClass('has-scroll');
                    } else {
                        btParallax.c_pos.css('margin-top', '20px');
                        adv.find('.button-wrap .close-btn').addClass('has-scroll');
                        adv.find('.nav-wrap-in.next').addClass('has-scroll');
                    }
                }
                if (options.contentType === 'video') {
                    adv.find('.item-contain').css({'height': btParallax.win_height, 'width': btParallax.win_width});
                }
            };
            btParallax.renderParallax();
        });
    };
})(jQuery);