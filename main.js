/*
*Crossview
*by:    jiajunyu、zhe-he
*email: junyu@jiaju.com、hezhe@jiaju.com
*version:   1.0
*last-time: 2015-7-23
*参数说明
        bigImg:  '大图img',
        smallBox:   '盒子ul',
        left:   '左箭头',
        right:  '右箭头',
        pre:    '上一页',
        next:   '下一页',
        activeClass:    '活动的active',
        animate:    '运动时间',
        num:        '展示的li的个数',
        afterFn:    function (){
            //运动后的回调函数    
        },
        beforeFn:   function (){
            //运动前的回调函数
        }
*
*
*
*

*/


(function ($){
    $.tools = $.tools || {version: '1.0'};
    $.tools.Crossview = {
        bigImg:  '',
        smallBox:   '',
        left:   '',
        right:  '',
        pre:    '',
        next:   '',
        activeClass:    'active',
        animate:    500,
        num:        5,
        afterFn:    function (){},
        beforeFn:   function (){}
    };

    function Crossview(ele,json){
        this.bigImg = $(ele).find(json.bigImg);
        this.smallBox = $(ele).find(json.smallBox);
        
        this.left = $(ele).find(json.left);
        this.right = $(ele).find(json.right);
        this.pre = $(ele).find(json.pre);
        this.next = $(ele).find(json.next);
        this.activeClass = json.activeClass || 'active';
        this.animate = json.animate || 500;  //运动形式
        this.num = json.num || 5;
        
        this.supportState = 'pushState' in window.history;
        
        this.afterFn = json.afterFn;        //运动后的回调函数
        this.beforeFn = json.beforeFn;      //运动前的回调函数
        this.state = {                      //state
            title: document.title           
            ,url: window.location.href
            //,otherkey: 'othervalue',
        }
        this._init();
        this.init();
    }

    Crossview.prototype = {
        constructor:    Crossview,
        _init:          function (){
            var _this = this;
            this.aLi = this.smallBox.find('li');
            this.aB = this.smallBox.find('li b');
            this.aImg = this.smallBox.find('li img');
            this.count = this.aLi.length;
            this.now = 0;
            this.w = this.aLi.eq(0).outerWidth(true);
            //设置smallbox 宽度
            this.smallBox.css('width',this.w*this.count + 'px');
            //设置下标
            this.set();
            //第一个加active
            this.aLi.removeClass(this.activeClass).eq(this.now).addClass(this.activeClass);

            //click
            this.aLi.each(function(i,ele){
                $(ele).on('click', function (){
                    _this.click.call(_this,i);
                });
            })
        },
        init:           function (){
            delete this.init;
            var _this = this;

       
            //上一个下一个
            this.left.on('click', function (){
                _this._left.call(_this)
            });
            this.right.on('click', function (){
                _this._right.call(_this)
            });

            //hash
            this.hash();

            //hashchange事件
            $(window).on('hashchange',function (){
                _this.hash();
            });

            //键盘事件
            $(window).on('keyup',function (ev){
                _this.keyup.call(_this,ev)
            });

            //翻页
            this.pre.on('click', function (){
                _this._pre.call(_this);
            });
            this.next.on('click', function (){
                _this._next.call(_this);
            });
        },
        set:        function (){
            var _this = this;
            if (this.count>1) {
                this.aB.each(function (i,ele){
                    $(ele).html((i+1)+'/'+_this.count);
                });
            };
        },
        hash:           function (){
            var sHash = window.location.hash.substr(1);
            if (sHash) {
                sHash = sHash.split('=');
                if (sHash[0] === 'page'){
                    sHash = Number(sHash[1]);
                };
                if (isNaN(sHash) || sHash>this.count) {
                    sHash = 1;
                };

                this.click(sHash);
            };
        },
        keyup:          function (ev){
            var ev = ev || window.event;
            switch(ev.keyCode){
                case 37:
                    this._left();
                    break;
                case 39:
                    this._right();
                    break;
            }
        },
        click:          function (i){
            
            var _this = this;
            //点自己返回
            if(this.now===i){
                return ;
            }
            //点上一页下一页不会有参数传进,进if
            if (i == null) {
                i = this.now;
            }else{
                this.now = i;
            };

            window.location.hash = '#page='+this.now;
            //改变大图src
            this.changeBigImg(this.aImg.eq(this.now));
            this.aLi.removeClass(this.activeClass).eq(this.now).addClass(this.activeClass);
            
            //可视区总数大于总的li,返回
            if (this.num>=this.count) {
                return;
            };
            //点击超过 可视区总数的一半时让smallbox运动展示其他的li
            var s = Math.ceil(this.num/2,10);
            var t = this.now+1-s;
            
            //点击到头或到尾时,限定运动
            if (t<=0) {
                t=0;
            };
            if (t>=this.count-this.num) {
                t=this.count-this.num;
            };

            //运动形式   
            this.smallBox.stop().animate({
                left:     -t*_this.w+'px'  
            },this.animate);
        },
        changeBigImg:   function (nowImg){
            var _this = this;
            //改变大图src
            var src = nowImg.attr('_src') || nowImg.attr('src');

            this.beforeFn && this.beforeFn();
            this.bigImg.stop().animate({
                opacity:    0
            },this.animate,function (){
                _this.bigImg.attr('src',src);
                _this.bigImg.stop().animate({
                    opacity:    1
                },_this.animate, function (){
                    _this.afterFn && _this.afterFn();
                }); 
            })
        },
        _left:          function (){
            //上一页
            this.now--;
            if (this.now === -1) {
                this.now = 0;   //到顶进入前一页

                this._pre();
            }else{
                this.click();
            };
        },
        _right:         function (){
            //下一页
            this.now++;
            if (this.now === this.count) {
                this.now = this.count - 1;    //到顶后一页
                this._next();
            }else{
                this.click();
            };
        },
        _pre:           function (){

            //前一页
            this.state = {
                title: document.title           
                ,url: this.pre.attr('_href')
                //,otherkey: 'othervalue',
            }
            this.changeUrl(-1);
        },
        _next:          function (){  

            //后一页
            this.state = {
                title: document.title           
                ,url: this.next.attr('_href')
                //,otherkey: 'othervalue',
            }
            this.changeUrl(1);
        },
        changeUrl:           function (page){
            
            if (this.supportState) {
                var _this = this;
                var preImg = this.pre.find('img');
                var nextImg = this.next.find('img');
                

                if (page === -1) {
                    if (this.pre.attr('_href') === 'javascript:;') {
                        return '没有上一页了'
                    };
                    var url = this.pre.attr('_api_href');
                    this.changeBigImg(preImg);
                }else if(page === 1){
                    if (this.next.attr('_href') === 'javascript:;') {
                        return '没有下一页了'
                    };
                    var url = this.next.attr('_api_href');
                    this.changeBigImg(nextImg);
                };
                
                $.ajax({
                    url:    url,
                    dataType: 'json',
                    success:    function (data){
            
                        if (data.flag == '0') {
                            return data.data;
                        };
                        
                        if (!data.cur.img || !data.cur.img.length) {

                            var smallBoxUl = '<li><a href="javascript:;"><img src="http://static.jiaju.com/jiaju/com/images/shafa/none.jpg" alt=""/></a><b></b></li>';
                        } else {
                            var smallBoxUl = [];
                            for (var i = 0; i < data.cur.img.length; i++) {
                                smallBoxUl[i] = [
                                    '<li><a href="javascript:;"><img src="',
                                    data.cur.img[i],
                                    '" alt=""/></a><b></b></li>'
                                ];
                                smallBoxUl[i] = smallBoxUl[i].join('');
                            }
                            smallBoxUl = smallBoxUl.join('');

                        }

                        _this.smallBox.empty();
                        _this.smallBox.html(smallBoxUl);


                        if (!data.next || data.next.length === 0) {
                            _this.next.attr({
                                '_href': 'javascript:;',
                                '_api_href': 'javascript:;'
                            });
                            nextImg.attr({
                                'src': 'http://static.jiaju.com/jiaju/com/images/shafa/none_s.jpg',
                                'alt': '没有更多了'
                            });
                        }else{
                            _this.next.attr({
                                '_href': data.next.url,
                                '_api_href': data.next.api_url
                            });
                            nextImg.attr({
                                'src': data.next.img || 'http://static.jiaju.com/jiaju/com/images/shafa/none.jpg',
                                'alt': data.next.name
                            });
                        };

                        if (!data.pre || data.pre.length === 0) {
                            _this.pre.attr({
                                '_href': 'javascript:;',
                                '_api_href': 'javascript:;'
                            });
                            preImg.attr({
                                'src': 'http://static.jiaju.com/jiaju/com/images/shafa/none_s.jpg',
                                'alt': '没有更多了'
                            });
                        }else{
                            _this.pre.attr({
                                '_href': data.pre.url,
                                '_api_href': data.pre.api_url
                            });
                            preImg.attr({
                                'src': data.pre.img || 'http://static.jiaju.com/jiaju/com/images/shafa/none.jpg',
                                'alt': data.pre.name
                            });
                        };

                        window.history.pushState(_this.state, '', _this.state.url);
                        _this._init();
                        
                    }
                })
            }else if(!!this.state.url){
                window.location.href = this.state.url;
            }
        }
    }


    $.fn.Crossview = function (json){
        return this.each(function (i,ele){           
            $(this).data('Crossview', new Crossview(ele,json));
        });
    }

})(jQuery);