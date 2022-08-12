import './style.css'
import * as THREE from "three";

//console.log(THREE);//three.jsが入っているかの確認

//canvas
const canvas = document.querySelector("#webgl");

//シーン
const scene = new THREE.Scene();

//背景用のテクスチャ
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load("./images/scene-bg.jpg");
scene.background = bgTexture;//sceneに反映させるためには、今まではscene.addを使っていたが、背景を挿入する場合はscene.backgroundというプロパティを使う


//サイズ（アスペクト比とかで必要）
const sizes = {
  width: innerWidth,
  height: innerHeight
}

//カメラ
const camera = new THREE.PerspectiveCamera(
  75,//視野角
  sizes.width / sizes.height,//アスペクト比（ブラウザの幅と高さ）
  0.1,//near
  1000//far
);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,//webglrendererをキャンバスの中に描写していくと、明示的に示す
});
renderer.setSize(sizes.width, sizes.height);//サイズを決めるどの領域にレンダリングするのか
renderer.setPixelRatio(window.devicePixelRatio);//ピクセルの粗さを軽減する

//オブジェクトを作成
const boxGeometry = new THREE.BoxGeometry(5, 5, 5, 10);//幅、高さ、横の分割数、縦の分割数
const boxMaterial = new THREE.MeshNormalMaterial;//光源を必要としないマテリアル
const box = new THREE.Mesh(boxGeometry, boxMaterial);//メッシュ化
box.position.set(0, 0.5, -15);//カメラと原点が重なっているので、boxが映らない。boxを移動させる
box.rotation.set(1, 1, 0);//回転を加える(傾ける)

const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 100);//ドーナツ型。引数は、半径、radialSegment,tubularsegment
const torusMaterial = new THREE.MeshNormalMaterial;
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.set(0, 1, 10);//ドーナツ型をカメラより後ろに位置さsる
scene.add(box, torus)

//線形補間で滑らかに移動させる
//ある区間からある区間までを滑らかに動かすのを、線形補間を使って作る
function lerp(x, y, a){//xがスタート地点、yが最終地点。
  /*aは滑らかに動く度合いを決める。
  例えば、aが0.5だったら、xとyの真ん中に0.5があって、x→a→yと、パラパラ漫画のようにカクカクと移動する
  xとyの間を細かく点を取ったら、滑らかに動かせる
  では、何をaに入れれば良いのか？→0.5のような数字ではなく、滑らかに動くグラフ(一次線形補間。y=axみたいな直線形の滑らかなグラフ)を入れれば良い
  一次関数ではなく、二次関数の二次線形補間にすると、また別の線形補間になる*/
  return  (1 - a) * x + a * y;
};

//滑らかに動かす関数
function scalePercent(start, end){
  return (scrollPercent - start) / (end -start);//各区間において、どこに位置しているのか（の割合）を算出する。
  //scalePercentはlerp関数の第3引数に代入する
};

//スクロールアニメーション(画面の上から40%,60%,80%の位置で区切って、アニメーションをかえる)
const animationScripts = [];//アニメーションを管理するための空の配列を用意
//0~40%のアニメーション
animationScripts.push({//オブジェクトのプロパティのアニメーションを追加していく
  start: 0,//開始位置
  end: 40,//終了位置
  function(){//0~40%の時にどんなアニメーションにするか
    camera.lookAt(box.position);//カメラはboxを向いているようにする
    camera.position.set(0, 1, 10);
    //box.position.z += 0.01;//ただ手前に動かしているだけ。lerp関数に変更する
    box.position.z = lerp(-15, 2, scalePercent(0, 40));//第一引数は、オブジェクトを作成した時のスタート位置、第二引数は終了位置、第三引数は滑らかに動くような関数。第3引数の引数は、startとend（今回は0と40）
    torus.position.z = lerp(10, -20, scalePercent(0, 40));//第一引数は、オブジェクトを作成した時のスタート位置、第二引数は終了位置、第三引数は滑らかに動くような関数。第3引数の引数は、startとend（今回は0と40）
  }
});//ここまででは配列に関数を格納しただけ

