<script setup>
import MeetingHeader from '@/components/layouts/MeetingHeader.vue';
import MeetingSider from '@/components/layouts/MeetingSider.vue';
import MeetingFooter from '@/components/layouts/MeetingFooter.vue';
import MeetingMain from '@/components/layouts/MeetingMain.vue';

import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';
// import { exitMeetingService } from '@/api/user';
import { getInMeetingUsers } from '@/api/user';
import { ElMessage, ElMessageBox  } from 'element-plus';

// const users = ref([]);
const router = useRouter(); // 引入 useRouter
const meetingendVisible = ref(false); // 确认离开会议弹窗显示状态
const users = ref(JSON.parse(localStorage.getItem('users')) || []); // 存储当前会议中的用户列表
const meetingNumber = localStorage.getItem('meetingNumber');
// 使用 ref 创建响应式引用
// const micStatus = ref(JSON.parse(localStorage.getItem('micStatus')) || false);
var is_begin = 0;//是否开始录音
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
var ws = null;//实现WebSocket
var record=null;//多媒体对象，用来处理音频
var timeInte = null;//定义一个定时器
    
var my_sampleRate = 0;//输出采样率
    
//var volume = document.getElementById('volume');
// volume.onchange = function () {
//     record.changeVolume();
// }

const fetchUsers = async () => {
  try {
    const response = await getInMeetingUsers(meetingNumber);
    if (response && response.data) {
      console.log('获取的用户数据:', response.data);
      users.value = response.data.map(user => {
        return {
          ...user,
          avatar: user.avatar ? 'data:image/png;base64,' + user.avatar : '',// 格式转换
        };
      });
      localStorage.setItem('users', JSON.stringify(users.value)); // 缓存用户列表到本地
    }
  } catch (error) {
    console.error('获取用户列表失败:', error.response ? error.response.data : error.message);
  }
};

onMounted(()=>{
        // beginWS();
    if (!navigator.getUserMedia) {
        alert('浏览器不支持音频输入');
    } else {
        navigator.getUserMedia(
        { audio: true },
        function (mediaStream) {
            init(new Recorder(mediaStream));
            beginWS(); 
        },
        function (error) {
            console.log(error);
        }
        );
    }
});  

const beginWS = ()=>{
  console.log('开始对讲');
  if(is_begin === 0){
    // var ws = new WebSocket("ws://127.0.0.1:8079/audio/1");
        ws = new WebSocket("ws://121.37.24.76:8079//meeting/audio/"+localStorage.getItem('userId'));
        ws.binaryType = 'arraybuffer'; //传输的是 ArrayBuffer 类型的数据
        ws.onopen = function(event) {
            console.log('握手成功');

        };
        timeInte=setInterval(function(){
            console.log('readyState'+ws.readyState);
            if(ws.readyState===1){//ws进入连接状态，则每隔500毫秒发送一包数据
                record.start();
                    //console.log("#######################send Blob start ##############################");
                //console.log(record.getBlob());
                const micStatus = ref(JSON.parse(localStorage.getItem('micStatus')) || false);
                if(!micStatus.value){
                    ws.send(record.getBlob());    //发送音频数据
                }
                    //console.log("#######################send Blob end ##############################");
                record.clear(); //每次发送完成则清理掉旧数据
            }
        },500);  //每隔500ms发送一次，定时器
            ///
        ws.onmessage = function (evt){
            console.log( "Received Message: " + evt.data);
            receive(evt.data);
        }
            ///
        is_begin = 1;   
    }else{
        // alert("已开启录音!");
        ElMessage({
                message: '麦克风已关闭。',
                type: 'success',
            })
    }
}

const endWS = ()=>{
  console.log('关闭对讲')
        if(is_begin) {
            ws.close();
            record.stop();
            clearInterval(timeInte);
            is_begin = 0;
        }
        else{
            // alert("已关闭!");
            // ElMessage({
            //     message: '麦克风已关闭。',
            //     type: 'success',
            // })
            console.log('麦克风已关闭。')
        }
}    

