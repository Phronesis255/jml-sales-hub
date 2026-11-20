/* Display shared account evidence inside the original planner's reference modules. */
(function(root){
  'use strict';let context;const attached=new WeakSet();
  function attach(frame){
    if(attached.has(frame))return;attached.add(frame);
    const connect=()=>{let doc;try{doc=frame.contentDocument;}catch{return;}if(!doc)return;
      const refresh=()=>{const key=doc.documentElement.dataset.plannerSection?.replace('planner-','');
        if(!['performance','experiments','sources','assets'].includes(key))return;
        const body=doc.getElementById('moduleBody');if(!body)return;
        const html=root.JMLDemo?.plannerPanel?.(context,key);if(html&&body.dataset.sharedPanel!==html){body.dataset.sharedPanel=html;body.innerHTML=html;}
      };
      new MutationObserver(refresh).observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['data-planner-section']});
      doc.addEventListener('click',ev=>{const link=ev.target.closest('[data-workspace-route]');if(link){ev.preventDefault();context.navigate(link.dataset.workspaceRoute);}});refresh();
    };
    frame.addEventListener('load',connect);connect();
  }
  root.JMLPlannerInsights={init(ctx){context=ctx;document.querySelectorAll('#planner-host iframe').forEach(attach);}};
})(window);