//40~60%のアニメーション
animationScripts.push({//オブジェクトのプロパティのアニメーションを追加していく
  start: 40,//開始位置
  end: 60,//終了位置
  function(){//0~40%の時にどんなアニメーションにするか
    camera.lookAt(box.position);//カメラはboxを向いているようにする
    camera.position.set(0, 1, 10);
    box.rotation.z = lerp(1, Math.PI, scalePercent(0, 40));//半回転させる
  }
});//ここまででは配列に関数を格納しただけ

//60~80%のアニメーション
animationScripts.push({//オブジェクトのプロパティのアニメーションを追加していく
  start: 60,//開始位置
  end: 80,//終了位置
  function(){//0~40%の時にどんなアニメーションにするか
    camera.lookAt(box.position);//カメラはboxを向いているようにする
    camera.position.x = lerp(0, -15, scalePercent(60, 80));//x座標が最初に存在している場所が0
    camera.position.y = lerp(1, 15, scalePercent(60, 80));//y座標が最初に存在している場所が1
    camera.position.z = lerp(10, 25, scalePercent(60, 80));//z座標が最初に存在している場所が10
    //カメラを移動させていくので、boxのアニメーションは消す
  }
});//ここまででは配列に関数を格納しただけ

//80~100%のアニメーション
animationScripts.push({//オブジェクトのプロパティのアニメーションを追加していく
  start: 80,//開始位置
  end: 100,//終了位置
  function(){//0~40%の時にどんなアニメーションにするか
    camera.lookAt(box.position);//カメラはboxを向いているようにする
    //rotationのx座標に回転を加えていく
    box.rotation.x += 0.02;
    box.rotation.y =+ 0.02;
  }
});//ここまででは配列に関数を格納しただけ



//配列に格納した関数を実行する（アニメーションを開始）
function playScrollAnimation(){//playScrollAnimationをtickの中に貼り付ける。そうすると、リクエストアニメーションのフレームごとに実行される
  animationScripts.forEach((animation) => {
    if (scrollPercent >= animation.start && scrollPercent <= animation.end){//100%の位置も含むので=をつける
      animation.function();
    }
  });//配列の中の関数を一つずつ取り出す
};



/*スクロールしていなくても、z軸に+0.01したものが実行され続けてしまう。
  なので、今どこをスクロールしているのか？何％のところをスクロールしているのかを取得する必要がある*/
//ブラウザのスクロール率を取得

let scrollPercent = 0;//0%の状態

document.body.onscroll = () =>{
  //console.log("scroll");
  //スクロールできる全ての高さから、今表示されている画面の高さを引いたもの　分の　スクロールした部分の高さ（今表示されている画面の高さを引くのは、そうしないと一番下まで行った時に100%にならないから）
  scrollPercent = (document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;
  console.log(scrollPercent);
};



//アニメーション
const tick = () =>{//tickじゃなくてanimationとかでもOK
  window.requestAnimationFrame(tick);//requestAnimationFrameで、tickを何度も呼び出す
  playScrollAnimation();
  renderer.render(scene,camera);//その中で、レンダラーのレンダー関数を何度も呼び出す
};

tick();

//ブラウザのリサイズ操作
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;//リサイズすると、ブラウザのwidthを元に戻す。変更したサイズに適応していく
  sizes.height = window.innerHeight;

  //cameraのアスペクト比もサイズが変わると変わっていくので合わせていく
  camera.aspect = sizes.width / sizes.height;
  //アスペクト比が変わると、updateProjectionMatrixという関数を読む必要がある。これをしないとアスペクト比が変更しない
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);//レンダラーのサイズも変更する必要がある
  renderer.setPixelRatio(window.devicePixelRatio);//setPixelRatioも毎度変更する

});



















/*立ち上げ方
(npm i three・・・初回のみ。three.jsのインストール。package.jsonにバージョンが追記される)
npm install
npm run dev（ Local:   http://localhost:5173/にアクセス）
*/
