const cp = require('child_process');

function sleep(time){
    return new Promise(function(resolve){
        setTimeout(resolve,time);
    });
}

function getNetIOFromWmic(){
	return new Promise(function(resolve,reject){
		cp.exec("wmic path Win32_PerfRawData_Tcpip_NetworkInterface get BytesReceivedPersec,BytesSentPersec",function(err,out){
			if(err)return reject(err);
			out = out.trim().split("\n");
			out.shift();//remove title
			for(let i in out){
				out[i] = out[i].trim().split(/\s+/)
			}
			resolve(out);
		});
	});
}

function byteToMib(b){
    return Math.round(b/1024/1024*1000)/1000
}

async function promiseObj(object) {
    let p = {};
    for(let i in object){
        p[i] = object[i]();
    }
    for(let i in p){
        p[i] = await p[i];
    }
    return p;
}

module.exports={
    sleep,
    getNetIOFromWmic,
    byteToMib,
    promiseObj
}