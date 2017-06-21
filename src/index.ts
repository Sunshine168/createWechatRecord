import {DrawWecheatView} from './DrawView'


(function(){ 
         var canvas:any,context,drawWecheatView:DrawWecheatView,isInit:boolean,avatar,list = [
       {
         user:0,
         message:"hello"
       },
        {
         user:1,
         message:"hello1"
       },
        {
         user:1,
         message:"hello2"
       },
       ];
        canvas = document.getElementById("canvas");
        canvas.width = 500;
        canvas.height = 800;
        context = canvas.getContext("2d");
        drawWecheatView = new DrawWecheatView({
    mode:0,
    platform:0,
    x:0,
    y:0,
    context:context,
    windowWidth:500,
    windowHeight:800
  })    

        document.getElementById("setName").onclick = function(){
            setName()
        };
        document.getElementById("addMessage").onclick = function(){
           addMessage()
        }
         document.getElementById("process").onclick = function(){
           download()
        }
        document.getElementById("upload").onclick = function(){  
             var avatar = (<HTMLInputElement>document.getElementById('avatar')),
             avatar2 = (<HTMLInputElement>document.getElementById('avatar2')),
             mode    = Number((<HTMLInputElement>document.getElementById('mode')).value),
             addMessage = (<HTMLInputElement>document.getElementById('addMessage'));
             var element = (<HTMLInputElement>this);
             if(mode===0){
               //双方头像必须上传
               if(!avatar.files[0]||!avatar2.files[0]){
                 alert("请上传双方头像");
               }else{
                 element.disabled =true
                 uploadAvatarBoth(avatar,avatar2).then(function(){
                              addMessage.disabled = false;
                 })
               }
             }
             if(mode==1){
                //自己头像必须上传
                if(!avatar.files[0]){
                 alert("请上传自己头像")
               }else{
                 element.disabled =true
                 uploadAvatarSelf(avatar).then(function(result:any){
                              addMessage.disabled = false;
                 })
               }
             }
              if(mode==2){
                //对方头像必须上传
                 if(!avatar2.files[0]){
                 alert("请上传对方头像")
               }else{
                 element.disabled =true
                 uploadAvatarOther(avatar2).then(function(){
                              addMessage.disabled = false;
                 })
               }
             }

        }
      checkInit(function(){
        document.getElementById('loading').style.display="none";
      }) 


      /*init*/
      drawWecheatView.initView()
      .then(function(){
        isInit =  true;
        return drawWecheatView.setBarkground({color:"#f3f3f3"})
      })
      function checkInit(success:any,fail?:any){
        var timer = setInterval(function(){
                    if(isInit){
                      clearInterval(timer);
                      clearInterval(timeOuter);
                      console.log("初始化成功")//
                      success()
                    }
        },500);
        var timeOuter = setTimeout(function(){
              if(!isInit){
                alert("初始化失败")
              }
        },50000);
      }
      function uploadAvatarBoth(avatar:any,avatar2:any){
               var p1 = drawWecheatView.setAvatar(0,avatar.files[0])
               var p2 = drawWecheatView.setAvatar(1,avatar2.files[0])
             return Promise.all([p1,p2]);

      }
      function uploadAvatarSelf(avatar:any){
        return drawWecheatView.setAvatar(0,avatar.files[0])
      }
      function uploadAvatarOther(avatar:any){
        return drawWecheatView.setAvatar(1,avatar.files[0])
      }
      function addMessage(){
         var talkerType = Number((<HTMLInputElement>document.getElementById('talkerType')).value),
             message =  (<HTMLInputElement>document.getElementById('message')).value;
             if(message===""){
               alert("信息不能为空")
             }else{
               var result = drawWecheatView.drewMessage(talkerType,message)
                 if(!result){
                     alert("高度不足 请等待更新");
                 }
             }
      }
      function setName(){
            var name = (<HTMLInputElement>document.getElementById("talkerName")).value;
            console.log(name);
            drawWecheatView.setTalkerName(name);
            (<HTMLInputElement>document.getElementById("setName")).disabled = true;
      }
      function download(){
        if (canvas.toBlob) {
                canvas.toBlob(
        function (blob:any) {
           createAndDownloadFile("record.png",blob)
        },
        'image/jpeg'
    );
      }
  }
/**
https://gaohaoyang.github.io/2016/11/22/js-create-file-and-download/
 * 创建并下载文件
 * @param  {String} fileName 文件名
 * @param  {String} content  文件内容
 */
function createAndDownloadFile(fileName:any, content:any) {
    var aTag = document.createElement('a');
    var blob :any;
    blob= new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
}
})()