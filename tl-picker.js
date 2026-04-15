(function(){
  if(!window.__tlAutoConfirm3){
    window.__tlAutoConfirm3=1;

    function isVisible(el){
      var r=el.getBoundingClientRect();
      var s=getComputedStyle(el);
      return r.width>0 && r.height>0 && s.display!=="none" && s.visibility!=="hidden" && s.opacity!=="0";
    }

    function fire(el){
      ["mousedown","mouseup","click"].forEach(function(type){
        el.dispatchEvent(new MouseEvent(type,{
          bubbles:true,
          cancelable:true,
          view:window
        }));
      });
    }

    function findBtn(){
      var els=[].slice.call(document.querySelectorAll('button,a,input[type="button"],input[type="submit"],[role="button"]'));
      for(var i=0;i<els.length;i++){
        var el=els[i];
        var t=(el.innerText||el.value||el.textContent||"").replace(/\s+/g,"").trim();
        if(t==="확인" && isVisible(el)) return el;
      }
      return null;
    }

    function run(){
      var b=findBtn();
      if(b){
        fire(b);
        return true;
      }
      return false;
    }

    var mo=new MutationObserver(function(){
      run();
    });

    mo.observe(document.documentElement,{
      childList:true,
      subtree:true,
      attributes:true
    });

    window.__tlAutoConfirm3Stop=function(){
      try{ mo.disconnect(); }catch(e){}
      delete window.__tlAutoConfirm3;
      delete window.__tlAutoConfirm3Stop;
    };

    run();
  }

  var old=document.getElementById("tl-picker");
  if(old) old.remove();

  var rows=[].slice.call(document.querySelectorAll("tr, ul.lst_match > li, .lst_match > li"));
  var items=[];

  rows.forEach(function(row,idx){
    var txt=(row.innerText||row.textContent||"").replace(/\s+/g," ").trim();
    if(!txt) return;

    var reserveBtn=row.querySelector("a.btn_reserve");
    var waitBtn=row.querySelector('a.btn_wait, a.btn_open, a[class*="wait"]');

    var btn=null;
    var type=null;

    var reserveTxt=reserveBtn ? (reserveBtn.innerText||reserveBtn.textContent||"").replace(/\s+/g,"").trim() : "";
    var waitTxt=waitBtn ? (waitBtn.innerText||waitBtn.textContent||"").replace(/\s+/g,"").trim() : "";

    if(reserveBtn && (reserveTxt.includes("예매하기") || txt.includes("예매하기"))){
      btn=reserveBtn;
      type="reserve";
    }else if(
      waitBtn ||
      txt.includes("판매예정") ||
      txt.includes("예매오픈") ||
      waitTxt.includes("판매예정") ||
      waitTxt.includes("예매오픈")
    ){
      btn=waitBtn || reserveBtn || null;
      type="pending";
    }

    if(!type) return;

    items.push({
      row:row,
      btn:btn,
      text:txt,
      index:idx,
      type:type
    });
  });

  var box=document.createElement("div");
  box.id="tl-picker";
  box.style="position:fixed;right:20px;bottom:20px;width:420px;max-width:calc(100vw - 24px);max-height:70vh;overflow:auto;z-index:2147483647;background:#fff;border:2px solid #222;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);font:14px/1.45 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial";

  box.innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid #ddd;background:#f7f7f7;font-weight:700">경기 선택<button id="tl-picker-close" style="border:0;background:#ddd;border-radius:8px;padding:4px 8px;cursor:pointer">닫기</button></div>'+
    '<div id="tl-picker-body"></div>';

  document.body.appendChild(box);

  document.getElementById("tl-picker-close").onclick=function(){
    box.remove();
  };

  var body=document.getElementById("tl-picker-body");

  if(!items.length){
    body.innerHTML='<div style="padding:12px">경기를 찾지 못했습니다.</div>';
    return;
  }

  items.forEach(function(it,i){
    var d=document.createElement("div");
    d.style="padding:10px 12px;border-bottom:1px solid #eee;cursor:pointer;white-space:pre-wrap";
    d.textContent=(i+1)+". ["+(it.type==="reserve"?"예매가능":"판매예정")+"] "+it.text;

    d.onmouseenter=function(){
      d.style.background="#f5f5f5";
    };

    d.onmouseleave=function(){
      d.style.background="";
    };

    d.onclick=function(){
      try{
        it.row.scrollIntoView({block:"center"});
      }catch(e){}

      if(it.btn){
        try{
          it.btn.style.pointerEvents="auto";
          it.btn.classList.remove("disabled");
        }catch(e){}

        setTimeout(function(){
          try{ it.btn.dispatchEvent(new Event("touchstart",{bubbles:true,cancelable:true})); }catch(e){}
          try{ it.btn.dispatchEvent(new Event("touchend",{bubbles:true,cancelable:true})); }catch(e){}
          try{ it.btn.dispatchEvent(new MouseEvent("mousedown",{bubbles:true,cancelable:true,view:window})); }catch(e){}
          try{ it.btn.dispatchEvent(new MouseEvent("mouseup",{bubbles:true,cancelable:true,view:window})); }catch(e){}
          try{ it.btn.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window})); }catch(e){}
          try{ it.btn.click(); }catch(e){}
        },80);
      }
    };

    body.appendChild(d);
  });
})();
