// 장바구니 자료구조
let bucket = {
	"date":"",
	"author":"",
	"email":"",
	"project":"",
	"comment":"",
	"items":[],
};

// 장바구니에 들어가는 아이템 자료구조
const item = {
	"id":"", // date로 설정할것. 나중에 삭제할 키로 사용하기
	"basicCost" : 200000.0, // KRW model, 기본가격
	"totalShotNum" : 0, // 총 샷수
	"objectTrackingRigidCost" : 250000.0, // KRW model
	"objectTrackingRigid" : 0,
	"objectTrackingNoneRigidCost" : 350000.0, // KRW model
	"objectTrackingNoneRigid" : 0,
	"rotoanimationBasicCost" : 500000.0, // KRW model
	"rotoanimationBasic" : 0,
	"rotoanimationSoftDeformCost" : 700000.0, // KRW model
	"rotoanimationSoftDeform" : 0,
	"frameCost" : 1000.0, // KRW model, 프레임당 가격
	"frame" : 0,
	"attributes" : [],
	"totalCost": 0,
};

// 아이템에 종속되는 어트리뷰트 자료구조
const attributeStruct = {
	"id":"",
	"value":1.0,
};

//init Write infomation
document.getElementById("date").innerHTML = today()

// Callback
document.getElementById('addBucket').addEventListener('click', addBucket);

function numberWithCommas(n) {
	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 오늘 날짜를 문자열로 출력한다.
function today() {
	let date = new Date();
	let y = date.getFullYear();
	let m = date.getMonth() + 1;
	let d = date.getDate();
	return `Date: ${y}. ${m}. ${d}`;
}

function removeItem(e) {
	id = e.target.parentElement.getAttribute("id");
	for (i = 0; i < bucket.items.length; i++) {
		if ( bucket.items[i].id == id ) {
			// console.log(id);
			bucket.items.splice(i,1);
		}
	}
	bucketRender()
}

// 장바구니를 렌더링한다.
function bucketRender() {
	let totalCost = 0.0;
	document.getElementById("bucket").innerHTML = "";
	for (let i = 0; i < bucket.items.length; i++) {
		let div = document.createElement("div");
		div.setAttribute("id", bucket.items[i].id);
		div.innerHTML += `${bucket.items[i].totalShotNum} Shot,`;
		div.innerHTML += ` ${bucket.items[i].attributes.length} Attrs,`;
		div.innerHTML += ` ${bucket.items[i].frame} f`;
		titles = [];
		for (let j = 0; j < bucket.items[i].attributes.length; j++) {
			titles.push(bucket.items[i].attributes[j].id);
		}
		div.setAttribute("title", titles.join(","));
		div.innerHTML += " = ￦" + numberWithCommas(Math.round(bucket.items[i].totalCost));
		div.innerHTML += ` <i class="far fa-times-circle btn-outline-danger"></i>`;
		div.onclick = removeItem;
		document.getElementById("bucket").appendChild(div);
		totalCost += bucket.items[i].totalCost;
	}
	document.getElementById("numOfItem").innerHTML = "Bucket: " + bucket.items.length;
	document.getElementById("total").innerHTML = "Total: ￦" + numberWithCommas(Math.round(totalCost));
}

// 매치무브 샷 조건을 장바구니에 넣는다.
function addBucket() {
	if (document.getElementById("author").value == "") {
		alert("회사명 또는 작성자 이름을 입력해주세요.\nPlease enter your company name or author name.");
		return
	}
	if (document.getElementById("email").value == "") {
		alert("E-mail을 입력해주세요.\nPlease enter your e-mail address.");
		return
	}
	if (document.getElementById("project").value == "") {
		alert("프로젝트의 간략한 특징을 설명해주세요.\nPlease provide a brief description of the project.");
		return
	}

	if (!document.getElementById("privacy").checked) {
		alert("개인정보 수집 동의항목을 체크해주세요.\nPlease agree to collect personal information.");
		return
	}
	
	let shot = Object.create(item);
	let attrs = document.getElementsByTagName("input");
	let currentDate = new Date();
	shot.id = currentDate.getTime();
	shot.attributes = []; // 기존의 Attrbute를 초기화 한다.

	for (let i = 0; i < attrs.length; i++) {
		type = attrs[i].getAttribute("type")
		if (!(type == "radio" || type=="checkbox")){
			continue;
		};
		if (attrs[i].checked) {
			if (attrs[i].id === "privacy") {
				continue
			}
			attr = Object.create(attributeStruct);
			attr.id = attrs[i].id;
			attr.value = attrs[i].value;
			shot.attributes.push(attr)
		};
	}
	shot.totalShotNum = document.getElementById("totalShotNum").value;
	shot.objectTrackingRigid = document.getElementById("objectTrackingRigid").value;
	shot.objectTrackingNoneRigid = document.getElementById("objectTrackingNoneRigid").value;
	shot.rotoanimationBasic = document.getElementById("rotoanimationBasic").value;
	shot.rotoanimationSoftDeform = document.getElementById("rotoanimationSoftDeform").value;
	shot.frame = document.getElementById("frame").value;
	// 비용산출
	shot.totalCost += shot.basicCost * shot.totalShotNum;
	shot.totalCost += shot.objectTrackingRigidCost * shot.objectTrackingRigid;
	shot.totalCost += shot.objectTrackingNoneRigidCost * shot.objectTrackingNoneRigid;
	shot.totalCost += shot.rotoanimationBasicCost * shot.rotoanimationBasic;
	shot.totalCost += shot.rotoanimationSoftDeformCost * shot.rotoanimationSoftDeform;
	// 적용된 속성을 곱한다.
	for (let n = 0; n < shot.attributes.length; n++) {
		shot.totalCost *= shot.attributes[n].value;
	}
	// 마지막으로 프레임 가격을 더한다.
	shot.totalCost += shot.frameCost * shot.frame;

	bucket.items.push(shot);

	// 데이터전송
	if (document.getElementById("privacy").checked) {
		$.ajax({
			url: "https://5c9y2kwd9k.execute-api.ap-northeast-2.amazonaws.com/estimate_bucket",
			type: 'POST',
			data: JSON.stringify(shot),
			dataType: 'json',
			crossDomain: true,
			contentType: 'application/json',
			success: function(data) {
				console.log(JSON.stringify(data));
			},
			error: function(e) {
				console.log("failed:" + JSON.stringify(e));
			}
		});
	}

	bucketRender()
}

function printMode() {
	window.print();
}

function sendToEmail() {
	if ( bucket.items.length === 0 ) {
		alert("장바구니가 비어있습니다.\n데이터를 전송할 수 없습니다.\nYour shopping cart is empty.\nData can not be transferred.");
		return
	}
	bucket.date = today();
	bucket.author = document.getElementById("author").value;
	bucket.email = document.getElementById("email").value;
	bucket.project = document.getElementById("project").value;
	bucket.comment = document.getElementById("comment").value;
	$.ajax({
		url: "https://b9mx1b8r59.execute-api.ap-northeast-2.amazonaws.com/estimate_send",
		type: 'POST',
		data: JSON.stringify(bucket),
		dataType: 'json',
		crossDomain: true,
		contentType: 'application/json',
		success: function(data) {
			console.log(JSON.stringify(data));
		},
		error: function(e) {
			console.log("failed:" + JSON.stringify(e));
		}
	});
	alert("데이터가 전송되었습니다.\n업무시간 기준 24시간 안에 연락드리겠습니다.\nData has been transferred.\nWe will contact you within 24 business hours.");
}