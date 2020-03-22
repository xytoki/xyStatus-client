const fs = require("fs")
const path = require("path")
const { exec } = require('pkg')
const compressing = require('compressing');
function p(s){
	return path.resolve(__dirname+"/../"+s);
}
let packageJSON = JSON.parse(fs.readFileSync(p("package.json")));
let targets=[
	"node12-win-x86",
];
async function main(){
	for(let target of targets){
		let names=[
			packageJSON.name.split("/")[1],
			"v"+packageJSON.version,
			target,
		];
		let output = (names.join("-")+(target.indexOf("win")==-1?".bin":".exe"));
		console.log("building "+output);
		await exec([p('/lib/index.js'), '--target', target, '--output', p(`/release/${target}/${output}`) ])
		fs.writeFileSync(p(`/release/${target}/start.bat`),`@echo off\r\n${output} http://<username>:<password>@<ip> 10\r\npause`);
		fs.writeFileSync(p(`/release/${target}/start.sh`),`#!/bin/sh\nchmod +x ${output}\n./${output} http://<username>:<password>@<ip> 10`);
		console.log(`compressing /release/${target}.zip`);
		await compressing.zip.compressDir(p(`/release/${target}`),p(`/release/${target}.zip`))
	}
}
main();