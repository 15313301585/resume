let loadingRender=(function () {
    let $loadingBox=$('.loadingBox'),
        $run=$loadingBox.find('.run');
    //我们需要处理的图片
    let imgList=["img/icon.png","img/zf_concatAddress.png","img/zf_concatInfo.png","img/zf_concatPhone.png","img/zf_course.png","img/zf_course1.png","img/zf_course2.png","img/zf_course3.png","img/zf_course4.png","img/zf_course5.png","img/zf_course6.png","img/zf_cube1.png","img/zf_cube2.png","img/zf_cube3.png","img/zf_cube4.png","img/zf_cube5.png","img/zf_cube6.png","img/zf_cubeBg.jpg","img/zf_cubeTip.png","img/zf_emploment.png","img/zf_messageArrow1.png","img/zf_messageArrow2.png","img/zf_messageChat.png","img/zf_messageKeyboard.png","img/zf_messageLogo.png","img/zf_messageStudent.png","img/zf_outline.png","img/zf_phoneBg.jpg","img/zf_phoneDetail.png","img/zf_phoneListen.png","img/zf_phoneLogo.png","img/zf_return.png","img/zf_style1.jpg","img/zf_style2.jpg","img/zf_style3.jpg","img/zf_styleTip1.png","img/zf_styleTip2.png","img/zf_teacher1.png","img/zf_teacher2.png","img/zf_teacher3.jpg","img/zf_teacher4.png","img/zf_teacher5.png","img/zf_teacher6.png","img/zf_teacherTip.png"];

    //控制图片加载进度
    let total=imgList.length,
        cur=0;//已经加载成功的图片的数量
    let computed=function () {
        imgList.forEach(function (item) {
            let temImg=new Image;
            temImg.src=item;
            temImg.onload=function () {
                cur++;
                temImg=null;
                runFn();
            }
        })
    };
    //计算滚动条加载长度
    let runFn=function () {
        $run.css('width',cur/total*100+'%');
        if(cur>=total){
            //需要延迟的图片都加载成功了：进入到下一个区域(设置一个缓冲等待时间，当加载完成，让用户看到加载完成的效果，进入下一个区域)
            let delayTimer=setTimeout(()=>{
                $loadingBox.remove();//remove()删除元素节点
                phoneRender.init();
                clearTimeout(delayTimer);
            },1500);
        }
    };
    
    return {
        init:function () {
            $loadingBox.css('display','block');//我们在css中把所有区域的display都设置为none，以后开发的时候，开发哪个区域，我们就执行哪个区域的init方法，在这个方法中首先控制当前区域展示（开发哪个区域，哪个区域展示，其他区域都是影藏的）
            computed();
        }
    }
})();

let phoneRender=(function ($) {
    let $phoneBox=$('.phoneBox'),
        $time=$phoneBox.find('.time'),
        $listen=$phoneBox.find('.listen'),
        $listenTouch=$listen.find('.touch'),
        $detail=$phoneBox.find('.detail'),
        $detailTouch=$detail.find('.touch');

    let audioBell=$('#audioBell')[0],
        audioSay=$('#audioSay')[0];

    //  点击$listenTouch时，使用订阅发布模式
    let $phonePlan=$.Callbacks();

    //控制盒子的显示隐藏
    $phonePlan.add(function () {
        $listen.remove();
        $detail.css('transform','translateY(0)');
    });
    //控制say播放
    $phonePlan.add(function () {
        audioBell.pause();
        audioSay.play();
        $time.css('display','block');

        //console.dir(audioSay);
        //随时计算播放时间
        let sayTimer=setInterval(()=>{
            //总时间和已经播放的时间：单位秒
            let duration=audioSay.duration,
                current=audioSay.currentTime;

            let minute=Math.floor(current/60);
            let second=Math.floor(current-minute*60);
            minute<10?minute='0'+minute:null;
            second<10?second='0'+second:null;
            $time.html(`${minute}:${second}`);

        //播放结束
            if(current>=duration){
                clearInterval(sayTimer);
                enterNext();
            }

        },1000);
    });

    //detail  touch
    $phonePlan.add(function () {
        $detailTouch.tap(enterNext)
    });
    
    //进入下一个区域（message）
    let enterNext=function () {
        audioSay.pause();
        $phoneBox.remove();
        messageRender.init();
    };
    
    return{
        init:function () {
            $phoneBox.css('display','block');

            //控制bell播放
            audioBell.play();// audioBell.pause(); 控制暂停
            // 想看audioBell上有什么方法直接  console.dir(audioBell)

            //listen-touch
            $listenTouch.tap($phonePlan.fire);
        }
    }
})(Zepto);