function init(rec){
        record = rec;
}     
    if (!navigator.getUserMedia) {
        alert('浏览器不支持音频输入');
    }else{
        navigator.getUserMedia(
            { audio: true },
            function (mediaStream) {
    
                init(new Recorder(mediaStream));
            },function(error){
                console.log(error)
            }
        )
    }
        //录音对象
    var Recorder = function(stream) {
    var sampleBits = 16;//输出采样数位 8, 16
           // var sampleRate = 16000;//输出采样率
    
        var context = new AudioContext();
        var audioInput = context.createMediaStreamSource(stream);
        var gainNode = context.createGain();
            //var filter = context.createBiquadFilter();
           // var recorder = context.createScriptProcessor(4096, 2, 2);
        var recorder = context.createScriptProcessor(4096, 1, 1);
        var sampleRate = context.sampleRate;
        my_sampleRate = sampleRate;
        var audioData = {
            size: 0          //录音文件长度
            , buffer: []    //录音缓存
            , inputSampleRate: sampleRate    //输入采样率
            , inputSampleBits: 16      //输入采样数位 8, 16
            , outputSampleRate: sampleRate
            , oututSampleBits: sampleBits
            , clear: function() {
                this.buffer = [];
                this.size = 0;
            }
            , input: function (data) {
                this.buffer.push(new Float32Array(data));
                this.size += data.length;
            }
            , compress: function () { //合并压缩
                    //合并
                var data = new Float32Array(this.size);
                var offset = 0;
                for (var i = 0; i < this.buffer.length; i++) {
                    data.set(this.buffer[i], offset);
                    offset += this.buffer[i].length;
                }
                    //压缩
                var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
                var length = data.length / compression;
                var result = new Float32Array(length);
                var index = 0, j = 0;
                while (index < length) {
                    result[index] = data[j];
                    j += compression;
                    index++;
                }
                return result;
            }, encodePCM: function(){//这里不对采集到的数据进行其他格式处理，如有需要均交给服务器端处理。
                var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
                var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
                var bytes = this.compress();
                var dataLength = bytes.length * (sampleBits / 8);
                var buffer = new ArrayBuffer(dataLength);
                var data = new DataView(buffer);
                var offset = 0;
                for (var i = 0; i < bytes.length; i++, offset += 2) {
                    var s = Math.max(-1, Math.min(1, bytes[i]));
                    data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }
                return new Blob([data]);
            }
        };
        this.start = function () {
                //噪音处理
    
                // audioInput.connect(filter);
                //
                // filter.connect(gainNode);
            audioInput.connect(gainNode);
            gainNode.connect(recorder);
            recorder.connect(context.destination);
                //filter.type = 'lowshelf';
                //filter.frequency.value = 1000;
        }
     
        this.stop = function () {
            recorder.disconnect();
        }
    
        this.changeVolume = function (){
                // 调节音量
            gainNode.gain.value = volume.value; // 设置为 0.5 表示 50% 音量
                //gainNode.gain.value = 0; // 设置为 0.5 表示 50% 音量
        }
     
        this.getBlob = function () {
            return audioData.encodePCM();
        }
     
        this.clear = function() {
            audioData.clear();
        }
     
        recorder.onaudioprocess = function (e) {
                audioData.input(e.inputBuffer.getChannelData(0));
        }
    };
     
    //import { ElMessage, ElMessageBox } from 'element-plus';
     
    // function receive(data) {
    //     //console.log('receive data:'+ data);
    //     if( data == 'END'){
    //         console.log('END');
    //         endWS();
    //         //meetingendVisible.value = true; // 显示确认对话框
    //         ElMessage({
    //                     type: 'info',
    //                     message: `会议结束`,
    //                 });
    //         router.push('/main/user');
    //     }else if(data == 'SomeOneIn'||data == 'ONE_LEAVE'){
    //         console.log(data);
    //         fetchUsers();
    //         // location.reload(); // 页面刷新
    //         // beginWS();
    //     }else if(data == 'NEW_FILE'){
    //         //提示有新文件
    //         ElMessage({
    //             showClose: true,
    //             message: '有新文件上传',
    //         })

    //     }
    //     else{
    //         var buffer = (new Response(data)).arrayBuffer();
    //         buffer.then(function(buf){
    //                 //console.log("################recv start ####################################");
    //             var audioContext = new ( window.AudioContext || window.webkitAudioContext )();
    //               // var fileResult =addWavHeader(buf, '16000', '16', '2');//解析数据转码wav
    //             var fileResult =addWavHeader(buf, my_sampleRate, '16', '1');//解析数据转码wav
    //             audioContext.decodeAudioData(fileResult, function(buffer) {
    //                  _visualize(audioContext,buffer);//播放
    //             });
    //                 //console.log("################recv end ####################################");
    //         });
    //     }
    // }
    // 修改 receive 函数，使用 _visualize 函数来处理每个接收到的音频数据
