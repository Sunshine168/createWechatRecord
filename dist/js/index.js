(function () {
    var canvas, context;
    document.getElementById("add").onclick = run;
    /*
    绘制流程需要上传头像
    */
    function run() {
        var avatar = document.getElementById('avatar'), image = new Image(), reader = new FileReader(), url, file = avatar.files[0];
        //check file 
        reader.onload = function (e) {
            url = e.target.result;
            image.onload = function () {
                context.drawImage(image, 10, 10, 40, 40);
            };
            image.src = url;
        };
        reader.readAsDataURL(file);
    }
})();
/*
promise异步通过fileReader加载图片,成功后返回该图片
*/
function promiseFileReaderLoadImage(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader(), image = new Image(), url;
        reader.onload = function (e) {
            url = e.target.result;
            image.onload = function () {
                resolve(image);
            };
            image.onerror = reject;
            image.src = url;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
function promiseLoadImage(url) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
            resolve(image);
        };
        image.onerror = reject;
        image.src = url;
    });
}
var DrawWecheatView = (function () {
    function DrawWecheatView(opts) {
        if (opts === void 0) { opts = {
            mode: 0,
            platform: 0,
            x: 0,
            y: 0,
            windowWidth: 500,
            windowHeight: 1000,
        }; }
        this.opts = {
            mode: opts.mode,
            platform: opts.platform,
            x: opts.x,
            y: opts.y,
        };
        this.context = opts.context;
        this.windowWidth = opts.windowWidth;
        this.windowHeight = opts.windowHeight;
        var defaultInitViewOptions = {
            windowHeight: this.windowHeight,
            windowWidth: this.windowWidth,
            statusWidth: this.opts.statusWidth || this.windowWidth,
            statusHeight: this.opts.statusHeight || 40,
            talkerWidth: this.opts.talkerWidth || this.windowWidth,
            talkerHeight: this.opts.talkerHeight || 45,
            inputWidth: this.opts.inputWidth || this.windowWidth,
            inputHeight: this.opts.inputHeight || 60,
        };
        this.defaultInitViewOptions = defaultInitViewOptions;
        //初始化的时候已经将与头部的间距设为20
        this.realHeight = 20 + defaultInitViewOptions.talkerHeight + defaultInitViewOptions.statusHeight;
        this.backgroundHeight = 0;
        this.avatarSize = 40;
        this.textSize = opts.textSize || 11;
    }
    /*
     params
     target
     1 设置主头像
     2 设置对话头像
     通过异步链确定加载完成
    */
    DrawWecheatView.prototype.setAvatar = function (target, avatar) {
        var fileReader = promiseFileReaderLoadImage(avatar), that = this;
        return new Promise(function (resolve, reject) {
            fileReader.then(function (result) {
                if (target === 0) {
                    that.avatar = result;
                }
                else {
                    that.avatar2 = result;
                }
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    };
    /*设置对话信息列表*/
    DrawWecheatView.prototype.setDialogue = function (list) {
        this.dialogueList = list;
    };
    DrawWecheatView.prototype._drawDialogueView = function () {
        this._checkStatus().then(function () {
        }).catch(function (e) { return function () {
        }; });
    };
    /*
     初始化顶部栏和状态栏并绘制
    */
    DrawWecheatView.prototype.initView = function () {
        /*IOS加载*/
        var srcURL = "", that = this;
        if (this.opts.platform === 0) {
            /*目前图片写死,后面再修改成活动的*/
            srcURL = "../img/";
        }
        else {
        }
        var statusImage = promiseLoadImage(srcURL + "status.png"), talkerImage = promiseLoadImage(srcURL + "talker.png"), inputImage = promiseLoadImage(srcURL + "input.png");
        return new Promise(function (resolve, reject) {
            Promise.all([statusImage, talkerImage, inputImage]).then(function (result) {
                that.statusImage = result[0];
                that.talkerImage = result[1];
                that.inputImage = result[2];
                /*加载完图片后开始绘制*/
                /*绘制过程*/
                /**/
                that.context.drawImage(that.statusImage, that.opts.x, that.opts.y, that.defaultInitViewOptions.statusWidth, that.defaultInitViewOptions.statusHeight);
                that.context.drawImage(that.talkerImage, that.opts.x, that.opts.y + that.defaultInitViewOptions.statusHeight, that.defaultInitViewOptions.talkerWidth, that.defaultInitViewOptions.talkerHeight);
                that.context.drawImage(that.inputImage, that.opts.x, that.opts.y + that.defaultInitViewOptions.windowHeight - that.defaultInitViewOptions.inputHeight, that.defaultInitViewOptions.inputWidth, that.defaultInitViewOptions.inputHeight);
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    };
    /*
     如果需要使用自定义背景就加载背景图返回一个promise
    */
    DrawWecheatView.prototype._loadBackground = function () {
        return promiseFileReaderLoadImage(this.opts.background);
    };
    DrawWecheatView.prototype.setBarkground = function (opts) {
        var that = this, backgroundX = this.opts.x, backgroundY = this.defaultInitViewOptions.statusHeight + this.defaultInitViewOptions.talkerHeight, backgroundWidth = this.defaultInitViewOptions.windowWidth, backgroundHeight = this.defaultInitViewOptions.windowHeight - this.defaultInitViewOptions.statusHeight - this.defaultInitViewOptions.talkerHeight - this.defaultInitViewOptions.inputHeight;
        //存储下来计算所得的背景高度
        this.backgroundHeight = backgroundHeight;
        return new Promise(function (resolve, reject) {
            if (opts.color) {
                //直接绘制背景
                that.context.fillStyle = opts.color;
                that.context.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
                resolve();
            }
            else {
                //加装图片并绘制
            }
        });
    };
    DrawWecheatView.prototype._checkStatus = function () {
        //检查是否加载图片完成了如果失败了则抛出异常
        return new Promise(function (resolve, reject) {
            this.timer = setTimeout(function () {
                if (this.checkTimer) {
                    reject("time out");
                }
            }, 50000);
            this.checkTimer = setInterval(function () {
                if (this.opts.mode === 1) {
                    if (this.avatar) {
                        resolve();
                    }
                }
                else {
                    if (this.avatar && this.avatar2) {
                        resolve();
                    }
                }
            }, 500);
        });
    };
    /*头像方面待更新*/
    /*绘制单条信息*/
    DrawWecheatView.prototype.drewMessage = function (user, text) {
        //单行信息长度根据字体宽度设定,多行信息待定
        var avatarX, avatarY, messageX, messageY, width, height = 35, messageWidth = 100, messageHeight = 30, padding = 5, textCount = 0, row = 0, textSize;
        var MULTIPE_LINE_CHAT_LIMIT = 40, 
        //计算信息的宽度,先将中文转化一下,一个中文字符占位两个英文字符
        let = chineseCount = this._countChinese(text), textCount = text.length - chineseCount + chineseCount * 2, otherCount = text.length - chineseCount;
        this.context.font = "18px 微软雅黑";
        if (textCount < MULTIPE_LINE_CHAT_LIMIT) {
            //只有一行
            width = this.context.measureText(text).width + 12;
        }
        else {
            /*
            多行定宽处理
            */
            var textRows = [[]], j = 0, strCount = 0, tempStr = "";
            //按字节截取一行可以放36字节
            for (var i = 0; i < text.length; i++) {
                var strSize = 0;
                if (text.charCodeAt(i) > 128) {
                    strSize = 2;
                }
                else {
                    strSize = 1;
                }
                //第二个条件应该是通过计算非中文字符宽度和中文字符宽度比进行判断 这个暂时写死。。
                if (strCount + strSize > MULTIPE_LINE_CHAT_LIMIT || this._countNotChinese(tempStr) > MULTIPE_LINE_CHAT_LIMIT - 3) {
                    textRows[j].push(tempStr);
                    tempStr = "";
                    //换行
                    j++;
                    //初始化
                    textRows[j] = [];
                    //清零
                    strCount = 0;
                }
                tempStr += text[i];
                strCount += strSize;
            }
            if (textRows[j] !== tempStr) {
                var temp = j++;
                textRows[temp] = [];
                textRows[temp].push(tempStr);
            }
            height = 15 + (j + 1) * 20;
            width = 18 * 20 + 15;
        }
        /*绘制前需要判断绘制信息是否会超过整个聊天栏*/
        if (height + this.realHeight > this.backgroundHeight) {
            /*超过整个聊天栏则停止绘制,后续可以绘制后遮盖？*/
            return false;
        }
        if (user === 0) {
            //右边为本人
            //先计算头像的起点,信息的起点,使用默认的左右间距后为起点
            avatarX = this.defaultInitViewOptions.windowWidth - padding - this.avatarSize;
            avatarY = this.realHeight + padding;
            messageX = avatarX - width - 12;
            messageY = avatarY;
            /*先绘制头像再绘制信息*/
            this.context.drawImage(this.avatar, avatarX, avatarY, this.avatarSize, this.avatarSize);
            //开始绘制信息
            this._drawRoundRect(this.context, messageX, messageY + 5, width, height, 5);
            this.context.fillStyle = "#a2e563";
            this.context.fill();
            this.context.beginPath();
            //右边起点
            this.context.moveTo(messageX + 10 + width, messageY + 20);
            // 左上角
            this.context.lineTo(messageX + width, messageY + 15);
            // //左下角
            this.context.lineTo(messageX + width, messageY + 30);
            this.context.lineCap = "round";
            this.context.strokeStyle = "#a2e563";
            this.context.stroke();
            this.context.fillStyle = "#a2e563";
            this.context.fill();
            this.context.closePath();
            if (textCount < MULTIPE_LINE_CHAT_LIMIT) {
                //单行绘制
                this.context.fillStyle = "#000";
                this.context.fillText(text, messageX + 6, messageY + 30);
            }
            else {
                //多行绘制
                var textRowX = messageX + 10, textRowY = messageY + 30;
                for (var i = 0; i < textRows.length; i++) {
                    //多行需要分拆
                    this.context.beginPath();
                    this.context.fillStyle = "#000";
                    this.context.fillText(textRows[i], textRowX, textRowY);
                    this.context.closePath();
                    textRowY += 25;
                }
            }
        }
        else {
            //左边为对话者
            //先计算头像的起点,信息的起点,使用默认的左右间距后为起点
            avatarX = padding;
            avatarY = this.realHeight + padding;
            messageX = avatarX + this.avatarSize + 11;
            messageY = avatarY;
            /*先绘制头像再绘制信息*/
            this.context.drawImage(this.avatar2, avatarX, avatarY, this.avatarSize, this.avatarSize);
            //开始绘制信息
            this._drawRoundRect(this.context, messageX, messageY + 5, width, height, 5);
            this.context.fillStyle = "#FFF";
            this.context.fill();
            this.context.beginPath();
            //左边起点
            this.context.moveTo(messageX - 10, messageY + 20);
            //右上角
            this.context.lineTo(messageX, messageY + 15);
            //右下角
            this.context.lineTo(messageX, messageY + 30);
            this.context.lineCap = "round";
            this.context.strokeStyle = "#fff";
            this.context.stroke();
            this.context.fillStyle = "#fff";
            this.context.fill();
            this.context.closePath();
            if (textCount < 36) {
                //单行绘制
                this.context.fillStyle = "#000";
                this.context.fillText(text, messageX + 6, messageY + 30);
            }
            else {
                //多行绘制
                var textRowX = messageX + 10, textRowY = messageY + 30;
                for (var i = 0; i < textRows.length; i++) {
                    //多行需要分拆
                    this.context.beginPath();
                    this.context.fillStyle = "#000";
                    this.context.fillText(textRows[i], textRowX, textRowY);
                    this.context.closePath();
                    textRowY += 25;
                }
            }
        }
        // 绘制完成后需要更新实际高度
        this.realHeight += height + 15;
        return true;
    };
    DrawWecheatView.prototype._debugImage = function () {
        var url = "../img/debug.png", that = this;
        return new Promise(function (resolve) {
            promiseLoadImage(url).then(function (result) {
                that.avatar = result;
                resolve(result);
            });
        });
    };
    /*画圆角的函数*/
    DrawWecheatView.prototype._drawRoundRect = function (cxt, x, y, width, height, radius) {
        cxt.beginPath();
        cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
        cxt.lineTo(width - radius + x, y);
        cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
        cxt.lineTo(width + x, height + y - radius);
        cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
        cxt.lineTo(radius + x, height + y);
        cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
        cxt.closePath();
    };
    /*设置对话人名字*/
    DrawWecheatView.prototype.setTalkerName = function (name) {
        /*长度不可超过20个字符*/
        if (name.length > 20 || name.length == 0) {
            return false;
        }
        var nameY = this.defaultInitViewOptions.statusHeight + 25, nameX = this.defaultInitViewOptions.windowWidth / 2 - (name.length * 8) / 2;
        this.context.beginPath();
        this.context.fillStyle = "#fff";
        this.context.font = "22px 微软雅黑";
        this.context.fillText(name, nameX, nameY);
        this.context.closePath();
    };
    DrawWecheatView.prototype._countChinese = function (str) {
        var m = str.match(/[\u4e00-\u9fff\uf900-\ufaff]/g);
        return (!m ? 0 : m.length);
    };
    DrawWecheatView.prototype._countNotChinese = function (str) {
        var m = str.match(/(?![\u4e00-\u9fff\uf900-\ufaff])/g);
        return (!m ? 0 : m.length);
    };
    //设置状态图片接口(null则是直接清空)
    DrawWecheatView.prototype.setStatusImage = function (statusImage) {
        this.statusImage = statusImage;
    };
    //设置状态对话条接口(null则是直接清空)
    DrawWecheatView.prototype.settalkerImage = function (talkerImage) {
        this.talkerImage = talkerImage;
    };
    DrawWecheatView.prototype.getStatusImage = function () {
        return this.statusImage;
    };
    DrawWecheatView.prototype.getStatusImage = function () {
        return this.settalkerImage;
    };
    return DrawWecheatView;
}());
