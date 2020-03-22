const _WIN = process.platform === "win32";

require('loadavg-windows');
const os = require('os');
const osutil = require('os-utils');
const si = require('systeminformation');
const {sleep, getNetIOFromWmic, byteToMib, promiseObj,cpu} = require("./utils");
const infos={
    async loadavg(){
        let d = os.loadavg();
        for(let i in d){
            d[i] = Math.round(d[i]*10000)/10000
        }
        return d;
    },
    async uptime(){
        return os.uptime();
    },
    async disk(){
        let disk = await si.fsSize();
        let data = {
            used:0,
            total:0
        }
        for(let i of disk){
            data.used+=byteToMib(i.used)
            data.total+=byteToMib(i.size)
        }
        return data
    },
    async mem(){
        let mem = await si.mem();
        return {
            total:byteToMib(mem.total),
            available:byteToMib(mem.available),
            swapFree:byteToMib(mem.swapfree),
            swap:byteToMib(mem.swaptotal)
        }
    },
    async net(){
        let data = {
            rx:0,
            tx:0,
            rx_total:0,
            tx_total:0
        }
		if(!_WIN){
			await si.networkStats();
			await sleep(300);
			let net = await si.networkStats();
			for(let i of net){
				if(i.iface=="lo")continue;
				data.rx+=i.rx_sec;
				data.tx+=i.tx_sec;
				data.rx_total+=i.rx_bytes;
				data.tx_total+=i.tx_bytes;
			}
		}else{
			let interval = 500;
			let io1 = await getNetIOFromWmic();
			for(let i of io1){
				data.rx-=Number(i[0]);
				data.tx-=Number(i[1]);
			}
			await sleep(interval);
			let io2 = await getNetIOFromWmic();
			for(let i of io2){
				data.rx+=Number(i[0]);
				data.tx+=Number(i[1]);
				data.rx_total+=Number(i[0]);
				data.tx_total+=Number(i[1]);
			}
			data.rx = data.rx/(interval/1000)*0.7;
			data.tx = data.tx/(interval/1000)*0.7;
		}
		for(let i in data){
			data[i] = byteToMib(data[i]);
		}
        return data;
    },
    cpu(){
        return new Promise(function(resolve,rej){
            osutil.cpuUsage(function(v){
                resolve(Math.round(v*10000)/10000);
            });
        })
    },
};
async function getData(){
    return await promiseObj(infos);
}
module.exports = getData;
/* Test code 
    console.time('data');
    getData().then(function(e){
        console.log(e);
        console.timeEnd('data');
    });
*/