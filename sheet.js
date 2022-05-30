const sheetID = '1L-RBWIHC6v3wWP64Lzu4ROcWTBc7BPNoiIgfsiLOeN8';
const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
const sheetName = 'Index';
const key = 'AIzaSyA9RqGBzlNr0zoo-LzULHm6IFFr3cttd10'
const query = encodeURIComponent('Select *');
const url = `${base}&sheet=${sheetName}&key=${key}&tq=${query}`
const data = [];

document.addEventListener('DOMContentLoaded', init);

function init(){
	console.log(url);
	fetch(url)
	.then(res => res.text())
	.then(rep => {
		console.log(rep)
	});
}	