function receive(data) {
    if (data == 'END') {
        console.log('END');
        endWS();
        ElMessage({
            type: 'info',
            message: `会议结束`,
        });
        router.push('/main/user');
    } else if (data == 'SomeOneIn' || data == 'ONE_LEAVE') {
        console.log(data);
        fetchUsers();
    } else if (data == 'NEW_FILE') {
        ElMessage({
            showClose: true,
            message: '有新文件上传',
        });
    } else {
        const buffer = (new Response(data)).arrayBuffer();
        buffer.then((buf) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const fileResult = addWavHeader(buf, my_sampleRate, '16', '1');
            audioContext.decodeAudioData(fileResult, (buffer) => {
                _visualize(audioContext, buffer);
            });
        });
    }
}
     
     
        //处理音频流，转码wav
    var addWavHeader = function(samples,sampleRateTmp,sampleBits,channelCount){
        var dataLength = samples.byteLength;
        var buffer = new ArrayBuffer(44 + dataLength);
        var view = new DataView(buffer);
        function writeString(view, offset, string){
            for (var i = 0; i < string.length; i++){
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }
        var offset = 0;
            /* 资源交换文件标识符 */
        writeString(view, offset, 'RIFF'); offset += 4;
            /* 下个地址开始到文件尾总字节数,即文件大小-8 */
        view.setUint32(offset, /*32*/ 36 + dataLength, true); offset += 4;
            /* WAV文件标志 */
        writeString(view, offset, 'WAVE'); offset += 4;
            /* 波形格式标志 */
        writeString(view, offset, 'fmt '); offset += 4;
            /* 过滤字节,一般为 0x10 = 16 */
        view.setUint32(offset, 16, true); offset += 4;
            /* 格式类别 (PCM形式采样数据) */
        view.setUint16(offset, 1, true); offset += 2;
            /* 通道数 */
        view.setUint16(offset, channelCount, true); offset += 2;
            /* 采样率,每秒样本数,表示每个通道的播放速度 */
        view.setUint32(offset, sampleRateTmp, true); offset += 4;
            /* 波形数据传输率 (每秒平均字节数) 通道数×每秒数据位数×每样本数据位/8 */
        view.setUint32(offset, sampleRateTmp * channelCount * (sampleBits / 8), true); offset +=4;
            /* 快数据调整数 采样一次占用字节数 通道数×每样本的数据位数/8 */
        view.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
            /* 每样本数据位数 */
        view.setUint16(offset, sampleBits, true); offset += 2;
            /* 数据标识符 */
        writeString(view, offset, 'data'); offset += 4;
            /* 采样数据总数,即数据总大小-44 */
        view.setUint32(offset, dataLength, true); offset += 4;
        function floatTo32BitPCM(output, offset, input){
            input = new Int32Array(input);
            for (var i = 0; i < input.length; i++, offset+=4){
                output.setInt32(offset,input[i],true);
            }
        }
        function floatTo16BitPCM(output, offset, input){
            input = new Int16Array(input);
            for (var i = 0; i < input.length; i++, offset+=2){
                output.setInt16(offset,input[i],true);
            }
        }
        function floatTo8BitPCM(output, offset, input){
            input = new Int8Array(input);
            for (var i = 0; i < input.length; i++, offset++){
                output.setInt8(offset,input[i],true);
            }
        }
        if(sampleBits == 16){
            floatTo16BitPCM(view, 44, samples);
        }else if(sampleBits == 8){
            floatTo8BitPCM(view, 44, samples);
        }else{
            floatTo32BitPCM(view, 44, samples);
        }
        return view.buffer;
    }
        //播放音频
    // var _visualize = function(audioContext, buffer) {
    //     var audioBufferSouceNode = audioContext.createBufferSource(),
    //         analyser = audioContext.createAnalyser(),
    //         that = this;
    //         //将信号源连接到分析仪
    //     audioBufferSouceNode.connect(analyser);
    //         //将分析仪连接到目的地（扬声器），否则我们将听不到声音
    //     analyser.connect(audioContext.destination);
    //         //然后将缓冲区分配给缓冲区源节点
    //     audioBufferSouceNode.buffer = buffer;
    //         //发挥作用
    //     if (!audioBufferSouceNode.start) {
    //         audioBufferSouceNode.start = audioBufferSouceNode.noteOn //在旧浏览器中使用noteOn方法
    //         audioBufferSouceNode.stop = audioBufferSouceNode.noteOff //在旧浏览器中使用noteOff方法
    //     };
    //         //如果有的话，停止前一个声音
    //     // if (this.animationId !== null) {
    //     //     cancelAnimationFrame(this.animationId);
    //     // }
    //     audioBufferSouceNode.start(0);
    //         /*let audo;
    //         audo.source = audioBufferSouceNode;
    //         audo.audioContext = audioContext;*/
    // }
    // 在 script setup 中添加一个数组来存储 AudioBufferSourceNode 实例
const audioSources = ref([]);

// 修改 _visualize 函数，使其返回创建的 AudioBufferSourceNode 实例
const _visualize = (audioContext, buffer) => {
    const audioBufferSouceNode = audioContext.createBufferSource();
    const analyser = audioContext.createAnalyser();

    audioBufferSouceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    audioBufferSouceNode.buffer = buffer;

    if (!audioBufferSouceNode.start) {
        audioBufferSouceNode.start = audioBufferSouceNode.noteOn;
        audioBufferSouceNode.stop = audioBufferSouceNode.noteOff;
    }

    audioBufferSouceNode.start(0);

    // 将创建的 AudioBufferSourceNode 实例添加到数组中
    audioSources.value.push(audioBufferSouceNode);

    // 可选：设置一个事件监听器，在音频播放结束后从数组中移除该实例
    audioBufferSouceNode.onended = () => {
        const index = audioSources.value.indexOf(audioBufferSouceNode);
        if (index > -1) {
            audioSources.value.splice(index, 1);
        }
    };

    return audioBufferSouceNode;
};

const handleLeaveMeeting = () => {
    console.log('退出会议成功：');
    router.push('/main/user')
}

onBeforeUnmount(() => {
    endWS(); // 关闭WebSocket连接
    localStorage.removeItem('fileId'); // 移除 fileId
    // exitMeetingService(); // 调用退出会议界面接口
});
     
</script>

<template>
    <div class="common-layout">
      <el-container>
        <el-header class="fixed-header">
          <MeetingHeader />
        </el-header>
        <el-container>
          <el-aside class="fixed-aside" width="250px">
            <MeetingSider />
          </el-aside>
          <el-container>
            <el-main>
              <MeetingMain />
            </el-main>
            <el-footer class="fixed-footer footer">
              <MeetingFooter />
            </el-footer>
          </el-container>
        </el-container>
      </el-container>
      <el-dialog v-model="meetingendVisible" title="会议结束" width="300" center>
        <div>
          <p>当前会议已结束。</p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="meetingendVisible = false">取消</el-button>
            <el-button type="primary" @click="handleLeaveMeeting">确认</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>


<style lang="scss" scoped>
.common-layout {
  height: 100vh; // 设置布局高度为视口高度
  position: relative;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 998;
  background-color: #fff; // 可以根据需要调整背景颜色
}

.fixed-aside {
  position: fixed;
  top: 60px; // 根据 header 的高度调整
  bottom: 0;
  left: 0;
  z-index: 998;
  background-color: #f0f2f5; // 可以根据需要调整背景颜色
}

.el-main {
    height: auto;
    margin-top: 60px; // 根据 header 的高度调整
    margin-left: 250px; // 根据 aside 的宽度调整
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 250px; // 根据 aside 的宽度调整
  right: 0;
  z-index: 998;
  background-color: #fff; // 可以根据需要调整背景颜色
}

.footer {
  font-size: 14px;
  color: #666;
  padding: 10px; // 可以根据需要调整内边距
}
</style>
