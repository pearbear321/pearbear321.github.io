const sheetID = '1L-RBWIHC6v3wWP64Lzu4ROcWTBc7BPNoiIgfsiLOeN8';
const base = `https://docs.google.com/spreadsheets/d/${sheetID}gviz/tq?`;
const sheetName = 'Index';
const query = encodeURIComponent('Select *');
const url = `${base}&sheet=${sheetName}&tq=${query}`
const data = [];

document.addEventListener('DOMContentLoaded', init);

function init(){
	console.log('ready');
	fetch(url)
	.then(res => res.text())
	.then(rep => {
		console.log(rep)
	});
}	