let messageRender = (function ($) {
    let $messageBox = $('.messageBox'),
        $talkBox = $messageBox.find('.talkBox'),
        $talkList = $talkBox.find('li'),
        $keyBord = $messageBox.find('.keyBord'),
        $keyBordText = $keyBord.find('span'),
        $submit = $keyBord.find('.submit'),
        musicAudio=$('#musicAudio')[0];

    let $plan = $.Callbacks();

    //=>控制消息列表逐条显示
    let step = -1,
        autoTimer = null,
        interval = 1500,
        offset=0;
    $plan.add(() => {
        autoTimer = setInterval(() => {
            step++;
            let $cur = $talkList.eq(step);
            $cur.css({
                opacity: 1,
                transform: 'translateY(0)'
            });
            //=>当第三条完全展示后立即调取键盘（step===2&&当前的li显示的动画已经完成）
            if (step === 2) {
                //=>transitionend:当前元素正在进行的过渡动画已经完成，就会触发这个事件（有几个元素样式需要改变，就会被触发执行几次）
                $cur.one('transitionend', () => {
                    //one:给当前元素只绑定一次事件，触发一次后，绑定的方法自动移除
                    $keyBord.css('transform', 'translateY(0)').one('transitionend', textMove)
                });
                clearInterval(autoTimer);
            }

            //从第五条开始，每当展示一个LI，都需要让ul整体上移
            if (step >= 4) {
                offset+=-$cur[0].offsetHeight;
                $talkBox.css({
                    transform: `translateY(${offset}px)`
                });
            }
            //已经把li都显示了，结束动画，进入到下一个区域即可
            if (step >= $talkList.length-1) {
                clearInterval(autoTimer);
                //进入下一个环节之前设置一个延迟，目的是让用户把最后一个信息读完
                let delayTimer=setTimeout(()=>{
                    musicAudio.pause();
                    $messageBox.remove();
                    cubeRender.init();
                    clearTimeout(delayTimer);
                },interval);

            }
        }, interval)
    });

    //=>控制文字及其打印效果
    let textMove = function () {
        let text = $keyBordText.html();
        $keyBordText.css('display', 'block').html('');
        let timer = null,
            n = -1;
        timer = setInterval(() => {
            n++;
            if (n >= text.length) {
                //=>打印机效果完成，让发送按钮显示(并且给发送绑定点击事件)
                clearInterval(timer);
                $keyBordText.html(text);
                $submit.css('display', 'block').tap(() => {
                    $keyBordText.css('display', 'none');
                    $keyBord.css('transform', 'translateY(3.7rem)');
                    $plan.fire();//此时计划表中只有一个方法，重新通知计划表中的这个方法执行
                });
                return;
            }

            $keyBordText[0].innerHTML += text.charAt(n);
        }, 100);
    };


    return {
        init: function () {
            $messageBox.css('display', 'block');
            musicAudio.play();
            $plan.fire();
        }
    }
})(Zepto);

/* cube*/
let cubeRender=(function () {
    let $cubeBox=$('.cubeBox'),
        $box=$cubeBox.find('.box');

    let touchBegin=function (e) {
        //=>this:box 原生对象
        let point=e.changedTouches[0];
        $(this).attr({
            strX:point.clientX,
            strY:point.clientY,
            isMove:false,
            changeX:0,
            changeY:0
        })
    };
    let touching=function (e) {
        let point=e.changedTouches[0],
            $this=$(this);
        let changeX=point.clientX-parseFloat($this.attr('strX')),
            changeY=point.clientY-parseFloat($this.attr('strY'));
        if(Math.abs(changeX)>10 || Math.abs(changeY)>10){
            $this.attr({
                isMove:true,
                changeX:changeX,
                changeY:changeY
            })
        }
    };
    let touchEnd = function (e) {
        let point = e.changedTouches[0],
            $this = $(this);
        let isMove = $this.attr('isMove'),
            changeX = parseFloat($this.attr('changeX')),
            changeY = parseFloat($this.attr('changeY')),
            rotateX = parseFloat($this.attr('rotateX')),
            rotateY = parseFloat($this.attr('rotateY'));
        if (isMove === 'false') return;

        rotateX = rotateX - changeY / 3;
        rotateY = rotateY + changeX / 3;
        $this.css(`transform`, `scale(.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`).attr({
            rotateX: rotateX,
            rotateY: rotateY
        });
    };

    return{
        init:function () {
            $cubeBox.css('display', 'block');

            //事件绑定实现相关效果
            $box.attr({
                rotateX:-30,
                rotateY:45
            }).on({
                'touchstart':touchBegin,
                'touchmove':touching,
                'touchend':touchEnd
            });

            // 每一个页面的点击操作
            $box.find('li').tap(function () {
                $cubeBox.css('display','none');
                let index=$(this).index();
                detailRender.init(index);
            })
        }
    }
})();

/*detail*/
let detailRender=(function () {
    let $detailBox=$('.detailBox'),
        $returnLink=$detailBox.find('.returnLink'),
        $cubeBox=$('.cubeBox'),
        swiperExample=null;
    let $makisuBox=$('#makisuBox');
    let change=function (example) {
        //example.activeIndex 当前活动块的索引
        //example.slides  数组，存储了当前所有活动块
        //example.slides[example.activeIndex] 当前活动块
       let {slides:slideAry,activeIndex}=example;

       //=>page1单独处理
        if(activeIndex===0){
            $makisuBox.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0.8
            });
            $makisuBox.makisu('open');
        }else {
            $makisuBox.makisu({
                selector:'dd',
                overlap:0,
                speed:0
            });
            $makisuBox.makisu('close');
        }

        //=>给当前活动块设置id，其他块移除id
        [].forEach.call(slideAry,(item,index)=>{
            if(index===activeIndex){
                item.id='page'+(activeIndex+1);
                return;
            }
            item.id=null;
        })

    };
    return{
        init:function (index=0) {
            $detailBox.css('display','block');

            //=>init swiper
            if(!swiperExample){
                //=>return
                $returnLink.tap(()=>{
                    $detailBox.css('display','none');
                    $cubeBox.css('display','block');
                });

                //=>不存在实例的情况下我们初始化，如果已经初始化过了，下一次直接运动到具体的位置即可，不需要重新的初始化
                swiperExample=new Swiper('.swiper-container',{
                    // loop:true,  如果我们采用的切换效果是3D的，最好不要设置无缝衔接循环切换，在部分安卓机中，swiper这块的处理是由一些bug的
                    effect:'coverflow',
                    onInit:change,
                    onTransitionEnd:change
                });
            }
            index=index>5?5:index;
            swiperExample.slideTo(index,0);//运动到指定索引的slide位置，第二个参数是speed，我们设置0是让其立即运动到指定位置
        }
    }
})();

loadingRender.init();

/*
* 基于swiper实现每一个页面的动画
* 1.滑到某一个页面的时候，给当前这个页面设置一个ID，例如：滑动到第二个页面，我们给其设置id=page2
* 2.当滑出这个页面的时候，我们把之前设置的id移除掉
* 3.我们把当前页面中元素实现的动画效果全部写在指定的id下
*
* #page2 h2{
*   animation:xxx 1s ...
* }
*
*细节处理：
* 1.我们是基于animate.css帧动画库完成的动画
* 2.我们让需要运动的元素初始样式：opacity=0(开始是隐藏的)
* 3.当设置ID让其运动的时候，我们自己在动画公式完成的时候，让其透明度为 1
*
*
*/